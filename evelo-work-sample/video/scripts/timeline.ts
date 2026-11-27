// Builds data/timeline.json (the single source of timing for every scene) from an alignment file.
//   bun scripts/timeline.ts data/align-temp.json [voFile]
// Scene boundaries come from the script's own sentences, so a new voice take re-times everything.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const alignPath = process.argv[2] ?? "data/align-temp.json";
const al = JSON.parse(readFileSync(join(ROOT, alignPath), "utf8"));
const FPS = 30;
const VO_OFFSET = 0.35; // seconds of picture before the first word
const MIN_END_HOLD = 3.0; // end card hold after the last word
const MAX_MUSIC_SKIP = 5.5; // never cut past the music's first beat

type W = { i: number; text: string; start: number; end: number; break: string | null };
const words: W[] = al.words;
const t = (s: number) => Math.round((s + VO_OFFSET) * 1000) / 1000; // vo time -> video time
const findWord = (re: RegExp, from = 0) => {
  const k = words.findIndex((w, idx) => idx >= from && re.test(w.text));
  if (k < 0) throw new Error(`cue word not found: ${re}`);
  return k;
};

// ---- scenes, anchored to script words ----
const cue = {
  price: findWord(/^Hamilton$/),
  inventory: findWord(/^Buyers$/),
  comps: findWord(/^A$/, findWord(/^headlines\.$/)),
  asking: findWord(/^One$/),
  cta: findWord(/^Call$/),
};
const speechEnd = t(words.at(-1)!.end);
const musicDur: number = al.music.duration;
// Shortest hold that still lets the music's own ending land on the last frame.
const endHold = Math.max(MIN_END_HOLD, musicDur - MAX_MUSIC_SKIP - speechEnd);
const duration = Math.round((speechEnd + endHold) * FPS) / FPS;
const musicSkip = Math.max(0, Math.min(MAX_MUSIC_SKIP, musicDur - duration));

const lead = 0.25; // cut slightly before the first word of a beat
const sceneStart = (k: number) => Math.max(0, t(words[k].start) - lead);
const scenes = [
  { id: "hook", start: 0 },
  { id: "price", start: sceneStart(cue.price) },
  { id: "inventory", start: sceneStart(cue.inventory) },
  { id: "comps", start: sceneStart(cue.comps) },
  { id: "asking", start: sceneStart(cue.asking) },
  { id: "cta", start: sceneStart(cue.cta) },
].map((s, i, arr) => ({ ...s, end: i < arr.length - 1 ? arr[i + 1].start : duration }));

// ---- caption phrases: hand-set line breaks (data/captions.txt) timed from the words ----
const lines = readFileSync(join(ROOT, "data/captions.txt"), "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
if (lines.join(" ") !== words.map((w) => w.text).join(" ")) throw new Error("captions.txt does not match the script word for word");
let wi = 0;
const phrases = lines.map((line) => {
  const n = line.split(/\s+/).length;
  const ws = words.slice(wi, wi + n);
  wi += n;
  return { text: line, start: t(ws[0].start), end: t(ws.at(-1)!.end), words: ws.map((w) => ({ text: w.text, start: t(w.start), end: t(w.end) })) };
});

// ---- music beats in video time (extrapolate the grid back over the ambient intro) ----
const rawBeats: number[] = al.music.beats;
const period = (rawBeats.at(-1)! - rawBeats[0]) / (rawBeats.length - 1);
const grid: number[] = [];
for (let b = rawBeats[0]; b > 0; b -= period) grid.unshift(b);
grid.pop();
const beats = [...grid, ...rawBeats].map((b) => Math.round((b - musicSkip) * 1000) / 1000).filter((b) => b >= 0 && b <= duration);
const nearestBeat = (s: number) => beats.reduce((a, b) => (Math.abs(b - s) < Math.abs(a - s) ? b : a), beats[0]);

// ---- SFX cues ----
const w445 = findWord(/^\$445,000$/);
const wCall = cue.cta;
const sfx = [
  { file: "whoosh", at: 0.0, gain: 0.55 },
  ...scenes.slice(1).map((s) => ({ file: "whoosh", at: Math.max(0, s.start - 0.45), gain: 0.4 })),
  { file: "riser", at: t(words[w445].start) - 1.6, gain: 0.35 },
  { file: "impact", at: t(words[w445].start), gain: 0.7 },
  ...Array.from({ length: 14 }, (_, i) => ({ file: "tick", at: scenes[2].start + 1.2 + 4.2 * Math.pow(i / 13, 0.75), gain: 0.18 })),
  { file: "impact", at: scenes[2].start + 5.6, gain: 0.45 },
  { file: "shimmer", at: t(words[wCall].start) + 0.1, gain: 0.35 },
];

const out = {
  fps: FPS,
  duration,
  durationInFrames: Math.round(duration * FPS),
  voOffset: VO_OFFSET,
  vo: { file: al.vo.file, speechEnd },
  music: { file: al.music.file, skip: Math.round(musicSkip * 1000) / 1000, tempo: al.music.tempo, period: Math.round(period * 1000) / 1000 },
  beats,
  scenes: scenes.map((s) => ({ ...s, start: Math.round(s.start * 1000) / 1000, end: Math.round(s.end * 1000) / 1000, beatNear: nearestBeat(s.start) })),
  words: words.map((w) => ({ text: w.text, start: t(w.start), end: t(w.end) })),
  phrases,
  sfx: sfx.map((s) => ({ ...s, at: Math.round(s.at * 1000) / 1000 })),
  keyTimes: {
    fishers: t(words[findWord(/^Fishers$/)].start),
    carmel: t(words[findWord(/^Carmel$/)].start),
    price: t(words[w445].start),
    down: t(words[findWord(/^down$/)].start),
    compare: t(words[findWord(/^compare$/)].start),
    comparable: t(words[findWord(/^comparable$/)].start),
    street: t(words[findWord(/^street$/)].start),
    showing: t(words[findWord(/^showing\.$/)].start),
    asking: t(words[findWord(/^asking$/)].start),
    call: t(words[wCall].start),
  },
};
writeFileSync(join(ROOT, "data/timeline.json"), JSON.stringify(out, null, 1));
console.log(`duration ${duration}s (${out.durationInFrames} frames), music skip ${out.music.skip}s, end hold ${endHold.toFixed(2)}s`);
for (const s of out.scenes) console.log(`  ${s.id.padEnd(10)} ${s.start.toFixed(2)}-${s.end.toFixed(2)}`);
for (const p of phrases) console.log(`  ${p.start.toFixed(2)} ${p.text}`);
