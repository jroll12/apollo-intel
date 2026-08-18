/* ============================================================================
   COACH: THIS IS THE ONLY FILE YOU NEED TO EDIT.
   Everything below is safe to change. Redeploy after editing.
   ========================================================================= */

export const CONFIG = {
  /* ---- TEAM NAME -------------------------------------------------------
     Used in the chant ("[TEAM NAME] on three") and the app header.
     TODO(coach): confirm this is right — it was inferred from the team's
     banana-yellow palette, not given to us. */
  teamName: 'BANANAS',

  /* ---- COACH PIN -------------------------------------------------------
     4 digits. This is a friction gate so a kid doesn't tap "award" by
     accident. It is NOT security — this file ships to every phone and
     anyone can read it. Don't reuse a PIN you care about.
     TODO(coach): change this from the placeholder. */
  coachPin: '1234',

  /* ---- WALK-UP SONG SHEET ---------------------------------------------
     Out of scope to rebuild — the Fun tab just links out to it.
     Paste the Google Sheet share link here. Leave '' to hide the link.
     TODO(coach): paste the sheet URL. */
  walkupSheetUrl: '',

  /* ---- HANDSHAKE -------------------------------------------------------
     Base sequence is fixed (clap, bump, spin). The team voted on a final
     move — the coach sets it in-app behind the PIN, and it syncs to every
     phone when a shared backend is configured (see below). This value is
     only the starting text before anyone sets one. */
  handshakeFinalMoveDefault: '',

  /* ---- SHARED BACKEND (Golden Chain history + handshake move) ----------
     'auto'     — try the Netlify function, fall back to this-phone-only
     'netlify'  — Netlify Blobs via /.netlify/functions/chain (no API keys)
     'firebase' — Firestore REST (fill in firebase.projectId + apiKey)
     'local'    — deliberately this-phone-only

     Until one of these is working the Golden Chain does NOT sync between
     phones, and the app says so on screen rather than pretending. Setup
     instructions for both options are in README.md. */
  chainBackend: 'auto',

  firebase: {
    projectId: '',
    apiKey: '',
  },
};

/* Storage key prefix — bump this to reset every phone's saved progress. */
export const STORAGE_PREFIX = 'funfocus.v1';
