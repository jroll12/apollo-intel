// Self-check: container props, timing vs audio, determinism, facts whitelist, contrast,
// safe zones (via hyperframes check at boundary times), frame extraction + contact sheet + poster.
import { readFileSync, readdirSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const dir = new URL("../", import.meta.url).pathname;
const mp4 = process.argv[2] ?? "out/evelo-impact-concept.mp4";
const T = JSON.parse(readFileSync(dir + "timings.json"));
const fails = [], notes = [];
const ok = (cond, msg) => (cond ? notes.push("PASS " + msg) : fails.push("FAIL " + msg));
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: dir, encoding: "utf8", maxBuffer: 64e6 });

// 1. container
const probe = JSON.parse(sh("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", mp4]));
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const vdur = +probe.format.duration;
ok(v.codec_name === "h264" && v.width === 1080 && v.height === 1920 && v.r_frame_rate === "30/1",
  `video h264 1080x1920 30fps (${v.codec_name} ${v.width}x${v.height} ${v.r_frame_rate})`);
ok(vdur < 60, `duration < 60 s (${vdur.toFixed(3)})`);
const wav = dir + "assets/narration.wav";
if (existsSync(wav)) {
  const adur = +sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).trim();
  ok(Math.abs(vdur - adur) <= 0.1, `video within 0.1 s of narration (${vdur.toFixed(3)} vs ${adur.toFixed(3)})`);
  ok(!!a, "audio stream present");
} else {
  notes.push(`SKIP audio sync: no narration.wav (draft, timings source=${T.source})`);
  ok(Math.abs(vdur - T.duration) <= 1 / 30 + 0.001, `video matches timings.json duration (${vdur.toFixed(3)} vs ${T.duration})`);
}

// 2. determinism: no real-time APIs in authored HTML
const html = ["index.html", ...readdirSync(dir + "compositions").map((f) => "compositions/" + f)]
  .map((f) => readFileSync(dir + f, "utf8")).join("\n");
ok(!/setInterval|setTimeout|Date\.now|requestAnimationFrame|performance\.now|Math\.random|repeat:\s*-1/.test(html),
  "no real-time / random APIs");

// 3. facts: every number shown on screen (scene files, not captions) is whitelisted
const sceneText = readdirSync(dir + "compositions").filter((f) => f !== "captions.html")
  .map((f) => readFileSync(dir + "compositions/" + f, "utf8").replace(/<style>[\s\S]*?<\/style>|<script>[\s\S]*?<\/script>|<[^>]+>/g, " "))
  .join(" ");
const nums = [...new Set(sceneText.match(/\$?\d[\d,.\-]*[M+]*/g) ?? [])];
const allowed = ["170+", "$70M+", "0", "+", "2027", "317-863-9011"]; // "0" = counter initial text node
ok(nums.every((n) => allowed.includes(n)), `on-screen numbers whitelisted: ${nums.join(" ")}`);
ok(/v:\s*1760/.test(html) && /tl\.set\(c,\s*\{\s*v:\s*1760/.test(html), "counter tweens to and is pinned at 1760");
ok(/>Concept</.test(html), "Concept label present in final scene");

// 4. captions match narration word-for-word
const caps = JSON.parse(readFileSync(dir + "captions.json"));
const script = JSON.parse(readFileSync(dir + "assets/script.json"));
const narr = script.scenes.map((s) => s.narration).join(" ").split(/\s+/);
ok(caps.map((c) => c.text).join(" ").split(/\s+/).join(" ") === narr.join(" "), "captions concatenate to the exact script");

// 5. contrast of tokens on navy
const lum = (h) => { const c = h.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (f, b) => { const [x, y] = [lum(f), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const [n, hex] of [["cream", "F5EBDD"], ["accent", "E8A33D"], ["muted", "B9C2D3"]])
  ok(cr(hex, "0E1B33") >= 4.5, `contrast ${n} on navy ${cr(hex, "0E1B33").toFixed(1)}:1`);

// 6. hyperframes check (layout, safe zones, contrast) at every scene boundary +/-0.1 and midpoints
const times = [0.05];
for (const s of T.scenes) times.push(s.start + 0.1, (s.start + s.end) / 2, s.end - 0.1);
const at = [...new Set(times.map((t) => +Math.min(t, T.duration - 0.05).toFixed(2)))].sort((p, q) => p - q);
let hf;
try {
  hf = JSON.parse(sh("node", [".agents/skills/hyperframes/scripts/plugin-cli.mjs", "check", "--json", "--at", at.join(","), "--at-transitions"]));
} catch (e) { hf = JSON.parse(e.stdout); }
const findings = ["layout", "contrast", "runtime"].flatMap((k) => (hf[k]?.findings ?? []).map((f) => ({ k, ...f })));
const bad = findings.filter((f) => f.severity === "error" || f.code === "outside_safe_zone" || /contrast/.test(f.code));
ok(hf.ok && bad.length === 0, `hyperframes check at ${at.length}+ times: ${bad.length} layout/contrast/safe-zone findings` +
  (bad.length ? "\n   " + bad.map((f) => `${f.code} ${f.selector} @${f.time} "${(f.text ?? "").slice(0, 30)}"`).join("\n   ") : ""));

// 7. frames from the rendered file + contact sheet + poster
const fdir = dir + "out/frames/";
rmSync(fdir, { recursive: true, force: true }); mkdirSync(fdir, { recursive: true });
at.forEach((t, i) => sh("ffmpeg", ["-v", "error", "-ss", String(t), "-i", mp4, "-frames:v", "1", "-vf", "scale=360:-1",
  `${fdir}${String(i).padStart(2, "0")}_${t.toFixed(2)}s.png`]));
sh("ffmpeg", ["-v", "error", "-y", "-sseof", "-0.04", "-i", mp4, "-frames:v", "1", `${fdir}last.png`]);
sh("ffmpeg", ["-v", "error", "-y", "-pattern_type", "glob", "-i", `${fdir}[0-9]*.png`, "-vf", "tile=6x4:padding=6:color=black", "-frames:v", "1", dir + "out/contact-sheet.png"]);
const s3 = T.scenes.find((s) => s.id === "s3");
sh("ffmpeg", ["-v", "error", "-y", "-ss", String(+(s3.end - 0.4).toFixed(2)), "-i", mp4, "-frames:v", "1", dir + "out/poster.png"]);
notes.push(`frames: out/frames (${at.length} + last.png), out/contact-sheet.png, out/poster.png @ ${(s3.end - 0.4).toFixed(2)}s`);

console.log([...notes, ...fails].join("\n"));
process.exit(fails.length ? 1 : 0);
