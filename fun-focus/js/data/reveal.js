/* Whole-field reveal helper for the hand-written phases.

   Every question shows all nine positions — that reveal is the differentiator
   and it never gets skipped. This fills in the positions a question doesn't
   bother to specify so the data files only have to write the rows that
   actually carry the lesson. */

import { POSITION_ORDER } from '../ui.js';

/**
 * @param {Object} jobs      position -> job text, for the rows that matter
 * @param {Object} options   { primary: 'SS', fallback: {pos->text} }
 */
export function reveal(jobs, { primary, fallback = {} } = {}) {
  return POSITION_ORDER.map((pos) => ({
    pos,
    job: jobs[pos] || fallback[pos] || GENERIC[pos],
    primary: primary === pos,
  }));
}

/* Last-resort lines. Honest and position-specific, never "do nothing". */
const GENERIC = {
  P: 'Off the mound and into the play — you back up a base on every throw.',
  C: 'Home is yours. Call the play out loud before the pitch.',
  '1B': 'First is yours. Give a target.',
  '2B': 'Move with the ball and cover your half of the middle.',
  SS: 'Move with the ball and cover your half of the middle.',
  '3B': 'Third is yours. Know whether that runner can go.',
  LF: 'Break in behind third.',
  CF: 'Break in behind second.',
  RF: 'Break in behind first.',
};
