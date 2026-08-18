/* ============================================================================
   PHASE 4 — CUTOFFS & RELAYS

   Standard: the cutoff player gets to the right spot, calls for the ball, and
   the cut-or-through decision gets made correctly.

   ---------------------------------------------------------------------------
   THE ASSIGNMENTS THIS PHASE TEACHES
     Throw HOME from left field        -> 3B is the cutoff
     Throw HOME from center or right   -> 1B is the cutoff
     Throw to THIRD from anywhere      -> SS is the cutoff
     Ball in a gap (relay)             -> the middle infielder on that side
                                          goes out, the other covers second
     Whoever is not the cutoff covers the bag the runners are headed for.

   THE CALL SYSTEM THIS PHASE TEACHES
     The cutoff man never decides. The player AT the base the throw is going
     to makes the call, because he is the only one facing the whole play:
       silence        -> let it go through
       "Cut!"         -> catch it and hold, the play is over
       "Cut two!"     -> catch it and throw to second (or three / four)
     Cut it when the throw is off line, when the run does not matter, or when
     a trailing runner can be gotten. Let it through when the throw is on line
     and the run at the plate matters.

   ---------------------------------------------------------------------------
   COACH'S CALLS, flagged rather than guessed:

   1. Whether a cutoff man may cut a throw with NO call — one that is clearly
      short or clearly off line. Some coaches teach "never touch it without a
      call," others teach "cut anything that obviously will not get there."
      Both are defensible and this app does not build a question on it. If the
      team has a rule, it belongs here.

   2. On a ball hit straight to CENTER in a gap, which middle infielder goes
      out for the relay. Most systems make it a verbal call between the two
      rather than a fixed assignment. Questions here only use the left-center
      and right-center gaps, where the side of the field settles it.
   ========================================================================= */

import { reveal } from './reveal.js';

export const PHASE4_META = {
  id: 'phase4',
  num: 'Phase 4',
  name: 'Cutoffs & Relays',
  standard:
    'The cutoff man gets to the right spot, calls loud for the ball, and the player at the base makes the cut-or-through call.',
};

export const PHASE4_QUESTIONS = [
  {
    id: 'p4-01',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'Clean base hit to left field. The runner rounds third and is heading home.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Line up between the left fielder and home as the cutoff' },
      { key: 'b', text: 'Cover third base' },
      { key: 'c', text: 'Go out toward left field as the relay man' },
      { key: 'd', text: 'Back up home behind the catcher' },
    ],
    correct: 'a',
    why: 'Throws home from left field go through the third baseman — that is your assignment every single time.',
    trap: 'Covering third feels like your bag and your name. On any ball to the outfield the shortstop takes third so that you are free to be the cutoff.',
    reveal: reveal(
      {
        LF: 'Field it clean and throw through the cutoff — chest high, on a line.',
        '3B': 'Straight line between him and the plate, out on the grass. Both hands up, yell for it.',
        C: 'Set up at the plate and make the call — cut or through.',
        P: 'Back up home.',
        SS: 'Cover third.',
        '2B': 'Cover second — the batter is coming.',
        '1B': 'Cover first, then trail toward the cut line.',
        CF: 'Back up the left fielder.',
        RF: 'Cross in behind second.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p4-02',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'SS',
    situation: 'Base hit to left field. The third baseman breaks out toward the cut line.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Cover third base' },
      { key: 'b', text: 'Cover second base' },
      { key: 'c', text: 'Go out as a second relay man behind the third baseman' },
      { key: 'd', text: 'Back up the throw to home' },
    ],
    correct: 'a',
    why: 'The third baseman is the cutoff on a throw home from left, so his bag becomes yours.',
    reveal: reveal(
      {
        LF: 'Get it and throw through the cutoff.',
        '3B': 'Cutoff man on the line to home.',
        SS: 'Cover third. The batter will try for it if the throw goes home.',
        '2B': 'Cover second.',
        C: 'Make the call.',
        P: 'Back up home.',
        '1B': 'Cover first.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p4-03',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '1B',
    situation: 'Base hit to center field. The runner is rounding third and the throw is coming home.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Line up between the center fielder and home as the cutoff' },
      { key: 'b', text: 'Cover first base and stay there' },
      { key: 'c', text: 'Go out to center as the relay man' },
      { key: 'd', text: 'Back up home behind the catcher' },
    ],
    correct: 'a',
    why: 'Throws home from center or right go through the first baseman — left field is the only one that goes through third.',
    reveal: reveal(
      {
        CF: 'Field it clean and throw through the cutoff.',
        '1B': 'Straight line between him and the plate. Hands up, call for it loud.',
        C: 'Set up, give the runner a lane, make the cut call.',
        P: 'Back up home.',
        '2B': 'Cover first — the first baseman is out on the line.',
        SS: 'Cover second.',
        '3B': 'Cover third behind the runner.',
        LF: 'Back up the center fielder.',
        RF: 'Back up the center fielder from the other side.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p4-04',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'SS',
    situation: 'Base hit to right field. The runner is digging for third.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Line up between the right fielder and third base' },
      { key: 'b', text: 'Cover second base' },
      { key: 'c', text: 'Cover third base' },
      { key: 'd', text: 'Go out to right field as the relay man' },
    ],
    correct: 'a',
    why: 'Every throw to third from the outfield goes through the shortstop, no matter which outfielder has the ball.',
    reveal: reveal(
      {
        RF: 'Field it and throw through the cutoff to third.',
        SS: 'On the line between right field and third. Hands up, yell for it.',
        '3B': 'Cover third, give a target, make the cut call.',
        '2B': 'Cover second — the batter is coming.',
        '1B': 'Cover first.',
        P: 'Get behind third to back it up.',
        C: 'Stay home.',
        CF: 'Back up the right fielder.',
        LF: 'Cross in behind third.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p4-05',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '1B',
    situation: 'Base hit to center. You are the cutoff man on the throw home.',
    question: 'Where exactly do you set up?',
    options: [
      { key: 'a', text: 'In a straight line between him and the plate, out on the grass' },
      { key: 'b', text: 'Right next to the catcher at the plate' },
      { key: 'c', text: 'Halfway out to the center fielder' },
      { key: 'd', text: 'Wherever you happen to be when the ball is fielded' },
    ],
    correct: 'a',
    why: 'On the line is the whole job — if you are off it, cutting the ball costs the throw its direction as well as its distance.',
    trap: 'Being close to the plate feels safer, but a cutoff man standing near the catcher is useless. Far enough out that a strong throw still reaches you in the air.',
    reveal: reveal(
      {
        CF: 'Throw through him, not to him — low and on a line.',
        '1B': 'Line yourself up by looking at the plate over your shoulder, then set your feet.',
        C: 'Line him up for him — "left! left!" until he is right.',
        P: 'Back up home.',
        '2B': 'Cover first.',
        SS: 'Cover second.',
        '3B': 'Cover third.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p4-06',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'You are lined up as the cutoff. The left fielder has the ball and his head is down.',
    question: 'What do you do?',
    options: [
      { key: 'a', text: 'Both hands straight up and yell his name until he finds you' },
      { key: 'b', text: 'Stand still and wait for him to look up' },
      { key: 'c', text: 'Run toward him to shorten the throw' },
      { key: 'd', text: 'Point at the plate so he throws home' },
    ],
    correct: 'a',
    why: 'An outfielder with his head down finds a target he can hear before he finds one he can see.',
    reveal: reveal(
      {
        LF: 'Head up, find the voice, throw through him.',
        '3B': 'Hands high, name loud. You are a sound before you are a target.',
        C: 'Second voice — help line him up and get ready to make the call.',
        P: 'Back up home.',
        SS: 'Cover third.',
        '2B': 'Cover second.',
        '1B': 'Cover first.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p4-07',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '1B',
    situation: 'You are the cutoff on a throw home. The ball is in the air and the catcher has not said a word.',
    question: 'What do you do?',
    options: [
      { key: 'a', text: 'Let it go through — get out of its way' },
      { key: 'b', text: 'Catch it and hold the ball' },
      { key: 'c', text: 'Catch it and throw to second' },
      { key: 'd', text: 'Catch it and throw home yourself' },
    ],
    correct: 'a',
    why: 'Silence means the throw is on line and the play is at the plate — you do not touch it.',
    trap: 'Grabbing it because nobody told you not to is the single most common cutoff mistake there is. No call means let it fly.',
    reveal: reveal(
      {
        CF: 'Throw it through — on a line, let it carry.',
        '1B': 'Duck out of the flight path. Do not reach for it.',
        C: 'Say nothing if it is on line. Your silence IS the call.',
        P: 'Back up home.',
        '3B': 'Cover third.',
        SS: 'Cover second.',
        '2B': 'Cover first.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p4-08',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'C',
    situation:
      'The throw from left is coming in way up the first-base side, well off line. The runner is going to score standing up. Behind him, the batter is rounding first hard.',
    question: 'What is your call?',
    options: [
      { key: 'a', text: '"Cut two!"' },
      { key: 'b', text: 'Say nothing and let it come to you' },
      { key: 'c', text: '"Cut!" and nothing else' },
      { key: 'd', text: '"Home! Home!"' },
    ],
    correct: 'a',
    why: 'The run is scoring either way, so the ball goes to the base that stops the next runner.',
    reveal: reveal(
      {
        LF: 'You made the throw — now back up nothing, trail the play in.',
        '3B': 'Cut it and turn to second in one motion.',
        C: 'Loud and early. He needs the call before the ball reaches him, not as it arrives.',
        '2B': 'Cover second — the throw is coming to you.',
        SS: 'Cover third behind the batter if he keeps going.',
        P: 'Back up home anyway until you hear the cut.',
        '1B': 'Cover first.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p4-09',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'C',
    situation: 'The throw from center is on line and coming in hard. The runner is going to be right on top of it.',
    question: 'What is your call?',
    options: [
      { key: 'a', text: 'Say nothing — let it come through' },
      { key: 'b', text: '"Cut!"' },
      { key: 'c', text: '"Cut two!"' },
      { key: 'd', text: '"Cut four!"' },
    ],
    correct: 'a',
    why: 'A throw on line with a real play at the plate is exactly the one you never interrupt.',
    reveal: reveal(
      {
        CF: 'Throw through the cutoff on a line.',
        '1B': 'Get out of the way. No call means it is not yours.',
        C: 'Silence, then set up for the tag. Give him a lane to the plate.',
        P: 'Back up home — this is the play you exist for.',
        '3B': 'Cover third.',
        SS: 'Cover second.',
        '2B': 'Cover first.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p4-10',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'You are the cutoff on the throw home. The catcher yells "Cut!" and nothing after it.',
    question: 'What do you do?',
    options: [
      { key: 'a', text: 'Catch it and hold the ball' },
      { key: 'b', text: 'Catch it and throw home anyway' },
      { key: 'c', text: 'Catch it and throw to second' },
      { key: 'd', text: 'Let it go through — he did not name a base' },
    ],
    correct: 'a',
    why: '"Cut" on its own means the play is over — take the ball and freeze everybody where they are.',
    trap: 'No base named feels like an unfinished instruction. It is a complete one: cut it, hold it, let nobody take another step.',
    reveal: reveal(
      {
        LF: 'You already did your job — trail the play in.',
        '3B': 'Catch it, hold it, look every runner back.',
        C: 'Say it early and say it once.',
        SS: 'Cover third in case somebody strays.',
        '2B': 'Cover second.',
        '1B': 'Cover first.',
        P: 'Back up home until the ball is dead.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p4-11',
    outs: 2,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: '2B',
    situation: 'Ball is hammered into the right-center gap and both outfielders are chasing it.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Run out into the outfield as the relay man' },
      { key: 'b', text: 'Cover second base' },
      { key: 'c', text: 'Cover first base' },
      { key: 'd', text: 'Line up between the outfield and home' },
    ],
    correct: 'a',
    why: 'Ball in the gap on your side, you go get it — the shortstop covers second behind you.',
    reveal: reveal(
      {
        RF: 'Run it down and find the relay man with your voice.',
        CF: 'Chase with him and call who takes it.',
        '2B': 'Sprint out onto the grass, get on the line to third, hands up.',
        SS: 'Cover second.',
        '3B': 'Cover third — that is where the throw is going.',
        '1B': 'Cover first, then trail toward the cut line.',
        C: 'Stay home and read the play.',
        P: 'Get between third and home and pick one to back up.',
        LF: 'Cross all the way in behind second.',
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p4-12',
    outs: 2,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'SS',
    situation: 'Ball is in the right-center gap. The second baseman takes off toward the outfield.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Cover second base' },
      { key: 'b', text: 'Go out as a second relay man behind him' },
      { key: 'c', text: 'Cover third base' },
      { key: 'd', text: 'Line up between the relay man and home' },
    ],
    correct: 'a',
    why: 'One middle infielder goes out, the other has the bag — on a ball to the right side, you are the bag.',
    reveal: reveal(
      {
        '2B': 'Out for the relay.',
        SS: 'Cover second. The batter is coming and somebody has to be there.',
        RF: 'Run it down, hit the relay man.',
        '3B': 'Cover third.',
        '1B': 'Cover first.',
        CF: 'Chase and back up.',
        P: 'Read the throw and back up third or home.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p4-13',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'SS',
    situation: 'Ball is ripped into the left-center gap.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Run out into the outfield as the relay man' },
      { key: 'b', text: 'Cover second base' },
      { key: 'c', text: 'Cover third base' },
      { key: 'd', text: 'Line up between the outfield and home' },
    ],
    correct: 'a',
    why: 'Ball in the gap on your side, so you go out — the second baseman covers second behind you.',
    reveal: reveal(
      {
        LF: 'Run it down and find the relay man.',
        CF: 'Chase and call who takes it.',
        SS: 'Out onto the grass, line up with third, hands up and loud.',
        '2B': 'Cover second.',
        '3B': 'Cover third and make the call on the relay.',
        '1B': 'Cover first, then trail the cut line.',
        P: 'Get between third and home.',
        C: 'Stay home.',
        RF: 'Cross all the way in behind second.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p4-14',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: '2B',
    situation: 'Ball is in the left-center gap and you are the relay man\'s partner. The outfielder has his back to the infield.',
    question: 'What does the relay man have to do first?',
    options: [
      { key: 'a', text: 'Yell his name and wave until he finds him' },
      { key: 'b', text: 'Get to the exact right spot and wait quietly' },
      { key: 'c', text: 'Run all the way out to take the ball from him' },
      { key: 'd', text: 'Turn and look at third to line himself up' },
    ],
    correct: 'a',
    why: 'The outfielder is running away from the infield, so the relay man has to be a voice before he can be a target.',
    reveal: reveal(
      {
        LF: 'Ball first, then find the voice.',
        SS: 'Relay man — noise, hands, then the line.',
        '2B': 'Cover second, and be the second voice if he cannot hear the shortstop.',
        '3B': 'Cover third.',
        '1B': 'Cover first.',
        C: 'Stay home.',
        P: 'Split third and home.',
        CF: 'Chase and back up.',
        RF: 'Cross in behind second.',
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p4-15',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'C',
    situation: 'Your team is up by six runs. Base hit to left, the runner is rounding third and will score easily. The batter is trying to stretch it into a double.',
    question: 'What is your call?',
    options: [
      { key: 'a', text: '"Cut two!"' },
      { key: 'b', text: 'Say nothing — always try for the runner at the plate' },
      { key: 'c', text: '"Cut!" and hold it' },
      { key: 'd', text: '"Home!"' },
    ],
    correct: 'a',
    why: 'One run does not change this game, and the runner going to second does — send the ball where it can still get an out.',
    trap: 'A runner heading home always pulls the eye. Part of making the call is knowing which runner actually matters right now.',
    reveal: reveal(
      {
        LF: 'Get it in fast and let the call decide where it ends up.',
        '3B': 'Cutoff — cut it and turn to second.',
        C: 'Make the call early and loud.',
        '2B': 'Cover second. This is the out.',
        SS: 'Cover third.',
        '1B': 'Cover first.',
        P: 'Back up home until you hear the cut.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p4-16',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '1B',
    situation: 'Tie game. Base hit to center, the runner is heading home, and the throw is on line. The catcher has said nothing.',
    question: 'What do you do?',
    options: [
      { key: 'a', text: 'Let it go through and get out of the way' },
      { key: 'b', text: 'Cut it and throw home yourself' },
      { key: 'c', text: 'Cut it and hold — a tie game is too risky' },
      { key: 'd', text: 'Cut it and throw to second' },
    ],
    correct: 'a',
    why: 'Tie game, on-line throw, real play at the plate — that ball is not yours to touch.',
    reveal: reveal(
      {
        CF: 'Throw through him on a line.',
        '1B': 'Clear the flight path. Hands down.',
        C: 'Silence, then block the lane and take the throw.',
        P: 'Back up home.',
        '3B': 'Cover third.',
        SS: 'Cover second.',
        '2B': 'Cover first.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p4-17',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'LF',
    situation: 'Double down the left-field line. You run it down in the corner and the runner is heading home.',
    question: 'What do you do with the ball?',
    options: [
      { key: 'a', text: 'Turn and fire it to the relay man, chest high' },
      { key: 'b', text: 'Throw it all the way home on the fly' },
      { key: 'c', text: 'Run it in toward the infield yourself' },
      { key: 'd', text: 'Throw it to third base' },
    ],
    correct: 'a',
    why: 'You are not throwing anyone out from the corner — the relay man is the throw, and your only job is getting it to him fast and accurate.',
    trap: 'The big throw home is the one everybody wants to make. From the corner it is slower than two good throws and it usually ends up somewhere nobody is standing.',
    reveal: reveal(
      {
        LF: 'Get to it, turn, and hit the relay man in the chest.',
        SS: 'Relay man — out on the grass, lined up with home.',
        '2B': 'Cover second, and be the trail man behind the relay.',
        '3B': 'Cover third.',
        C: 'Set up at the plate and make the call.',
        P: 'Back up home.',
        '1B': 'Cover first, then trail the cut line.',
        CF: 'Back up the corner.',
        RF: 'Cross in behind second.',
      },
      { primary: 'LF' },
    ),
  },

  {
    id: 'p4-18',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'You are the cutoff on a throw home. The throw is on line but short — it is going to bounce twice. The catcher yells "Cut!"',
    question: 'What does that mean?',
    options: [
      { key: 'a', text: 'Catch it and hold — the play at the plate is dead' },
      { key: 'b', text: 'Catch it and relay it home as fast as you can' },
      { key: 'c', text: 'Let it bounce through to him anyway' },
      { key: 'd', text: 'Catch it and throw to second' },
    ],
    correct: 'a',
    why: 'He can see that the throw will not beat the runner, so he is ending the play before a short hop turns into a loose ball.',
    reveal: reveal(
      {
        LF: 'Trail the play in.',
        '3B': 'Cut it clean, hold it high, look everybody back.',
        C: 'Make the call the moment you see it is short.',
        SS: 'Cover third.',
        '2B': 'Cover second.',
        '1B': 'Cover first.',
        P: 'Back up home until the ball is held.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p4-19',
    outs: 1,
    bases: [3],
    basesLabel: 'Runner on 3rd',
    pos: '1B',
    situation: 'Fly ball to medium center field. The runner is tagging up to go home.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Line up between the center fielder and home as the cutoff' },
      { key: 'b', text: 'Stay at first base' },
      { key: 'c', text: 'Go out toward center as the relay man' },
      { key: 'd', text: 'Back up home behind the catcher' },
    ],
    correct: 'a',
    why: 'A tag-up throw home gets a cutoff man exactly like a base hit does — nothing about the assignment changes.',
    trap: 'A caught fly ball feels like the play is over, and with a runner on third it is only starting.',
    reveal: reveal(
      {
        CF: 'Catch it moving toward the infield and throw through the cutoff.',
        '1B': 'On the line to the plate. Hands up, call for it.',
        C: 'Set up, give a lane, make the cut call.',
        P: 'Back up home.',
        '2B': 'Cover first.',
        SS: 'Cover second.',
        '3B': 'Cover third the moment he leaves.',
        LF: 'Back up the catch.',
        RF: 'Back up the catch from the other side.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p4-20',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'You are lined up as the cutoff on a throw home. The runner is going to score and the batter has rounded first hard behind him.',
    question: 'Who decides whether you cut the ball?',
    options: [
      { key: 'a', text: 'The catcher — he is facing the whole play' },
      { key: 'b', text: 'You — you are the one holding the glove' },
      { key: 'c', text: 'The outfielder who made the throw' },
      { key: 'd', text: 'Whoever yells first' },
    ],
    correct: 'a',
    why: 'The player at the base the throw is going to always makes the call, because he is the only one who can see every runner at once.',
    trap: 'You have the best view of the ball and the worst view of the field — everything worth knowing is happening behind you.',
    reveal: reveal(
      {
        C: 'You own the call. Loud, early, and one word.',
        '3B': 'Listen. Your job is hands and feet, not decisions.',
        LF: 'Throw through the cutoff and let the call happen.',
        '2B': 'Cover second — most likely where a cut ball goes.',
        SS: 'Cover third.',
        '1B': 'Cover first.',
        P: 'Back up home.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p4-21',
    outs: 0,
    bases: [],
    basesLabel: 'Bases empty',
    pos: '2B',
    situation: 'Clean base hit to center field. The batter rounds first hard and looks at second.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Out toward center field as the relay man' },
      { key: 'b', text: 'Cover second base' },
      { key: 'c', text: 'Cover first base' },
      { key: 'd', text: 'Stay where you are — it is only a single' },
    ],
    correct: 'a',
    why: 'Even on a single with nobody on, one middle infielder goes out — that is what keeps a bobble in the outfield from becoming a double.',
    trap: 'A routine single feels like a play with no jobs in it. The relay man going out is exactly why it stays routine.',
    reveal: reveal(
      {
        CF: 'Field it clean and come up ready to throw.',
        '2B': 'Out onto the grass, lined up with second, hands up.',
        SS: 'Cover second.',
        '1B': 'Cover first behind the runner.',
        '3B': 'Cover third.',
        C: 'Bases empty, but the runner is at first now — stay home.',
        P: 'Move toward second and read it.',
        LF: 'Back up center.',
        RF: 'Back up center.',
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p4-22',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '1B',
    situation: 'Base hit to right field. The runner is going for third and the shortstop breaks out to the cut line.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Cover first base' },
      { key: 'b', text: 'Line up as the cutoff for the throw to third' },
      { key: 'c', text: 'Go out to right field as the relay man' },
      { key: 'd', text: 'Line up between right field and home' },
    ],
    correct: 'a',
    why: 'Throws to third go through the shortstop, and the batter is running to your bag — first is yours on this one.',
    trap: 'You are the cutoff on plenty of throws, just not this one. The cutoff man is set by where the ball is GOING, not by who you are.',
    reveal: reveal(
      {
        RF: 'Field it and throw through the cutoff to third.',
        SS: 'Cutoff on the line to third.',
        '3B': 'Cover third and make the call.',
        '1B': 'Cover first. The batter is coming and nobody else is there.',
        '2B': 'Cover second.',
        P: 'Back up third.',
        C: 'Stay home.',
        CF: 'Back up right field.',
        LF: 'Cross in behind third.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p4-23',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'CF',
    situation: 'Base hit right at you. The runner is rounding third and the first baseman is out on the cut line waving his arms.',
    question: 'How do you throw it?',
    options: [
      { key: 'a', text: 'Through the cutoff man, low and on a line' },
      { key: 'b', text: 'High over his head so it carries all the way home' },
      { key: 'c', text: 'A soft lob to the cutoff man so he can catch it easily' },
      { key: 'd', text: 'Straight at the catcher, ignoring the cutoff man' },
    ],
    correct: 'a',
    why: 'A low throw on a line goes home fine if nobody cuts it, and it can still be cut if somebody does — a high one takes that choice away.',
    trap: 'Throwing over the cutoff man looks like the strong play. It is the one throw that cannot be redirected, so it turns the whole call system off.',
    reveal: reveal(
      {
        CF: 'Low, hard, on a line through the cutoff. Let the call decide the rest.',
        '1B': 'Cutoff on the line to home. Hands up, loud.',
        C: 'Make the call — cut or through.',
        P: 'Back up home.',
        '2B': 'Cover first.',
        SS: 'Cover second.',
        '3B': 'Cover third.',
        LF: 'Back up the center fielder.',
        RF: 'Back up the center fielder.',
      },
      { primary: 'CF' },
    ),
  },

  {
    id: 'p4-24',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'RF',
    situation: 'Base hit in front of you. The runner is going first to third and the shortstop is out on the grass calling for it.',
    question: 'Where does your throw go?',
    options: [
      { key: 'a', text: 'Through the shortstop toward third' },
      { key: 'b', text: 'All the way to third on the fly' },
      { key: 'c', text: 'To second base to hold the batter' },
      { key: 'd', text: 'Straight home in case he keeps going' },
    ],
    correct: 'a',
    why: 'The shortstop is the cutoff on every outfield throw to third, so your job is hitting him — not the base behind him.',
    reveal: reveal(
      {
        RF: 'Get to it, crow-hop, and throw through the shortstop.',
        SS: 'Cutoff on the line to third. Hands up, name loud.',
        '3B': 'Cover third and make the cut call.',
        '2B': 'Cover second — the batter will try to take it.',
        '1B': 'Cover first.',
        P: 'Back up third.',
        C: 'Stay home.',
        CF: 'Back up the right fielder.',
        LF: 'Cross in behind third.',
      },
      { primary: 'RF' },
    ),
  },

  {
    id: 'p4-25',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'P',
    situation: 'Ball is in the left-center gap. The shortstop is out on the grass as the relay man and the runner is going to try to score.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Get between third and home, then back up whichever one the throw goes to' },
      { key: 'b', text: 'Go out and be a second relay man behind the shortstop' },
      { key: 'c', text: 'Cover second base' },
      { key: 'd', text: 'Stay on the mound as an extra cutoff option' },
    ],
    correct: 'a',
    why: 'On an extra-base hit you cannot know yet which base the throw ends at, so you split the two and commit once the relay man turns.',
    trap: 'Picking a base early feels decisive and it is a guess. Standing between them costs you nothing and covers both.',
    reveal: reveal(
      {
        LF: 'Run it down and hit the relay man.',
        SS: 'Relay man out on the grass, lined up with home.',
        '2B': 'Cover second.',
        '3B': 'Cover third and make the call if it comes there.',
        C: 'Home is yours — set up and make the call.',
        P: 'Split third and home. Read the relay man, then commit and sprint.',
        '1B': 'Cover first, then trail toward the cut line.',
        CF: 'Chase and back up.',
        RF: 'Cross all the way in behind second.',
      },
      { primary: 'P' },
    ),
  },
].map((q) => ({ ...q, phase: 'phase4', correctText: q.options.find((o) => o.key === q.correct).text }));
