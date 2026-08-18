/* ============================================================================
   THE CHANT BOOK

   ---------------------------------------------------------------------------
   THE ONE RULE, and it is not negotiable:
   Every chant in here hypes OUR guy. None of them say a word about theirs.

   That is not politeness, it is the rulebook. Little League International
   bans taunting and "negative chatter" aimed at opponents, and most leagues
   stop all chanting once the pitcher starts his windup. Half of what turns up
   if you search "baseball chants" is aimed at the other team's pitcher and
   would get a dugout warned. None of that is in here, and nothing like it
   should be added.
   ---------------------------------------------------------------------------

   WHAT MAKES ONE WORK, at 10 and 11:
     - One breath. If it can't be taught in three seconds it won't spread.
     - Call-and-response beats a group recital — one kid leads, everyone answers.
     - It has to sound tough, not cute. This age group will drop anything that
       feels babyish, instantly and permanently.
     - Short beats clever. "FROZE HIM!" is one word and it will outlive
       everything else in this file.

   Several of these deliberately encode the "What Fun Looks Like in a Game"
   standards — "on the rail", "we got him", "everybody moves" — so the chants
   teach the checklist instead of sitting beside it.
   ========================================================================= */

/* line.who: 'lead' = one kid calls it, 'all' = whole dugout answers,
   undefined = everyone together. */

export const CHANT_SECTIONS = [
  {
    id: 'break',
    name: 'Breaking the huddle',
    blurb: 'Hands in, before the first pitch.',
    chants: [
      {
        id: 'good-better-best',
        name: 'Good, Better, Best',
        moment: 'The team break. This one is ours and it never changes.',
        lines: [
          { text: 'Good, better, best!' },
          { text: 'Never let it rest!' },
          { text: "'Til your good gets better," },
          { text: 'And your better gets best!' },
          { who: 'lead', text: '[TEAM] on three!' },
          { who: 'all', text: '1, 2, 3 — [TEAM]!' },
        ],
      },
      {
        id: 'cold-blooded',
        name: 'Cold Blooded',
        moment: 'Short break before a big inning, or when everyone needs waking up.',
        signature: true,
        lines: [
          { who: 'lead', text: 'What are we?' },
          { who: 'all', text: 'COLD!' },
          { who: 'lead', text: 'What are we?' },
          { who: 'all', text: 'COLD BLOODED!' },
          { who: 'lead', text: 'Hands in — ice on three!' },
          { who: 'all', text: '1, 2, 3 — ICE!' },
        ],
      },
    ],
  },

  {
    id: 'batter',
    name: 'Our guy is up',
    blurb: 'Every at-bat gets noise. Every single one.',
    chants: [
      {
        id: 'here-we-go',
        name: 'Here We Go',
        moment: 'Any at-bat. The one everybody already knows — start here.',
        lines: [
          { text: 'Here we go, [NAME], here we go!' },
          { text: '(clap-clap)' },
          { text: 'Here we go, [NAME], here we go!' },
        ],
        note: 'Swap in his real name. Hearing your own name from the dugout is the whole point.',
      },
      {
        id: 'barrel',
        name: 'Barrel',
        moment: 'First pitch of an at-bat.',
        lines: [
          { who: 'lead', text: 'Find the—' },
          { who: 'all', text: 'BARREL!' },
          { who: 'lead', text: 'Find the—' },
          { who: 'all', text: 'BARREL!' },
        ],
      },
      {
        id: 'lock-in',
        name: 'Lock In',
        moment: 'Runners on. Time to focus up.',
        lines: [
          { who: 'lead', text: 'Lock it in!' },
          { who: 'all', text: 'LOCKED!' },
          { who: 'lead', text: 'Lock it in!' },
          { who: 'all', text: 'LOCKED!' },
        ],
      },
      {
        id: 'good-eye',
        name: 'Good Eye',
        moment: 'He took a ball. Reward the take.',
        lines: [{ text: 'Good eye, good eye!' }],
        note: 'Taking a pitch is a skill. Cheering it is how it becomes a habit.',
      },
      {
        id: 'battle',
        name: 'Battle',
        moment: 'Full count.',
        lines: [
          { text: 'BAT-TLE!' },
          { text: 'BAT-TLE!' },
          { text: '(clap, clap, clap)' },
        ],
      },
      {
        id: 'fight-it-off',
        name: 'Fight It Off',
        moment: 'Two strikes.',
        lines: [
          { who: 'lead', text: 'Two strikes!' },
          { who: 'all', text: 'FIGHT IT OFF!' },
        ],
        note: 'Two strikes is not bad news. It is a different job, and this is how we say so.',
      },
    ],
  },

  {
    id: 'signature',
    name: 'Creamsicle calls',
    blurb: 'Ours. Nobody else has these.',
    chants: [
      {
        id: 'ice-cold',
        name: 'Ice Cold',
        moment: 'A clutch hit. Big moment, big swing.',
        signature: true,
        lines: [
          { who: 'lead', text: 'How cold?' },
          { who: 'all', text: 'ICE COLD!' },
          { who: 'lead', text: 'How cold?' },
          { who: 'all', text: 'ICE! COLD!' },
        ],
      },
      {
        id: 'froze-him',
        name: 'Froze Him',
        moment: 'Our pitcher gets a called strike three.',
        signature: true,
        lines: [{ text: 'FROZE HIM!' }],
        note: 'One word, whole dugout, all at once. Do not add anything to it.',
      },
      {
        id: 'two-scoops',
        name: 'Two Scoops',
        moment: 'A double.',
        signature: true,
        lines: [
          { text: 'TWO SCOOPS!' },
          { text: '(clap-clap)' },
        ],
      },
      {
        id: 'stack-it',
        name: 'Stack It Up',
        moment: 'Runners on and the line is moving. Rally chant.',
        signature: true,
        lines: [
          { who: 'lead', text: 'Stack it!' },
          { who: 'all', text: 'UP!' },
          { who: 'lead', text: 'Stack it!' },
          { who: 'all', text: 'UP!' },
          { text: '(each round a little faster)' },
        ],
      },
      {
        id: 'stay-cold',
        name: 'Stay Cold',
        moment: 'Tight game, late innings, everyone tightening up.',
        signature: true,
        lines: [
          { who: 'lead', text: 'Pressure?' },
          { who: 'all', text: 'STAY COLD!' },
        ],
      },
    ],
  },

  {
    id: 'defense',
    name: 'We are in the field',
    blurb: 'Nine guys talking. Never silent between pitches.',
    chants: [
      {
        id: 'right-here',
        name: 'Right Here',
        moment: 'Our pitcher needs a strike.',
        lines: [{ text: 'Right here, right now!' }],
      },
      {
        id: 'everybody-moves',
        name: 'Everybody Moves',
        moment: 'Two outs. Say it before the pitch.',
        lines: [
          { who: 'lead', text: 'Two outs!' },
          { who: 'all', text: 'EVERYBODY MOVES!' },
        ],
        note: 'This is a Focus standard turned into a chant. Nobody stands still on a two-out play.',
      },
      {
        id: 'three-up',
        name: 'Three Up',
        moment: 'Start of a clean inning.',
        lines: [
          { who: 'lead', text: 'Three up!' },
          { who: 'all', text: 'THREE DOWN!' },
        ],
      },
    ],
  },

  {
    id: 'teammate',
    name: 'For each other',
    blurb: 'The ones that matter most. Loudest right after something goes wrong.',
    chants: [
      {
        id: 'we-got-him',
        name: 'We Got Him',
        moment: 'Right after a teammate misses one. Do not wait.',
        lines: [
          { who: 'lead', text: "Who's got him?" },
          { who: 'all', text: 'WE GOT HIM!' },
        ],
        note: 'The standard says the nearest teammate goes first and goes fast. This is that, out loud.',
      },
      {
        id: 'next-one',
        name: 'Next One',
        moment: 'Anybody, any mistake, any time.',
        lines: [{ text: 'Next one! Next one!' }],
      },
      {
        id: 'on-the-rail',
        name: 'On The Rail',
        moment: 'A teammate is walking up. Get off the bench.',
        lines: [
          { who: 'lead', text: 'Where we at?' },
          { who: 'all', text: 'ON THE RAIL!' },
        ],
        note: 'Every walk-up, the dugout is standing. This is the reminder.',
      },
    ],
  },
];

/** Flat list, for counting and lookups. */
export const ALL_CHANTS = CHANT_SECTIONS.flatMap((s) => s.chants);

/* The one thing a kid should remember if he remembers nothing else. */
export const CHANT_RULE = {
  title: 'One rule',
  body: 'We get loud for our guy. We never say a word about theirs. That is the whole rule, and it is also the actual league rule — chirping the other team gets the dugout warned.',
};
