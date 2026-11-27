/**
 * Build data/geo.json: the map data for the Hamilton County, Indiana video.
 *
 *   bun scripts/build-geo.ts
 *
 * Sources (nothing else is used):
 *   - County polygons: npm `us-atlas` counties-10m.json (TopoJSON), read with `topojson-client`.
 *   - Roads: Census TIGER 2024 primary + secondary roads for Indiana (tl_2024_18_prisecroads),
 *     downloaded on first run into GEO_RAW_DIR (default: $TMPDIR/evelo-geo-raw, never the repo)
 *     and parsed with npm `shapefile`.
 *   - Town coordinates: the WGS84 constants in TOWNS below.
 *
 * Coordinates: local planar kilometres from d3-geo geoTransverseMercator on a sphere of radius
 * R_KM, origin and central meridian at the spherical centroid of Hamilton County (FIPS 18057),
 * x = east, y = north.
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoArea, geoCentroid, geoContains, geoTransverseMercator } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import * as topojson from "topojson-client";
// @ts-expect-error: shapefile ships without type declarations
import * as shapefile from "shapefile";

type Pt = [number, number];
type Kind = "interstate" | "us" | "state";

// ---------------------------------------------------------------- constants

const HAMILTON = "18057";
const MARION = "18097";
const R_KM = 6371.0088; // IUGG mean Earth radius
const TIGER_URL = "https://www2.census.gov/geo/tiger/TIGER2024/PRISECROADS/tl_2024_18_prisecroads.zip";
const RAW_DIR = process.env.GEO_RAW_DIR ?? path.join(os.tmpdir(), "evelo-geo-raw");

const ROAD_PAD_KM = 10; // roads are kept inside bbox padded by this much
const SIMPLIFY_KM = 0.05; // Douglas-Peucker tolerance
const DENSIFY_KM = 0.05; // resample step before overlap trimming
const DUAL_TOL_KM = 0.15; // two carriageways of one road closer than this are drawn once
const DUAL_MIN_RUN_KM = 0.5;
const CONCUR_TOL_KM = 0.15; // a US/state route riding on a higher-class road is drawn once
const CONCUR_MIN_RUN_KM = 1.0;
const MIN_PIECE_KM = 0.6; // fragments shorter than this are dropped

const DOT_TOTAL = 1111;
const DOT_NEW = 180;
const DOT_INSET = 0.45; // dots keep >= this * spacing from the county line
const I69_SOUTH_KM = 15;

const TOWNS: { name: string; lat: number; lon: number }[] = [
  { name: "Fishers", lat: 39.9568, lon: -86.0134 },
  { name: "Carmel", lat: 39.9784, lon: -86.118 },
  { name: "Noblesville", lat: 40.0456, lon: -86.0086 },
  { name: "Westfield", lat: 40.0428, lon: -86.1275 },
  { name: "Zionsville", lat: 39.9509, lon: -86.2619 }, // Boone County
  { name: "Indianapolis", lat: 39.7684, lon: -86.1581 }, // Marion County
];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "geo.json");
const require = createRequire(import.meta.url);

// ---------------------------------------------------------------- small geometry helpers

const r2 = (v: number) => {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
};
const r3 = (v: number) => {
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? 0 : r;
};
const roundLine = (line: Pt[]): Pt[] => {
  const out: Pt[] = [];
  for (const [x, y] of line) {
    const p: Pt = [r2(x), r2(y)];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  return out;
};
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lineLength = (line: Pt[]) => {
  let s = 0;
  for (let i = 1; i < line.length; i++) s += dist(line[i - 1], line[i]);
  return s;
};

/** Closest point on segment ab to p: returns [distance, fraction along ab]. */
function segDist(p: Pt, a: Pt, b: Pt): [number, number] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L2 = dx * dx + dy * dy;
  let t = L2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2 : 0;
  t = Math.max(0, Math.min(1, t));
  return [Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy), t];
}

/** Distance from p to a polyline plus the arc length (from line[0]) of the closest point. */
function alongLine(p: Pt, line: Pt[]): { d: number; t: number } {
  let best = { d: Infinity, t: 0 };
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const L = dist(line[i - 1], line[i]);
    const [d, f] = segDist(p, line[i - 1], line[i]);
    if (d < best.d) best = { d, t: acc + f * L };
    acc += L;
  }
  return best;
}

function douglasPeucker(line: Pt[], tol: number): Pt[] {
  if (line.length <= 2) return line.slice();
  const keep = new Uint8Array(line.length);
  keep[0] = keep[line.length - 1] = 1;
  const stack: [number, number][] = [[0, line.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop()!;
    let maxD = -1;
    let idx = -1;
    for (let k = i + 1; k < j; k++) {
      const d = segDist(line[k], line[i], line[j])[0];
      if (d > maxD) {
        maxD = d;
        idx = k;
      }
    }
    if (maxD > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([i, idx], [idx, j]);
    }
  }
  return line.filter((_, k) => keep[k]);
}

function densify(line: Pt[], step: number): Pt[] {
  const out: Pt[] = [line[0]];
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const n = Math.ceil(dist(a, b) / step);
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

/** Liang-Barsky clip of a polyline to [x0,y0,x1,y1]; returns the inside runs. */
function clipLineToBox(line: Pt[], [x0, y0, x1, y1]: number[]): Pt[][] {
  const runs: Pt[][] = [];
  let cur: Pt[] | null = null;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    let t0 = 0;
    let t1 = 1;
    let ok = true;
    for (const [p, q] of [
      [-dx, a[0] - x0],
      [dx, x1 - a[0]],
      [-dy, a[1] - y0],
      [dy, y1 - a[1]],
    ]) {
      if (p === 0) {
        if (q < 0) ok = false;
      } else {
        const r = q / p;
        if (p < 0) t0 = Math.max(t0, r);
        else t1 = Math.min(t1, r);
      }
    }
    if (!ok || t0 > t1) {
      if (cur) runs.push(cur), (cur = null);
      continue;
    }
    const pa: Pt = [a[0] + t0 * dx, a[1] + t0 * dy];
    const pb: Pt = [a[0] + t1 * dx, a[1] + t1 * dy];
    if (!cur || t0 > 0) {
      if (cur) runs.push(cur);
      cur = [pa];
    }
    cur.push(pb);
    if (t1 < 1) runs.push(cur), (cur = null);
  }
  if (cur) runs.push(cur);
  return runs.filter((r) => r.length > 1);
}

/** Even-odd point in polygon over all rings. */
function inRings(p: Pt, rings: Pt[][]): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}
function distToRings(p: Pt, rings: Pt[][]): number {
  let d = Infinity;
  for (const ring of rings) for (let i = 1; i < ring.length; i++) d = Math.min(d, segDist(p, ring[i - 1], ring[i])[0]);
  return d;
}
function ringsBBox(rings: Pt[][]): [number, number, number, number] {
  const b: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const ring of rings)
    for (const [x, y] of ring) {
      b[0] = Math.min(b[0], x);
      b[1] = Math.min(b[1], y);
      b[2] = Math.max(b[2], x);
      b[3] = Math.max(b[3], y);
    }
  return b;
}
/** Planar area and centroid; holes carry the opposite winding, so signed sums handle them. */
function areaCentroid(rings: Pt[][]): { area: number; c: Pt } {
  let A = 0;
  let cx = 0;
  let cy = 0;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const cr = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
      A += cr;
      cx += (ring[j][0] + ring[i][0]) * cr;
      cy += (ring[j][1] + ring[i][1]) * cr;
    }
  }
  return { area: Math.abs(A / 2), c: [cx / (3 * A), cy / (3 * A)] };
}

/** Uniform grid of segments for "is this point within tol of any kept line" queries. */
class SegIndex {
  private cells = new Map<string, [Pt, Pt][]>();
  constructor(private cell = 0.5) {}
  private key(ix: number, iy: number) {
    return ix + "," + iy;
  }
  add(line: Pt[]) {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      const ix0 = Math.floor(Math.min(a[0], b[0]) / this.cell);
      const ix1 = Math.floor(Math.max(a[0], b[0]) / this.cell);
      const iy0 = Math.floor(Math.min(a[1], b[1]) / this.cell);
      const iy1 = Math.floor(Math.max(a[1], b[1]) / this.cell);
      for (let ix = ix0; ix <= ix1; ix++)
        for (let iy = iy0; iy <= iy1; iy++) {
          const k = this.key(ix, iy);
          const arr = this.cells.get(k);
          if (arr) arr.push([a, b]);
          else this.cells.set(k, [[a, b]]);
        }
    }
  }
  near(p: Pt, tol: number): boolean {
    const ix0 = Math.floor((p[0] - tol) / this.cell);
    const ix1 = Math.floor((p[0] + tol) / this.cell);
    const iy0 = Math.floor((p[1] - tol) / this.cell);
    const iy1 = Math.floor((p[1] + tol) / this.cell);
    for (let ix = ix0; ix <= ix1; ix++)
      for (let iy = iy0; iy <= iy1; iy++)
        for (const [a, b] of this.cells.get(this.key(ix, iy)) ?? []) if (segDist(p, a, b)[0] <= tol) return true;
    return false;
  }
}

/**
 * Remove stretches (>= minRun long) of a densified line that run within tol of lines already in idx.
 * Each surviving piece keeps one vertex of the removed stretch so it still meets the kept line.
 */
function trimNear(line: Pt[], idx: SegIndex, tol: number, minRun: number): Pt[][] {
  const n = line.length;
  const near = line.map((p) => idx.near(p, tol));
  const drop = new Uint8Array(n);
  for (let i = 0; i < n; ) {
    if (!near[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < n && near[j + 1]) j++;
    if (lineLength(line.slice(i, j + 1)) >= minRun) for (let k = i; k <= j; k++) drop[k] = 1;
    i = j + 1;
  }
  const pieces: Pt[][] = [];
  for (let i = 0; i < n; ) {
    if (drop[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < n && !drop[j + 1]) j++;
    const s = Math.max(0, i - 1);
    const e = Math.min(n - 1, j + 1);
    pieces.push(line.slice(s, e + 1));
    i = j + 1;
  }
  return pieces.filter((p) => p.length > 1 && lineLength(p) >= MIN_PIECE_KM);
}

// ---------------------------------------------------------------- road naming & merging

/** "I- 69" -> I-69, "US Hwy 31 N" -> US-31, "N State Rd 37" / "In Hwy 32" / "S Sr 38 Hwy" -> SR-n. */
function normalizeRoad(full: string | null): { name: string; kind: Kind } | null {
  if (!full) return null;
  const s = full.trim().replace(/\s+/g, " ").replace(/^[NSEW] /, "");
  if (/^old\b/i.test(s)) return null; // decommissioned alignments ("Old US Hwy 421")
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^I-? ?(\d+)\b/i))) return { name: `I-${m[1]}`, kind: "interstate" };
  if ((m = s.match(/^US (?:Hwy |Highway |Rte |Route )?(\d+)\b/i))) return { name: `US-${m[1]}`, kind: "us" };
  if ((m = s.match(/^(?:State (?:Rd|Road|Rte|Route|Hwy|Highway)|In(?:diana)? (?:Hwy|Highway|Rd|Rte)|SR) ?(\d+)\b/i)))
    return { name: `SR-${m[1]}`, kind: "state" };
  return null; // locally named streets (no route number) are not part of the map
}

type Seg = { coords: Pt[]; a: string; b: string; len: number };

/** Direction of the line leaving `pts` at its end (or start), smoothed over ~0.2 km. */
function endDir(pts: Pt[], atEnd: boolean): Pt {
  const n = pts.length;
  const tip = atEnd ? pts[n - 1] : pts[0];
  let k = atEnd ? n - 2 : 1;
  let q = pts[k] ?? tip;
  while (k > 0 && k < n - 1 && dist(q, tip) < 0.2) {
    k += atEnd ? -1 : 1;
    q = pts[k];
  }
  const d = dist(q, tip) || 1;
  return [(tip[0] - q[0]) / d, (tip[1] - q[1]) / d];
}

/** Greedily chain segments that share endpoints, preferring the straightest continuation. */
function mergeSegments(segs: Seg[]): Pt[][] {
  const byKey = new Map<string, number[]>();
  segs.forEach((s, i) => {
    for (const k of [s.a, s.b]) {
      const arr = byKey.get(k);
      if (arr) arr.push(i);
      else byKey.set(k, [i]);
    }
  });
  const used = new Uint8Array(segs.length);
  const order = segs.map((_, i) => i).sort((i, j) => segs[j].len - segs[i].len || i - j);
  const lines: Pt[][] = [];
  for (const start of order) {
    if (used[start]) continue;
    used[start] = 1;
    let pts = segs[start].coords.slice();
    let head = segs[start].a;
    let tail = segs[start].b;
    for (const atEnd of [true, false]) {
      for (;;) {
        const key = atEnd ? tail : head;
        const cands = (byKey.get(key) ?? []).filter((i) => !used[i]);
        if (!cands.length) break;
        const dIn = endDir(pts, atEnd);
        let best = -1;
        let bestScore = -Infinity;
        let bestCoords: Pt[] = [];
        for (const i of cands) {
          // orient the candidate so it starts at the shared key
          const c = segs[i].a === key ? segs[i].coords : segs[i].coords.slice().reverse();
          // endDir(c, false) points from inside c back toward the shared key, so going straight on
          // means it is opposite to dIn: score = cos(turn angle)
          const dOut = endDir(c, false);
          const score = -(dIn[0] * dOut[0] + dIn[1] * dOut[1]);
          if (score > bestScore) {
            bestScore = score;
            best = i;
            bestCoords = c;
          }
        }
        used[best] = 1;
        const other = segs[best].a === key ? segs[best].b : segs[best].a;
        if (atEnd) {
          pts = pts.concat(bestCoords.slice(1));
          tail = other;
        } else {
          pts = bestCoords.slice().reverse().concat(pts.slice(1));
          head = other;
        }
      }
    }
    lines.push(pts);
  }
  return lines;
}

// ---------------------------------------------------------------- 1. counties & projection

const topo = JSON.parse(readFileSync(require.resolve("us-atlas/counties-10m.json"), "utf8"));
const geoms: { id: string; properties: { name: string } }[] = topo.objects.counties.geometries;
const allCounties = topojson.feature(topo, topo.objects.counties) as unknown as FeatureCollection<
  Polygon | MultiPolygon,
  { name: string }
>;
const featById = new Map(allCounties.features.map((f) => [String(f.id), f]));
const hamIdx = geoms.findIndex((g) => g.id === HAMILTON);
if (hamIdx < 0) throw new Error("Hamilton County (18057) missing from us-atlas");
const neighborIds = topojson.neighbors(topo.objects.counties.geometries)[hamIdx].map((i) => geoms[i].id);
const countyIds = [HAMILTON, ...new Set([...neighborIds, MARION])].filter((id) => id !== HAMILTON);
countyIds.unshift(HAMILTON);

const hamFeature = featById.get(HAMILTON)!;
const [lon0, lat0] = geoCentroid(hamFeature);
const projection = geoTransverseMercator()
  .rotate([-lon0, -lat0])
  .scale(R_KM) // sphere radius in output units => kilometres
  .translate([0, 0]);
/** WGS84 lon/lat -> local km, x east, y north (d3 screen y points down, so flip it). */
const P = (lon: number, lat: number): Pt => {
  const p = projection([lon, lat])!;
  return [p[0], -p[1]];
};
const PInv = ([x, y]: Pt): Pt => projection.invert!([x, -y])!;

const featureRings = (f: Feature<Polygon | MultiPolygon>): Pt[][] => {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  return polys.flat().map((ring) => ring.map(([lon, lat]) => P(lon, lat)));
};

const counties = countyIds.map((id) => {
  const f = featById.get(id)!;
  const rings = featureRings(f);
  return { fips: id, name: f.properties.name, highlight: id === HAMILTON, rings, centroid: areaCentroid(rings).c };
});
const hamRings = counties[0].rings;
const hamBBox = ringsBBox(hamRings);

const allRings = counties.flatMap((c) => c.rings);
const bboxRaw = ringsBBox(allRings);
const bbox = [Math.floor(bboxRaw[0] * 100) / 100, Math.floor(bboxRaw[1] * 100) / 100, Math.ceil(bboxRaw[2] * 100) / 100, Math.ceil(bboxRaw[3] * 100) / 100];
const roadBox = [bbox[0] - ROAD_PAD_KM, bbox[1] - ROAD_PAD_KM, bbox[2] + ROAD_PAD_KM, bbox[3] + ROAD_PAD_KM];

// ---------------------------------------------------------------- 2. towns

const indiana = allCounties.features.filter((f) => String(f.id).startsWith("18"));
const towns = TOWNS.map((t) => {
  const hits = indiana.filter((f) => geoContains(f, [t.lon, t.lat]));
  const county = hits.length === 1 ? hits[0].properties.name : hits.length ? hits.map((h) => h.properties.name).join("/") : "none";
  const [x, y] = P(t.lon, t.lat);
  return { name: t.name, x: r2(x), y: r2(y), county };
});

// ---------------------------------------------------------------- 3. roads

const shpBase = path.join(RAW_DIR, "tl_2024_18_prisecroads");
if (!existsSync(shpBase + ".shp") || !existsSync(shpBase + ".dbf")) {
  mkdirSync(RAW_DIR, { recursive: true });
  const zip = shpBase + ".zip";
  if (!existsSync(zip)) {
    console.log(`downloading ${TIGER_URL}`);
    const res = await fetch(TIGER_URL);
    if (!res.ok) throw new Error(`TIGER download failed: ${res.status}`);
    writeFileSync(zip, new Uint8Array(await res.arrayBuffer()));
  }
  execFileSync("unzip", ["-o", "-q", zip, "-d", RAW_DIR]);
}

// lon/lat prefilter window derived from the padded km box (with margin)
const corners = [
  [roadBox[0], roadBox[1]],
  [roadBox[0], roadBox[3]],
  [roadBox[2], roadBox[1]],
  [roadBox[2], roadBox[3]],
].map((c) => PInv(c as Pt));
const lonMin = Math.min(...corners.map((c) => c[0])) - 0.05;
const lonMax = Math.max(...corners.map((c) => c[0])) + 0.05;
const latMin = Math.min(...corners.map((c) => c[1])) - 0.05;
const latMax = Math.max(...corners.map((c) => c[1])) + 0.05;

const segsByName = new Map<string, { kind: Kind; segs: Seg[] }>();
const rawNameCounts = new Map<string, number>();
{
  const src = await shapefile.open(shpBase + ".shp", shpBase + ".dbf", { encoding: "utf-8" });
  for (;;) {
    const r = await src.read();
    if (r.done) break;
    const { properties: p, geometry: g } = r.value;
    if (p.MTFCC !== "S1100" && p.MTFCC !== "S1200") continue;
    if (g?.type !== "LineString") continue;
    const ll = g.coordinates as Pt[];
    if (!ll.some(([lon, lat]) => lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax)) continue;
    const norm = normalizeRoad(p.FULLNAME);
    if (!norm) continue;
    rawNameCounts.set(`${p.FULLNAME} -> ${norm.name}`, (rawNameCounts.get(`${p.FULLNAME} -> ${norm.name}`) ?? 0) + 1);
    const coords = ll.map(([lon, lat]) => P(lon, lat));
    const key = ([lon, lat]: Pt) => `${lon.toFixed(6)},${lat.toFixed(6)}`;
    const entry = segsByName.get(norm.name) ?? { kind: norm.kind, segs: [] };
    entry.segs.push({ coords, a: key(ll[0]), b: key(ll[ll.length - 1]), len: lineLength(coords) });
    segsByName.set(norm.name, entry);
  }
}

const KIND_RANK: Record<Kind, number> = { interstate: 0, us: 1, state: 2 };
const routeNum = (name: string) => Number(name.replace(/^\D+/, ""));
const names = [...segsByName.keys()].sort(
  (a, b) => KIND_RANK[segsByName.get(a)!.kind] - KIND_RANK[segsByName.get(b)!.kind] || routeNum(a) - routeNum(b),
);

type Road = { name: string; kind: Kind; coords: Pt[] };
const keptDense: Road[] = []; // densified, unsimplified (used for overlap tests and the I-69 centreline)
const higherIdx: Record<Kind, SegIndex> = { interstate: new SegIndex(), us: new SegIndex(), state: new SegIndex() };
let segCount = 0;
for (const kind of ["interstate", "us", "state"] as Kind[]) {
  const pending: Road[] = [];
  for (const name of names.filter((n) => segsByName.get(n)!.kind === kind)) {
    const { segs } = segsByName.get(name)!;
    segCount += segs.length;
    const merged = mergeSegments(segs)
      .flatMap((l) => clipLineToBox(l, roadBox))
      .map((l) => densify(l, DENSIFY_KM))
      .sort((a, b) => lineLength(b) - lineLength(a));
    // 1) draw dual carriageways once: trim parts of shorter chains that shadow a kept chain of this road
    const own = new SegIndex();
    const pieces: Pt[][] = [];
    for (const line of merged) {
      for (const piece of trimNear(line, own, DUAL_TOL_KM, DUAL_MIN_RUN_KM)) {
        pieces.push(piece);
        own.add(piece);
      }
    }
    // 2) concurrencies: drop stretches riding on a higher-class road (e.g. US-36 on I-465)
    for (const piece of pieces) {
      const parts = kind === "interstate" ? [piece] : trimNear(piece, higherIdx[kind], CONCUR_TOL_KM, CONCUR_MIN_RUN_KM);
      for (const part of parts) pending.push({ name, kind, coords: part });
    }
  }
  // lines of this class become obstacles for every lower class
  for (const road of pending) {
    keptDense.push(road);
    if (kind === "interstate") higherIdx.us.add(road.coords), higherIdx.state.add(road.coords);
    if (kind === "us") higherIdx.state.add(road.coords);
  }
}

const roads = keptDense
  .map((r) => ({ name: r.name, kind: r.kind, coords: roundLine(douglasPeucker(r.coords, SIMPLIFY_KM)) }))
  .filter((r) => r.coords.length > 1 && lineLength(r.coords) >= MIN_PIECE_KM);

// ---------------------------------------------------------------- 4. Hamilton + I-69 centreline

const ham = areaCentroid(hamRings);
const hamAreaSphere = geoArea(hamFeature) * R_KM * R_KM;

const inI69Region = (p: Pt) =>
  inRings(p, hamRings) ||
  (p[0] >= hamBBox[0] && p[0] <= hamBBox[2] && p[1] >= hamBBox[1] - I69_SOUTH_KM && p[1] <= hamBBox[1] + 0.5);

function clipToRegion(line: Pt[], inside: (p: Pt) => boolean): Pt[][] {
  const runs: Pt[][] = [];
  let cur: Pt[] | null = null;
  const edge = (a: Pt, b: Pt): Pt => {
    // bisect for the crossing point between an inside and an outside vertex
    let lo = a;
    let hi = b;
    for (let k = 0; k < 30; k++) {
      const m: Pt = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2];
      if (inside(m) === inside(a)) lo = m;
      else hi = m;
    }
    return lo;
  };
  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    const ins = inside(p);
    if (ins && !cur) cur = i > 0 ? [edge(p, line[i - 1]), p] : [p];
    else if (ins && cur) cur.push(p);
    else if (!ins && cur) {
      cur.push(edge(line[i - 1], p));
      runs.push(cur);
      cur = null;
    }
  }
  if (cur) runs.push(cur);
  return runs;
}

const i69Runs = keptDense
  .filter((r) => r.name === "I-69")
  .flatMap((r) => clipToRegion(r.coords, inI69Region))
  .sort((a, b) => lineLength(b) - lineLength(a));
if (!i69Runs.length) throw new Error("I-69 not found inside Hamilton County");
let i69Dense = i69Runs[0];
{
  const s = i69Dense[0];
  const e = i69Dense[i69Dense.length - 1];
  if (s[0] + s[1] > e[0] + e[1]) i69Dense = i69Dense.slice().reverse(); // start at the south-west end
}
const i69 = roundLine(douglasPeucker(i69Dense, SIMPLIFY_KM));

// ---------------------------------------------------------------- 5. unit-chart dots (hex grid)

function hexCandidates(s: number): { p: Pt; edge: number }[] {
  const h = (s * Math.sqrt(3)) / 2;
  const out: { p: Pt; edge: number }[] = [];
  const j0 = Math.floor(hamBBox[1] / h) - 1;
  const j1 = Math.ceil(hamBBox[3] / h) + 1;
  for (let j = j0; j <= j1; j++) {
    const off = Math.abs(j) % 2 === 1 ? s / 2 : 0;
    const i0 = Math.floor((hamBBox[0] - off) / s) - 1;
    const i1 = Math.ceil((hamBBox[2] - off) / s) + 1;
    for (let i = i0; i <= i1; i++) {
      const p: Pt = [i * s + off, j * h]; // grid anchored on the county centroid (origin)
      if (!inRings(p, hamRings)) continue;
      const edge = distToRings(p, hamRings);
      if (edge >= DOT_INSET * s) out.push({ p, edge });
    }
  }
  return out;
}

let best: { s: number; cands: { p: Pt; edge: number }[] } | null = null;
for (let s = 1.3; s >= 0.8; s -= 0.0001) {
  const sp = Math.round(s * 10000) / 10000;
  const cands = hexCandidates(sp);
  if (cands.length < DOT_TOTAL) continue;
  const left = cands.length - DOT_TOTAL;
  if (!best || left < best.cands.length - DOT_TOTAL) best = { s: sp, cands };
  if (left === 0) break; // largest spacing with zero leftover
}
if (!best) throw new Error("could not fit the dot grid");
const spacing = best.s;
const leftover = best.cands.length - DOT_TOTAL;
// drop extras from the outer edge: closest to the county line first (ties: south, then west)
const kept = best.cands
  .slice()
  .sort((a, b) => a.edge - b.edge || a.p[1] - b.p[1] || a.p[0] - b.p[0])
  .slice(leftover)
  .map(({ p }) => ({ p, ...alongLine(p, i69) }));

const byI69 = kept.slice().sort((a, b) => a.d - b.d || a.p[1] - b.p[1] || a.p[0] - b.p[0]);
const newSet = new Set(byI69.slice(0, DOT_NEW));
const base = kept.filter((k) => !newSet.has(k)).sort((a, b) => a.p[1] - b.p[1] || a.p[0] - b.p[0]);
const fresh = [...newSet].sort((a, b) => a.t - b.t || a.d - b.d || a.p[0] - b.p[0]);
const dots = [
  ...base.map((k, i) => ({ x: r3(k.p[0]), y: r3(k.p[1]), group: "base" as const, order: i })),
  ...fresh.map((k, i) => ({ x: r3(k.p[0]), y: r3(k.p[1]), group: "new" as const, order: base.length + i })),
];

// ---------------------------------------------------------------- 6. write

const geo = {
  projection: `d3-geo geoTransverseMercator on a sphere (R = ${R_KM} km), rotate([-lon0, -lat0]) so the origin and central meridian sit at the spherical centroid of Hamilton County (FIPS ${HAMILTON}); output km with x = east, y = north (d3's screen y negated). Transverse Mercator scale factor stays below 1.0001 inside the padded road box; the spherical model keeps distances within ~0.3% of the WGS84 ellipsoid.`,
  origin: { lat: Number(lat0.toFixed(6)), lon: Number(lon0.toFixed(6)) },
  units: "km",
  bbox,
  counties: counties.map((c) => ({
    fips: c.fips,
    name: c.name,
    highlight: c.highlight,
    rings: c.rings.map(roundLine),
    centroid: [r2(c.centroid[0]), r2(c.centroid[1])],
  })),
  roads,
  towns,
  hamilton: {
    rings: hamRings.map(roundLine),
    bbox: hamBBox.map(r2),
    areaKm2: Math.round(ham.area * 10) / 10,
  },
  dots,
  i69,
  meta: {
    sources: [
      "us-atlas@3 counties-10m.json (Census cartographic boundaries, 1:10M)",
      "Census TIGER/Line 2024 tl_2024_18_prisecroads (MTFCC S1100 + S1200)",
      "town coordinates: fixed WGS84 constants in scripts/build-geo.ts",
    ],
    roadsNote: `named routes only (I-, US-, SR-); clipped to bbox + ${ROAD_PAD_KM} km; same-name segments chained; dual carriageways and concurrent stretches under a higher-class route drawn once; Douglas-Peucker ${SIMPLIFY_KM} km`,
    dotSpacingKm: spacing,
    dotRowSpacingKm: r3((spacing * Math.sqrt(3)) / 2),
    dotGridCandidates: best.cands.length,
    i69Note: `I-69 clipped to Hamilton County plus ${I69_SOUTH_KM} km south, ordered south-west to north-east`,
    generatedBy: "scripts/build-geo.ts",
  },
};

// one feature per line keeps the file diffable without pretty-printing every coordinate
const lines: string[] = ["{"];
const entries = Object.entries(geo);
entries.forEach(([k, v], i) => {
  const comma = i < entries.length - 1 ? "," : "";
  if (Array.isArray(v) && v.length && typeof v[0] === "object" && !Array.isArray(v[0])) {
    lines.push(`  ${JSON.stringify(k)}: [`);
    v.forEach((item, j) => lines.push(`    ${JSON.stringify(item)}${j < v.length - 1 ? "," : ""}`));
    lines.push(`  ]${comma}`);
  } else lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)}${comma}`);
});
lines.push("}");
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, lines.join("\n") + "\n");

// ---------------------------------------------------------------- 7. report

const kb = (statSync(OUT).size / 1024).toFixed(1);
const roadKinds = roads.reduce<Record<string, number>>((m, r) => ((m[r.kind] = (m[r.kind] ?? 0) + 1), m), {});
console.log(`projection: transverse Mercator, origin ${lat0.toFixed(5)}, ${lon0.toFixed(5)} (Hamilton centroid)`);
console.log(`bbox km: ${bbox.join(", ")}  (${(bbox[2] - bbox[0]).toFixed(1)} x ${(bbox[3] - bbox[1]).toFixed(1)})`);
console.log(`counties (${counties.length}): ${counties.map((c) => `${c.name} ${c.fips}`).join(", ")}`);
console.log(`Hamilton planar centroid: ${ham.c.map((v) => v.toFixed(3)).join(", ")}  area ${ham.area.toFixed(1)} km2 (sphere ${hamAreaSphere.toFixed(1)})`);
console.log(`roads: ${roads.length} polylines from ${segCount} TIGER segments`, roadKinds);
console.log(`road names: ${[...new Set(roads.map((r) => r.name))].join(" ")}`);
console.log(`towns:`);
for (const t of towns) console.log(`  ${t.name.padEnd(13)} ${t.county.padEnd(10)} x=${t.x} y=${t.y}`);
console.log(`i69: ${i69.length} pts, ${lineLength(i69).toFixed(1)} km, ${i69[0]} -> ${i69[i69.length - 1]}`);
console.log(
  `dots: ${dots.length} (base ${base.length}, new ${fresh.length}); spacing ${spacing} km, ${best.cands.length} grid points, ${leftover} dropped; new max dist to I-69 ${byI69[DOT_NEW - 1].d.toFixed(2)} km`,
);
console.log(`wrote ${path.relative(ROOT, OUT)} (${kb} KB)`);
if (process.env.GEO_DEBUG) for (const [k, v] of [...rawNameCounts].sort()) console.log(`  ${k}: ${v}`);
