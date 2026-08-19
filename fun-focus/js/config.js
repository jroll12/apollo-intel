/* ============================================================================
   COACH: THIS IS THE ONLY FILE YOU NEED TO EDIT.
   Everything below is safe to change. Redeploy after editing.
   ========================================================================= */

export const CONFIG = {
  /* ---- TEAM NAME -------------------------------------------------------
     teamName shows in the app header.
     chantName is the one shouted in the chant, where "The" gets in the way
     ("Creamsicles on three" reads better than "The Creamsicles on three").
     The chant lives on the Fun tab, which is parked — see fun.js. */
  teamName: 'The Creamsicles',
  chantName: 'Creamsicles',

  /* ---- COACH PIN -------------------------------------------------------
     4 digits, for awarding the Golden Chain. It is a friction gate, never
     security — this file ships to every phone and anyone can read it.
     Don't reuse a PIN you care about elsewhere. */
  coachPin: '0212',

  /* ---- WALK-UP SONG SHEET ---------------------------------------------
     Out of scope to rebuild — the Fun tab will just link out to it.
     Paste the Google Sheet share link here. Leave '' to hide the link.
     TODO(coach): paste the sheet URL before the Fun tab ships. */
  walkupSheetUrl: '',

  /* ---- HANDSHAKE -------------------------------------------------------
     Base sequence is fixed (clap, bump, spin). The team voted on a final
     move; the coach sets it in-app behind the PIN once the Fun tab ships. */
  handshakeFinalMoveDefault: '',

  /* ---- SHARED BACKEND (Golden Chain history + handshake move) ----------
     'auto'     — try the Netlify function, fall back to this-phone-only
     'netlify'  — Netlify Blobs via /.netlify/functions/chain (no API keys)
     'firebase' — Firestore REST (fill in firebase.projectId + apiKey)
     'local'    — deliberately this-phone-only

     Nothing calls this while the Fun tab is parked. Setup for both options
     is in README.md, ready for when it ships. */
  chainBackend: 'auto',

  firebase: {
    projectId: '',
    apiKey: '',
  },
};

/* Storage key prefix. Bumped to v2 when player profiles were removed — v1
   keyed progress by player name and that shape is gone. */
export const STORAGE_PREFIX = 'funfocus.v2';
