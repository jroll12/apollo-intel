// Deterministic gate for the rendered reel(s).
//   bun scripts/check.ts out/reel-s14-9x16.mp4 [out/reel-s14-4x5.mp4 ...]
// Fails (exit 1) on: wrong format/duration, loudness off target, file too big, captions that
// don't match the approved script, any on-screen number not in the locked data, low contrast.
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = join(import.meta.dir, "..");
const j = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const T = j("data/timeline.json");
const s14 = j("data/s14.json");
const metrics = j("data/metrics-oct-2026.json");
const onscreen: string[] = j("data/onscreen.json").strings;
const fails: string[] = [];
const ok = (cond: boolean, msg: string) => (cond ? console.log(`  ok   ${msg}`) : (fails.push(msg), console.log(`  FAIL ${msg}`)));

// ---- captions match the approved S14 script word for word ----
const caps = readFileSync(join(ROOT, "data/captions.txt"), "utf8").split("\n").map((l) => l.trim()).filter(Boolean).join(" ");
console.log("script");
ok(caps === s14.body, "captions.txt equals the approved S14 voiceover");
ok(T.words.map((w: { text: string }) => w.text).join(" ") === s14.body, "timeline words equal the approved S14 voiceover");

// ---- numbers: every number on screen or in captions traces to the locked data ----
const allowed = new Set<string>();
const add = (n: number) => [n, Math.abs(n)].forEach((v) => allowed.add(String(Math.round(v * 100) / 100)));
for (const s of Object.values<any>(metrics.series)) {
  [s.latest?.value, s.yearAgo?.value, s.prior?.value, s.yoyPct, s.momPct].filter((v) => typeof v === "number").forEach(add);
  if (s.yearAgo) add(Math.round((s.latest.value - s.yearAgo.value) * 100) / 100);
}
[2025, 2026, 2027, 317, 863, 9011, 69].forEach(add);
const NUM_RE = /\$?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)%?/g;
const bad: string[] = [];
for (const text of [...onscreen, caps]) {
  for (const m of text.replace(/\b\d{3}-\d{3}-\d{4}\b/g, "").matchAll(NUM_RE)) {
    const n = String(Math.round(Number(m[1].replace(/,/g, "")) * 100) / 100);
    if (!allowed.has(n)) bad.push(`${m[0]} in "${text}"`);
  }
}
console.log("numbers");
ok(bad.length === 0, `every on-screen number is in the locked October data${bad.length ? ": " + bad.join("; ") : ""}`);
ok(onscreen.some((s) => /Keller Williams Indy Metro NE/.test(s)), "brokerage line on screen (LIC-1)");
ok(onscreen.some((s) => /Source: Realtor\.com via FRED, October 2026/.test(s)), "source and period on screen (NAR-2)");
ok(onscreen.some((s) => /not closed prices/i.test(s)), "list price never presented as a sale price (DATA-2)");
ok(onscreen.some((s) => /Spec sample by Jarret Roloff/.test(s)), "spec-sample label on screen");

// ---- contrast of text colors on the darkest likely background ----
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
console.log("contrast (on scrim #16263d, the lightest panel behind text)");
for (const [name, hex] of Object.entries({ snow: "#f4f7fb", snowDim: "#c9d4e4", muted: "#9fb0c8", amber: "#ffb04d", teal: "#3fe0c5" })) {
  const r = ratio(hex, "#16263d");
  ok(r >= 4.5, `${name} ${r.toFixed(1)}:1`);
}

// ---- rendered files ----
const files = process.argv.slice(2);
for (const f of files) {
  console.log(f);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", f]).toString());
  const v = probe.streams.find((s: any) => s.codec_type === "video");
  const a = probe.streams.find((s: any) => s.codec_type === "audio");
  const dur = Number(probe.format.duration);
  const portrait = v.height === 1920;
  ok(v.codec_name === "h264" && v.pix_fmt === "yuv420p", `video h264 yuv420p (${v.codec_name} ${v.pix_fmt})`);
  ok(v.width === 1080 && (v.height === 1920 || v.height === 1350), `size ${v.width}x${v.height}`);
  ok(v.r_frame_rate === "30/1", `30 fps (${v.r_frame_rate})`);
  ok(!!a && a.codec_name === "aac", "audio aac");
  if (/short/.test(f)) ok(dur > 12 && dur < 25, `short cut length ${dur.toFixed(2)}s`);
  else ok(Math.abs(dur - T.duration) < 0.2, `duration ${dur.toFixed(2)}s vs timeline ${T.duration}s`);
  const size = statSync(f).size / 1024 / 1024;
  ok(size <= 15, `file size ${size.toFixed(1)} MB (<= 15)`);
  const out = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${f}" -af ebur128=peak=true -f null - 2>&1 | tail -14`]).toString();
  const I = Number(out.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
  const TP = Number(out.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1]);
  ok(Math.abs(I + 14) <= 1, `integrated loudness ${I} LUFS (target -14 ±1)`);
  ok(TP <= -0.9, `true peak ${TP} dBTP (<= -1)`);
  if (portrait) ok(true, "portrait safe area enforced by LAYOUT (text above y=1540, left of x=930)");
}

console.log(fails.length ? `\n${fails.length} check(s) failed` : "\nall checks passed");
process.exit(fails.length ? 1 : 0);
