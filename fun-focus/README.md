# Fun & Focus

The players' companion app for the 10U/11U team. It extends the coaching system
already used at practice — it doesn't replace it or invent a new one.

Two tabs. **Fun** opens first (Golden Chain, chant, handshake, what fun looks
like in a game). **Focus** is situational practice: four phases, 156 situations.

No accounts. A kid taps their name off the roster once and that phone remembers
them. Plain HTML/CSS/JS, no build step, no framework, nothing to install.

---

## ⚠️ Read this first: one feature needs a coach account

**Everything in this app runs with zero external accounts except one: the shared
Golden Chain history.**

The chain has to look the same on every phone — kids, parents and coaches all
need to see the same list — and that genuinely requires a backend. A
localStorage-only version would silently show each phone its own private list,
which is worse than useless, so this app does not ship it that way.

Until a backend is configured, the app **still works**, and it says so on screen:

> 🔗 **The chain is only saved on this phone**
> No shared backend is set up yet…

Awards made in that state are saved locally so nothing is lost, but they do not
reach anyone else. Two ways to switch it on, below. **Option A needs no API keys
at all** and is the recommended one.

---

## Deploying

### Option A — Netlify (recommended: no API keys, ~5 minutes)

Netlify Blobs works from inside a Netlify Function with no credentials, so the
only account needed is the Netlify account required to host the site anyway.

1. Sign up free at [netlify.com](https://netlify.com) and connect this repo.
2. Deploy. Nothing to configure — the repo-root `netlify.toml` already sets
   `base = "fun-focus"` (the root holds an unrelated app), and `js/config.js`
   ships with `chainBackend: 'auto'`, which finds the function on its own.
3. Optional but recommended: in **Site settings → Environment variables**, add
   `COACH_PIN` set to the same 4 digits as `coachPin` in `js/config.js`. Without
   it the write endpoint is open to anyone who finds the URL. With a rec team
   that's usually fine; setting it costs nothing.

Verify: open the site, and the yellow "only saved on this phone" banner should
be gone.

### Option B — Firebase Firestore (needs a Google account + API keys)

Use this if hosting somewhere without functions (Vercel static, GitHub Pages,
S3). The app talks to Firestore over plain REST, so there's no SDK to download
on a bad connection.

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com).
2. Build → **Firestore Database** → Create database.
3. Project settings → General → your web app → copy **Project ID** and
   **Web API Key**.
4. Paste both into `js/config.js` and set `chainBackend: 'firebase'`.
5. Set Firestore rules. This is a kids' team app with no login, so reads and
   writes are open to anyone with the URL — scope them at least to the two
   collections the app uses:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /goldenChain/{doc} { allow read, write: if true; }
       match /settings/{doc}    { allow read, write: if true; }
     }
   }
   ```

   Anyone who reads the site's JavaScript can find these keys and write to those
   two collections. That is an accepted trade for "no login for an 11-year-old",
   but it is a real trade — Option A's `COACH_PIN` check is the stronger setup.

### Any other static host

Upload the contents of `fun-focus/` (excluding `netlify/`). The app runs fine;
the Golden Chain stays per-phone unless you use Option B.

---

## Running it locally

ES modules need a real server — opening `index.html` from the filesystem won't
work.

```bash
cd fun-focus
npx serve@14 .          # or: python3 -m http.server 5173
```

The Netlify function won't exist locally, so the app drops to per-phone mode and
says so. To test the function too, use `npx netlify-cli dev` from this folder.

---

## Coach setup — everything lives in `js/config.js`

| Setting | What it does |
|---|---|
| `teamName` | Used in the chant and header. **Currently `BANANAS`, inferred from the team's banana-yellow palette — confirm it.** |
| `coachPin` | 4 digits to unlock awarding. Ships as `1234`; change it. |
| `walkupSheetUrl` | Google Sheet link. Blank hides the link card. |
| `chainBackend` | `auto` / `netlify` / `firebase` / `local` |
| `firebase` | Project ID + API key for Option B |

### About the PIN

It's a friction gate so a kid doesn't tap "Award" by accident. It is **not**
security — `config.js` ships to every phone and anyone can read it. Don't reuse
a PIN that matters. The server-side `COACH_PIN` env var (Option A) is the part
that actually stops a stranger writing to the list.

### The handshake

Base sequence (clap, bump, spin) is fixed. The team's voted-on fourth move is
set in-app: unlock with the PIN on the Fun tab and a text field appears under
the handshake. It saves to the shared backend so every phone sees the same move
— and falls back to this-phone-only if there's no backend, same as the chain.

---

## The Focus tab

Same loop in every phase: situation → answer with one line of why → whole-field
reveal → a Golden-Chain hype line on a correct answer.

| Phase | Standard | Situations |
|---|---|---|
| 1. Know the Situation | Outs, runners, and your job before every pitch | 84 |
| 2. Force vs. Tag | Label the play before the ball arrives, and say it out loud | 24 |
| 3. Backing Up & Bunt Coverage | Everyone not fielding it has a place to be | 23 |
| 4. Cutoffs & Relays | Right spot, call for it, cut or through | 25 |

Three things are deliberate and worth not undoing:

- **The whole-field reveal never gets skipped.** All nine positions, every
  question, even when eight of them weren't touching the ball. That's the part
  the app exists for.
- **A second explanation line only appears on genuine traps** — where the right
  answer would surprise someone who picked the obvious-sounding wrong one. About
  a third of situations have one. Adding one everywhere would make them stop
  landing.
- **Grading is about knowing the job, never the physical outcome.** A correct
  answer that would have ended in a missed throw is still correct. Nothing
  counts misses, nothing is red, and a wrong pick only resets the current streak
  and shows the read. There is no consequence system here and nothing in the
  data model to build one on.

### Coach's calls, flagged rather than guessed

Where real coaches genuinely disagree, the code says so in a comment instead of
inventing a house answer:

- **Runners on 1st & 3rd is excluded from Phase 1 entirely** (`phase1.js`). It
  needs a live judgment call about conceding a run, which doesn't fit a phase
  built on pure attention. It *does* appear in Phase 2, where labeling a play
  force-or-tag is a rule with one right answer and no judgment involved.
- **Bunt coverage systems vary** (`phase3.js`). This app teaches one simple
  split — 3B holds third whenever a runner is on second. Rotation and wheel
  systems are equally correct. If practice runs something else, the rules and
  the three questions that depend on them are marked.
- **Cutting a throw with no call** (`phase4.js`). Some coaches say never touch
  it without a call, others say cut anything obviously short. No question is
  built on it.
- **Comebacker with 1st & 2nd** (`phase1.js`). Some systems look the lead runner
  to third; this follows the table's double-play look to second.
- A few Phase 1 spots where the default table assumes more time than the hit
  location really gives (catcher on a bunt, 1B on or off the bag, 3B fielding a
  knockdown with the bases loaded). The situation text states the detail that
  settles it rather than leaving a kid guessing.

### Changing questions

- **Phases 2–4** are plain arrays in `js/data/phase2.js` etc. Copy an entry.
- **Phase 1** is generated from the coaching system's own default table in
  `js/data/phase1.js` — edit `IF_JOBS`, `IF_TWO_OUTS`, `OF_JOBS`, and the deck
  rebuilds itself.

There's a validator that checks every question has 3+ distinct options, a
correct answer among them, all nine reveal rows, and no blame language:

```bash
node -e "import('./js/data/phases.js').then(m=>console.log(m.PHASES.map(p=>p.name+': '+p.questions.length).join('\n')))"
```

---

## What's stored where

| Data | Where | Why |
|---|---|---|
| Roster, chant, checklist, all 156 questions | Hardcoded | Static reference content |
| Selected player, streaks, completion | `localStorage` | Personal to one phone |
| Golden Chain history, handshake move | Shared backend | Everyone must see the same thing |

Progress is stored per player, so a shared family phone doesn't blend two kids'
streaks. Nothing about wrong answers is persisted anywhere.

The app registers a service worker, so after one good load the whole thing —
every question included — works with no signal at all. Bump `CACHE_VERSION` in
`sw.js` when changing app files, or phones will keep serving the old copy.

---

## Out of scope for v1

- Walk-up song sign-up — stays on the Google Sheet, the Fun tab just links out.
- Any login beyond the name picker and the coach PIN.
- Editing the roster in-app.
- **Undoing an award.** The chain is append-only. A mis-tap currently needs
  editing the blob in the Netlify UI (or the Firestore doc). Worth adding if it
  happens more than once.
