/* ============================================================================
   Shared state: Golden Chain award history + the voted-on handshake move.

   This is the ONE piece of the app that has to be the same on every phone —
   a kid, a parent and the coach all need to see the same chain history. A
   localStorage-only version would silently show each phone a different list,
   so it is not shipped that way: if no backend is reachable the app keeps
   working but says plainly, on screen, that it is not syncing.

   Three providers, in order of least setup:
     netlify  — /.netlify/functions/chain (Netlify Blobs). No API keys at all;
                the coach only needs the Netlify account they already made to
                deploy the site.
     firebase — Firestore REST. Needs a free Google account, a project ID and
                a web API key pasted into config.js. Used straight over REST
                so there is no SDK to download on a bad connection.
     local    — this phone only. Honest fallback, flagged loudly in the UI.

   Setup for both is in README.md.
   ========================================================================= */

import { CONFIG } from './config.js';
import { readLocalShared, writeLocalShared } from './store.js';

const NETLIFY_ENDPOINT = '/.netlify/functions/chain';
const REQUEST_TIMEOUT_MS = 8000;

/* Caps mirrored in netlify/functions/chain.js. */
export const MAX_NOTE = 140;
export const MAX_HANDSHAKE = 120;

const state = {
  provider: null, // 'netlify' | 'firebase' | 'local'
  synced: false, // true only when awards really are shared across phones
  reason: '', // why we fell back, for the on-screen banner
  offline: false, // configured provider exists but was unreachable just now
};

export function chainStatus() {
  return { ...state };
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Provider resolution ------------------------------------------- */

function firebaseConfigured() {
  return Boolean(CONFIG.firebase?.projectId && CONFIG.firebase?.apiKey);
}

/**
 * Decide which backend to talk to. With `chainBackend: 'auto'` we probe the
 * Netlify function once; a 404 just means the site isn't on Netlify (or the
 * function isn't deployed) and we drop to the next option.
 */
export async function initChain() {
  const choice = CONFIG.chainBackend || 'auto';

  if (choice === 'local') {
    Object.assign(state, {
      provider: 'local',
      synced: false,
      reason: 'Set to this-phone-only in config.js.',
    });
    return chainStatus();
  }

  if (choice === 'firebase' || (choice === 'auto' && firebaseConfigured())) {
    if (!firebaseConfigured()) {
      Object.assign(state, {
        provider: 'local',
        synced: false,
        reason: 'Firebase is selected but projectId / apiKey are still blank in config.js.',
      });
      return chainStatus();
    }
    Object.assign(state, { provider: 'firebase', synced: true, reason: '' });
    return chainStatus();
  }

  if (choice === 'netlify' || choice === 'auto') {
    const reachable = await probeNetlify();
    if (reachable) {
      Object.assign(state, { provider: 'netlify', synced: true, reason: '' });
      return chainStatus();
    }
    Object.assign(state, {
      provider: 'local',
      synced: false,
      reason:
        choice === 'netlify'
          ? "The Netlify function isn't responding, so the chain is saved on this phone only."
          : 'No shared backend is set up yet, so the chain is saved on this phone only.',
    });
    return chainStatus();
  }

  Object.assign(state, { provider: 'local', synced: false, reason: 'Unknown backend in config.js.' });
  return chainStatus();
}

async function probeNetlify() {
  // A single-file build opened from disk has no origin to call — don't even
  // try, or the console fills with a scheme error on every load.
  if (!location.protocol.startsWith('http')) return false;
  try {
    const res = await fetchWithTimeout(`${NETLIFY_ENDPOINT}?probe=1`, {
      headers: { accept: 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---------- Read ----------------------------------------------------------- */

/**
 * Returns { awards, handshake }. Awards are newest first.
 * On a network failure with a real backend configured we serve the last list
 * this phone saw and flag `offline` so the UI can say the list may be stale
 * rather than showing an empty chain.
 */
export async function loadShared() {
  if (state.provider === 'local') {
    return cached();
  }

  try {
    const data = state.provider === 'firebase' ? await firebaseLoad() : await netlifyLoad();
    state.offline = false;
    writeLocalShared('chain', data.awards);
    writeLocalShared('handshake', data.handshake);
    return data;
  } catch {
    state.offline = true;
    return cached();
  }
}

function cached() {
  return {
    awards: sortAwards(readLocalShared('chain', [])),
    handshake: readLocalShared('handshake', CONFIG.handshakeFinalMoveDefault || ''),
  };
}

function sortAwards(awards) {
  return awards.slice().sort((a, b) => {
    const byDate = String(b.date).localeCompare(String(a.date));
    if (byDate !== 0) return byDate;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

/* ---------- Write ---------------------------------------------------------- */

export async function addAward({ player, note, date, pin }) {
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    player,
    note: (note || '').slice(0, MAX_NOTE),
    date,
    createdAt: new Date().toISOString(),
  };

  if (state.provider === 'firebase') await firebaseAddAward(record);
  else if (state.provider === 'netlify') await netlifyPost({ type: 'award', award: record, pin });

  // Always mirror locally: it keeps the offline copy fresh and it is the whole
  // store when running in local-only mode.
  const local = readLocalShared('chain', []);
  local.push(record);
  writeLocalShared('chain', local);

  return record;
}

export async function saveHandshake(text, pin) {
  const value = (text || '').slice(0, MAX_HANDSHAKE);

  if (state.provider === 'firebase') await firebaseSaveHandshake(value);
  else if (state.provider === 'netlify') await netlifyPost({ type: 'handshake', handshake: value, pin });

  writeLocalShared('handshake', value);
  return value;
}

/* ---------- Netlify Blobs provider ---------------------------------------- */

async function netlifyLoad() {
  const res = await fetchWithTimeout(NETLIFY_ENDPOINT, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`chain GET ${res.status}`);
  const data = await res.json();
  return {
    awards: sortAwards(data.awards || []),
    handshake: data.handshake || '',
  };
}

async function netlifyPost(body) {
  const res = await fetchWithTimeout(NETLIFY_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(detail || `chain POST ${res.status}`);
  }
  return res.json().catch(() => ({}));
}

/* ---------- Firestore REST provider ---------------------------------------
   Plain REST rather than the Firebase SDK: nothing extra to download, which
   matters on a phone with two bars at a ball field. */

function firestoreBase() {
  const { projectId } = CONFIG.firebase;
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
}

function withKey(url) {
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}key=${encodeURIComponent(CONFIG.firebase.apiKey)}`;
}

/** Firestore wraps every value in a type tag; unwrap the few we use. */
function fromFields(fields = {}) {
  const out = {};
  for (const [key, wrapper] of Object.entries(fields)) {
    out[key] = wrapper.stringValue ?? wrapper.integerValue ?? wrapper.booleanValue ?? '';
  }
  return out;
}

function toFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = { stringValue: String(value ?? '') };
  }
  return fields;
}

async function firebaseLoad() {
  const [awardsRes, handshakeRes] = await Promise.all([
    fetchWithTimeout(withKey(`${firestoreBase()}/goldenChain?pageSize=300`)),
    fetchWithTimeout(withKey(`${firestoreBase()}/settings/handshake`)),
  ]);

  if (!awardsRes.ok) throw new Error(`firestore ${awardsRes.status}`);
  const awardsData = await awardsRes.json();
  const awards = (awardsData.documents || []).map((doc) => fromFields(doc.fields));

  // A missing handshake doc is a 404 and is completely normal before the
  // coach has ever set one.
  let handshake = '';
  if (handshakeRes.ok) {
    const doc = await handshakeRes.json();
    handshake = fromFields(doc.fields).value || '';
  }

  return { awards: sortAwards(awards), handshake };
}

async function firebaseAddAward(record) {
  const res = await fetchWithTimeout(withKey(`${firestoreBase()}/goldenChain`), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fields: toFields(record) }),
  });
  if (!res.ok) throw new Error(`firestore write ${res.status}`);
}

async function firebaseSaveHandshake(value) {
  const res = await fetchWithTimeout(withKey(`${firestoreBase()}/settings/handshake`), {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fields: toFields({ value }) }),
  });
  if (!res.ok) throw new Error(`firestore write ${res.status}`);
}
