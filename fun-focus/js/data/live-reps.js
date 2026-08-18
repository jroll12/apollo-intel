/* ============================================================================
   LIVE REPS — builds one random batted ball, then asks the player what their
   job was on it.

   The rep is generated before the animation runs, but the player sees only
   the pre-pitch situation until the ball is hit. That is the whole point:
   they have to read it live instead of off a card.

   Combination count is genuinely large — 3 out counts x up to 8 runner states
   x 9 positions x 5 hit types x 16 landing zones — so the answers are
   computed by the play engine rather than authored.
   ========================================================================= */

import { ZONES, BUNT_ZONES, INFIELD_ZONES, OUTFIELD_ZONES } from './field-geometry.js';
import { resolvePlay, allowedRunnerStates, POSITIONS } from './play-engine.js';
import { shuffle } from '../ui.js';

/* Hit types paired with the zones they can legally land in, and how often
   each should come up. Weights are rough play-frequency, not uniform — a kid
   should see far more ground balls than pop-ups. */
const HIT_KINDS = [
  { type: 'grounder', zones: INFIELD_ZONES, weight: 34, arc: 0, label: 'ground ball' },
  { type: 'grounder', zones: OUTFIELD_ZONES, weight: 12, arc: 4, label: 'ground ball through' },
  { type: 'liner', zones: OUTFIELD_ZONES, weight: 18, arc: 14, label: 'line drive' },
  { type: 'fly', zones: OUTFIELD_ZONES, weight: 21, arc: 55, label: 'fly ball' },
  { type: 'popup', zones: INFIELD_ZONES, weight: 7, arc: 68, label: 'pop up' },
  { type: 'bunt', zones: Object.keys(BUNT_ZONES), weight: 8, arc: 0, label: 'bunt' },
];

function pickWeighted(items) {
  const total = items.reduce((n, i) => n + i.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * @param {string} you  the position the player is manning this rep
 */
export function generateRep(you) {
  const kind = pickWeighted(HIT_KINDS);
  const zoneKey = pick(kind.zones);
  const isBunt = kind.type === 'bunt';
  const zone = isBunt ? BUNT_ZONES[zoneKey] : ZONES[zoneKey];

  const states = allowedRunnerStates(kind.type, !isBunt && zone.infield);
  const state = pick(states);
  const outs = Math.floor(Math.random() * 3);

  const play = resolvePlay({
    outs,
    runners: new Set(state.bases),
    hitType: kind.type,
    zoneKey,
  });

  const mine = play.fielder === you;
  const correctText = play.assignments[you].text;

  return {
    id: `${state.key}-${outs}-${kind.type}-${zoneKey}-${you}`,
    you,
    outs,
    bases: state.bases,
    basesLabel: state.label,
    play,
    mine,
    question: mine ? "It's yours. What now?" : 'Not your ball. Where do you go?',
    correctText,
    options: buildLiveOptions(play, you, correctText),
    flight: {
      to: zone.spot,
      arc: kind.arc,
      type: kind.type,
      // Grounders and bunts stay on the deck and take longer to get there.
      duration: isBunt ? 1500 : kind.type === 'grounder' ? 1350 : kind.arc > 40 ? 2100 : 1500,
    },
  };
}

/**
 * Wrong answers are other positions' REAL jobs on this same play. That makes
 * every option plausible, and it means picking one teaches you whose job it
 * actually was.
 */
function buildLiveOptions(play, you, correctText) {
  const seen = new Set([correctText]);
  const pool = [];

  for (const pos of POSITIONS) {
    if (pos === you) continue;
    const text = play.assignments[pos].text;
    if (seen.has(text)) continue;
    seen.add(text);
    pool.push(text);
  }

  // Prefer distinct-sounding jobs over three variations of "cover a base".
  const byRole = (t) => (t.startsWith('Cover') ? 1 : 0);
  pool.sort((a, b) => byRole(a) - byRole(b));

  const wrong = shuffle(pool.slice(0, 5)).slice(0, 3);
  while (wrong.length < 3) {
    const filler = FILLER.find((f) => !seen.has(f));
    if (!filler) break;
    seen.add(filler);
    wrong.push(filler);
  }

  return shuffle([correctText, ...wrong]).map((text, i) => ({ key: `o${i}`, text }));
}

/* Only used if a play somehow yields fewer than three distinct other jobs. */
const FILLER = [
  'Hold your ground and let the play come to you.',
  'Run at the lead runner and try to tag him.',
  'Back up the pitcher on the mound.',
];

export { HIT_KINDS };
