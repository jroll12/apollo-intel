# Fun & Focus — The Creamsicles

The team's companion app. It extends the coaching system already used at
practice — it doesn't replace it or invent a new one.

Two tabs. **Fun** opens first and is currently a "more coming soon" placeholder.
**Focus** is the live one: situational practice, four phases, 156 situations.

**No accounts, no profiles, no name picker.** Open the link and you're in.
Progress belongs to the phone, not to a person. Plain HTML/CSS/JS, no build
step, no framework, nothing to install.

---

## Right now this needs zero external accounts

Everything that ships today runs off static files. Nothing to sign up for,
nothing to configure, no API keys.

That changes when the Fun tab ships — see [Parked: the Fun tab](#parked-the-fun-tab)
below, because the Golden Chain does need a backend to be the same on every
phone. The setup is written and ready; it just isn't needed yet.

---

## Deploying

Any static host works. Netlify is what the config targets.

1. Sign up free at [netlify.com](https://netlify.com) and connect this repo.
2. Deploy. Nothing to configure — the repo-root `netlify.toml` already sets
   `base = "fun-focus"` (the root holds an unrelated app).

That's it. `netlify/functions/chain.mjs` deploys alongside but nothing calls it
while the Fun tab is parked.

For Vercel, GitHub Pages, S3 or anything else: upload the contents of
`fun-focus/` minus `netlify/`. It works identically today.

### Running it locally

ES modules need a real server — opening `index.html` from the filesystem won't
work.

```bash
cd fun-focus
npx serve@14 .          # or: python3 -m http.server 5173
```

---

## Coach setup — everything lives in `js/config.js`

| Setting | What it does |
|---|---|
| `teamName` | Shows in the app header. `The Creamsicles` |
| `chantName` | The name shouted in the chant — `Creamsicles`, so it isn't "The Creamsicles on three". Parked with the Fun tab. |
| `coachPin` | 4 digits to award the Golden Chain. Ships as `1234`; change it before the Fun tab ships. Unused today. |
| `walkupSheetUrl` | Google Sheet link for walk-up songs. Parked. |
| `chainBackend` | `auto` / `netlify` / `firebase` / `local`. Parked. |
| `firebase` | Project ID + API key, if you go that route. Parked. |

## Look and feel

Three colours: **orange, white, black**. Everything else is a tint or a grey
derived from them, defined once at the top of `styles.css`.

- `--orange: #F26722` — the brand, and the only "yes" in the palette
- `--orange-dark: #C4501A` — borders and small text on white, where plain
  orange doesn't have the contrast
- `--orange-tint: #FFF0E6` — correct-answer backgrounds
- `--black: #121212`, `--white: #FFFFFF`, `--paper: #FAF8F5`

Orange fills always carry **black** text, never white — this orange is too
bright to hold white at button sizes.

Fonts are Anton for headers, Inter 400/600/700/800 for body.

No red and no amber anywhere. A wrong quiz answer is black-on-white under
"Here's the read", never alarming.

---

## The Focus tab

Same loop in every phase: situation → answer with one line of why → whole-field
reveal → a hype line on a correct answer.

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

The hype lines still talk about the Golden Chain — that award is a real thing
the team does, it just isn't in the app yet.

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

Quick count check:

```bash
node -e "import('./js/data/phases.js').then(m=>console.log(m.PHASES.map(p=>p.name+': '+p.questions.length).join('\n')))"
```

---

## Parked: the Fun tab

The full Fun tab is **built and working**, just held back. It has shared Golden
Chain history, a coach award form behind a PIN gate, the team chant, the
handshake with a coach-editable final move, the walk-up sheet link-out, and the
six-item "what fun looks like in a game" card.

Nothing was thrown away:

- The data it reads is still here and still wired — `js/data/fun-content.js`,
  `js/data/roster.js`, `js/chain.js`, `netlify/functions/chain.mjs`.
- The UI and its CSS are in git at commit `9b596ed`. `js/fun.js` has the exact
  restore commands at the top of the file.

Restoring it means putting back `js/fun.js` and its stylesheet blocks, and
calling `initChain()` / `loadFunData()` from `app.js` again.

**When it ships, the Golden Chain needs a backend.** It has to look the same on
every phone — kids, parents and coaches all seeing one list — and a
localStorage-only version would silently give each phone its own private copy.
Two ways to switch it on:

### Option A — Netlify Blobs (recommended: no API keys)

Works from inside a Netlify Function with no credentials, so the only account
needed is the Netlify one used to host the site anyway. `chainBackend: 'auto'`
already finds it. Optionally set a `COACH_PIN` environment variable on the site
so the write endpoint isn't open to anyone who finds the URL.

### Option B — Firebase Firestore (needs a Google account + API keys)

For hosts without functions. The app talks to Firestore over plain REST, so
there's no SDK to download on a bad connection.

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com).
2. Build → **Firestore Database** → Create database.
3. Copy **Project ID** and **Web API Key** into `js/config.js`, set
   `chainBackend: 'firebase'`.
4. Firestore rules — this is a kids' app with no login, so scope them at least
   to the two collections used:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /goldenChain/{doc} { allow read, write: if true; }
       match /settings/{doc}    { allow read, write: if true; }
     }
   }
   ```

   Anyone reading the site's JavaScript can find these keys and write to those
   collections. That's an accepted trade for "no login for an 11-year-old", but
   it is a real one — Option A's `COACH_PIN` check is stronger.

---

## What's stored where

| Data | Where | Why |
|---|---|---|
| All 156 questions | Hardcoded | Static reference content |
| Streaks and completion per phase | `localStorage` | Belongs to the phone |
| Golden Chain history, handshake move | Shared backend (parked) | Everyone must see the same thing |

Nothing about wrong answers is persisted anywhere. There is no player identity,
so a shared family phone is simply one shared set of streaks.

The app registers a service worker, so after one good load the whole thing —
every question included — works with no signal at all. **Bump `CACHE_VERSION` in
`sw.js` when changing app files**, or phones keep serving the old copy.

---

## Out of scope

- Player profiles or name selection — removed on purpose; anyone can just open
  it.
- Walk-up song sign-up — stays on the Google Sheet, the Fun tab will link out.
- Editing the roster in-app.
- **Undoing a Golden Chain award.** The chain is append-only. A mis-tap would
  need editing the blob in the Netlify UI. Worth adding if it happens twice.
