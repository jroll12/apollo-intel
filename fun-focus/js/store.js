/* Per-device state: quiz progress per phase. localStorage is exactly right —
   this is private to the phone and does not need to sync anywhere.

   There is no player identity in this app. Anyone can pick the app up and
   start; progress belongs to the device, not to a named kid. */

import { STORAGE_PREFIX } from './config.js';

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

/* Shape: { "<phaseId>": { correctIds: [], seen: n, streak: n, bestStreak: n } }

   Note what is NOT stored: wrong counts, misses, error rates. There is no
   consequence system in this app and nothing here should let one be built. */

function allProgress() {
  return read(KEY_PROGRESS, {});
}

export function getPhaseProgress(phaseId) {
  const phase = allProgress()[phaseId] || {};
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
export function recordAnswer(phaseId, questionId, wasCorrect) {
  const data = allProgress();
  const phase = {
    correctIds: [],
    seen: 0,
    streak: 0,
    bestStreak: 0,
    ...(data[phaseId] || {}),
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

  data[phaseId] = phase;
  write(KEY_PROGRESS, data);
  return phase;
}

export function resetPhase(phaseId) {
  const data = allProgress();
  delete data[phaseId];
  write(KEY_PROGRESS, data);
}

/* ---------- Live Reps -----------------------------------------------------
   Kept separate from the phases: reps are generated from a combinatorial
   space, so there is no fixed deck to complete and nothing to store per
   question. Only the running totals matter. */

const KEY_LIVE = `${STORAGE_PREFIX}.live`;

export function getLiveProgress() {
  const d = read(KEY_LIVE, {});
  return {
    reps: d.reps || 0,
    called: d.called || 0, // reps where the job was called correctly
    streak: d.streak || 0,
    bestStreak: d.bestStreak || 0,
    position: d.position || null, // last position chosen, or null for mixed
  };
}

export function recordLiveAnswer(wasCorrect) {
  const d = getLiveProgress();
  d.reps += 1;
  if (wasCorrect) {
    d.called += 1;
    d.streak += 1;
    if (d.streak > d.bestStreak) d.bestStreak = d.streak;
  } else {
    d.streak = 0;
  }
  write(KEY_LIVE, d);
  return d;
}

export function setLivePosition(position) {
  const d = getLiveProgress();
  d.position = position;
  write(KEY_LIVE, d);
}

/* ---------- Fallback storage for shared content --------------------------- */
/* Used by chain.js when no shared backend is configured. Parked with the Fun
   tab, kept so the Golden Chain can switch back on without rework. */

export function readLocalShared(key, fallback) {
  return read(`${STORAGE_PREFIX}.shared.${key}`, fallback);
}

export function writeLocalShared(key, value) {
  return write(`${STORAGE_PREFIX}.shared.${key}`, value);
}
