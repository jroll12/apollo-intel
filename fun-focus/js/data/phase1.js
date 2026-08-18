/* ============================================================================
   PHASE 1 — KNOW THE SITUATION

   Standard: before every pitch, every fielder knows the outs, the runners,
   and their job if the ball comes to them.

   Questions are generated from runner state x position x a plausible hit
   location. The correct primary job comes from the coaching system's own
   default table:

     Empty      -> throw to 1st
     1st        -> throw to 2nd, force is on
     2nd        -> no force, sure out at 1st
     3rd        -> no force, sure out at 1st
     1st & 2nd  -> to 3B: step on the bag. To SS/2B: force at 2nd, relay 1st
     2nd & 3rd  -> no force, sure out at 1st, don't force a play at the plate
     Loaded     -> home only on a clean, quick throw; else closest sure force
     2 outs     -> any sure out ends it; default to the closest, usually 1st

   ---------------------------------------------------------------------------
   DELIBERATELY EXCLUDED: runners on 1st & 3rd.
   That state needs a live judgment call about conceding a run, which doesn't
   belong in a phase built on pure attention with no skill ceiling. It is left
   out entirely rather than guessed at. Don't add it here without a coach's
   ruling on the house answer.
   ---------------------------------------------------------------------------

   WHERE HIT LOCATION DOES THE WORK: the default table assumes a routine
   grounder to an infielder with time to make either throw. A few spots break
   that assumption, so the situation text states the detail that settles it
   rather than leaving the kid to guess:
     - Catcher on a bunt: the lead force exists but the runner got a running
       start, so the sure out at first is the real coached play.
     - First baseman: "on the bag" vs "pulled off it" changes the answer, so
       every 1B situation says which one it is.
     - 3B with bases loaded: gloving it clean makes the throw home right;
       knocking it down makes the force under his foot right. The situation
       says which happened.
   Each of these carries a trap line explaining the tension out loud.

   ALSO A COACH'S CALL, flagged not guessed: with 1st & 2nd and a comebacker,
   some coaches want the pitcher to look the lead runner to third. This app
   follows the table's double-play look and goes to second. If the coach wants
   the other answer, it's the r12/P entry below.
   ========================================================================= */

import { POSITION_ORDER, seededShuffle, hashString } from '../ui.js';

/* ---------- Answer vocabulary ---------------------------------------------
   Options are drawn from this list so wording stays identical everywhere. A
   kid should recognise "step on the bag" as the same idea every time. */
const PLAYS = {
  first: 'Throw to first',
  firstStep: 'Step on first yourself',
  firstFlipP: 'Flip to the pitcher covering first',
  lookThenFirst: 'Look the runner back, then throw to first',
  lookThenFirstPl: 'Look the runners back, then throw to first',
  second: 'Throw to second',
  secondThenFirst: 'Get the force at second, then throw to first',
  third: 'Throw to third',
  thirdStep: 'Step on third yourself',
  home: 'Throw home',
  homeStep: 'Step on home yourself',
  chase: 'Run at the lead runner and try to tag him',
  holdBall: 'Hold the ball and walk it back to the mound',
  catchIn: 'Catch it, then get the ball back in to the infield',
  catchSecond: 'Catch it, then get the ball in to second',
  catchThird: 'Catch it, then come up throwing to third',
  catchHome: 'Catch it, then come up throwing home',
  catchInning: "Catch it — that's the inning, no throw needed",
};

/* Options in the same family are different versions of one idea, so only one
   of them is ever offered per question. Otherwise a kid ends up choosing
   between "throw to first" and "step on first" when both mean the same thing. */
const FAMILY = {
  first: 'F1',
  firstStep: 'F1',
  firstFlipP: 'F1',
  lookThenFirst: 'F1',
  lookThenFirstPl: 'F1',
  second: 'F2',
  secondThenFirst: 'F2',
  third: 'F3',
  thirdStep: 'F3',
  home: 'FH',
  homeStep: 'FH',
  chase: 'FX',
  holdBall: 'FX',
  catchIn: 'OC',
  catchSecond: 'O2',
  catchThird: 'O3',
  catchHome: 'OH',
  catchInning: 'OI',
};

/* Which wrong answers are plausible enough to be worth offering, per state. */
const DISTRACTOR_POOL = {
  empty: ['first', 'second', 'third', 'chase', 'holdBall'],
  r1: ['first', 'second', 'third', 'chase'],
  r2: ['first', 'third', 'chase', 'home'],
  r3: ['first', 'home', 'chase', 'second'],
  r12: ['first', 'second', 'thirdStep', 'home'],
  r23: ['first', 'homeStep', 'chase', 'second'],
  loaded: ['firstStep', 'second', 'thirdStep', 'homeStep'],
  outfield: ['catchIn', 'catchSecond', 'catchThird', 'catchHome', 'catchInning'],
};

const RUNNERS = {
  empty: { bases: [], label: 'Bases empty' },
  r1: { bases: [1], label: 'Runner on 1st' },
  r2: { bases: [2], label: 'Runner on 2nd' },
  r3: { bases: [3], label: 'Runner on 3rd' },
  r12: { bases: [1, 2], label: 'Runners on 1st & 2nd' },
  r23: { bases: [2, 3], label: 'Runners on 2nd & 3rd' },
  loaded: { bases: [1, 2, 3], label: 'Bases loaded' },
};

const INFIELD = ['P', 'C', '1B', '2B', 'SS', '3B'];
const OUTFIELD = ['LF', 'CF', 'RF'];

/* ---------- Infield jobs, fewer than two outs ------------------------------
   loc  = the hit location shown to the player
   play = key into PLAYS
   why  = the one line of explanation
   trap = second line, ONLY where the right answer genuinely surprises someone
          who picked the obvious-sounding wrong one. Most entries have none. */
const IF_JOBS = {
  empty: {
    P: {
      loc: 'Comebacker bounces right back at you off the mound.',
      play: 'first',
      why: "Nobody on — the only out on the field is the batter. Set your feet and make the easy throw.",
    },
    C: {
      loc: 'Swinging bunt dribbles out in front of the plate.',
      play: 'first',
      why: 'Bases empty means one job: get the ball to first before the batter.',
    },
    '1B': {
      loc: 'Grounder to your right pulls you two steps off the bag.',
      play: 'firstFlipP',
      why: "You got pulled off the bag, so the pitcher is the one who beats the runner there — find him and lead him with a soft flip.",
      trap: "Racing back to the bag yourself is the instinct, but you'll lose that race from off the line. The pitcher is already moving.",
    },
    '2B': {
      loc: 'Routine two-hopper to your left.',
      play: 'first',
      why: 'Nobody on — get the batter at first, and that is the whole play.',
    },
    SS: {
      loc: 'Routine grounder right at you.',
      play: 'first',
      why: 'One out available. Field it, get your feet under you, throw.',
    },
    '3B': {
      loc: 'Grounder right at you at third.',
      play: 'first',
      why: 'Bases empty — the long throw across is the only play there is.',
    },
  },

  r1: {
    P: {
      loc: 'Comebacker right back at you.',
      play: 'second',
      why: 'The runner on first has to go — turn and take the lead out at second.',
      trap: "First is the easier throw, but the force at second takes the runner who's actually a threat to score.",
    },
    C: {
      loc: 'Bunt dies halfway up the first-base line.',
      play: 'first',
      why: 'A bunt gives that runner a running start, so the sure out is the batter at first.',
      trap: "The force at second is on, which is why this one feels wrong — but he's already most of the way there. Take the out you're actually going to get.",
    },
    '1B': {
      loc: 'Grounder pulls you a step off the bag toward second.',
      play: 'second',
      why: "Force is on and you're already moving that way — the lead out is right in front of you.",
      trap: "Getting back to first is the reflex and nobody's mad if you do, but with the force on you can take the runner closer to scoring.",
    },
    '2B': {
      loc: 'Routine grounder right at you.',
      play: 'second',
      why: "Force is on — the shortstop is covering second, so feed him and you've got the lead runner.",
    },
    SS: {
      loc: 'Two-hopper right at you.',
      play: 'second',
      why: 'Force is on — the second baseman is covering, get him the ball.',
    },
    '3B': {
      loc: 'Grounder right at you at third.',
      play: 'second',
      why: 'Force is on at second, and that throw is shorter than the one across — take the lead runner.',
    },
  },

  r2: {
    P: {
      loc: 'Comebacker right at you.',
      play: 'lookThenFirst',
      why: 'Nothing is forced — freeze him with a look, then take the sure out at first.',
      trap: "Chasing him toward third feels aggressive, but he doesn't have to run. You'd be handing back an out you already had.",
    },
    C: {
      loc: 'Slow roller out in front of the plate.',
      play: 'first',
      why: "Nothing's forced — the batter at first is the out that's actually there.",
    },
    '1B': {
      loc: "Grounder right at the bag and you're standing on it.",
      play: 'firstStep',
      why: 'No force on the runner, so take the out you cannot miss.',
    },
    '2B': {
      loc: 'Grounder to your right.',
      play: 'first',
      why: 'No force — first base is the only sure out on the field.',
    },
    SS: {
      loc: 'Grounder right at you, runner breaking behind you.',
      play: 'first',
      why: "He isn't forced, so don't get baited — set your feet and throw to first.",
      trap: "It looks like you can beat him to third, but he only runs if you let him. The out at first is the one you own.",
    },
    '3B': {
      loc: 'Grounder right at you at third.',
      play: 'first',
      why: "He's frozen with you in front of him — make the throw across and get the batter.",
    },
  },

  r3: {
    P: {
      loc: 'Comebacker right at you.',
      play: 'lookThenFirst',
      why: 'Show him the ball to hold him at third, then take the out at first.',
      trap: "Firing home feels like the big play, but there's no force there — you'd need a tag, and you'd give up the out you had.",
    },
    C: {
      loc: 'Chopper straight down in front of the plate.',
      play: 'first',
      why: 'No force at home — check him back, then take the batter at first.',
    },
    '1B': {
      loc: "Grounder right at the bag and you're standing on it.",
      play: 'firstStep',
      why: "Take the sure out. If he scores from third, that's the trade — the out is the job.",
    },
    '2B': {
      loc: 'Routine grounder right to you.',
      play: 'first',
      why: 'No force anywhere — first base is the play.',
    },
    SS: {
      loc: 'Routine grounder right to you.',
      play: 'lookThenFirst',
      why: 'Glance him back if you have a beat, then throw to first for the sure out.',
    },
    '3B': {
      loc: 'Grounder right at you at third.',
      play: 'lookThenFirst',
      why: 'Look him back off the bag, then make the throw across and get the batter.',
    },
  },

  r12: {
    /* COACH'S CALL flagged above: some systems want the pitcher looking the
       lead runner to third here. This follows the table's double-play look. */
    P: {
      loc: 'Comebacker right back at you.',
      play: 'second',
      why: "Everybody's forced, and the closest force you can't miss is second — get it and you're halfway to two.",
    },
    C: {
      loc: 'Bunt dies in the grass in front of the plate.',
      play: 'first',
      why: 'Both runners got a running start on the bunt, so the batter at first is the out you can count on.',
      trap: "The force at third is on and it's tempting, but on a bunt that runner is already nearly there.",
    },
    '1B': {
      loc: 'Grounder pulls you off the bag toward second.',
      play: 'second',
      why: "Force is on and the shortstop is covering — that's the closest out you can't miss.",
    },
    '2B': {
      loc: 'Routine grounder right at you.',
      play: 'secondThenFirst',
      why: 'Two-out chance: force at second, then the then throw across to first.',
    },
    SS: {
      loc: 'Two-hopper right at you.',
      play: 'secondThenFirst',
      why: 'Two-out chance: force at second, then the then throw across to first.',
    },
    '3B': {
      loc: 'Grounder right at you at third.',
      play: 'thirdStep',
      why: "Force is on at third and you're standing on it — take the lead runner without making a throw.",
      trap: "Throwing across to first is the reflex, but the bag under your foot is a free out on the runner closest to scoring.",
    },
  },

  r23: {
    P: {
      loc: 'Comebacker right at you.',
      play: 'lookThenFirstPl',
      why: 'Nothing is forced — freeze them both, then take the sure out at first.',
      trap: "Home looks like the play with a runner ninety feet away, but with no force you'd need a tag. That's how a sure out turns into no outs.",
    },
    C: {
      loc: 'Chopper straight down in front of the plate.',
      play: 'first',
      why: "Stepping on home does nothing here — there's no force. Take the batter at first.",
      trap: "The plate is right under your feet, which is exactly why this one fools people. He doesn't have to run, so touching it isn't an out.",
    },
    '1B': {
      loc: "Grounder right at the bag and you're standing on it.",
      play: 'firstStep',
      why: 'No force anywhere — the guaranteed out is the one under your foot.',
    },
    '2B': {
      loc: 'Routine grounder right to you.',
      play: 'first',
      why: "Nothing's forced — first base is the sure out. Don't chase the run.",
    },
    SS: {
      loc: 'Grounder right at you.',
      play: 'first',
      why: 'No force anywhere — set your feet and take the out at first.',
    },
    '3B': {
      loc: 'Grounder right at you at third.',
      play: 'first',
      why: "The runner on third isn't forced, so the bag under you is just a bag — throw across and get the batter.",
    },
  },

  loaded: {
    P: {
      loc: 'Comebacker right at you, fielded clean.',
      play: 'home',
      why: "Short, clean throw and the catcher's standing on the plate — that's the force on the runner closest to scoring.",
    },
    C: {
      loc: 'Chopper straight down, right in front of the plate.',
      play: 'homeStep',
      why: "Force is on at home and you're standing on it — take it, no throw needed.",
    },
    '1B': {
      loc: 'Grounder to your right, you field it charging a few steps in front of the bag.',
      play: 'home',
      why: "You're already moving toward the plate and the catcher's on the bag — that's the clean, quick throw the force at home is waiting for.",
    },
    '2B': {
      loc: 'Routine grounder right at you.',
      play: 'secondThenFirst',
      why: 'Second is your closest guaranteed force, and the second throw across can give you two.',
      trap: "Home is a long throw from where you're standing. The force at second is the out that's actually guaranteed.",
    },
    SS: {
      loc: 'Two-hopper right at you.',
      play: 'secondThenFirst',
      why: 'Closest guaranteed force is right beside you — take it and look to turn two.',
    },
    /* The clean-glove version of this is a coach's call between the short
       throw home and the force underfoot. The situation says he knocked it
       down, which settles it. */
    '3B': {
      loc: 'Hard grounder eats you up — you knock it down and pick it up standing on the bag.',
      play: 'thirdStep',
      why: "The quick throw home is gone once you've knocked it down, but you're standing on a force. Take it.",
      trap: "Home is the run everyone's yelling about, but a rushed throw off a knockdown is how you end up with nobody out.",
    },
  },
};

/* ---------- Infield jobs with two outs -------------------------------------
   Any sure out ends the inning, so the answer is almost always the closest
   one. Only the spots where that's a real decision are drilled — there's no
   value in nine identical "throw to first" questions. */
const IF_TWO_OUTS = [
  {
    runners: 'empty',
    pos: '1B',
    loc: "Grounder right at the bag and you're standing on it.",
    play: 'firstStep',
    why: "Two outs — take the out under your foot and you're jogging in.",
  },
  {
    runners: 'empty',
    pos: 'SS',
    loc: 'Routine grounder right at you.',
    play: 'first',
    why: 'Two outs and one throw ends it. Make the one you make every time.',
  },
  {
    runners: 'r1',
    pos: 'P',
    loc: 'Comebacker right back at you.',
    play: 'first',
    why: 'Any out ends the inning, so take the safest one instead of the fanciest one.',
    trap: 'With one out you turn and go to second here. With two, the force stops mattering — every out is the same out.',
  },
  {
    runners: 'r1',
    pos: 'C',
    loc: 'Bunt dies in front of the plate.',
    play: 'first',
    why: "Two outs — the batter at first ends it, and that's the throw you can make.",
  },
  {
    runners: 'r1',
    pos: '3B',
    loc: 'Grounder right at you at third.',
    play: 'first',
    why: 'Any out ends the inning. Take the throw you trust.',
  },
  {
    runners: 'r1',
    pos: 'SS',
    loc: 'Two-hopper right at you.',
    play: 'first',
    why: "Two outs, so there's no double play to chase — one throw, inning over.",
  },
  {
    runners: 'r2',
    pos: '3B',
    loc: 'Grounder right at you at third.',
    play: 'first',
    why: 'No force and two outs — the throw across ends it.',
  },
  {
    runners: 'r3',
    pos: 'P',
    loc: 'Comebacker right at you.',
    play: 'first',
    why: "Take the out at first. The inning ends before he can score, so there's nothing to look at.",
    trap: 'With fewer than two outs you look him back first. With two, the out itself is what stops the run — just go get it.',
  },
  {
    runners: 'r3',
    pos: 'C',
    loc: 'Chopper in front of the plate.',
    play: 'first',
    why: "No force at home, and the throw to first ends the inning. Don't look at the runner.",
  },
  {
    runners: 'r12',
    pos: '3B',
    loc: 'Grounder right at you at third.',
    play: 'thirdStep',
    why: "You're standing on a force with two outs — that's the inning, no throw required.",
    trap: "The throw to first is the habit, and it would work. But there's a free out under your foot, so take the one nothing can go wrong with.",
  },
  {
    runners: 'r12',
    pos: 'SS',
    loc: 'Routine grounder right at you.',
    play: 'first',
    why: 'Any out ends it — take the throw you make ten times out of ten.',
  },
  {
    runners: 'r12',
    pos: 'C',
    loc: 'Bunt dies in front of the plate.',
    play: 'first',
    why: 'Two outs — the batter at first ends the inning and nothing else has to happen.',
  },
  {
    runners: 'r23',
    pos: '1B',
    loc: "Grounder right at the bag and you're on it.",
    play: 'firstStep',
    why: "Step on it and the inning's over before anyone scores.",
  },
  {
    runners: 'r23',
    pos: '2B',
    loc: 'Routine grounder right to you.',
    play: 'first',
    why: 'One throw to first ends the inning — no runner can beat you to the plate.',
  },
  {
    runners: 'loaded',
    pos: 'C',
    loc: 'Chopper straight down in front of the plate.',
    play: 'homeStep',
    why: "You're standing on a force with two outs — that's the inning without a throw.",
  },
  {
    runners: 'loaded',
    pos: '3B',
    loc: 'Grounder right at you at third.',
    play: 'thirdStep',
    why: 'Force under your foot and two outs — take the free one and run off the field.',
    trap: 'The long throw to first also ends it, but there is no reason to make a throw when the bag is already under you.',
  },
  {
    runners: 'loaded',
    pos: '1B',
    loc: "Grounder right at the bag and you're standing on it.",
    play: 'firstStep',
    why: "Two outs — step on it and you're done, no run counts.",
  },
  {
    runners: 'loaded',
    pos: 'SS',
    loc: 'Two-hopper right at you.',
    play: 'first',
    why: 'Any of the four forces ends it. Take the throw you trust most.',
  },
];

/* ---------- Outfield jobs --------------------------------------------------
   Outfielders get fly balls in Phase 1, not base hits. On a fly ball the job
   falls straight out of the outs and the runners, which is exactly this
   phase's lesson. Base hits to the outfield turn into cutoff-and-relay
   decisions, and those are Phase 4's whole subject. */
const OF_WHERE = { LF: 'to left field', CF: 'to center field', RF: 'to right field' };

const OF_JOBS = {
  empty: {
    depth: 'Routine fly ball',
    extra: 'You camp under it.',
    play: 'catchIn',
    why: 'Nobody on. Squeeze it, then get it back in to the infield.',
  },
  r1: {
    depth: 'Fly ball, medium depth',
    extra: '',
    play: 'catchSecond',
    why: "He can't tag up and make it from first on that one — catch it and get the ball in to second.",
  },
  r2: {
    depth: 'Deep fly ball',
    extra: "You're moving back on it.",
    play: 'catchThird',
    why: "He'll tag and go on a ball hit that deep — catch it moving toward the infield so the throw has something on it.",
    trap: "Deciding where the ball goes after you've caught it is already too late. That's the whole point of knowing it before the pitch.",
  },
  r3: {
    depth: 'Fly ball, medium-deep',
    extra: '',
    play: 'catchHome',
    why: "Fewer than two outs with a runner on third — he's tagging. Catch it moving in so the throw home has a chance.",
  },
  r12: {
    depth: 'Deep fly ball',
    extra: '',
    play: 'catchThird',
    why: 'The lead runner tags and takes third on a ball that deep. Get it to the lead base.',
  },
  r23: {
    depth: 'Fly ball, medium-deep',
    extra: '',
    play: 'catchHome',
    why: 'The runner on third tags on that one. Home is the base that matters.',
  },
  loaded: {
    depth: 'Fly ball, medium-deep',
    extra: '',
    play: 'catchHome',
    why: 'All three can tag, but only one of them scores — the ball goes home.',
  },
};

const OF_TWO_OUTS = [
  {
    runners: 'r3',
    pos: 'LF',
    loc: 'Fly ball to left field, medium-deep. You settle under it.',
    play: 'catchInning',
    why: "Two outs — the catch is the third out, so nobody tags and nothing scores.",
    trap: "With one out you're catching this one ready to throw home. With two, the catch itself is the whole play.",
  },
  {
    runners: 'loaded',
    pos: 'CF',
    loc: 'Fly ball to center field. You camp under it.',
    play: 'catchInning',
    why: 'Two outs and a fly ball caught ends the inning no matter who is on base.',
  },
  {
    runners: 'r12',
    pos: 'RF',
    loc: 'Deep fly ball to right field. You run it down.',
    play: 'catchInning',
    why: "Two outs — squeeze it and you're jogging off. No runner can do anything about it.",
  },
];

/* ---------- Whole-field reveal --------------------------------------------
   Phase 1 shows the primary fielder's job plus who has the base or bases the
   play is going to. Full backup rotations are Phase 3's job and are kept out
   of here on purpose. */

function targetsFor(playKey) {
  switch (playKey) {
    case 'first':
    case 'firstStep':
    case 'firstFlipP':
    case 'lookThenFirst':
    case 'lookThenFirstPl':
      return [1];
    case 'second':
      return [2];
    case 'secondThenFirst':
      return [2, 1];
    case 'third':
    case 'thirdStep':
      return [3];
    case 'home':
    case 'homeStep':
      return ['H'];
    case 'catchSecond':
      return [2];
    case 'catchThird':
      return [3];
    case 'catchHome':
      return ['H'];
    default:
      return [];
  }
}

/* Youth base-coverage conventions: whoever fields it can't also cover, and
   balls to the right side pull the shortstop to second while balls to the
   left side pull the second baseman there. */
function coverage(pos) {
  return {
    1: pos === '1B' ? 'P' : pos === 'C' ? '2B' : '1B',
    2: ['1B', '2B', 'RF'].includes(pos) ? 'SS' : '2B',
    3: pos === '3B' ? 'SS' : '3B',
    H: pos === 'C' ? 'P' : 'C',
  };
}

const IF_DEFAULT_JOBS = {
  P: "Off the mound toward the ball. If the throw gets away, you're the one backing up a base.",
  C: 'Home is yours. Before the pitch, call the outs and the play out loud so everyone hears it.',
  '1B': 'Get to first and hold your glove up so they know where to throw — a relay can still end up coming your way.',
  '2B': 'Move toward the ball. If it gets through, you chase it down on your side.',
  SS: 'Move toward the ball. If it gets through, you chase it down on your side.',
  '3B': "Third is yours. Know before it's hit whether that runner can go.",
  LF: 'Run in toward third base so you are close to the play. If it gets through, you keep it to one base.',
  CF: 'Run in toward second base so you are close to the play. Nothing gets past you.',
  RF: 'Run in toward first base. If the throw gets past, you stop it.',
};

const COVER_TEXT = {
  1: 'Cover first. Hold your glove up and stretch toward the throw.',
  2: 'Cover second. Beat the runner to the bag and hold your glove up so they know where to throw.',
  3: 'Cover third and hold your glove up so they know where to throw.',
  H: 'Cover home. Foot on the plate, call for the ball.',
};

function buildReveal({ pos, playKey, isOutfield }) {
  const targets = targetsFor(playKey);
  const cover = coverage(pos);
  const primaryText = PLAYS[playKey];

  return POSITION_ORDER.map((p) => {
    if (p === pos) return { pos: p, job: `${primaryText}.`, primary: true };

    for (const target of targets) {
      if (cover[target] === p) return { pos: p, job: COVER_TEXT[target] };
    }

    if (isOutfield) {
      const ofJob = outfieldSupportJob(p, pos, targets);
      if (ofJob) return { pos: p, job: ofJob };
    }

    return { pos: p, job: IF_DEFAULT_JOBS[p] };
  });
}

/* On a ball caught in the outfield the infield lines up to receive it. The
   cutoff man's exact spot and the cut/through call are Phase 4 — Phase 1 just
   points at who it is. */
function outfieldSupportJob(p, fielder, targets) {
  const goingHome = targets.includes('H');
  const goingThird = targets.includes(3);

  if (p === 'P') return 'Get off the mound toward the third-base line — you back up third or home depending on where the throw goes.';
  if (p === '1B' && goingHome) return `Line up between ${fielder} and home as the cutoff man. Phase 4 drills the details.`;
  if (p === 'SS' && goingThird) return `Line up between ${fielder} and third as the cutoff man. Phase 4 drills the details.`;
  if (p === 'C' && goingHome) return 'Home is yours. Set up, hold your glove up so they know where to throw, and make the call on the throw.';
  if (['LF', 'CF', 'RF'].includes(p)) return 'Back up your teammate — take an angle behind the catch, not straight at it.';
  return null;
}

/* ---------- Option assembly ------------------------------------------------ */

function buildOptions(correctKey, poolKey, explicitWrong, seed) {
  const pool = explicitWrong || DISTRACTOR_POOL[poolKey] || [];
  const usedFamilies = new Set([FAMILY[correctKey]]);
  const wrong = [];

  for (const key of pool) {
    if (wrong.length >= 3) break;
    const family = FAMILY[key];
    if (usedFamilies.has(family)) continue;
    usedFamilies.add(family);
    wrong.push(key);
  }

  const options = [correctKey, ...wrong].map((key) => ({ key, text: PLAYS[key] }));
  return seededShuffle(options, seed);
}

/* ---------- Generation ------------------------------------------------------ */

function makeQuestion({ id, outs, runnersKey, pos, loc, play, why, trap, wrong }) {
  const runners = RUNNERS[runnersKey];
  const isOutfield = OUTFIELD.includes(pos);
  const poolKey = isOutfield ? 'outfield' : runnersKey;

  return {
    id,
    phase: 'phase1',
    outs,
    bases: runners.bases,
    basesLabel: runners.label,
    pos,
    situation: loc,
    question: "What's your job?",
    options: buildOptions(play, poolKey, wrong, hashString(id)),
    correct: play,
    correctText: PLAYS[play],
    why,
    trap: trap || null,
    reveal: buildReveal({ pos, playKey: play, isOutfield }),
  };
}

export function buildPhase1Questions() {
  const questions = [];
  let alternator = 0;

  // Infield, fewer than two outs. Outs alternate 0/1 so both show up without
  // doubling the deck with near-identical pairs.
  for (const runnersKey of Object.keys(IF_JOBS)) {
    for (const pos of INFIELD) {
      const entry = IF_JOBS[runnersKey][pos];
      if (!entry) continue;
      const outs = alternator % 2;
      alternator += 1;
      questions.push(
        makeQuestion({
          id: `p1-${runnersKey}-${pos}-${outs}`,
          outs,
          runnersKey,
          pos,
          ...entry,
        }),
      );
    }
  }

  // Infield, two outs.
  for (const entry of IF_TWO_OUTS) {
    questions.push(
      makeQuestion({
        id: `p1-${entry.runners}-${entry.pos}-2`,
        outs: 2,
        runnersKey: entry.runners,
        pos: entry.pos,
        ...entry,
      }),
    );
  }

  // Outfield fly balls, fewer than two outs.
  for (const runnersKey of Object.keys(OF_JOBS)) {
    const entry = OF_JOBS[runnersKey];
    for (const pos of OUTFIELD) {
      const outs = alternator % 2;
      alternator += 1;
      const loc = [`${entry.depth} ${OF_WHERE[pos]}.`, entry.extra].filter(Boolean).join(' ');
      questions.push(
        makeQuestion({
          id: `p1-${runnersKey}-${pos}-${outs}`,
          outs,
          runnersKey,
          pos,
          loc,
          play: entry.play,
          why: entry.why,
          trap: entry.trap,
        }),
      );
    }
  }

  // Outfield, two outs.
  for (const entry of OF_TWO_OUTS) {
    questions.push(
      makeQuestion({
        id: `p1-${entry.runners}-${entry.pos}-2`,
        outs: 2,
        runnersKey: entry.runners,
        pos: entry.pos,
        ...entry,
      }),
    );
  }

  return questions;
}

export const PHASE1_META = {
  id: 'phase1',
  num: 'Phase 1',
  name: 'Know the Situation',
  standard:
    'Before every pitch, every fielder knows the outs, the runners, and their job if the ball comes to them.',
};
