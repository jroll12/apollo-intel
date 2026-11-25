// Builds a 1-page PDF summary (letter size) from the same content files the site uses.
//   bun scripts/one-pager.ts <out.pdf>
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const ROOT = join(import.meta.dir, "..");
const j = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const metrics = j("content/metrics.json");
const grid = j("content/grid.json");
const v = j("content/validation-report.json");
const dropped = new Set<string>(v.dropped);
const assets = readdirSync(join(ROOT, "content/assets")).flatMap((f) => j(`content/assets/${f}`)).filter((a: { id: string }) => !dropped.has(a.id));
const final = v.rounds.at(-1);
const S = metrics.series;
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const out = process.argv[2] ?? join(ROOT, "one-pager.pdf");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: letter; margin: 0.55in; }
body { font-family: Inter, Helvetica, Arial, sans-serif; color: #16202e; font-size: 10.5pt; line-height: 1.4; margin: 0; }
h1 { font-family: Georgia, serif; font-size: 21pt; margin: 2px 0 4px; line-height: 1.15; color: #0b1f3a; }
h2 { font-family: Georgia, serif; font-size: 12pt; margin: 14px 0 4px; color: #0b1f3a; }
.eyebrow { font-size: 8pt; letter-spacing: .14em; text-transform: uppercase; color: #a5823f; font-weight: 600; }
.banner { background: #f4ecdf; padding: 5px 10px; font-size: 8pt; border-radius: 4px; margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
.tile { border: 1px solid #e4dfd6; border-radius: 8px; padding: 8px 10px; }
.tile b { display: block; font-family: Georgia, serif; font-size: 17pt; color: #0b1f3a; }
.tile span { font-size: 8.5pt; color: #5b6472; }
ul { margin: 4px 0; padding-left: 16px; } li { margin: 2px 0; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.foot { margin-top: 14px; border-top: 1px solid #e4dfd6; padding-top: 6px; font-size: 8.5pt; color: #5b6472; display: flex; justify-content: space-between; }
</style></head><body>
<div class="banner">Spec work sample by Jarret Roloff. Not affiliated with or published by Evelo Team or Keller Williams. All content is draft.</div>
<div class="eyebrow">For Hannah Perkey · Evelo Team</div>
<h1>A December marketing plan, and the weekly system to run it</h1>
<div>Built from public data and the team's own blog: ${grid.slots.length} calendar slots across 7 channels, every piece written, checked for fair housing and brokerage rules, plus the playbook a coordinator would use to run it every week.</div>
<div class="grid">
  <div class="tile"><b>${assets.length}</b><span>draft assets ready to review</span></div>
  <div class="tile"><b>${final.compliancePass}/${final.reviewed}</b><span>passed blind compliance review</span></div>
  <div class="tile"><b>0</b><span>untraceable numbers (script-checked)</span></div>
  <div class="tile"><b>15 min</b><span>CEO time per week, one approval queue</span></div>
</div>
<div class="two">
<div>
<h2>What's inside</h2>
<ul>
<li><b>30-day calendar:</b> social, short video, Google posts, email, blog</li>
<li><b>Listing launch kit:</b> MLS remarks to follow-up texts, 12-day timeline</li>
<li><b>Market Pulse:</b> Hamilton County and metro data, refreshed monthly</li>
<li><b>Podcast reboot:</b> pilot script, 4 clips, 6-episode season</li>
<li><b>Ops playbook:</b> weekly rhythm, RACI, compliance, KPIs, 30-60-90</li>
</ul>
<h2>Three opportunities</h2>
<ul>
<li>The blog already works. Each post can become 4 to 6 assets across channels.</li>
<li>419 Google reviews at 5.0 and the giving plan deserve a weekly slot.</li>
<li>The podcast archive is still live. A pilot is ready to record.</li>
</ul>
</div>
<div>
<h2>The December story (October 2026 data)</h2>
<ul>
<li>Hamilton County median list price ${usd(S.MEDLISPRI18057.latest.value)}, ${S.MEDLISPRI18057.yoyPct}% vs a year ago</li>
<li>Metro active listings ${S.ACTLISCOU26900.latest.value.toLocaleString()}, +${S.ACTLISCOU26900.yoyPct}% vs a year ago</li>
<li>Metro median days on market ${S.MEDDAYONMAR26900.latest.value} (${S.MEDDAYONMAR26900.yearAgo.value} a year ago)</li>
<li>30-year fixed rate ${S.MORTGAGE30US.latest.value}% (week of Nov 19)</li>
</ul>
<div style="font-size:8pt;color:#5b6472">Source: Realtor.com and Freddie Mac via FRED. List prices, not sale prices.</div>
<h2>How it was built</h2>
<div>An AI-assisted pipeline I designed: parallel writers, script checks on every number and rule, and blind compliance and editor reviewers that never saw the prompts. Average editor score went from ${v.rounds[0].avgScore.toFixed(1)} to ${final.avgScore.toFixed(1)} out of 5 across ${v.rounds.length - 1} review rounds.</div>
</div>
</div>
<div class="foot"><span>Jarret Roloff · 630-669-8697 · jroloff1@gmail.com</span><span>Full interactive version: [LINK]</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: out, format: "Letter", printBackground: true });
await browser.close();
writeFileSync(out.replace(/\.pdf$/, ".html"), html);
console.log("wrote", out);
