// Pulls public Realtor.com housing series (via FRED, no API key) and writes content/metrics.json.
// Every number used in generated copy must trace back to this file (see scripts/facts.ts).
import { writeFileSync } from "node:fs";
import { join } from "node:path";

type SeriesDef = { id: string; label: string; geo: "metro" | "hamilton" | "us"; unit: "usd" | "count" | "days" | "pct" };

const SERIES: SeriesDef[] = [
  { id: "MEDLISPRI26900", label: "Median listing price", geo: "metro", unit: "usd" },
  { id: "MEDLISPRIPERSQUFEE26900", label: "Median listing price per sq ft", geo: "metro", unit: "usd" },
  { id: "ACTLISCOU26900", label: "Active listings", geo: "metro", unit: "count" },
  { id: "NEWLISCOU26900", label: "New listings", geo: "metro", unit: "count" },
  { id: "PENLISCOU26900", label: "Pending listings", geo: "metro", unit: "count" },
  { id: "PRIREDCOU26900", label: "Listings with a price reduction", geo: "metro", unit: "count" },
  { id: "MEDDAYONMAR26900", label: "Median days on market", geo: "metro", unit: "days" },
  { id: "MEDLISPRI18057", label: "Median listing price", geo: "hamilton", unit: "usd" },
  { id: "ACTLISCOU18057", label: "Active listings", geo: "hamilton", unit: "count" },
  { id: "MEDDAYONMAR18057", label: "Median days on market", geo: "hamilton", unit: "days" },
  { id: "MORTGAGE30US", label: "30-year fixed mortgage rate (weekly avg)", geo: "us", unit: "pct" },
];

const GEO_NAME = {
  metro: "Indianapolis-Carmel-Anderson metro",
  hamilton: "Hamilton County, IN",
  us: "U.S. (Freddie Mac PMMS)",
};

async function fetchSeries(id: string) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  const rows = (await res.text())
    .trim()
    .split("\n")
    .slice(1)
    .map((l) => l.split(","))
    .filter(([, v]) => v && v !== ".")
    .map(([date, v]) => ({ date, value: Number(v) }));
  return { url: `https://fred.stlouisfed.org/series/${id}`, rows };
}

const pct = (a: number, b: number) => Math.round(((a - b) / b) * 1000) / 10;

const out: Record<string, unknown> = {};
for (const s of SERIES) {
  const { url, rows } = await fetchSeries(s.id);
  const latest = rows.at(-1)!;
  let prior = rows.at(-2)!;
  let yearAgo: { date: string; value: number } | undefined;
  if (s.geo === "us") {
    // weekly series: compare to ~4 weeks and ~52 weeks back
    prior = rows.at(-5)!;
    yearAgo = rows.at(-53);
  } else {
    const d = new Date(latest.date);
    const ya = `${d.getUTCFullYear() - 1}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
    yearAgo = rows.find((r) => r.date === ya);
  }
  out[s.id] = {
    id: s.id,
    label: s.label,
    geo: s.geo,
    geoName: GEO_NAME[s.geo],
    unit: s.unit,
    source: s.geo === "us" ? "Freddie Mac via FRED" : "Realtor.com via FRED",
    url,
    latest,
    prior,
    yearAgo,
    momPct: pct(latest.value, prior.value),
    yoyPct: yearAgo ? pct(latest.value, yearAgo.value) : null,
    last24: rows.slice(s.geo === "us" ? -104 : -24),
  };
}

const m = out as Record<string, { latest: { value: number }; yearAgo?: { value: number } }>;
const share = (a: number, b: number) => Math.round((a / b) * 1000) / 10;
const derived = {
  priceReducedSharePct: share(m.PRIREDCOU26900.latest.value, m.ACTLISCOU26900.latest.value),
  priceReducedSharePctYearAgo: share(m.PRIREDCOU26900.yearAgo!.value, m.ACTLISCOU26900.yearAgo!.value),
  hamiltonPremiumPct: pct(m.MEDLISPRI18057.latest.value, m.MEDLISPRI26900.latest.value),
  hamiltonShareOfMetroInventoryPct: share(m.ACTLISCOU18057.latest.value, m.ACTLISCOU26900.latest.value),
};

writeFileSync(
  join(import.meta.dir, "../content/metrics.json"),
  JSON.stringify({ fetchedAt: new Date().toISOString(), series: out, derived }, null, 2),
);
console.log("metrics.json written", derived);
