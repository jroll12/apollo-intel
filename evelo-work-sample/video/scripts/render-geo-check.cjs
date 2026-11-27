// Quick visual check of data/geo.json -> out/geo-check.png
//   NODE_PATH=$(npm root -g) node scripts/render-geo-check.cjs
// Left: the whole map frame (counties, roads, towns, dots by group, I-69 clip).
// Right: Hamilton only, dots shaded by draw order (base: light->dark blue, new: yellow->red).
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const geo = JSON.parse(fs.readFileSync(path.join(root, "data/geo.json"), "utf8"));
const outFile = path.join(root, "out/geo-check.png");

const PANEL_H = 1000;
const PAD = 30;

function panel(id, box, pxPerKm, offsetX, body) {
  const [x0, y0, x1, y1] = box;
  const w = (x1 - x0) * pxPerKm;
  const h = (y1 - y0) * pxPerKm;
  // km -> px with y flipped (north up); clipped to the panel's km box
  const tx = `translate(${offsetX + PAD - x0 * pxPerKm},${PAD + y1 * pxPerKm}) scale(${pxPerKm},${-pxPerKm})`;
  const clip = `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath>`;
  return { w, h, svg: `<g transform="${tx}">${clip}<g clip-path="url(#${id})">${body}</g></g>` };
}

const pathD = (pts, close) => "M" + pts.map((p) => p.join(",")).join("L") + (close ? "Z" : "");
const KIND = {
  state: { color: "#8a98a8", width: 0.18 },
  us: { color: "#56677a", width: 0.32 },
  interstate: { color: "#1d3f66", width: 0.7 },
};

// ---------- left panel: full frame
const bbox = geo.bbox;
const leftScale = (PANEL_H - 2 * PAD) / (bbox[3] - bbox[1]);
const toPxL = ([x, y]) => [PAD + (x - bbox[0]) * leftScale, PAD + (bbox[3] - y) * leftScale];
let L = "";
for (const c of geo.counties)
  for (const r of c.rings)
    L += `<path d="${pathD(r, true)}" fill="${c.highlight ? "#fde8c9" : "#f2f0ea"}" stroke="${c.highlight ? "#d9822b" : "#a9a59b"}" stroke-width="${c.highlight ? 0.35 : 0.15}"/>`;
for (const kind of ["state", "us", "interstate"])
  for (const r of geo.roads.filter((r) => r.kind === kind))
    L += `<path d="${pathD(r.coords)}" fill="none" stroke="${KIND[kind].color}" stroke-width="${KIND[kind].width}" stroke-linejoin="round" stroke-linecap="round"/>`;
L += `<path d="${pathD(geo.i69)}" fill="none" stroke="#e8433a" stroke-width="0.35" stroke-dasharray="1 0.6"/>`;
for (const d of geo.dots) L += `<circle cx="${d.x}" cy="${d.y}" r="0.33" fill="${d.group === "new" ? "#e8433a" : "#2f6db5"}"/>`;
const left = panel("clipL", bbox, leftScale, 0, L);

// labels in px space (so text is not mirrored)
let labels = "";
for (const c of geo.counties) {
  const [px, py] = toPxL(c.centroid);
  labels += `<text x="${px}" y="${py}" class="county">${c.name.toUpperCase()}</text>`;
}
const longest = new Map();
for (const r of geo.roads) {
  const len = r.coords.length;
  if (!longest.has(r.name) || longest.get(r.name).coords.length < len) longest.set(r.name, r);
}
for (const [name, r] of longest) {
  if (r.kind === "state" && !["SR-37", "SR-32", "SR-38", "SR-19", "SR-431", "SR-13"].includes(name)) continue;
  const inside = r.coords.filter(([x, y]) => x > bbox[0] + 3 && x < bbox[2] - 3 && y > bbox[1] + 3 && y < bbox[3] - 3);
  if (!inside.length) continue;
  const [px, py] = toPxL(inside[Math.floor(inside.length * 0.35)]);
  labels += `<text x="${px}" y="${py}" class="road ${r.kind}">${name}</text>`;
}
for (const t of geo.towns) {
  const [px, py] = toPxL([t.x, t.y]);
  labels += `<circle cx="${px}" cy="${py}" r="4.5" fill="#111" stroke="#fff" stroke-width="1.5"/>`;
  const leftSide = t.x < -5; // Carmel, Westfield, Zionsville, Indianapolis: label to the left
  labels += `<text x="${px + (leftSide ? -7 : 7)}" y="${py - 6}" text-anchor="${leftSide ? "end" : "start"}" class="town">${t.name} <tspan class="sub">(${t.county})</tspan></text>`;
}

// ---------- right panel: Hamilton, dots by order
const hb = geo.hamilton.bbox;
const hbox = [hb[0] - 1, hb[1] - 5, hb[2] + 1, hb[3] + 1];
const rightScale = (PANEL_H - 2 * PAD) / (hbox[3] - hbox[1]);
const offR = left.w + 2 * PAD;
const toPxR = ([x, y]) => [offR + PAD + (x - hbox[0]) * rightScale, PAD + (hbox[3] - y) * rightScale];
let R = "";
for (const r of geo.hamilton.rings) R += `<path d="${pathD(r, true)}" fill="#fbf6ee" stroke="#d9822b" stroke-width="0.12"/>`;
R += `<path d="${pathD(geo.i69)}" fill="none" stroke="#1d3f66" stroke-width="0.25"/>`;
const nBase = geo.dots.filter((d) => d.group === "base").length;
const nNew = geo.dots.length - nBase;
for (const d of geo.dots) {
  const fill =
    d.group === "base"
      ? `hsl(212,60%,${85 - (55 * d.order) / (nBase - 1)}%)`
      : `hsl(${50 - (50 * (d.order - nBase)) / (nNew - 1)},90%,50%)`;
  R += `<circle cx="${d.x}" cy="${d.y}" r="0.38" fill="${fill}"/>`;
}
// roads on top (translucent) to check alignments inside the county
for (const kind of ["state", "us", "interstate"])
  for (const r of geo.roads.filter((r) => r.kind === kind))
    R += `<path d="${pathD(r.coords)}" fill="none" stroke="${kind === "interstate" ? "#1d3f66" : "#222"}" stroke-opacity="0.75" stroke-width="${KIND[kind].width * 0.6}" stroke-linejoin="round"/>`;
const right = panel("clipR", hbox, rightScale, offR, R);
let rlabels = "";
for (const t of geo.towns.filter((t) => t.county === "Hamilton")) {
  const [px, py] = toPxR([t.x, t.y]);
  rlabels += `<text x="${px}" y="${py}" class="town halo" text-anchor="middle">${t.name}</text>`;
}
for (const name of ["US-31", "SR-37", "SR-32", "SR-38", "SR-19", "SR-13", "SR-431", "US-421", "I-465", "I-69"]) {
  for (const r of geo.roads.filter((r) => r.name === name)) {
    const inside = r.coords.filter(([x, y]) => x > hbox[0] + 1 && x < hbox[2] - 1 && y > hbox[1] + 1 && y < hbox[3] - 1);
    if (!inside.length) continue;
    const [px, py] = toPxR(inside[Math.floor(inside.length / 2)]);
    rlabels += `<text x="${px + 5}" y="${py}" class="road ${r.kind}">${name}</text>`;
  }
}
const [sx, sy] = toPxR(geo.i69[0]);
rlabels += `<text x="${sx + 8}" y="${sy}" class="road interstate">I-69 start (SW)</text>`;

const W = Math.ceil(offR + right.w + 2 * PAD);
const counts = (k) => geo.roads.filter((r) => r.kind === k).length;
const html = `<!doctype html><html><head><style>
body{margin:0;background:#fff;font-family:Helvetica,Arial,sans-serif}
.county{font-size:13px;fill:#8b867a;letter-spacing:2px;text-anchor:middle}
.town{font-size:16px;font-weight:700;fill:#111;paint-order:stroke;stroke:#fff;stroke-width:4px}
.sub{font-weight:400;font-size:12px;fill:#555}
.road{font-size:11px;font-weight:700;paint-order:stroke;stroke:#fff;stroke-width:3px}
.road.interstate{fill:#1d3f66;font-size:13px}.road.us{fill:#56677a}.road.state{fill:#7a8796}
.halo{paint-order:stroke;stroke:#fff;stroke-width:4px}
.cap{font-size:13px;fill:#333}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${PANEL_H + 40}">
${left.svg}${labels}${right.svg}${rlabels}
<text x="${PAD}" y="${PANEL_H + 22}" class="cap">bbox ${geo.bbox.join(", ")} km - ${geo.counties.length} counties - roads: ${counts("interstate")} interstate, ${counts("us")} US, ${counts("state")} state - red dashed = i69 clip - dots: blue base / red new</text>
<text x="${offR + PAD}" y="${PANEL_H + 22}" class="cap">Hamilton ${geo.hamilton.areaKm2} km2 - dot order: base light->dark blue (S->N), new yellow->red (along I-69 from SW) - ${nBase} base / ${nNew} new</text>
</svg></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: PANEL_H + 40 } });
  await page.setContent(html);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await page.screenshot({ path: outFile });
  await browser.close();
  console.log(`wrote ${path.relative(root, outFile)} (${W}x${PANEL_H + 40})`);
})();
