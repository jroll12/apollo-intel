/* ============================================================================
   Shared Golden Chain store, backed by Netlify Blobs.

   Why this and not Firebase: on Netlify this needs no API keys, no second
   account, and no credentials pasted into a file that ships to every phone.
   Deploying the site is the entire setup.

   GET  /.netlify/functions/chain   -> { awards: [...], handshake: "..." }
   POST /.netlify/functions/chain   -> { type: "award",     award: {...}, pin }
                                    -> { type: "handshake", handshake: "", pin }

   Concurrency: this is a read-modify-write on one blob. Two coaches awarding
   the chain in the same second could drop one write. With one coach and one
   award a game that is not worth solving.
   ========================================================================= */

import { getStore } from '@netlify/blobs';

const STORE_NAME = 'fun-focus';
const KEY = 'chain-v1';

const MAX_NOTE = 140;
const MAX_HANDSHAKE = 120;
const MAX_AWARDS = 500;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

async function readState(store) {
  const data = await store.get(KEY, { type: 'json' });
  return { awards: [], handshake: '', ...(data || {}) };
}

export default async function handler(request) {
  const store = getStore(STORE_NAME);

  if (request.method === 'GET') {
    const state = await readState(store);
    return json(state);
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Expected JSON' }, 400);
  }

  /* Optional second gate. The in-app PIN is client-side and can't stop a
     determined person, so set COACH_PIN in the Netlify site's environment
     variables to also check it here. Left unset, writes are open — fine for a
     rec team, but it is a real open endpoint, so set it. */
  const expectedPin = process.env.COACH_PIN;
  if (expectedPin && String(body.pin || '') !== String(expectedPin)) {
    return json({ error: 'That PIN did not match.' }, 403);
  }

  const state = await readState(store);

  if (body.type === 'handshake') {
    state.handshake = String(body.handshake || '').slice(0, MAX_HANDSHAKE);
    await store.setJSON(KEY, state);
    return json({ ok: true, handshake: state.handshake });
  }

  if (body.type === 'award') {
    const incoming = body.award || {};
    if (!incoming.player) return json({ error: 'An award needs a player.' }, 400);

    const award = {
      id: String(incoming.id || `${Date.now()}`).slice(0, 40),
      player: String(incoming.player).slice(0, 60),
      note: String(incoming.note || '').slice(0, MAX_NOTE),
      date: String(incoming.date || '').slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    // Ignore a repeat of an id we already have, so a retry after a flaky
    // connection can't post the same award twice.
    if (!state.awards.some((a) => a.id === award.id)) {
      state.awards.push(award);
      if (state.awards.length > MAX_AWARDS) {
        state.awards = state.awards.slice(-MAX_AWARDS);
      }
      await store.setJSON(KEY, state);
    }

    return json({ ok: true, award });
  }

  return json({ error: 'Unknown request type.' }, 400);
}

export const config = { path: '/.netlify/functions/chain' };
