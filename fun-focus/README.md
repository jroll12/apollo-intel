# Fun & Focus — The Creamsicles

The team's companion app. It extends the coaching system already used at
practice — it doesn't replace it or invent a new one.

Two tabs. **Fun** has the chant book, the Golden Chain, the handshake and the
game-day standards. **Focus** has animated live reps plus four phases of
situational practice.

**No accounts, no profiles, no name picker.** Open the link and you're in.
Progress belongs to the phone, not to a person. Plain HTML/CSS/JS, no build
step, no framework, nothing to install.

---

## One feature needs a backend

Everything runs off static files except the **Golden Chain**, which has to look
the same on every phone. Until a backend is configured the app still works and
says so on screen rather than pretending — see [The Golden Chain backend](#the-golden-chain-backend).

---

## Deploying

Any static host works. Netlify is what the config targets, and the site is
already created: **`creamsicles-fun-focus`**
([app.netlify.com/projects/creamsicles-fun-focus](https://app.netlify.com/projects/creamsicles-fun-focus)).
It has no deploy yet. To give it one:

1. Open the project → **Project configuration → Build & deploy → Link repository**
2. Pick `jroll12/apollo-intel`, branch `claude/fun-focus-team-app-6cuutu`
3. **Deploy.** Change nothing else — the repo-root `netlify.toml` already sets
   `base = "fun-focus"` (the root holds an unrelated app), the publish
   directory, and the functions directory.

Netlify pulls straight from GitHub, so this needs nothing from any local
machine. It lands at `https://creamsicles-fun-focus.netlify.app`.

`netlify/functions/chain.mjs` deploys alongside and is what makes the Golden
Chain shared.

For Vercel, GitHub Pages, S3 or anything else: upload the contents of
`fun-focus/` minus `netlify/`. It works identically today.

### Single-file build

The app normally ships as ES modules, which need a web server. To flatten it
into one self-contained HTML file that runs from anywhere — email attachment,
USB stick, any static host, even a double-clicked `file://` — run:

```bash
cd fun-focus
node build-single-file.mjs              # dist/fun-focus.html   (~257 KB)
node build-single-file.mjs --artifact   # dist/fun-focus.artifact.html
```

`dist/` is gitignored: it's a derived build, so never edit the output — edit
the modules and re-run. The bundler concatenates sources in dependency order
and throws on any top-level name collision, and on any module syntax that
survives stripping, rather than silently shipping a blank page.

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
| `chantName` | The name shouted in the chant — `Creamsicles`, so it isn't "The Creamsicles on three". |
| `coachPin` | 4 digits to award the Golden Chain. Not security — see the code comment. |
| `walkupSheetUrl` | Google Sheet link for walk-up songs. Blank hides the card. |
| `chainBackend` | `auto` / `netlify` / `firebase` / `local` |
| `firebase` | Project ID + API key, if you go that route |

## Look and feel

Orange, white, black. White is the ground, orange carries the structure, and
black is text only — never a surface. Defined once at the top of `styles.css`.

Three oranges, split strictly by **contrast job**. Getting this wrong is the
easiest way to make the app unreadable in daylight at a field:

| Token | Hex | Job | Contrast |
|---|---|---|---|
| `--orange` | `#F88800` | Decorative fills only — progress bar, rules, tab indicator | can't hold text either way (2.47:1) |
| `--orange-deep` | `#DB7518` | Surfaces with white text — header, situation card, buttons | 3.20:1 white-on-it |
| `--orange-ink` | `#B26010` | Orange text on white, borders, focus rings | 4.59:1 on white |

`--orange` is the 🍊 emoji's own orange, sampled from a render. All three share
its hue (~30°) so they read as one family. Plus `--black: #121212`,
`--white: #FFFFFF`, `--paper: #FFFFFF`, `--orange-tint: #FFF2E3`.

Never put white text on `--orange`, and never use `--orange` as text on white.

Fonts are Anton for headers, Inter 400/600/700/800 for body.

No red and no amber anywhere. A wrong quiz answer is black-on-white under
"Here's the read", never alarming.

---

## The Focus tab

### Live Reps — "Read It Live"

A ball is hit and you do not know where it is going. It animates across a
canvas drawing of the field, and only once it settles does the app ask what
your job was. Two questions come out of the same rep:

- **"It's yours. What now?"** when the ball came to your position
- **"Not your ball. Where do you go?"** when it did not — which is most reps,
  and is where 10U defense actually breaks down

**Answers are computed, not authored.** `js/data/play-engine.js` resolves any
batted ball into an assignment for all nine positions, running the four phases
as one system: ground ball to the infield uses Phase 1's force table, a bunt
uses Phase 3's coverage, a ball to the outfield uses Phase 4's cutoffs, a
caught fly uses tag-up logic, and everyone else covers or backs up. That is
819 distinct plays and 7,371 askable questions.

The payoff of computing them: **every wrong answer offered is another
position's real job on that same play**, so no option is filler and picking
one teaches you whose job it actually was.

Live Reps is not a fifth standard — it is the four existing ones run together
on one ball, which is why it sits above the phase list rather than in it.

Field geometry is 10U/11U, not big-league: 60-foot basepaths, 46-foot mound.

### The four phases

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

The hype lines talk about the Golden Chain, which is the same award the Fun
tab tracks — one system, both tabs.

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
- **1st & 3rd in Live Reps** (`play-engine.js`). Same rule as Phase 1, applied
  per play type: excluded from ground balls and bunts, where conceding a run is
  a live coach's call, but allowed on outfield hits and caught fly balls, where
  the cutoff and tag-up answers are assignments rather than judgment calls.
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

## The Fun tab

### Chant book

19 chants in five sections, grouped by the moment you use them: breaking the
huddle, our guy is up, Creamsicle calls, we are in the field, and for each
other.

**Dugout Mode** is the point of it. Tap any chant and it fills the screen in
huge type, with the leader's call set smaller and the dugout's answer set
biggest, so the kid running the cheer holds his phone up and everyone reads it.

**The one rule, and it is a real rule, not a manners note.** Every chant hypes
our guy; none of them mention theirs. Little League International bans taunting
and "negative chatter" aimed at opponents, and most leagues stop chanting once
the pitcher starts his windup. Roughly half of what a search for "baseball
chants" turns up is aimed at the other team's pitcher and would get a dugout
warned. None of it is in `js/data/chants.js` and nothing like it should be
added.

Several chants deliberately encode the "What Fun Looks Like in a Game"
standards — **On The Rail**, **We Got Him**, **Everybody Moves** — so the chant
book teaches the checklist instead of sitting next to it.

Adding one: copy an entry in `js/data/chants.js`. `who: 'lead'` is the call,
`who: 'all'` is the answer, no `who` is everyone together. `[TEAM]` is swapped
for `CONFIG.chantName`.

### Golden Chain

Shared award history, newest first, plus a coach-only award form behind a
4-digit PIN. The PIN is friction so nobody taps it by accident — it ships
inside `config.js` and anyone can read it, so it is not security.

### Also here

The handshake (clap, bump, spin, plus the team's voted fourth move, which the
coach sets in-app behind the PIN), the walk-up song sheet link-out, and the
six-item game-day standard.

---

## The Golden Chain backend

The chain and the handshake move have to be the same on every phone — kids,
parents and coaches all seeing one list — and a localStorage-only version would
silently give each phone its own private copy. Two ways to switch it on:

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
| Chants, checklist, roster | Hardcoded | Static reference content |
| All 156 phase questions | Hardcoded | Static reference content |
| Live rep plays | Computed at runtime | 819 plays is too many to author |
| Streaks and completion per phase | `localStorage` | Belongs to the phone |
| Live rep count, streak, position | `localStorage` | Belongs to the phone |
| Golden Chain history, handshake move | Shared backend | Everyone must see the same thing |

Nothing about wrong answers is persisted anywhere. There is no player identity,
so a shared family phone is simply one shared set of streaks.

The app registers a service worker, so after one good load the whole thing —
every question included — works with no signal at all. **Bump `CACHE_VERSION` in
`sw.js` when changing app files**, or phones keep serving the old copy.

---

## Out of scope

- Player profiles or name selection — removed on purpose; anyone can just open
  it.
- Kid-to-kid shoutout board. The standards call for teammate shoutouts, but an
  in-app version is free text written by ten-year-olds, visible to the whole
  team and parents, with no moderation and no accounts to trace anything. That
  needs a deliberate decision, not a default.
- Walk-up song sign-up — stays on the Google Sheet, the Fun tab will link out.
- Editing the roster in-app.
- **Undoing a Golden Chain award.** The chain is append-only. A mis-tap would
  need editing the blob in the Netlify UI. Worth adding if it happens twice.
