/* ============================================================================
   PLAY ENGINE — resolves any batted ball into all nine fielders' jobs.

   The four phases each teach one slice of defense. A real play needs all of
   them at once, so this engine runs the same standards as one system:

     ground ball to the infield  -> Phase 1's force / sure-out table
     bunt                        -> Phase 3's bunt coverage
     ball to the outfield        -> Phase 4's cutoff and relay assignments
     fly ball caught             -> Phase 1's tag-up logic
     everyone not on the ball    -> Phase 3's cover-and-back-up rotation

   The output is an assignment for EVERY position, which is what makes a live
   rep work: the question can be asked of any of the nine, and the wrong
   answers offered are other positions' real jobs on that same play rather
   than invented filler.

   ---------------------------------------------------------------------------
   RUNNERS ON 1ST & 3RD, same rule as Phase 1: excluded from ground balls and
   bunts, where "do you concede the run?" is a live coach's call this app
   refuses to guess at. It IS allowed on balls to the outfield and on caught
   fly balls, where the cutoff and tag-up answers are assignments rather than
   judgment calls. See allowedRunnerStates().
   ---------------------------------------------------------------------------
   ========================================================================= */

import { ZONES, BUNT_ZONES } from './field-geometry.js';

export const POSITIONS = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'];

const BASE_NAME = { 1: 'first', 2: 'second', 3: 'third', H: 'home' };

/* ---------- Force logic ---------------------------------------------------
   A runner is forced only when the runner immediately behind him has to go.
   Count from first base — that is the whole rule. */
function forcedBases(runners) {
  const f = new Set([1]); // the batter is always forced at first
  if (runners.has(1)) f.add(2);
  if (runners.has(1) && runners.has(2)) f.add(3);
  if (runners.has(1) && runners.has(2) && runners.has(3)) f.add('H');
  return f;
}

/* ---------- Base coverage -------------------------------------------------
   Whoever fields it can't also cover it, and balls to the right side pull the
   shortstop to second while balls to the left side pull the second baseman. */
function coverageMap(fielder, isBunt) {
  return {
    1: isBunt ? '2B' : fielder === '1B' ? 'P' : fielder === 'C' ? '2B' : '1B',
    2: ['1B', '2B', 'RF'].includes(fielder) ? 'SS' : '2B',
    3: fielder === '3B' ? 'SS' : '3B',
    H: fielder === 'C' ? 'P' : 'C',
  };
}

/** Outfield throws always run through a cutoff man. */
function cutoffFor(target, outfielder, ballX) {
  if (target === 'H') return outfielder === 'LF' ? '3B' : '1B';
  if (target === 3) return 'SS';
  if (target === 2) return ballX < 0 ? 'SS' : '2B';
  return null;
}

const BACKUP_FOR = { 1: 'RF', 2: 'CF', 3: 'LF', H: 'P' };

/* ---------- Where the play goes ------------------------------------------- */

function infieldGrounderTarget(outs, runners, fielder) {
  const f = forcedBases(runners);

  if (outs === 2) {
    // Any sure out ends it — take the closest one you cannot miss.
    if (fielder === '1B') return { base: 1, step: true, note: 'twoOut' };
    if (fielder === '3B' && f.has(3)) return { base: 3, step: true, note: 'twoOutFreeForce' };
    if (fielder === 'C' && f.has('H')) return { base: 'H', step: true, note: 'twoOutFreeForce' };
    return { base: 1, note: 'twoOut' };
  }

  if (f.has('H')) {
    // Bases loaded: home only on a clean, quick throw, else the closest force.
    if (fielder === 'C') return { base: 'H', step: true, note: 'loadedStep' };
    if (fielder === 'P') return { base: 'H', note: 'loadedQuick' };
    if (fielder === '3B') return { base: 3, step: true, note: 'loadedClosest' };
    return { base: 2, relay: true, note: 'loadedClosest' };
  }

  if (f.has(3)) {
    // Runners on 1st & 2nd.
    if (fielder === '3B') return { base: 3, step: true, note: 'stepThird' };
    return { base: 2, relay: fielder === 'SS' || fielder === '2B', note: 'dpLook' };
  }

  if (f.has(2)) return { base: 2, note: 'forceOn' }; // runner on 1st

  return { base: 1, look: runners.size > 0, note: runners.size ? 'noForce' : 'empty' };
}

function buntTarget(outs, runners) {
  const f = forcedBases(runners);
  // A bunt gives every runner a running start, so the batter at first is the
  // out you actually get — even when a lead force is technically on.
  return { base: 1, note: f.has(2) || f.has(3) ? 'buntSureOut' : 'buntPlain' };
}

function outfieldHitTarget(outs, runners) {
  if (outs === 2) {
    return { base: runners.has(2) || runners.has(3) ? 'H' : 2, note: 'twoOutOF' };
  }
  if (runners.has(3) || runners.has(2)) return { base: 'H', note: 'runScoring' };
  if (runners.has(1)) return { base: 3, note: 'firstToThird' };
  return { base: 2, note: 'keepToSingle' };
}

function flyCaughtTarget(outs, runners) {
  if (outs === 2) return { base: null, note: 'inningOver' };
  if (runners.has(3)) return { base: 'H', note: 'tagHome' };
  if (runners.has(2)) return { base: 3, note: 'tagThird' };
  if (runners.has(1)) return { base: 2, note: 'noTag' };
  return { base: null, note: 'justCatch' };
}

/* ---------- Why lines ------------------------------------------------------
   One line, coach voice. Never about whether the throw would be caught. */
const WHY = {
  empty: 'Nobody is on base, so the only out you can get is the batter at first.',
  noForce: "Nobody HAS to run, so first base is your sure out. Show the runner the ball first, then throw.",
  forceOn: 'The runner on first HAS to run, so you can get him at second just by touching the bag.',
  dpLook: 'Every runner ahead of the batter HAS to run. Second base is the closest out you cannot miss.',
  stepThird: 'The runner has to come to third, and you are already standing on it. Just step on the bag.',
  loadedStep: 'Bases loaded means the runner on third HAS to run home, so touching the plate is an out.',
  loadedQuick: 'It is a short, easy throw and the catcher is standing on the plate. That stops the run.',
  loadedClosest: 'Everybody is watching home plate, but the out you know you will get is the closest base.',
  twoOut: 'Two outs. Any out ends the inning, so make the throw you make every single time.',
  twoOutFreeForce: 'Two outs, and the base is already under your foot. Take the easy one.',
  buntSureOut: 'The runners took off as soon as the ball was bunted, so the batter at first is the out you can really get.',
  buntPlain: 'Grab it and throw to first before the batter gets there.',
  runScoring: 'A runner is trying to score, so the ball goes home. Throw it to your cutoff man, not all the way.',
  firstToThird: 'He is running all the way to third, so the ball goes there. Throw it to your cutoff man.',
  keepToSingle: 'Nobody is on base. Get the ball back in fast so the batter has to stop at first.',
  twoOutOF: 'Two outs. Do not try a huge throw. Get it back in and let the next out end the inning.',
  tagHome: 'Less than two outs with a runner on third means he can run home as soon as you catch it.',
  tagThird: 'On a ball hit that deep he can run to third as soon as you catch it.',
  noTag: 'He cannot make it all the way from first on that one. Just catch it and get the ball back in.',
  justCatch: 'Nobody is on base. Catch it and throw it back in to the infield.',
  inningOver: 'Two outs, so catching it is the third out. The inning is over and nobody can run.',
};

/* A second line only where the right answer genuinely surprises someone who
   picked the obvious-sounding wrong one. */
const TRAP = {
  buntSureOut: 'The lead runner HAS to run, which is why this one tricks people. He left early and you will not catch him.',
  stepThird: 'Throwing to first feels normal, but the base is already under your foot. That is a free out on the runner closest to scoring.',
  twoOutFreeForce: 'The long throw would work too. But why throw at all when the base is right under you?',
  loadedClosest: 'Home plate looks like the play with the bases loaded. From where you are standing, it is the throw most likely to go wrong.',
  noForce: 'Chasing the runner feels brave, but he does not have to run anywhere. You would be giving away the out you already had.',
  twoOutOF: 'With one out you catch it ready to throw. With two outs the catch itself ends the inning, so play it safe.',
};

/* ---------- Non-involved movement -----------------------------------------
   Honest, position-specific, and never "do nothing". */
const IDLE = {
  P: 'Get off the mound and follow the ball. Be ready to stand behind whichever base the throw goes to.',
  C: 'Stay at home plate. Before the pitch, yell out how many outs there are and where the play is.',
  '1B': 'Get to first base and hold your glove up so they know where to throw.',
  '2B': 'Move toward the ball. If it gets past the infield, you are the one chasing it down on your side.',
  SS: 'Move toward the ball. If it gets past the infield, you are the one chasing it down on your side.',
  '3B': 'Stay at third base. Know before the pitch whether that runner is allowed to run.',
  LF: 'Run in toward third base so you are close if the ball ends up coming that way.',
  CF: 'Run in toward second base so you are close if the ball ends up coming that way.',
  RF: 'Run in toward first base so you are close if the ball ends up coming that way.',
};

/* ---------- Resolve -------------------------------------------------------- */

/**
 * @param {object} rep  { outs, runners:Set, hitType, zoneKey }
 *        hitType: 'grounder' | 'liner' | 'fly' | 'popup' | 'bunt'
 * @returns full play with assignments for all nine positions.
 */
export function resolvePlay({ outs, runners, hitType, zoneKey }) {
  const isBunt = hitType === 'bunt';
  const zone = isBunt ? BUNT_ZONES[zoneKey] : ZONES[zoneKey];
  const ballX = zone.spot[0];

  let fielder;
  if (isBunt) fielder = buntFielder(zoneKey, runners);
  else fielder = zone.fielder;

  // Which branch of the standards applies.
  let target;
  let branch;
  if (isBunt) {
    branch = 'bunt';
    target = buntTarget(outs, runners);
  } else if (zone.infield && (hitType === 'grounder' || hitType === 'popup')) {
    branch = hitType === 'popup' ? 'popup' : 'infieldGrounder';
    target = hitType === 'popup' ? { base: null, note: 'justCatch' } : infieldGrounderTarget(outs, runners, fielder);
  } else if (hitType === 'fly') {
    branch = 'flyCaught';
    target = flyCaughtTarget(outs, runners);
  } else {
    branch = 'outfieldHit';
    target = outfieldHitTarget(outs, runners);
  }

  const cover = coverageMap(fielder, isBunt);
  const cutoff = branch === 'outfieldHit' || (branch === 'flyCaught' && target.base)
    ? cutoffFor(target.base, fielder, ballX)
    : null;

  const assignments = buildAssignments({
    branch, fielder, target, cover, cutoff, runners, outs, isBunt,
  });

  return {
    fielder,
    branch,
    target,
    cutoff,
    outs,
    runners,
    hitType,
    zoneKey,
    headline: headlineFor(hitType, zone, branch, target),
    assignments,
    why: WHY[target.note] || WHY.justCatch,
    trap: TRAP[target.note] || null,
  };
}

/* With a runner on second the third baseman holds the bag and the pitcher
   takes that side — the split this app teaches. Coaches vary here; see
   phase3.js for the flag. */
function buntFielder(zoneKey, runners) {
  if (zoneKey === 'bunt-3B') return runners.has(2) ? 'P' : '3B';
  if (zoneKey === 'bunt-1B') return '1B';
  return 'C';
}

function headlineFor(hitType, zone, branch, target) {
  const where = zone.desc;
  if (hitType === 'bunt') return `Bunt — ${where}.`;
  if (hitType === 'grounder') return `Ground ball ${where}.`;
  if (hitType === 'popup') return `Pop up ${where} — caught.`;
  if (hitType === 'fly') return `Fly ball ${where} — caught.`;
  return `Base hit ${where}.`;
}

function buildAssignments({ branch, fielder, target, cover, cutoff, runners, outs, isBunt }) {
  const out = {};
  const base = target.base;

  // 1. The player on the ball.
  out[fielder] = { role: 'primary', text: primaryText(branch, target, fielder, cutoff) };

  // 2. Cutoff / relay man on outfield throws.
  if (cutoff && cutoff !== fielder && !out[cutoff]) {
    out[cutoff] = {
      role: 'cutoff',
      text: `Run out and stand in a straight line between ${fielder} and ${BASE_NAME[base]}. Both hands up, and yell for the ball.`,
    };
  }

  // 3. Whoever has the base the throw is going to.
  if (base && cover[base] && !out[cover[base]]) {
    out[cover[base]] = {
      role: 'cover',
      text: base === 'H'
        ? 'Stand on home plate, hold your glove up, and be ready for the throw.'
        : `Run to ${BASE_NAME[base]} and stand on it. Get there before the runner does and hold your glove up.`,
    };
  }

  // 4. Backup behind that throw.
  const backup = BACKUP_FOR[base];
  if (base && backup && !out[backup]) {
    out[backup] = { role: 'backup', text: `Stand well behind ${BASE_NAME[base]}. If the throw gets past, you are the one who stops it.` };
  }

  // 5. Everyone else covers a live base or moves with the ball.
  for (const [b, who] of Object.entries(cover)) {
    if (out[who]) continue;
    const bKey = b === 'H' ? 'H' : Number(b);
    const liveBase =
      bKey === 1 || (bKey === 2 && runners.has(1)) || (bKey === 3 && runners.has(2)) || (bKey === 'H' && runners.has(3));
    if (liveBase) {
      out[who] = { role: 'cover', text: bKey === 'H' ? 'Stay right in front of home plate. That base is yours.' : `Get to ${BASE_NAME[bKey]} and stay on it.` };
    }
  }

  // 6. Bunt-specific jobs for anyone still unassigned.
  if (isBunt) {
    if (!out['1B']) out['1B'] = { role: 'move', text: 'Run in hard toward the first-base line and try to get the ball.' };
    if (!out.C) out.C = { role: 'move', text: 'Grab anything that stops in front of the plate, then yell which base to throw to.' };
    if (!out.P) out.P = { role: 'move', text: 'Run in and grab anything bunted up the middle.' };
    if (!out['3B']) {
      out['3B'] = runners.has(2)
        ? { role: 'cover', text: 'Stay at third base. There is a runner on second and he is coming to you.' }
        : { role: 'move', text: 'Run in hard toward the third-base line and try to get the ball.' };
    }
  }

  // 7. Outfielders back each other up when they aren't the ball or a backup.
  for (const of of ['LF', 'CF', 'RF']) {
    if (out[of]) continue;
    if (['LF', 'CF', 'RF'].includes(fielder) && of !== fielder) {
      out[of] = { role: 'backup', text: `Run behind ${fielder}. If the ball gets past him, you are there to stop it.` };
    }
  }

  // 8. Anyone left moves with the ball.
  for (const pos of POSITIONS) {
    if (!out[pos]) out[pos] = { role: 'move', text: IDLE[pos] };
  }

  return out;
}

function primaryText(branch, target, fielder, cutoff) {
  const base = target.base;

  if (branch === 'outfieldHit') {
    if (target.note === 'twoOutOF') return 'Field it clean and throw it in to your cutoff man. Do not try a long throw.';
    return `Field it clean and throw it to your cutoff man, lined up with ${BASE_NAME[base]}.`;
  }

  if (branch === 'flyCaught') {
    if (!base) {
      return target.note === 'inningOver'
        ? "Catch it. That's the third out and the inning is over."
        : 'Catch it, then throw the ball back in to the infield.';
    }
    return `Catch it, then throw to ${BASE_NAME[base]} right away.`;
  }

  if (branch === 'popup') return 'Yell "I got it!" loud, get underneath it, and catch it.';

  // Infield ground ball or bunt.
  if (target.step) return `Step on ${BASE_NAME[base]} yourself. You do not need to throw it.`;
  if (target.relay) return 'Step on second base for the out, then throw to first.';
  if (target.look) return `Show the runner the ball so he stays put, then throw to ${BASE_NAME[base]}.`;
  return `Throw to ${BASE_NAME[base]}.`;
}

/* ---------- Runner states -------------------------------------------------- */

const ALL_STATES = [
  { key: 'empty', bases: [], label: 'Bases empty' },
  { key: 'r1', bases: [1], label: 'Runner on 1st' },
  { key: 'r2', bases: [2], label: 'Runner on 2nd' },
  { key: 'r3', bases: [3], label: 'Runner on 3rd' },
  { key: 'r12', bases: [1, 2], label: 'Runners on 1st & 2nd' },
  { key: 'r13', bases: [1, 3], label: 'Runners on 1st & 3rd' },
  { key: 'r23', bases: [2, 3], label: 'Runners on 2nd & 3rd' },
  { key: 'loaded', bases: [1, 2, 3], label: 'Bases loaded' },
];

/**
 * 1st & 3rd is allowed only where the answer is an assignment rather than a
 * judgment call about conceding a run — see the note at the top of the file.
 */
export function allowedRunnerStates(hitType, zoneInfield) {
  const infieldPlay = hitType === 'bunt' || (zoneInfield && (hitType === 'grounder' || hitType === 'popup'));
  return infieldPlay ? ALL_STATES.filter((s) => s.key !== 'r13') : ALL_STATES;
}

export { ALL_STATES, BASE_NAME };
