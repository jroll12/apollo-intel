/* Static reference content for the Fun tab. No backend, no edits needed. */

/* Parked with the Fun tab — nothing imports this yet. See js/fun.js.

   The chant. [TEAM] is swapped at render time for CONFIG.chantName, not
   teamName: "Creamsicles on three" is what gets shouted, not "The
   Creamsicles on three". */
export const CHANT_LINES = [
  'Good, better, best!',
  'Never let it rest,',
  "'Til your good gets better,",
  'And your better gets best!',
];

export const CHANT_CLOSER = '[TEAM] on three — 1, 2, 3, [TEAM]!';

export const HANDSHAKE_BASE = [
  { step: '1', move: 'Clap' },
  { step: '2', move: 'Bump' },
  { step: '3', move: 'Spin' },
];

/* "What Fun Looks Like in a Game" — six items, exactly as the coaching
   system already words them. */
export const FUN_CHECKLIST = [
  {
    moment: 'Walk-up',
    looks: "Batter's song plays, dugout's up on the rail hyping them to the plate",
  },
  {
    moment: 'Every pitch',
    looks: 'Full dugout on its feet, calling out something specific',
  },
  {
    moment: 'Between innings',
    looks: 'One quick teammate-to-teammate shoutout, kid-to-kid',
  },
  {
    moment: 'On the bench',
    looks: 'Every non-starter has a job that inning (chart pitches, lead the cheer, run the walk-up cue)',
  },
  {
    moment: 'After a mistake',
    looks: "Nearest teammate's first move is encouragement, not silence",
  },
  {
    moment: 'Big play or hit',
    looks: "Team's signature celebration moves",
  },
];
