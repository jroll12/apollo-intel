// DRAFT ONLY: estimates word timings from the script so layout and motion can be reviewed
// before narration.wav exists. Replaced by scripts/whisper-timings.py output once audio lands.
import { readFileSync, writeFileSync } from "node:fs";

const script = JSON.parse(readFileSync(new URL("../assets/script.json", import.meta.url)));
const LEAD_IN = 0.4, SCENE_GAP = 0.55, SENTENCE_PAUSE = 0.35, COMMA_PAUSE = 0.18, TAIL = 1.6;

function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (/^\d+$/.test(w)) {
    // spoken numbers: "170" ~ "one seventy" (3), "2027" ~ "twenty twenty-seven" (5), "1760" (6)
    const table = { "170": 4, "70": 3, "2027": 5, "1760": 6 };
    return table[w] ?? w.length; // digit-by-digit fallback (phone digits)
  }
  const m = w.match(/[aeiouy]+/g);
  let n = m ? m.length : 1;
  if (w.endsWith("e") && n > 1 && !w.endsWith("le")) n -= 1;
  return Math.max(1, n);
}

let t = LEAD_IN;
const words = [], scenes = [];
let id = 0;
for (const [si, s] of script.scenes.entries()) {
  if (si > 0) t += SCENE_GAP;
  const tokens = s.narration.split(/\s+/).flatMap((tok) =>
    // "3-1-7," is spoken as three words; keep it as one caption token but time it as 3 digits
    [tok]);
  for (const tok of tokens) {
    const digitsGroup = /^\d(-\d)+[,.]?$/.test(tok);
    const syl = digitsGroup ? tok.replace(/[^0-9]/g, "").length : syllables(tok.replace(/,/g, ""));
    const dur = 0.1 + 0.155 * syl;
    words.push({ id: `w${id++}`, text: tok, start: +t.toFixed(3), end: +(t + dur).toFixed(3), scene: s.id });
    t += dur;
    if (/[.?!:]$/.test(tok)) t += SENTENCE_PAUSE;
    else if (/,$/.test(tok)) t += COMMA_PAUSE;
    else t += 0.04;
  }
}
const duration = +(t + TAIL).toFixed(3);
for (const [si, s] of script.scenes.entries()) {
  const first = words.find((w) => w.scene === s.id);
  const start = si === 0 ? 0 : +(first.start - 0.25).toFixed(3);
  scenes.push({ id: s.id, start });
}
scenes.forEach((s, i) => (s.end = i < scenes.length - 1 ? scenes[i + 1].start : duration));

writeFileSync(new URL("../timings.json", import.meta.url),
  JSON.stringify({ source: "estimate", note: "DRAFT: estimated, no audio", duration, scenes, words }, null, 2));
console.log(`estimate: ${duration}s`, scenes.map((s) => `${s.id} ${s.start}-${s.end}`).join(" | "));
