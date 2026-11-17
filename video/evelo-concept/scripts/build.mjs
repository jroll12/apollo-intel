// Generates index.html + compositions/*.html from assets/script.json and timings.json.
// Every scene start/end and every reveal time comes from timings.json. Re-run after re-timing.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const T = JSON.parse(readFileSync(new URL("timings.json", root)));
const hasAudio = existsSync(new URL("assets/narration.wav", root));
const W = 1080, H = 1920;
const r3 = (n) => Math.round(n * 1000) / 1000;

// ---- timing helpers -------------------------------------------------------
const scene = (id) => T.scenes.find((s) => s.id === id);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$]/g, "");
// local time (seconds from scene start) of the first word in `id` matching `text`
function at(id, text, which = "start") {
  const s = scene(id);
  const w = T.words.find((w) => w.scene === id && norm(w.text) === norm(text));
  if (!w) throw new Error(`timings.json: no word "${text}" in ${id}`);
  return r3(w[which] - s.start);
}
const dur = (id) => r3(scene(id).end - scene(id).start);

// ---- shared tokens --------------------------------------------------------
const TOKENS = `
  --bg: #0E1B33; --fg: #F5EBDD; --accent: #E8A33D; --muted: #B9C2D3;
  /* intersection of TikTok, Reels and Shorts UI-clear bands (core/safeAreas): y 288-1248;
     x 120-888 above y 840, x 120-780 below */
  --x-left: 120px; --x-right-hi: 192px; --x-right-lo: 300px;
  --safe-top: 288px; --key-bottom: 1060px; --cap-top: 1096px;`;

const BASE_CSS = `
  #root { position: absolute; inset: 0; font-family: Inter, sans-serif; color: var(--fg); }
  .stage { position: absolute; left: var(--x-left); right: var(--x-right-hi); top: var(--safe-top);
           height: calc(var(--key-bottom) - var(--safe-top)); display: flex; flex-direction: column;
           align-items: flex-start; justify-content: center; text-align: left; }
  .big { font-weight: 900; line-height: 0.95; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .sub { font-weight: 700; line-height: 1.05; }
  .accent { color: var(--accent); }
  .muted { color: var(--muted); }
  .bar { width: 120px; height: 10px; background: var(--accent); margin-bottom: 56px; }
  .drop { width: 120px; height: 120px; margin-bottom: 48px; }
  .drop i { display: block; width: 100%; height: 100%; background: var(--accent);
            border-radius: 50% 0 50% 50%; rotate: -45deg; }`;

// scene file: everything inside <template>, timeline registered last
function sceneFile(id, { css = "", html, js, holdEnd = false }) {
  const d = dur(id);
  const exit = holdEnd ? "" :
    `tl.to("#${id}-stage", { opacity: 0, duration: 0.25, ease: "power2.in" }, ${r3(d - 0.3)});`;
  return `<template>
  <style>
    #root { ${TOKENS} }
    ${BASE_CSS}
    ${css}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <div id="${id}-stage" class="stage">
${html}
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    ${exit}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}
const pop = (sel, t, extra = "") =>
  `tl.fromTo("${sel}", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out"${extra} }, ${r3(Math.max(0, t))});`;

// ---- scenes ---------------------------------------------------------------
const files = {};

files.s1 = sceneFile("s1", {
  css: `#s1-num { font-size: 260px; } #s1-label { font-size: 110px; margin-top: 24px; }`,
  html: `      <div id="s1-bar" class="bar"></div>
      <div id="s1-num" class="big accent">170+</div>
      <div id="s1-label" class="sub">families</div>`,
  // frame 0 is the thumbnail: the number is already on screen, it only settles
  js: `tl.fromTo("#s1-num", { scale: 0.94 }, { scale: 1, duration: 0.8, ease: "power3.out" }, 0);
    tl.fromTo("#s1-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, 0);
    ${pop("#s1-label", at("s1", "families") - 0.15)}`,
});

files.s2 = sceneFile("s2", {
  css: `#s2-num { font-size: 210px; } #s2-label { font-size: 84px; margin-top: 28px; }`,
  html: `      <div id="s2-bar" class="bar"></div>
      <div id="s2-num" class="big accent">$70M+</div>
      <div id="s2-label" class="sub">in real estate</div>`,
  js: `tl.fromTo("#s2-stage", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    ${pop("#s2-num", at("s2", "70") - 0.2)}
    ${pop("#s2-label", at("s2", "70") + 0.35)}`,
});

// counter: tween a plain object on the timeline; onUpdate writes the text. Seek-safe.
const cStart = at("s3", "So"), cEnd = at("s3", "1,760", "end") + 0.15;
files.s3 = sceneFile("s3", {
  css: `#s3-eyebrow { font-size: 60px; margin-bottom: 40px; }
    #s3-count { font-size: 190px; white-space: nowrap; }
    #s3-label { font-size: 84px; margin-top: 24px; }`,
  html: `      <div id="s3-drop" class="drop"><i></i></div>
      <div id="s3-eyebrow" class="sub muted">Filter of Hope</div>
      <div id="s3-count" class="big accent"><span id="s3-n">0</span><span id="s3-plus">+</span></div>
      <div id="s3-label" class="sub">water filters</div>`,
  js: `tl.fromTo("#s3-stage", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    ${pop("#s3-drop", 0.1)}
    ${pop("#s3-eyebrow", at("s3", "Filter") - 0.2)}
    const n = document.querySelector("#s3-n");
    const c = { v: 0 };
    const paint = () => { n.textContent = Math.round(c.v).toLocaleString("en-US"); };
    tl.fromTo("#s3-count", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${r3(cStart - 0.1)});
    tl.fromTo(c, { v: 0 }, { v: 1760, duration: ${r3(cEnd - cStart)}, ease: "power2.out", onUpdate: paint }, ${cStart});
    tl.set(c, { v: 1760, onComplete: paint }, ${r3(cEnd)});
    tl.fromTo("#s3-plus", { opacity: 0 }, { opacity: 1, duration: 0.2 }, ${r3(cEnd)});
    ${pop("#s3-label", at("s3", "water") - 0.15)}
    paint();`,
});

files.s4 = sceneFile("s4", {
  css: `#s4-a, #s4-b { font-size: 190px; }`,
  html: `      <div id="s4-drop" class="drop"><i></i></div>
      <div id="s4-a" class="big">Clean</div>
      <div id="s4-b" class="big accent">water</div>`,
  js: `tl.fromTo("#s4-stage", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    ${pop("#s4-drop", 0)}
    ${pop("#s4-a", at("s4", "Clean") - 0.15)}
    ${pop("#s4-b", at("s4", "water,") - 0.15)}`,
});

files.s5 = sceneFile("s5", {
  css: `#s5-eyebrow { font-size: 60px; margin-bottom: 56px; }
    .s5-line { font-size: 84px; margin: 18px 0; max-width: 660px; }`,
  html: `      <div id="s5-eyebrow" class="sub muted">Our mission</div>
      <div id="s5-l1" class="big s5-line">Making a <span class="accent">Difference.</span></div>
      <div id="s5-l2" class="big s5-line">Changing <span class="accent">Lives.</span></div>
      <div id="s5-l3" class="big s5-line">Leaving a <span class="accent">Legacy.</span></div>`,
  js: `tl.fromTo("#s5-stage", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    ${pop("#s5-eyebrow", at("s5", "mission:") - 0.3)}
    ${pop("#s5-l1", at("s5", "Making") - 0.1)}
    ${pop("#s5-l2", at("s5", "Changing") - 0.1)}
    ${pop("#s5-l3", at("s5", "Leaving") - 0.1)}`,
});

files.s6 = sceneFile("s6", {
  holdEnd: true,
  css: `#s6-q { font-size: 84px; }
    #s6-team { font-size: 54px; margin-top: 64px; }
    #s6-phone { font-size: 88px; margin-top: 8px; white-space: nowrap; }
    #s6-mail { font-size: 54px; margin-top: 22px; white-space: nowrap; }
    #s6-concept { margin-top: 64px; font-size: 36px; font-weight: 700; letter-spacing: 0.18em;
                  text-transform: uppercase; padding: 10px 24px; border: 3px solid var(--muted); }`,
  html: `      <div id="s6-q" class="big">Know someone moving in&nbsp;<span class="accent">2027?</span></div>
      <div id="s6-team" class="sub">Evelo Team</div>
      <div id="s6-phone" class="big accent">317-863-9011</div>
      <div id="s6-mail" class="sub">info@eveloteam.com</div>
      <div id="s6-concept" class="muted">Concept</div>`,
  js: `tl.fromTo("#s6-stage", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    ${pop("#s6-q", 0.1)}
    ${pop("#s6-team", at("s6", "Send") - 0.1)}
    ${pop("#s6-phone", at("s6", "Send") - 0.1)}
    ${pop("#s6-mail", at("s6", "Send") + 0.25)}
    ${pop("#s6-concept", at("s6", "Send") + 0.6)}`,
});

// ---- captions: 3-5 word groups, break at sentence end / comma pause / 5 words -------------
const groups = [];
let cur = [];
for (const [i, w] of T.words.entries()) {
  cur.push(w);
  const next = T.words[i + 1];
  const gap = next ? next.start - w.end : 99;
  const endSentence = /[.?!:]$/.test(w.text);
  const sceneChange = !next || next.scene !== w.scene;
  if (sceneChange || endSentence || cur.length >= 5 || (gap >= 0.15 && cur.length >= 2)) {
    groups.push(cur); cur = [];
  }
}
const capRows = groups.map((g, i) => {
  const start = r3(Math.max(0.15, g[0].start - 0.05));
  const nextStart = groups[i + 1] ? groups[i + 1][0].start - 0.05 : T.duration;
  const end = r3(Math.min(nextStart, g.at(-1).end + 0.6, T.duration));
  return { id: `cap-${i}`, text: g.map((w) => w.text).join(" "), start, dur: r3(end - start) };
});
writeFileSync(new URL("captions.json", root), JSON.stringify(capRows, null, 2));

files.captions = `<template>
  <style>
    #root { ${TOKENS} position: absolute; inset: 0; font-family: Inter, sans-serif; }
    .cap { position: absolute; left: var(--x-left); right: var(--x-right-lo); top: var(--cap-top);
           text-align: left; font-weight: 700; font-size: 50px; line-height: 1.2; color: var(--fg); }
  </style>
  <div id="root" data-composition-id="captions" data-width="${W}" data-height="${H}">
${capRows.map((c) => `    <div id="${c.id}" class="cap clip" data-start="${c.start}" data-duration="${c.dur}" data-track-index="1"><span id="${c.id}-t">${c.text}</span></div>`).join("\n")}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
${capRows.map((c) => `    tl.fromTo("#${c.id}-t", { opacity: 0 }, { opacity: 1, duration: 0.1 }, ${c.start});`).join("\n")}
    window.__timelines["captions"] = tl;
  </script>
</template>
`;

// ---- root -----------------------------------------------------------------
const hosts = T.scenes.map((s) => `    <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html"
      data-start="${r3(s.start)}" data-duration="${r3(s.end - s.start)}" data-track-index="1"
      data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>`).join("\n");

const index = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Evelo: every closing gives back (concept)</title>
  <style>
    html, body { margin: 0; background: #0E1B33; }
    #bg { position: absolute; inset: 0; background: #0E1B33; }
  </style>
</head>
<body>
  <script src="assets/vendor/gsap.min.js"></script>
  <!-- generated by scripts/build.mjs from timings.json (${T.source}); edit the generator, not this file -->
  <div id="main" data-composition-id="main" data-start="0" data-duration="${T.duration}" data-width="${W}" data-height="${H}">
    <div id="bg"></div>
${hosts}
    <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html"
      data-start="0" data-duration="${T.duration}" data-track-index="2"
      data-track-kind="captions" data-width="${W}" data-height="${H}"></div>
${hasAudio ? `    <audio id="narration" class="clip" src="assets/narration.wav" data-start="0" data-track-index="3" data-volume="1"></audio>` : "    <!-- no assets/narration.wav yet: silent draft -->"}
  </div>
  <script>
    window.__timelines["main"] = gsap.timeline({ paused: true });
  </script>
</body>
</html>
`;

mkdirSync(new URL("compositions/", root), { recursive: true });
for (const [id, src] of Object.entries(files)) writeFileSync(new URL(`compositions/${id}.html`, root), src);
writeFileSync(new URL("index.html", root), index);
console.log(`built: ${T.duration}s, ${T.scenes.length} scenes, ${capRows.length} caption groups, audio=${hasAudio}`);
