/* ============================================================================
   PHASE 2 — FORCE VS. TAG

   Standard: the fielder identifies force vs. tag before the ball arrives and
   calls it out — "force!" or "tag!"

   Phase 1 asked which base. This phase asks what kind of out that base gives
   you, which is the layer Phase 1 deliberately left out. Every question is
   about correctly labeling the play type.

   The one rule underneath all of it, and the one worth saying out loud:
   a runner is forced only when the runner immediately behind him has to
   advance. Count from first base. If first base is open, almost nothing is
   forced.

   ON 1ST & 3RD: Phase 1 excludes that runner state because it needs a live
   judgment call about conceding a run. Labeling a play force or tag involves
   no such judgment — it is a rule, with one right answer — so two 1st-and-3rd
   questions appear here on purpose. They're the clearest way to teach "count
   from first base." No house answer is being guessed at.
   ========================================================================= */

import { reveal } from './reveal.js';

const CALL_IT = 'Call it out loud before the pitch so nobody has to work it out while the ball is in the air.';

export const PHASE2_META = {
  id: 'phase2',
  num: 'Phase 2',
  name: 'Force vs. Tag',
  standard:
    'Every fielder knows whether a play is a force or a tag before the ball arrives — and says it out loud.',
};

export const PHASE2_QUESTIONS = [
  {
    id: 'p2-01',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'SS',
    situation: "Ground ball to the second baseman. He flips you the ball as you cross the bag at second.",
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Force at second — just touch the bag' },
      { key: 'b', text: 'Tag at second — glove on the runner' },
      { key: 'c', text: 'Neither — run it back to the mound' },
      { key: 'd', text: 'Depends on how hard he slides' },
    ],
    correct: 'a',
    why: 'The batter is running to first, so the runner on first has nowhere to go back to — he has to run, and that makes it a force.',
    reveal: reveal(
      {
        '2B': 'Field it and feed the shortstop — glove-side flip, chest high.',
        SS: 'Touch second for the force, then throw across to first.',
        '1B': 'Cover first and stretch for the second throw.',
        P: 'Break toward the first-base line and back up the throw.',
        C: `"Force at second!" ${CALL_IT}`,
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p2-02',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'Ground ball to short. The runner takes off for third and the shortstop throws you the ball.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Force at third — just touch the bag' },
      { key: 'b', text: 'Tag at third — glove on the runner' },
      { key: 'c', text: 'Force at third, then throw to first' },
      { key: 'd', text: 'Let him have third and throw to first' },
    ],
    correct: 'b',
    why: "First base is empty, so nobody is pushing him — he chose to run, which means you have to put the glove on him.",
    trap: 'The throw beating him to the bag feels like an out, and it is not. Standing on third does nothing when the runner is not forced.',
    reveal: reveal(
      {
        SS: 'Field it and get the ball to third ahead of the runner.',
        '3B': 'Cover third, catch it, and apply the tag — sweep low.',
        '2B': 'Cover second behind the play.',
        '1B': 'First is yours if the ball comes back across.',
        LF: 'Back up the throw to third.',
        C: `"No force — tag at third!" ${CALL_IT}`,
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p2-03',
    outs: 0,
    bases: [1, 2, 3],
    basesLabel: 'Bases loaded',
    pos: 'C',
    situation: 'Ground ball to short. The throw comes to you at the plate.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Force at home — just touch the plate' },
      { key: 'b', text: 'Tag at home — glove on the runner' },
      { key: 'c', text: 'Touch the plate, then tag him anyway' },
      { key: 'd', text: 'No play at home — throw to first' },
    ],
    correct: 'a',
    why: 'Bases loaded means every runner has someone right behind him, so home is a force like any other bag.',
    reveal: reveal(
      {
        SS: 'Field it and throw home — the lead force is the play.',
        C: 'Foot on the plate, hold your glove up so they know where to throw, take the force. Then look to first.',
        '1B': 'Cover first for the throw after the force.',
        P: 'Back up home in case the throw gets by.',
        '3B': 'Cover third — a runner is still coming.',
        '2B': 'Cover second.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p2-04',
    outs: 1,
    bases: [3],
    basesLabel: 'Runner on 3rd',
    pos: 'C',
    situation: 'Ground ball to short. The runner breaks for home and the throw comes to you at the plate.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Tag at home — glove on the runner' },
      { key: 'b', text: 'Force at home — just touch the plate' },
      { key: 'c', text: 'Touch the plate, then throw to first' },
      { key: 'd', text: 'Step off and let him score' },
    ],
    correct: 'a',
    why: 'First and second are empty, so he never had to run — if you just stand on the plate he is safe.',
    trap: 'It looks exactly like the bases-loaded play from the outside. It is not. The plate under your foot means nothing here.',
    reveal: reveal(
      {
        SS: 'Field it, look him back, and throw home only if he commits.',
        C: 'Block the plate lane, take the throw, apply the tag.',
        P: 'Back up home.',
        '1B': 'Cover first — the batter is still running.',
        '3B': 'Cover third in case he retreats.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p2-05',
    outs: 0,
    bases: [1, 2],
    basesLabel: 'Runners on 1st & 2nd',
    pos: '3B',
    situation: 'Ground ball back to the pitcher. He turns and throws to you at third.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Force at third — just touch the bag' },
      { key: 'b', text: 'Tag at third — glove on the runner' },
      { key: 'c', text: 'No play — throw to first instead' },
      { key: 'd', text: 'Force at third only if he slides' },
    ],
    correct: 'a',
    why: 'The runner on second has to go because the runner on first has to go — the whole line behind him is forced.',
    reveal: reveal(
      {
        P: 'Field it and get the lead runner — throw to third.',
        '3B': 'Get to the bag, catch it, touch it. Then look to first.',
        SS: 'Cover second behind the play.',
        '1B': 'Cover first for the follow-up throw.',
        LF: 'Back up the throw to third.',
        C: `"Force at third!" ${CALL_IT}`,
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p2-06',
    outs: 1,
    bases: [2, 3],
    basesLabel: 'Runners on 2nd & 3rd',
    pos: '3B',
    situation: 'Ground ball to the second baseman. The runner from second heads for third and the throw comes to you.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Tag at third — glove on the runner' },
      { key: 'b', text: 'Force at third — just touch the bag' },
      { key: 'c', text: 'Force at third, then relay home' },
      { key: 'd', text: 'No play anywhere — hold the ball' },
    ],
    correct: 'a',
    why: 'First base is open, so nobody behind him is pushing him up — he has to be tagged.',
    trap: 'Two runners on looks like a force must be on somewhere. Count from first base: if first is empty, nothing is forced.',
    reveal: reveal(
      {
        '2B': 'Field it and decide — the sure out is first, third is only a tag.',
        '3B': 'Cover the bag and be ready to tag, not just catch.',
        '1B': 'Cover first — that is the automatic out.',
        C: `"Nothing forced but first!" ${CALL_IT}`,
        SS: 'Cover second.',
        LF: 'Back up third.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p2-07',
    outs: 2,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'SS',
    situation: "The runner takes off on the pitch. The batter doesn't swing. You cover second and the catcher's throw is on its way.",
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Tag at second — glove on the runner' },
      { key: 'b', text: 'Force at second — just touch the bag' },
      { key: 'c', text: 'Touch the bag, then tag to be safe' },
      { key: 'd', text: 'Let him have it — no play on a steal' },
    ],
    correct: 'a',
    why: "Nothing was hit, so the batter never became a runner — nobody is forcing him and he has to be tagged.",
    trap: 'A runner going from first to second is the classic force picture. That picture only holds when the ball is put in play.',
    reveal: reveal(
      {
        C: 'Come up clean and throw to the bag — low and on the tag side.',
        SS: 'Stand with a foot on each side of the bag, catch it, sweep your glove down to tag him.',
        '2B': 'Back up the throw behind second.',
        CF: 'Break in hard behind second — if it gets through, he takes third.',
        P: 'Get off the mound toward third in case it gets away.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p2-08',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: '2B',
    situation:
      'Ground ball to the first baseman. He steps on first for the out, then sees the runner stopped halfway to second and throws to you.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Tag him — glove on the runner' },
      { key: 'b', text: 'Force at second — just touch the bag' },
      { key: 'c', text: 'Touch the bag, no tag needed' },
      { key: 'd', text: 'Throw it back — he is already out' },
    ],
    correct: 'a',
    why: 'Once the batter is out at first, the runner behind him no longer has to advance — the force is gone.',
    trap: 'It was a force half a second earlier. The out at first erased it, which is exactly why you have to tag him now.',
    reveal: reveal(
      {
        '1B': 'Step on first for the out, then look up — the force just disappeared.',
        '2B': 'Take the throw and run at him. Tag, do not just stand on the bag.',
        SS: 'Get behind second so the rundown has two men.',
        P: 'Follow the play toward second — be the third man in a rundown.',
        C: `"Force is off!" — somebody has to say it the moment first is stepped on.`,
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p2-09',
    outs: 1,
    bases: [1, 2],
    basesLabel: 'Runners on 1st & 2nd',
    pos: '2B',
    situation:
      'Ground ball to third. The third baseman steps on the bag for the out, then throws to you at second with the runner from first sliding in.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Force at second — just touch the bag' },
      { key: 'b', text: 'Tag him — the force came off' },
      { key: 'c', text: 'Neither — the inning is over' },
      { key: 'd', text: 'Force only if he is past the halfway mark' },
    ],
    correct: 'a',
    why: 'Getting the lead runner at third changes nothing behind him — the batter is still running to first, so the man from first still has to go.',
    trap: 'A force comes off when the runner immediately behind is retired. That runner is the batter, and he is still running. The out at third was in front, not behind.',
    reveal: reveal(
      {
        '3B': 'Step on third for the lead force, then get it to second.',
        '2B': 'Cover second, catch it, touch the bag. Still a force.',
        SS: 'Cover third behind the play once it moves on.',
        '1B': 'Cover first for the last relay.',
        C: `"Still a force at second!" ${CALL_IT}`,
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p2-10',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'Fly ball to right, caught for the second out. The runner tags up and goes, and the throw comes to you at third.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Tag at third — glove on the runner' },
      { key: 'b', text: 'Force at third — just touch the bag' },
      { key: 'c', text: 'Touch the bag to appeal the tag-up' },
      { key: 'd', text: 'No play — he left too early anyway' },
    ],
    correct: 'a',
    why: 'A caught fly ball never creates a force — he is advancing at his own risk, so he has to be tagged.',
    reveal: reveal(
      {
        RF: 'Catch it moving in, then come up and throw to third.',
        SS: 'Line up as the cutoff between right field and third.',
        '3B': 'Stand with a foot on each side of the bag, take the throw, sweep your glove down to tag him.',
        '2B': 'Cover second.',
        C: `"He can tag — play is at third, and it's a tag!"`,
        P: 'Back up third.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p2-11',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: '1B',
    situation: 'Line drive snagged by the shortstop for the out. The runner was moving and is way off the bag. The shortstop throws to you.',
    question: 'What kind of out is this?',
    options: [
      { key: 'a', text: 'Neither — just touch first before he gets back' },
      { key: 'b', text: 'Force at first — he has to advance' },
      { key: 'c', text: 'Tag him when he dives back in' },
      { key: 'd', text: 'No out available — the ball was caught' },
    ],
    correct: 'a',
    why: 'On a caught ball he owes first base a retouch, so getting there with the ball before he does is the out all by itself.',
    trap: 'It looks like a force because you are standing on the bag. The reason is different: he is not being forced anywhere, he is late getting back.',
    reveal: reveal(
      {
        SS: 'Catch it and get the ball to first immediately — he is hung out.',
        '1B': 'Get to the bag and touch it with the ball. No tag needed.',
        '2B': 'Cover second in case he beats the throw back.',
        P: 'Trail toward first to back up the throw.',
        C: `"He's off! Get it to first!"`,
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p2-12',
    outs: 1,
    bases: [1, 2, 3],
    basesLabel: 'Bases loaded',
    pos: '2B',
    situation: 'Routine ground ball right at you.',
    question: 'Where is there a force?',
    options: [
      { key: 'a', text: 'At every base — first, second, third and home' },
      { key: 'b', text: 'Everywhere except home' },
      { key: 'c', text: 'Only at first and second' },
      { key: 'd', text: 'Only at first' },
    ],
    correct: 'a',
    why: 'Bases loaded means every runner has somebody right behind him, so all four bags are a touch and not a tag.',
    reveal: reveal(
      {
        '2B': 'Take the closest force you cannot miss — second — and look to turn two.',
        SS: 'Cover second for the feed.',
        '1B': 'Cover first for the second throw.',
        C: `"Force everywhere!" ${CALL_IT}`,
        '3B': 'Cover third — that force is live too.',
        P: 'Back up home.',
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p2-13',
    outs: 1,
    bases: [3],
    basesLabel: 'Runner on 3rd',
    pos: 'CF',
    situation: 'Fly ball to you, caught for the second out. The runner tags and heads home. Your throw goes to the plate.',
    question: 'What does the catcher have to do?',
    options: [
      { key: 'a', text: 'Tag him — the plate alone is not enough' },
      { key: 'b', text: 'Just touch the plate for the force' },
      { key: 'c', text: 'Touch the plate, then throw to third' },
      { key: 'd', text: 'Nothing — the run scores automatically' },
    ],
    correct: 'a',
    why: 'He tagged up and left on his own, so nothing forces him — the catcher has to put the glove on him.',
    reveal: reveal(
      {
        CF: 'Catch it moving toward the infield and throw through the cutoff to the plate.',
        '1B': 'Line up between center field and home as the cutoff.',
        C: 'Give him a lane, take the throw, apply the tag.',
        P: 'Back up home.',
        '3B': 'Cover third behind the runner.',
        SS: 'Trail toward second in case the batter tries to advance on the throw.',
      },
      { primary: 'CF' },
    ),
  },

  /* 1st & 3rd appears here because labeling a play is a rule, not the live
     judgment call that keeps this runner state out of Phase 1. These two are
     the clearest way to teach "count from first base." */
  {
    id: 'p2-14',
    outs: 0,
    bases: [1, 3],
    basesLabel: 'Runners on 1st & 3rd',
    pos: 'SS',
    situation: 'Ground ball to the second baseman. He feeds you at the bag.',
    question: 'Force or tag at second?',
    options: [
      { key: 'a', text: 'Force at second — just touch the bag' },
      { key: 'b', text: 'Tag at second — glove on the runner' },
      { key: 'c', text: 'Neither — look the runner back from third first' },
      { key: 'd', text: 'Force only if the runner on third stays put' },
    ],
    correct: 'a',
    why: 'The batter is running to first, which forces the man on first to second — who else is on base does not change that.',
    reveal: reveal(
      {
        '2B': 'Field it and feed second.',
        SS: 'Touch second for the force, then decide on the second throw.',
        '1B': 'Cover first.',
        C: `"Force at second — nothing forced at home!"`,
        P: 'Back up home.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p2-15',
    outs: 0,
    bases: [1, 3],
    basesLabel: 'Runners on 1st & 3rd',
    pos: 'C',
    situation: 'The runner on third breaks for home and the throw comes in to you at the plate.',
    question: 'Force or tag?',
    options: [
      { key: 'a', text: 'Tag at home — glove on the runner' },
      { key: 'b', text: 'Force at home — just touch the plate' },
      { key: 'c', text: 'Force, because two runners are on' },
      { key: 'd', text: 'Touch the plate, then tag to be safe' },
    ],
    correct: 'a',
    why: 'Second base is empty behind him, so nothing pushes him home — he has to be tagged.',
    trap: 'Two runners on can feel like the bases are jammed. Count from first: the man on third is only forced when first AND second are both occupied.',
    reveal: reveal(
      {
        C: 'Get in front of the plate, take the throw, apply the tag.',
        P: 'Back up home.',
        '1B': 'Cover first — the other runner will try to move on the throw.',
        SS: 'Cover second — that is where the trail runner is going.',
        '3B': 'Cover third.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p2-16',
    outs: 2,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'Ground ball right at you at third. The runner is coming hard and the bag is a step away.',
    question: 'Step on third, or throw to first?',
    options: [
      { key: 'a', text: 'Throw to first — third is only a tag' },
      { key: 'b', text: 'Step on third — the force ends the inning' },
      { key: 'c', text: 'Step on third, then throw to first anyway' },
      { key: 'd', text: 'Tag him as he goes by, then throw to first' },
    ],
    correct: 'a',
    why: 'He is not forced, so stepping on third gets you nothing. The batter at first is always a force.',
    trap: 'The bag is right there and so is the runner, which makes it feel like an easy out. Tagging a moving runner is the hard way to get an out you can already have at first.',
    reveal: reveal(
      {
        '3B': 'Field it, ignore the bag, make the throw across.',
        '1B': 'Cover first and stretch — this is the out that ends it.',
        P: 'Break toward the first-base line to back up.',
        RF: 'Back up the throw to first.',
        C: `"Nothing forced but first!" ${CALL_IT}`,
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p2-17',
    outs: 1,
    bases: [1, 2, 3],
    basesLabel: 'Bases loaded',
    pos: '3B',
    situation: 'Ground ball right at you at third.',
    question: 'Which is true about third and home?',
    options: [
      { key: 'a', text: 'Force at third and force at home' },
      { key: 'b', text: 'Force at third, tag at home' },
      { key: 'c', text: 'Tag at third, force at home' },
      { key: 'd', text: 'Tag at both' },
    ],
    correct: 'a',
    why: 'Bases loaded forces every runner, so both bags are just a touch.',
    reveal: reveal(
      {
        '3B': 'Force at third is under your foot — the guaranteed one. Home is live too.',
        C: 'Foot on the plate, ready for a force if it comes home.',
        SS: 'Cover third if you charge past it, otherwise cover second.',
        '2B': 'Cover second.',
        '1B': 'Cover first.',
        P: 'Back up home.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p2-18',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'The batter squares and bunts. You charge and field it in front of the line.',
    question: 'Where is the only force?',
    options: [
      { key: 'a', text: 'First base only' },
      { key: 'b', text: 'Second and third' },
      { key: 'c', text: 'Third base only' },
      { key: 'd', text: 'Nowhere — everything is a tag' },
    ],
    correct: 'a',
    why: 'The batter is always forced at first. The runner on second is not forced anywhere.',
    reveal: reveal(
      {
        '3B': 'Charge, field it, throw to first — the only force on the field.',
        SS: 'Cover third the moment the third baseman charges.',
        '1B': 'Charge the line, then get back to the bag if the third baseman has it.',
        '2B': 'Cover first.',
        C: `"Only force is first!" — say it as soon as he squares.`,
        P: 'Cover the middle of the infield grass.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p2-19',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'CF',
    situation: 'You are in center. The pitcher is coming set.',
    question: 'What should the whole infield be saying to each other right now?',
    options: [
      { key: 'a', text: '"Force at second!"' },
      { key: 'b', text: '"Tag at second!"' },
      { key: 'c', text: 'Nothing — you call it once the ball is hit' },
      { key: 'd', text: '"Get the sure out at first!"' },
    ],
    correct: 'a',
    why: 'Everyone says the play out loud before the pitch so nobody has to work it out while the ball is in the air.',
    reveal: reveal(
      {
        C: 'Loudest voice on the field. Outs and play type, every single pitch.',
        SS: '"Force at second" — and point at the bag so the outfield sees it.',
        '2B': 'Same call back. Two voices, one answer.',
        '1B': 'Repeat it to the pitcher so he hears it too.',
        '3B': 'Repeat it down the line.',
        CF: 'Repeat it to the corners — the outfield calls it too.',
        LF: 'Repeat it. Nine voices, same call.',
        RF: 'Repeat it. Nine voices, same call.',
        P: 'Hear it and nod. You are a fielder the second you let go of it.',
      },
      { primary: 'CF' },
    ),
  },

  {
    id: 'p2-20',
    outs: 1,
    bases: [2, 3],
    basesLabel: 'Runners on 2nd & 3rd',
    pos: 'P',
    situation: 'You are coming set on the mound.',
    question: 'What is the pre-pitch call?',
    options: [
      { key: 'a', text: '"Nothing forced but first!"' },
      { key: 'b', text: '"Force at third and home!"' },
      { key: 'c', text: '"Force at third, tag at home!"' },
      { key: 'd', text: '"Play is at the plate!"' },
    ],
    correct: 'a',
    why: 'First base is open, so the batter at first is the only automatic out anywhere on the field.',
    reveal: reveal(
      {
        P: 'Say it before you come set. If the ball comes back to you, you already know.',
        C: 'Confirm it back. One out, nothing forced but first.',
        '1B': 'Repeat it — you are the base that matters.',
        '3B': 'Repeat it. Your bag is a tag, not a touch.',
        SS: 'Repeat it and check the runner on second before every pitch.',
        '2B': 'Repeat it.',
      },
      { primary: 'P' },
    ),
  },

  {
    id: 'p2-21',
    outs: 2,
    bases: [1, 2],
    basesLabel: 'Runners on 1st & 2nd',
    pos: '2B',
    situation: 'Ground ball to short. He feeds you at the bag.',
    question: 'Force or tag, and what happens next?',
    options: [
      { key: 'a', text: 'Force at second — touch it and the inning is over' },
      { key: 'b', text: 'Tag him, then throw to first to end it' },
      { key: 'c', text: 'Force at second, then you still need the then throw to first' },
      { key: 'd', text: 'Tag at second — the inning ends on the tag' },
    ],
    correct: 'a',
    why: 'Both runners ahead of the batter are forced, and with two outs any single out ends the inning — so the touch is the whole play.',
    reveal: reveal(
      {
        SS: 'Field it and feed second — the shortest sure out on the field.',
        '2B': 'Touch the bag. Nothing else has to happen.',
        '1B': 'Cover first anyway until you hear the out call.',
        CF: 'Break in behind second in case the feed gets away.',
        C: `"Two outs — force at second ends it!"`,
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p2-22',
    outs: 0,
    bases: [3],
    basesLabel: 'Runner on 3rd',
    pos: '1B',
    situation: 'Ground ball right at you at the bag. The runner on third bluffs and stays.',
    question: 'What kind of out is at first, and what is at home?',
    options: [
      { key: 'a', text: 'Force at first, tag at home' },
      { key: 'b', text: 'Force at both' },
      { key: 'c', text: 'Tag at first, force at home' },
      { key: 'd', text: 'Force at first, no play at home at all' },
    ],
    correct: 'a',
    why: 'The batter is always forced at first, and with second base empty the runner from third is never forced home.',
    reveal: reveal(
      {
        '1B': 'Take the sure force under your foot. Home is only a tag.',
        C: 'Stay in front of the plate and be ready to tag if he goes.',
        P: 'Break toward the line, then back up home.',
        SS: 'Cover second.',
        '3B': 'Cover third in case he retreats.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p2-23',
    outs: 1,
    bases: [1, 2, 3],
    basesLabel: 'Bases loaded',
    pos: 'LF',
    situation: 'Fly ball to you in left, medium depth. You catch it. The runner on third tags and takes off for home, and your throw is going to the plate.',
    question: 'Force or tag at home?',
    options: [
      { key: 'a', text: 'Tag at home — glove on the runner' },
      { key: 'b', text: 'Force at home — the bases are loaded' },
      { key: 'c', text: 'Force, because he left before the catch' },
      { key: 'd', text: 'No play — a tagging runner cannot be thrown out' },
    ],
    correct: 'a',
    why: 'The catch wiped out every force on the field — from that moment he is running at his own risk.',
    trap: 'Bases loaded is the one situation where home IS a force, which is exactly why this fools people. That only holds on a ball that hits the ground. A catch erases all four forces at once.',
    reveal: reveal(
      {
        LF: 'Catch it moving toward the infield, then throw through the cutoff.',
        '3B': 'Line up between left field and home as the cutoff.',
        C: 'Set up, give a lane, and TAG him — the plate alone does nothing now.',
        P: 'Back up home.',
        SS: 'Cover third behind the runner.',
        '2B': 'Cover second.',
        '1B': 'Cover first.',
        CF: 'Back up the catch.',
        RF: 'Cross in behind second.',
      },
      { primary: 'LF' },
    ),
  },

  {
    id: 'p2-24',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'RF',
    situation: 'Base hit in front of you. The batter pulls into first and stands on it. The runner rounds second and digs for third, so your throw goes there.',
    question: 'Force or tag at third?',
    options: [
      { key: 'a', text: 'Tag at third — glove on the runner' },
      { key: 'b', text: 'Force at third — he had to leave first' },
      { key: 'c', text: 'Force at third, then a force back at second' },
      { key: 'd', text: 'Neither — just touch the bag' },
    ],
    correct: 'a',
    why: 'The batter is already standing safely on first, so nothing is pushing anybody anywhere — every play out here is a tag.',
    trap: 'The force was real while the batter was still running. The moment his foot hit the bag it disappeared, and almost every outfield play happens after that moment.',
    reveal: reveal(
      {
        RF: 'Field it clean and throw through the cutoff to third.',
        SS: 'Cutoff on the line between right field and third.',
        '3B': 'Cover third and be ready to tag, not just catch.',
        '2B': 'Cover second.',
        '1B': 'Cover first — the batter is there.',
        P: 'Back up third.',
        C: 'Stay home. Call "tag!" so the third baseman hears it.',
        CF: 'Back up the right fielder.',
        LF: 'Cross in behind third.',
      },
      { primary: 'RF' },
    ),
  },
].map((q) => ({ ...q, phase: 'phase2', correctText: q.options.find((o) => o.key === q.correct).text }));
