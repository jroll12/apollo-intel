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
  empty: 'Nobody on — the only out out there is the batter.',
  noForce: 'Nothing is forced, so first base is the sure out. Check the runner back, then throw.',
  forceOn: 'The runner on first has to go — take the lead out at second.',
  dpLook: 'Everyone ahead of the batter is forced. Second is the closest one you cannot miss.',
  stepThird: "Force is on at third and you're standing on it — the lead runner, without a throw.",
  loadedStep: "Bases loaded makes home a force, and your foot is already on the plate.",
  loadedQuick: "Short, clean throw with the catcher on the bag — that's the force on the runner closest to scoring.",
  loadedClosest: 'Home is the run everyone is watching, but the closest guaranteed force is the out you actually get.',
  twoOut: 'Two outs — any out ends the inning, so take the throw you make every time.',
  twoOutFreeForce: "Two outs and a force under your foot. Take the free one and run off the field.",
  buntSureOut: 'A bunt gives the runners a running start, so the batter at first is the out that is really there.',
  buntPlain: 'Field it clean and beat the batter to first.',
  runScoring: 'A runner in scoring position is coming home — the ball goes to the plate through your cutoff man.',
  firstToThird: "He's going first to third on that, so the throw goes to third through the shortstop.",
  keepToSingle: 'Nobody on — get it in cleanly and keep the batter to one base.',
  twoOutOF: 'Two outs, so no hero throw. Get it in to the cutoff and let the next out end it.',
  tagHome: "Fewer than two outs with a runner on third — he's tagging. Catch it moving in.",
  tagThird: "He'll tag and take third on a ball that deep. Get it to the lead base.",
  noTag: "He can't tag up and make it from first — catch it and get the ball back in.",
  justCatch: 'Nobody on. Squeeze it and get it back to the infield.',
  inningOver: "Two outs — the catch is the third out. Nobody tags, nothing scores.",
};

/* A second line only where the right answer genuinely surprises someone who
   picked the obvious-sounding wrong one. */
const TRAP = {
  buntSureOut: 'The lead force is on, which is exactly why this one fools people — but that runner left with the pitch and is already most of the way there.',
  stepThird: 'Throwing across to first is the reflex, but the bag under your foot is a free out on the runner closest to scoring.',
  twoOutFreeForce: 'The long throw would also end it. There is no reason to make a throw when the base is already under your foot.',
  loadedClosest: 'Home looks like the play with the bases loaded. From where you are standing it is the throw most likely to go wrong.',
  noForce: 'Chasing the lead runner feels aggressive, but he does not have to run — you would be giving back the out you already had.',
  twoOutOF: 'With one out you are coming up throwing. With two, the out itself ends the inning, so the safe throw wins.',
};

/* ---------- Non-involved movement -----------------------------------------
   Honest, position-specific, and never "do nothing". */
const IDLE = {
  P: 'Off the mound and into the play — read the throw and get behind a base.',
  C: 'Home is yours. Call the outs and the play out loud before the pitch.',
  '1B': 'First is yours. Give a target.',
  '2B': 'Move with the ball and cover your half of the middle.',
  SS: 'Move with the ball and cover your half of the middle.',
  '3B': 'Third is yours. Know whether that runner can go.',
  LF: 'Break in behind third.',
  CF: 'Break in behind second.',
  RF: 'Break in behind first.',
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
      text: `Line up between ${fielder} and ${BASE_NAME[base]} as the cutoff. Hands up, call for it.`,
    };
  }

  // 3. Whoever has the base the throw is going to.
  if (base && cover[base] && !out[cover[base]]) {
    out[cover[base]] = {
      role: 'cover',
      text: base === 'H'
        ? 'Cover home. Foot on the plate, give a target, and make the cut call.'
        : `Cover ${BASE_NAME[base]}. Beat the runner to the bag and give a target.`,
    };
  }

  // 4. Backup behind that throw.
  const backup = BACKUP_FOR[base];
  if (base && backup && !out[backup]) {
    out[backup] = { role: 'backup', text: `Back up the throw to ${BASE_NAME[base]}.` };
  }

  // 5. Everyone else covers a live base or moves with the ball.
  for (const [b, who] of Object.entries(cover)) {
    if (out[who]) continue;
    const bKey = b === 'H' ? 'H' : Number(b);
    const liveBase =
      bKey === 1 || (bKey === 2 && runners.has(1)) || (bKey === 3 && runners.has(2)) || (bKey === 'H' && runners.has(3));
    if (liveBase) {
      out[who] = { role: 'cover', text: bKey === 'H' ? 'Home is yours. Stay in front of the plate.' : `Cover ${BASE_NAME[bKey]}.` };
    }
  }

  // 6. Bunt-specific jobs for anyone still unassigned.
  if (isBunt) {
    if (!out['1B']) out['1B'] = { role: 'move', text: 'Charge the line.' };
    if (!out.C) out.C = { role: 'move', text: 'Field anything in front of the plate and call the base out loud.' };
    if (!out.P) out.P = { role: 'move', text: 'Field anything up the middle.' };
    if (!out['3B']) {
      out['3B'] = runners.has(2)
        ? { role: 'cover', text: 'Runner on second — hold third. Do not charge.' }
        : { role: 'move', text: 'Charge the line.' };
    }
  }

  // 7. Outfielders back each other up when they aren't the ball or a backup.
  for (const of of ['LF', 'CF', 'RF']) {
    if (out[of]) continue;
    if (['LF', 'CF', 'RF'].includes(fielder) && of !== fielder) {
      out[of] = { role: 'backup', text: `Angle in behind ${fielder} — take it if it gets past him.` };
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
    if (target.note === 'twoOutOF') return 'Field it clean and get it in to the cutoff man. No hero throw.';
    return `Field it clean and throw through the cutoff to ${BASE_NAME[base]}.`;
  }

  if (branch === 'flyCaught') {
    if (!base) return target.note === 'inningOver' ? "Catch it — that's the inning." : 'Catch it, then get the ball back in to the infield.';
    return `Catch it, then come up throwing to ${BASE_NAME[base]}.`;
  }

  if (branch === 'popup') return 'Call it loud, camp under it, and catch it.';

  // Infield ground ball or bunt.
  if (target.step) return `Step on ${BASE_NAME[base]} yourself — that's the force, no throw needed.`;
  if (target.relay) return 'Get the force at second, then relay to first.';
  if (target.look) return `Look the runner back, then throw to ${BASE_NAME[base]}.`;
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
