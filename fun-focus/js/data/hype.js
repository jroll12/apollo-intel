/* Golden-Chain-themed hype lines, shown on a correct answer only.
   Rotating pool — one at random. Tone: dugout, short, never about outcome,
   never about what a player owes anyone. Add more freely. */
export const HYPE_LINES = [
  'Chain-worthy read right there.',
  "Full dugout's on the rail for that one.",
  "That's automatic. Let's go.",
  'Locked in. Next one.',
  "That's the pre-pitch work showing up.",
  'You knew it before it was hit. That’s the whole thing.',
  "Chain's getting heavier.",
  "Coach didn't even have to say it.",
  'Nine guys thinking like that? Good luck to them.',
  'Called it before the pitch. That’s the standard.',
  'Clean read, clean job.',
  "That's a link in the chain.",
  "Dugout's up. That's how it should be.",
  'You were ready before the ball moved.',
  'Nothing sneaks up on you.',
  "That's the rep that shows up Saturday.",
  'Textbook. Next situation.',
  'Chain link earned.',
  'Right answer, right away.',
  "That's what knowing the situation looks like.",
  'Head was already there. Love it.',
  'Quiet confidence. Big play.',
];

export function randomHype() {
  return HYPE_LINES[Math.floor(Math.random() * HYPE_LINES.length)];
}
