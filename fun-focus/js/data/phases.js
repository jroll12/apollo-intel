/* All four phases in one place. Phase 1 is generated from a rules table;
   phases 2-4 are hand-written banks. Both end up as the same question shape,
   so the quiz loop does not care which is which. */

import { buildPhase1Questions, PHASE1_META } from './phase1.js';
import { PHASE2_META, PHASE2_QUESTIONS } from './phase2.js';
import { PHASE3_META, PHASE3_QUESTIONS } from './phase3.js';
import { PHASE4_META, PHASE4_QUESTIONS } from './phase4.js';

export const PHASES = [
  { ...PHASE1_META, questions: buildPhase1Questions() },
  { ...PHASE2_META, questions: PHASE2_QUESTIONS },
  { ...PHASE3_META, questions: PHASE3_QUESTIONS },
  { ...PHASE4_META, questions: PHASE4_QUESTIONS },
];

export function getPhase(id) {
  return PHASES.find((phase) => phase.id === id);
}
