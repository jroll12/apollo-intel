import timelineJson from "../data/timeline.json";
import geoJson from "../data/geo.json";
import metricsJson from "../data/metrics-oct-2026.json";

export type Pt = [number, number];

export type Timeline = {
  fps: number;
  duration: number;
  durationInFrames: number;
  voOffset: number;
  vo: { file: string; speechEnd: number };
  music: { file: string; skip: number; tempo: number; period: number };
  beats: number[];
  scenes: { id: string; start: number; end: number }[];
  words: { text: string; start: number; end: number }[];
  phrases: { text: string; start: number; end: number; words: { text: string; start: number; end: number }[] }[];
  sfx: { file: string; at: number; gain: number }[];
  keyTimes: Record<"fishers" | "carmel" | "price" | "down" | "compare" | "comparable" | "street" | "showing" | "asking" | "call", number>;
};

export type Geo = {
  counties: { fips: string; name: string; highlight?: boolean; rings: Pt[][]; centroid: Pt }[];
  roads: { name: string; kind: "interstate" | "us" | "state"; coords: Pt[] }[];
  towns: { name: string; x: number; y: number; county: string }[];
  hamilton: { rings: Pt[][]; bbox: number[]; areaKm2: number };
  dots: { x: number; y: number; group: "base" | "new"; order: number }[];
  i69: Pt[];
};

export const T = timelineJson as unknown as Timeline;
export const GEO = geoJson as unknown as Geo;
const M = (metricsJson as unknown as { series: Record<string, { latest: { value: number }; yearAgo: { value: number }; yoyPct: number }> }).series;

// Every number shown on screen comes from here (checked again by video/scripts/check.ts).
export const NUM = {
  price: M.MEDLISPRI18057.latest.value, // 445000
  priceYearAgo: M.MEDLISPRI18057.yearAgo.value, // 475000
  pricePct: M.MEDLISPRI18057.yoyPct, // -6.3
  listings: M.ACTLISCOU18057.latest.value, // 1111
  listingsYearAgo: M.ACTLISCOU18057.yearAgo.value, // 931
};
export const fmt = (n: number) => n.toLocaleString("en-US");
export const usd = (n: number) => `$${fmt(n)}`;

export const scene = (id: string) => {
  const s = T.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`scene ${id}`);
  return s;
};

// geo (x east, y north, km) -> world (x, up, z south)
export const W = (x: number, y: number, h = 0): [number, number, number] => [x, h, -y];

export const HAMILTON_TOP = 0.6;
export const OTHER_TOP = 0.25;

export const inside = ([x, y]: Pt, ring: Pt[]) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
export const HAM_RING = GEO.hamilton.rings[0];
export const groundAt = (x: number, y: number) => (inside([x, y], HAM_RING) ? HAMILTON_TOP : OTHER_TOP);

// Price column scale: 1 km of height per $25,000 of list price.
export const KM_PER_DOLLAR = 1 / 25000;

// Fictional street used for the comps scene, far from the map so the two never share a frame.
export const STREET_ORIGIN: [number, number, number] = [300, 0, 0];

export const ease = {
  outCubic: (u: number) => 1 - Math.pow(1 - u, 3),
  inOutCubic: (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  outBack: (u: number) => {
    const c1 = 1.4;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  },
};
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
