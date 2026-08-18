/* Personal, per-device state: which player this phone belongs to, and that
   player's progress per phase. localStorage is exactly right here — this is
   meant to be private to the phone and does not need to sync anywhere.

   Progress is stored per player so a shared family phone doesn't blend two
   kids' streaks together. */

import { STORAGE_PREFIX } from './config.js';

const KEY_PLAYER = `${STORAGE_PREFIX}.player`;
const KEY_PROGRESS = `${STORAGE_PREFIX}.progress`;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    // Private browsing, full storage, or a corrupt value — carry on unsaved.
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ---------- Player -------------------------------------------------------- */

export function getPlayer() {
  return read(KEY_PLAYER, null);
}

export function setPlayer(name) {
  write(KEY_PLAYER, name);
}

/* ---------- Progress ------------------------------------------------------
   Shape: { "<player>": { "<phaseId>": { correctIds: [], seen: n,
                                         streak: n, bestStreak: n } } }
   Note what is NOT stored: wrong counts, misses, error rates. There is no
   consequence system in this app and nothing here should let one be built. */

function allProgress() {
  return read(KEY_PROGRESS, {});
}

export function getPhaseProgress(player, phaseId) {
  const forPlayer = allProgress()[player || '_'] || {};
  const phase = forPlayer[phaseId] || {};
  return {
    correctIds: phase.correctIds || [],
    seen: phase.seen || 0,
    streak: phase.streak || 0,
    bestStreak: phase.bestStreak || 0,
  };
}

/**
 * Record one answered question.
 * A question counts toward completion the first time it is answered
 * correctly, and stays counted — completion only ever goes up.
 */
export function recordAnswer(player, phaseId, questionId, wasCorrect) {
  const key = player || '_';
  const data = allProgress();
  data[key] = data[key] || {};
  const phase = {
    correctIds: [],
    seen: 0,
    streak: 0,
    bestStreak: 0,
    ...(data[key][phaseId] || {}),
  };

  phase.seen += 1;

  if (wasCorrect) {
    if (!phase.correctIds.includes(questionId)) phase.correctIds.push(questionId);
    phase.streak += 1;
    if (phase.streak > phase.bestStreak) phase.bestStreak = phase.streak;
  } else {
    // The current streak resets. Nothing is deducted, nothing is recorded as
    // a miss, and completion is untouched.
    phase.streak = 0;
  }

  data[key][phaseId] = phase;
  write(KEY_PROGRESS, data);
  return phase;
}

export function resetPhase(player, phaseId) {
  const key = player || '_';
  const data = allProgress();
  if (data[key]) {
    delete data[key][phaseId];
    write(KEY_PROGRESS, data);
  }
}

/* ---------- Fallback storage for shared content --------------------------- */
/* Used only when no shared backend is configured. See chain.js. */

export function readLocalShared(key, fallback) {
  return read(`${STORAGE_PREFIX}.shared.${key}`, fallback);
}

export function writeLocalShared(key, value) {
  return write(`${STORAGE_PREFIX}.shared.${key}`, value);
}
