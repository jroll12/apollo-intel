// Stage 3: deterministic reduce/check pass.
//   bun scripts/check.ts                    -> all files in content/assets, writes content/check-report.json
//   bun scripts/check.ts content/assets/x.json  -> one file (generator self-check), no report written
// Checks: schema, platform formats (FMT/LIC/MSG), fact tracing (DATA-1), fair-housing terms, duplicate hooks.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AssetFileSchema, textOf, type Asset } from "./schema";

const ROOT = join(import.meta.dir, "..");
const read = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

// ---------- allowed numbers (DATA-1) ----------
const allowed = new Set<string>();
const addNum = (n: number) => {
  const r = (x: number) => String(Math.round(x * 100) / 100);
  allowed.add(r(n));
  allowed.add(r(Math.abs(n)));
  if (Math.abs(n) >= 1000) {
    allowed.add(r(Math.round(n / 1000))); // 445000 -> 445 (for $445K)
    allowed.add(r(Math.round(n / 100) / 10)); // 7171 -> 7.2 (for 7.2K)
  }
  allowed.add(String(Math.round(n))); // 7.28 -> 7 is NOT added below; rounding of pct handled separately
};
const metrics = read("content/metrics.json");
for (const s of Object.values<any>(metrics.series)) {
  for (const p of [s.latest, s.prior, s.yearAgo].filter(Boolean)) addNum(p.value);
  addNum(s.momPct);
  if (s.yoyPct !== null) addNum(s.yoyPct);
  if (s.yearAgo) addNum(Math.round((s.latest.value - s.yearAgo.value) * 100) / 100);
  if (s.prior) addNum(Math.round((s.latest.value - s.prior.value) * 100) / 100);
  // rounded percent variants (e.g. 21.3 -> 21)
  if (s.yoyPct !== null) allowed.add(String(Math.round(Math.abs(s.yoyPct))));
  allowed.add(String(Math.round(Math.abs(s.momPct))));
}
for (const v of Object.values<number>(metrics.derived)) {
  addNum(v);
  allowed.add(String(Math.round(v)));
}
// brand.json facts (and phone/address parts)
[1998, 1992, 2500, 200, 419, 5.0, 178, 3118, 18, 500, 10, 2, 11501, 300, 46037, 317, 863, 9011].forEach(addNum);
// listing.json (hypothetical)
const listing = read("content/listing.json");
[listing.price, listing.beds, listing.baths, listing.sqft, listing.lotAcres, listing.yearBuilt, listing.hoaMonthly, 2023, 2022, 1, 3, 46038, 1234].forEach(addNum);
// calendar years
[2025, 2026, 2027, 2016].forEach(addNum);

const NUM_RE = /(\$)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(\s?[kK]\b|\s?million\b)?(%| percent\b)?/g;
function checkFacts(text: string): string[] {
  const bad: string[] = [];
  const clean = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\b\d{1,2}:\d{2}\b/g, "") // clock times
    .replace(/\b(19|20)\d{2}-\d{2}-\d{2}\b/g, "") // ISO dates
    .replace(/\b\d{3}[-.]\d{3}[-.]\d{4}\b/g, ""); // phone
  for (const m of clean.matchAll(NUM_RE)) {
    const [raw, dollar, num, suffix, pctSign] = m;
    let n = Number(num.replace(/,/g, ""));
    if (suffix && /million/i.test(suffix)) n = n; // "$500 million" -> 500 allowed
    const isPlainSmallInt = !dollar && !pctSign && !suffix && Number.isInteger(n) && n <= 60;
    if (isPlainSmallInt) continue; // dates, list counts, seconds, ages of items (DATA-1 exemption)
    const key = String(Math.round(n * 100) / 100);
    if (!allowed.has(key)) bad.push(raw.trim());
  }
  return bad;
}

// ---------- fair-housing / banned terms ----------
const terms = readFileSync(join(ROOT, "rules/fairhousing-terms.txt"), "utf8")
  .split("\n")
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => {
    const m = l.match(/^(.*?)\s*\[(.+)\]$/)!;
    return { phrase: m[1].toLowerCase(), rule: m[2] };
  });
const checkTerms = (text: string) =>
  terms.filter((t) => new RegExp(`\\b${t.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)).map((t) => `${t.rule}: "${t.phrase}"`);

// ---------- format rules ----------
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
function checkFormat(a: Asset): string[] {
  const e: string[] = [];
  const all = textOf(a);
  if (a.adType && !/Keller Williams Indy Metro NE/.test(a.disclosure + " " + a.body)) e.push("LIC-1: brokerage name missing");
  if (/Evelo Realty/i.test(all)) e.push("LIC-2: implies team is a brokerage");
  if (a.channel.startsWith("listing") || a.channel === "sms") {
    if (/1234 Sample Lane/.test(all) && !/sample listing/i.test(all + a.disclosure)) e.push("LIC-3: sample listing not labeled");
  }
  switch (a.channel) {
    case "instagram":
    case "listing-social": {
      const cap = `${a.hook}\n${a.body}\n${a.cta}`;
      if (cap.length > 2200) e.push(`FMT-1: caption ${cap.length} > 2200`);
      const h = a.hashtags?.length ?? 0;
      if (h < 3 || h > 5) e.push(`FMT-1: ${h} hashtags (want 3-5)`);
      break;
    }
    case "gbp": {
      const t = `${a.hook}\n${a.body}\n${a.cta}`;
      if (t.length > 1500) e.push(`FMT-2: ${t.length} > 1500`);
      break;
    }
    case "email":
    case "listing-email": {
      if (!a.subject || a.subject.length > 60) e.push(`FMT-3: subject ${a.subject?.length ?? "missing"}`);
      if (!a.preview || a.preview.length > 110) e.push(`FMT-3: preview ${a.preview?.length ?? "missing"}`);
      if (!/11501 Cumberland Rd/.test(a.body + a.disclosure)) e.push("MSG-1: physical address missing");
      if (!/unsubscribe/i.test(a.body + a.disclosure)) e.push("MSG-1: unsubscribe missing");
      break;
    }
    case "blog": {
      if (!a.metaTitle || a.metaTitle.length > 60) e.push(`FMT-4: metaTitle ${a.metaTitle?.length ?? "missing"}`);
      if (!a.metaDescription || a.metaDescription.length > 160) e.push(`FMT-4: metaDescription ${a.metaDescription?.length ?? "missing"}`);
      const w = words(a.body);
      if (w < 650 || w > 1300) e.push(`blog length ${w} words (want 650-1300)`);
      break;
    }
    case "reel":
    case "podcast-clip": {
      const w = words(a.body);
      if (w < 70 || w > 120) e.push(`FMT-5: ${w} spoken words (want 75-115)`);
      if (!a.shotList?.length) e.push("FMT-5: shotList missing");
      break;
    }
    case "sms": {
      const parts = a.body.split(/\n---\n/);
      parts.forEach((p, i) => p.length > 160 && e.push(`MSG-2: text ${i + 1} is ${p.length} chars`));
      if (!/Reply STOP/i.test(parts[0])) e.push("MSG-2: first text missing 'Reply STOP to opt out'");
      break;
    }
  }
  if (/—/.test(all)) e.push("STYLE: em dash found (use a comma, period or colon)");
  return e;
}

// ---------- duplicate hooks ----------
const grams = (s: string) => {
  const w = s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const g = new Set<string>();
  for (let i = 0; i < w.length - 2; i++) g.add(w.slice(i, i + 3).join(" "));
  return g;
};
const jaccard = (a: Set<string>, b: Set<string>) => {
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / (a.size + b.size - inter || 1);
};

// ---------- run ----------
const arg = process.argv[2];
const files = arg ? [arg.replace(/^.*content\//, "content/")] : readdirSync(join(ROOT, "content/assets")).filter((f) => f.endsWith(".json")).map((f) => `content/assets/${f}`);

const report: Record<string, string[]> = {};
const assets: Asset[] = [];
let schemaErrors = 0;
for (const f of files) {
  const parsed = AssetFileSchema.safeParse(read(f));
  if (!parsed.success) {
    schemaErrors++;
    console.error(`SCHEMA ${f}:`, parsed.error.issues.slice(0, 8).map((i) => `${i.path.join(".")}: ${i.message}`));
    continue;
  }
  assets.push(...parsed.data);
}
for (const a of assets) {
  const t = textOf(a);
  const issues = [...checkFormat(a), ...checkTerms(t), ...checkFacts(t).map((n) => `DATA-1: untraceable number "${n}"`)];
  if (issues.length) report[a.id] = issues;
}
const hooks = assets.map((a) => ({ id: a.id, g: grams(a.hook) }));
for (let i = 0; i < hooks.length; i++)
  for (let j = i + 1; j < hooks.length; j++) {
    const s = jaccard(hooks[i].g, hooks[j].g);
    if (s > 0.5) (report[hooks[j].id] ??= []).push(`DEDUPE: hook ${Math.round(s * 100)}% similar to ${hooks[i].id}`);
  }
const ids = assets.map((a) => a.id);
ids.filter((x, i) => ids.indexOf(x) !== i).forEach((d) => (report[d] ??= []).push("DUPLICATE ID"));

const failing = Object.keys(report).length;
console.log(`${assets.length} assets checked, ${failing} with issues, ${schemaErrors} schema errors`);
for (const [id, iss] of Object.entries(report)) console.log(`  ${id}: ${iss.join(" | ")}`);
if (!arg) writeFileSync(join(ROOT, "content/check-report.json"), JSON.stringify({ checkedAt: new Date().toISOString(), total: assets.length, failing, report }, null, 2));
process.exit(failing || schemaErrors ? 1 : 0);
