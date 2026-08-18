/* ============================================================================
   PHASE 3 — BACKING UP & BUNT COVERAGE

   Standard: every player not directly involved in a play moves to a correct
   backup position, and bunt coverage assignments are automatic.

   Almost every question here is "you are NOT the one fielding this — where do
   you go?" This is also the phase that carries the fuller backup-rotation
   detail Phase 1's reveal deliberately simplified.

   ---------------------------------------------------------------------------
   THE BACKUP RULES THIS PHASE TEACHES
     Throw to first  -> right fielder backs it up
     Throw to second -> center fielder backs it up
     Throw to third  -> left fielder backs it up
     Throw to home   -> pitcher backs it up
     Catcher trails the batter down the first-base line ONLY with the bases
       empty. Any runner on base and he stays at the plate.
     Pitcher covers first on any ball to the right side, and otherwise goes to
       whichever base the next throw is heading for.
     The far-side outfielder never stands still — he comes in behind the bag
       the relay is going to.

   THE BUNT SYSTEM THIS PHASE TEACHES
     P   fields anything up the middle
     C   fields anything in front of the plate and calls the base out loud
     1B  charges the line
     2B  covers first
     SS  covers second
     3B  charges with the bases empty or a runner on first;
         HOLDS third any time there is a runner on second
     LF/CF/RF back up third / second / first as usual

   ---------------------------------------------------------------------------
   COACH'S CALL, flagged rather than guessed: bunt coverage is the one area of
   this app where real teams genuinely differ. Rotation systems (SS covers
   third so the third baseman can always crash) and wheel plays are both
   common and both correct. This app teaches the simple split above because it
   is the one that holds up when eleven ten-year-olds have to run it without
   thinking. If the team's practice system differs, change the 3B/SS rules in
   this file and the questions that depend on them (p3-08, p3-09, p3-13).
   ========================================================================= */

import { reveal } from './reveal.js';

export const PHASE3_META = {
  id: 'phase3',
  num: 'Phase 3',
  name: 'Backing Up & Bunt Coverage',
  standard:
    'Everyone not fielding the ball moves to a correct backup spot, and bunt assignments happen without anyone being told.',
};

export const PHASE3_QUESTIONS = [
  {
    id: 'p3-01',
    outs: 0,
    bases: [],
    basesLabel: 'Bases empty',
    pos: 'RF',
    situation: 'Routine ground ball to the shortstop. The throw is going to first.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint in behind first base and line up with the throw' },
      { key: 'b', text: 'Stay where you are — the play is on the infield' },
      { key: 'c', text: 'Break in toward second base' },
      { key: 'd', text: 'Move toward the right-field line in case it gets by' },
    ],
    correct: 'a',
    why: 'Every throw to first has a right fielder behind it — that is how a bad throw stays a single instead of a double.',
    reveal: reveal(
      {
        SS: 'Field it and throw to first.',
        '1B': 'Cover first, give a target, stretch.',
        RF: 'Sprint in and line up directly behind the bag with the flight of the throw.',
        C: 'Bases empty — trail the batter down the first-base line as a second backup.',
        P: 'Break toward the first-base line in case you are needed to cover.',
        '2B': 'Cover second behind the play.',
        '3B': 'Cover third.',
        CF: 'Break in behind second.',
        LF: 'Break in behind third.',
      },
      { primary: 'RF' },
    ),
  },

  {
    id: 'p3-02',
    outs: 0,
    bases: [],
    basesLabel: 'Bases empty',
    pos: 'C',
    situation: 'Ground ball to the shortstop, throw going to first.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Run down the first-base line behind the bag' },
      { key: 'b', text: 'Stay at the plate — home is always yours' },
      { key: 'c', text: 'Follow the ball toward the shortstop' },
      { key: 'd', text: 'Back up the pitcher on the mound' },
    ],
    correct: 'a',
    why: 'With nobody on base, home does not need you — if that throw gets by the first baseman, you are the next man behind it.',
    trap: 'Staying at the plate feels like the catcher\'s whole job, and it is the moment anyone is on base. Bases empty, your job is down the line.',
    reveal: reveal(
      {
        SS: 'Field and throw to first.',
        '1B': 'Cover first and stretch.',
        RF: 'First backup — directly behind the bag.',
        C: 'Second backup — sprint the line. You are the reason a wild throw does not become a triple.',
        P: 'Toward the first-base line.',
        '2B': 'Cover second.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p3-03',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'CF',
    situation: 'Ground ball to the shortstop. He is throwing to second for the force.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Break in hard behind second base' },
      { key: 'b', text: 'Hold your ground — the ball is on the infield' },
      { key: 'c', text: 'Move over behind the shortstop' },
      { key: 'd', text: 'Break in behind first for the relay' },
    ],
    correct: 'a',
    why: 'Every throw to second has a center fielder behind it, and that feed is the one most likely to get away.',
    reveal: reveal(
      {
        SS: 'Field it and feed second.',
        '2B': 'Cover second, take the force, relay to first.',
        CF: 'Break in behind second and line up with the throw.',
        '1B': 'Cover first for the relay.',
        RF: 'Break in behind first for that relay throw.',
        P: 'Get off the mound toward the first-base side.',
        C: 'Runner on base — stay home.',
        '3B': 'Cover third.',
        LF: 'Break in behind third.',
      },
      { primary: 'CF' },
    ),
  },

  {
    id: 'p3-04',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'P',
    situation: 'Ground ball to the second baseman. The throw is going to first and the runner takes off for third.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Get over to third base and back it up' },
      { key: 'b', text: 'Back up first base behind the throw' },
      { key: 'c', text: 'Stay on the mound and watch the play' },
      { key: 'd', text: 'Cover second base' },
    ],
    correct: 'a',
    why: 'That runner is going to try for third on the throw, so if a throw comes there you need to already be behind it.',
    trap: 'Backing up first is the instinct, and that is the right fielder\'s job. Yours is wherever the NEXT throw is going.',
    reveal: reveal(
      {
        '2B': 'Field it and throw to first.',
        '1B': 'Cover first.',
        RF: 'Back up the throw to first.',
        P: 'Sprint behind third — that is where the next throw goes.',
        '3B': 'Cover third and call for the ball if he commits.',
        SS: 'Cover second behind him.',
        LF: 'Break in behind third — you and the pitcher both.',
        C: 'Runner on base — stay home and read the play.',
      },
      { primary: 'P' },
    ),
  },

  {
    id: 'p3-05',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'P',
    situation: 'Base hit to left field. The runner rounds third and the throw is going home.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Get behind the catcher and back up home' },
      { key: 'b', text: 'Line up as the cutoff man for the throw' },
      { key: 'c', text: 'Cover third base' },
      { key: 'd', text: 'Stay on the mound and back up nothing' },
    ],
    correct: 'a',
    why: 'Any throw to the plate from the outfield has the pitcher behind the catcher — nobody else is close enough.',
    reveal: reveal(
      {
        LF: 'Field it clean and throw through the cutoff to the plate.',
        '3B': 'Line up as the cutoff between left field and home.',
        C: 'Give a lane, take the throw, make the tag.',
        P: 'Sprint behind home. Deep enough that a ball off the backstop stays in front of you.',
        SS: 'Cover third behind the runner.',
        '2B': 'Cover second — the batter will try to take it on the throw.',
        '1B': 'Cover first.',
        CF: 'Back up the left fielder.',
      },
      { primary: 'P' },
    ),
  },

  {
    id: 'p3-06',
    outs: 0,
    bases: [],
    basesLabel: 'Bases empty',
    pos: '2B',
    situation: 'The batter squares around and lays down a bunt toward the first-base side.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint over and cover first base' },
      { key: 'b', text: 'Charge the bunt' },
      { key: 'c', text: 'Cover second base' },
      { key: 'd', text: 'Back up the first baseman on the line' },
    ],
    correct: 'a',
    why: 'The first baseman is charging, so first belongs to you the moment the batter squares.',
    trap: 'Nothing is hit anywhere near you, which is exactly why it is easy to freeze. On a bunt your job starts before the ball is on the ground.',
    reveal: reveal(
      {
        C: 'Field anything in front of the plate and call the base out loud.',
        P: 'Field anything up the middle.',
        '1B': 'Charge the line hard.',
        '2B': 'Cover first — you are the bag.',
        SS: 'Cover second.',
        '3B': 'Bases empty, so charge.',
        RF: 'Break in behind first for the throw.',
        CF: 'Break in behind second.',
        LF: 'Break in behind third.',
      },
      { primary: '2B' },
    ),
  },

  {
    id: 'p3-07',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'SS',
    situation: 'The batter squares and bunts it up the first-base line.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Cover second base' },
      { key: 'b', text: 'Charge in behind the pitcher' },
      { key: 'c', text: 'Cover third base' },
      { key: 'd', text: 'Cover first base' },
    ],
    correct: 'a',
    why: 'The runner from first is going to second, and the middle infielders split the bags — second is yours, first is the second baseman\'s.',
    reveal: reveal(
      {
        C: 'Field anything in front of the plate. Call "one!" or "two!" loud.',
        P: 'Field anything up the middle.',
        '1B': 'Charge the line.',
        '2B': 'Cover first.',
        SS: 'Cover second — that is where the lead runner is going.',
        '3B': 'Nobody on second, so charge.',
        RF: 'Back up first.',
        CF: 'Back up second.',
        LF: 'Back up third.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p3-08',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: '3B',
    situation: 'The batter squares to bunt.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Stay home and cover third' },
      { key: 'b', text: 'Charge the line hard' },
      { key: 'c', text: 'Charge halfway, then read it' },
      { key: 'd', text: 'Cover second base' },
    ],
    correct: 'a',
    why: 'Any time there is a runner on second, third base is yours — charging leaves the exact bag he is running to wide open.',
    trap: 'With the bases empty you attack that bunt, and that instinct is correct there. The runner on second is the thing that changes it.',
    reveal: reveal(
      {
        '3B': 'Hold third. Give a target and call for it if he commits.',
        P: 'Field the middle AND the third-base side — the corner is not charging.',
        '1B': 'Charge the line.',
        C: 'Field anything in front of the plate and call the base.',
        '2B': 'Cover first.',
        SS: 'Cover second.',
        LF: 'Break in behind third — that is the live base.',
        RF: 'Back up first.',
        CF: 'Back up second.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p3-09',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'P',
    situation: 'The batter squares to bunt and the third baseman is holding the bag.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Field the middle and take the third-base side too' },
      { key: 'b', text: 'Field only what comes straight back at you' },
      { key: 'c', text: 'Cover third base yourself' },
      { key: 'd', text: 'Break toward first to cover' },
    ],
    correct: 'a',
    why: 'With the third baseman staying home, the whole left side of the bunt is yours — nobody else is coming for it.',
    reveal: reveal(
      {
        P: 'Off the mound hard and to your left. You own everything from the middle to the third-base line.',
        '3B': 'Hold third.',
        C: 'Anything you can reach in front of the plate — and call the base.',
        '1B': 'Charge the line.',
        '2B': 'Cover first.',
        SS: 'Cover second.',
        LF: 'Back up third.',
        CF: 'Back up second.',
        RF: 'Back up first.',
      },
      { primary: 'P' },
    ),
  },

  {
    id: 'p3-10',
    outs: 0,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'CF',
    situation: 'Base hit into right field in front of the right fielder.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint over behind the right fielder' },
      { key: 'b', text: 'Hold your spot and let him have it' },
      { key: 'c', text: 'Break in toward second base' },
      { key: 'd', text: 'Move toward the gap and wait' },
    ],
    correct: 'a',
    why: 'Outfielders back each other up first — if it gets past him, you are what keeps it from rolling to the wall.',
    reveal: reveal(
      {
        RF: 'Field it clean and get it in — keep the runner from taking third.',
        CF: 'Angle in behind him, not straight at him. Take the ball if it gets by.',
        '2B': 'Go out for the relay.',
        SS: 'Cover second behind the runner.',
        '3B': 'Cover third — that is where he is headed.',
        '1B': 'Cover first for the batter.',
        P: 'Get toward third to back it up.',
        C: 'Stay home and read it.',
        LF: 'Cross behind second in case a relay goes there.',
      },
      { primary: 'CF' },
    ),
  },

  {
    id: 'p3-11',
    outs: 1,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'RF',
    situation: 'Ball is smoked into the left-center gap. It is nowhere near you.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint all the way in toward second base' },
      { key: 'b', text: 'Stay put — the ball is on the other side of the field' },
      { key: 'c', text: 'Run toward the gap to help chase it down' },
      { key: 'd', text: 'Come in and cover first base' },
    ],
    correct: 'a',
    why: 'A ball in the other gap still gives you a job — get behind second so a relay throw that gets away does not turn into another base.',
    trap: 'It genuinely looks like a play you are not part of. The far-side outfielder never stands still; he goes to the bag the relay is coming to.',
    reveal: reveal(
      {
        LF: 'Run it down, get to it, and give the relay man a target.',
        CF: 'Chase with him and call who takes it.',
        SS: 'Go out as the relay man, line up with the throw.',
        '2B': 'Cover second.',
        RF: 'All the way in behind second base.',
        '3B': 'Cover third — the runner is coming.',
        C: 'Stay home. That runner is scoring on this unless something happens.',
        P: 'Get between third and home and read where the throw is going.',
        '1B': 'Cover first, then trail toward the cutoff line.',
      },
      { primary: 'RF' },
    ),
  },

  {
    id: 'p3-12',
    outs: 0,
    bases: [1, 2],
    basesLabel: 'Runners on 1st & 2nd',
    pos: '1B',
    situation: 'The batter squares around to bunt.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Charge the line hard' },
      { key: 'b', text: 'Hold the bag — there are runners on' },
      { key: 'c', text: 'Charge halfway and read it' },
      { key: 'd', text: 'Back up toward second base' },
    ],
    correct: 'a',
    why: 'Your bunt job does not change with runners on — you charge, and the second baseman has first behind you.',
    reveal: reveal(
      {
        '1B': 'Charge. Full speed, and be ready to field it barehanded if it stops.',
        '2B': 'Cover first.',
        C: 'Field what you can and call the base — with a force at third, that call matters.',
        P: 'Field the middle and the third-base side.',
        '3B': 'Runner on second, so hold third. That force is live.',
        SS: 'Cover second.',
        LF: 'Back up third.',
        CF: 'Back up second.',
        RF: 'Back up first.',
      },
      { primary: '1B' },
    ),
  },

  {
    id: 'p3-13',
    outs: 0,
    bases: [1, 2],
    basesLabel: 'Runners on 1st & 2nd',
    pos: 'SS',
    situation: 'The batter squares to bunt and the third baseman stays home on the bag.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Cover second base' },
      { key: 'b', text: 'Cover third base' },
      { key: 'c', text: 'Charge in to help field the bunt' },
      { key: 'd', text: 'Back up the pitcher' },
    ],
    correct: 'a',
    why: 'The third baseman is already holding third, so the bags split the usual way — second is yours, first is the second baseman\'s.',
    reveal: reveal(
      {
        SS: 'Cover second. Get there early and give a target.',
        '3B': 'Hold third — the force there is the lead out.',
        '2B': 'Cover first.',
        '1B': 'Charge the line.',
        P: 'Field the middle and the third-base side.',
        C: 'Call the base loud. Third if it is fielded quick, first if it is not.',
        LF: 'Back up third.',
        CF: 'Back up second.',
        RF: 'Back up first.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p3-14',
    outs: 2,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'SS',
    situation: 'Ground ball to the second baseman. He is going to first to end the inning.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Cover second base until you hear the out call' },
      { key: 'b', text: 'Start jogging toward the dugout' },
      { key: 'c', text: 'Break in behind first base' },
      { key: 'd', text: 'Cover third base' },
    ],
    correct: 'a',
    why: 'The runner is still running, so until that out is actually made the bag behind him is yours.',
    reveal: reveal(
      {
        '2B': 'Field it and make the throw.',
        '1B': 'Cover first — this is the out.',
        SS: 'Cover second. Nobody leaves a bag on a two-out play until the umpire says so.',
        RF: 'Back up first.',
        CF: 'Back up second.',
        P: 'Break toward the line.',
        C: 'Stay home. Runner on base.',
        '3B': 'Cover third.',
      },
      { primary: 'SS' },
    ),
  },

  {
    id: 'p3-15',
    outs: 1,
    bases: [1, 2, 3],
    basesLabel: 'Bases loaded',
    pos: 'P',
    situation: 'Ground ball to the shortstop. He is throwing home for the force.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint behind the catcher and back up home' },
      { key: 'b', text: 'Cover third base' },
      { key: 'c', text: 'Stay on the mound as a cutoff' },
      { key: 'd', text: 'Break toward first for the relay' },
    ],
    correct: 'a',
    why: 'Any throw to the plate has the pitcher behind it — and with the bases loaded, a ball to the backstop does not stop at one runner.',
    reveal: reveal(
      {
        SS: 'Field it and throw home — the lead force.',
        C: 'Foot on the plate, take the force, look to first.',
        P: 'Behind home, deep enough to cut off a ball off the backstop.',
        '1B': 'Cover first for the second half of the double play.',
        '2B': 'Cover second.',
        '3B': 'Cover third — that force is still live.',
        LF: 'Break in behind third.',
        CF: 'Break in behind second.',
        RF: 'Break in behind first.',
      },
      { primary: 'P' },
    ),
  },

  {
    id: 'p3-16',
    outs: 0,
    bases: [3],
    basesLabel: 'Runner on 3rd',
    pos: 'LF',
    situation: 'Fly ball to center field, medium-deep. The runner is going to tag.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Angle in behind the center fielder' },
      { key: 'b', text: 'Hold your position and watch the catch' },
      { key: 'c', text: 'Break in toward third base' },
      { key: 'd', text: 'Move toward the left-field line' },
    ],
    correct: 'a',
    why: 'You back up the catch before you back up anything else — a dropped ball with a runner tagging is the play that gets away.',
    reveal: reveal(
      {
        CF: 'Make the catch moving in, then come up throwing home.',
        LF: 'Angle in behind him. Not straight at him — behind and to the side.',
        '1B': 'Line up as the cutoff between center field and home.',
        C: 'Set up at the plate, give a lane, make the call on the throw.',
        P: 'Back up home.',
        '3B': 'Cover third once he leaves.',
        SS: 'Cover second.',
        '2B': 'Cover second or trail the cutoff, whoever is closer.',
        RF: 'Cross in behind second in case the throw is cut and comes there.',
      },
      { primary: 'LF' },
    ),
  },

  {
    id: 'p3-17',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'C',
    situation: 'The batter squares and drops a bunt three feet in front of the plate.',
    question: 'What is your job?',
    options: [
      { key: 'a', text: 'Pounce on it and call the base out loud' },
      { key: 'b', text: 'Let the pitcher take it and cover the plate' },
      { key: 'c', text: 'Field it and always go to first' },
      { key: 'd', text: 'Point at it and let the corners decide' },
    ],
    correct: 'a',
    why: 'You are the only player facing the whole field, so the throw goes wherever you say it goes.',
    reveal: reveal(
      {
        C: 'Out from behind the plate, field it, and call "one!" or "two!" before you throw.',
        P: 'Field the middle if you get there first — and listen for the call.',
        '1B': 'Charge the line.',
        '2B': 'Cover first.',
        SS: 'Cover second — the force is live there.',
        '3B': 'Nobody on second, so charge.',
        RF: 'Back up first.',
        CF: 'Back up second.',
        LF: 'Back up third.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p3-18',
    outs: 0,
    bases: [2],
    basesLabel: 'Runner on 2nd',
    pos: 'LF',
    situation: 'Base hit to center field. The runner is rounding third and the throw is going there behind him.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint in behind third base' },
      { key: 'b', text: 'Back up the center fielder' },
      { key: 'c', text: 'Hold your position in left' },
      { key: 'd', text: 'Come in behind second base' },
    ],
    correct: 'a',
    why: 'Every throw to third has the left fielder behind it, and you are the only one who can get there.',
    reveal: reveal(
      {
        CF: 'Field it and hit the cutoff man.',
        SS: 'Line up as the cutoff between center field and third.',
        '3B': 'Cover third and call for it.',
        LF: 'In behind third. Line up with the flight of the throw, not the bag.',
        P: 'Read the throw — third or home, get behind one of them.',
        '2B': 'Cover second.',
        '1B': 'Cover first.',
        C: 'Stay home.',
        RF: 'Cross in behind second.',
      },
      { primary: 'LF' },
    ),
  },

  {
    id: 'p3-19',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'RF',
    situation: 'Ground ball to third. He goes to second for the force and the relay is going across to first.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Get in behind first base for the relay throw' },
      { key: 'b', text: 'Back up second base' },
      { key: 'c', text: 'Hold your spot until the ball is in the outfield' },
      { key: 'd', text: 'Move toward the line in case of an overthrow' },
    ],
    correct: 'a',
    why: 'The last throw of a double play is the one most likely to sail, and it is going to your base.',
    reveal: reveal(
      {
        '3B': 'Field it and feed second.',
        '2B': 'Take the force at second, relay across.',
        '1B': 'Cover first and stretch for the relay.',
        RF: 'In behind first, lined up with the throw.',
        CF: 'In behind second for the feed.',
        SS: 'Cover third behind the play.',
        P: 'Break toward the first-base line.',
        C: 'Stay home.',
        LF: 'Break in behind third.',
      },
      { primary: 'RF' },
    ),
  },

  {
    id: 'p3-20',
    outs: 0,
    bases: [],
    basesLabel: 'Bases empty',
    pos: '3B',
    situation: 'The batter squares around to bunt.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Charge the line hard' },
      { key: 'b', text: 'Hold the bag' },
      { key: 'c', text: 'Charge halfway and read it' },
      { key: 'd', text: 'Slide over toward shortstop' },
    ],
    correct: 'a',
    why: 'Nobody is on second, so nothing holds you at the bag — attack it.',
    reveal: reveal(
      {
        '3B': 'Charge. Get to it before it stops rolling.',
        P: 'Field the middle.',
        C: 'Field what is in front of the plate and call the base.',
        '1B': 'Charge the line.',
        '2B': 'Cover first.',
        SS: 'Cover second — and drift toward third since the corner left it.',
        RF: 'Back up first.',
        CF: 'Back up second.',
        LF: 'Back up third.',
      },
      { primary: '3B' },
    ),
  },

  {
    id: 'p3-21',
    outs: 1,
    bases: [3],
    basesLabel: 'Runner on 3rd',
    pos: 'C',
    situation: 'Ground ball to the shortstop. He looks the runner back and throws to first.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Stay at the plate' },
      { key: 'b', text: 'Run down the first-base line behind the throw' },
      { key: 'c', text: 'Move up the third-base line toward the runner' },
      { key: 'd', text: 'Back up the pitcher' },
    ],
    correct: 'a',
    why: 'With a runner on third you never leave home — the moment he breaks, the play is yours.',
    trap: 'With the bases empty you would be sprinting down the line behind that same throw. A runner ninety feet away is what keeps you home.',
    reveal: reveal(
      {
        SS: 'Look him back, then throw to first.',
        C: 'Feet at the plate the whole time. Call "going!" if he breaks.',
        '1B': 'Cover first.',
        RF: 'Back up the throw to first.',
        P: 'Break toward the line, then get behind home if the runner goes.',
        '3B': 'Cover third in case he retreats.',
        '2B': 'Cover second.',
      },
      { primary: 'C' },
    ),
  },

  {
    id: 'p3-22',
    outs: 0,
    bases: [],
    basesLabel: 'Bases empty',
    pos: 'P',
    situation: 'Ground ball to the right side. The first baseman is fielding it a few steps off the bag.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint to first base and cover it' },
      { key: 'b', text: 'Back up first base behind the bag' },
      { key: 'c', text: 'Stay on the mound in case he flips it back' },
      { key: 'd', text: 'Cover second base' },
    ],
    correct: 'a',
    why: 'Any ball to the right side, you break for the bag — that is covering, not backing up, and nobody else is coming.',
    trap: 'Backing up and covering are two different jobs. Backing up means standing behind a base someone else has. Here, nobody has it but you.',
    reveal: reveal(
      {
        '1B': 'Field it, then find the pitcher and lead him with a soft flip.',
        P: 'Sprint to the bag, run the line, catch it before you look for the base.',
        '2B': 'Cover first as the backup option if the pitcher is late.',
        RF: 'Back up first behind the bag.',
        C: 'Bases empty — trail down the line.',
        SS: 'Cover second.',
        '3B': 'Cover third.',
      },
      { primary: 'P' },
    ),
  },

  {
    id: 'p3-23',
    outs: 1,
    bases: [1],
    basesLabel: 'Runner on 1st',
    pos: 'RF',
    situation: 'The batter squares and bunts it toward the first-base line.',
    question: 'Where do you go?',
    options: [
      { key: 'a', text: 'Sprint in behind first base' },
      { key: 'b', text: 'Stay back — a bunt never reaches the outfield' },
      { key: 'c', text: 'Come in behind second base' },
      { key: 'd', text: 'Move toward the line to help field it' },
    ],
    correct: 'a',
    why: 'The throw is going to first, so your job is the same as it always is — a bunt does not change where you go.',
    reveal: reveal(
      {
        '1B': 'Charge the line.',
        '2B': 'Cover first.',
        RF: 'In behind first. Everyone is crashing in, so an overthrow has nobody but you behind it.',
        C: 'Field what you can, call the base.',
        P: 'Field the middle.',
        SS: 'Cover second.',
        '3B': 'Nobody on second — charge.',
        CF: 'Back up second.',
        LF: 'Back up third.',
      },
      { primary: 'RF' },
    ),
  },
].map((q) => ({ ...q, phase: 'phase3', correctText: q.options.find((o) => o.key === q.correct).text }));
