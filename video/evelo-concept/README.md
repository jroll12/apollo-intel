# Evelo: "Every closing gives back" (concept)

9:16 spec video for a real estate team's past-client campaign. 1080x1920, 30 fps, H.264, about 42 s.
Built with HyperFrames 0.9.64 (HTML + GSAP rendered frame by frame).

**Status: DRAFT.** No narration yet. `out/evelo-impact-concept.DRAFT.mp4` is silent, and its timing is
estimated from the script (`timings.json` → `"source": "estimate"`). Treat it as a layout and motion review only.

## Files
| Path | What |
|---|---|
| `assets/script.json` | Narration, word for word from the brief. Single source for captions. |
| `timings.json` | Word and scene times. Drives every scene start/end, reveal, and caption. |
| `scripts/estimate-timings.mjs` | Draft timings (about 150 wpm, by syllable). |
| `scripts/whisper-timings.py` | Real timings from `assets/narration.wav`, aligned to the script. |
| `scripts/build.mjs` | Generates `index.html`, `compositions/*.html`, `captions.json`. Edit this, not the output. |
| `scripts/check.mjs` | Self-check: container, sync, facts whitelist, captions = script, contrast, safe zones, frames, poster. |
| `assets/vendor/gsap.min.js` | GSAP 3.12.5 from npm, vendored because the CDN is unreachable here and so renders stay offline. |
| `out/` | Render, `poster.png` (scene 3, counter at 1,760+), `contact-sheet.png`. |

## Commands
Run these from this folder. `HF` is the HyperFrames launcher from the installed skill.
```bash
npm install
npx skills add heygen-com/hyperframes   # installs .agents/skills (gitignored)
HF=".agents/skills/hyperframes/scripts/plugin-cli.mjs"
node scripts/estimate-timings.mjs          # draft only; skip once narration exists
node scripts/build.mjs
node $HF lint && node $HF check --json
node $HF render --quality looks -o out/evelo-impact-concept.DRAFT.mp4
node scripts/check.mjs out/evelo-impact-concept.DRAFT.mp4
```
Final pass, once `assets/narration.wav` exists:
```bash
pip install faster-whisper && python3 -I scripts/whisper-timings.py
node scripts/build.mjs        # adds the <audio> track automatically when the WAV exists
node $HF render --quality delivery -o out/evelo-impact-concept.mp4
node scripts/check.mjs out/evelo-impact-concept.mp4
```
If the narration runs over 45 s, stop and ask before cutting "More than 70 million dollars."

## Fonts and design
- Inter 400/700/900, bundled with HyperFrames, so no font files ship here.
- Tokens: navy `#0E1B33` background, cream `#F5EBDD` text (14.6:1), amber `#E8A33D` accent (8.0:1), grey-blue `#B9C2D3` labels (9.6:1). Flat fills only, no gradients.
- No logos, photos, or faces. One CSS water-drop shape in scenes 3 and 4.

## Deviations from the brief
1. **Safe zones are stricter than the brief's 150/380 px.** HyperFrames checks against TikTok, Reels, and Shorts UI. Key text sits at x 120-888 and y 288-1060. Captions sit at x 120-780 and y 1096-1248. That is why the layout is left-aligned and the bottom third is empty: platform UI covers it.
2. **On-screen labels added from the facts list or narration:** "Filter of Hope" and "water filters" (scene 3), "Our mission" (scene 5), "Evelo Team" (scene 6). "Evelo Team" was added after the blind check: with sound off, nothing on screen named the team.
3. **Draft timing** comes from an estimate, not audio (narration not supplied yet).
4. **Skill install** worked through `npx skills add`. The HyperFrames telemetry beacon (`events`) was not run.
5. **Captions** follow the script verbatim, including "3-1-7, 8-6-3, 9-0-1-1." The phone number also appears formatted on screen.

## Open copy questions (not changed)
- "This year, we helped over 170 families": is 170+ a 2026 figure or cumulative? Same question for $70M+. If either is cumulative, the narration makes a false claim.
- "$70M+ in real estate" doesn't say whether it means sales volume. The blind viewer couldn't tell.
- Filter of Hope is never explained, and "so far" has no start date.
- The headline says "moving in 2027?" while the narration says "buying or selling in 2027". This mismatch comes from the brief's table.
- The counter animates from 0 to 1,760, so a paused or screenshotted mid-count frame shows a different number. The poster uses the final value.
