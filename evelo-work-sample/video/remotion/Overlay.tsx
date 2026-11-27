import type * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { C, FONT, LAYOUT, type Format } from "./theme";
import { T, GEO, NUM, usd, fmt, scene, prog, ease, HAMILTON_TOP } from "./data";
import { project, SHOTS } from "./camera";
import { columnState, COLUMN } from "./world/Column";
import { DOTS } from "./world/Dots";
import { STREET_POINTS, compTimes } from "./world/Street";

const S = { hook: scene("hook"), price: scene("price"), inv: scene("inventory"), comps: scene("comps"), asking: scene("asking"), cta: scene("cta") };
const K = T.keyTimes;
const shadow = "0 2px 14px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)";

type Props = { t: number; format: Format; cam: THREE.PerspectiveCamera; shot: string };

const fadeIn = (t: number, a: number, d = 0.25) => ease.outCubic(prog(t, a, a + d));
const fadeOut = (t: number, b: number, d = 0.25) => 1 - ease.inOutCubic(prog(t, b - d, b));
const rise = (o: number, px = 14) => `translateY(${(1 - o) * px}px)`;

function Eyebrow({ t, format }: { t: number; format: Format }) {
  const L = LAYOUT[format];
  const o = fadeIn(t, 0.35, 0.4) * fadeOut(t, S.price.start + 0.5, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: L.left, top: L.top, opacity: o, transform: rise(o), textShadow: shadow }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: format === "portrait" ? 38 : 32, letterSpacing: "0.12em", color: C.snow, textTransform: "uppercase" }}>
        Hamilton County
      </div>
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: format === "portrait" ? 26 : 23, color: C.amber, marginTop: 6, letterSpacing: "0.04em" }}>
        Market Pulse · October 2026
      </div>
    </div>
  );
}

function TownLabels({ t, format, cam, shot }: Props) {
  if (shot === "street") return null;
  const L = LAYOUT[format];
  const lit: Record<string, number> = { Fishers: K.fishers, Carmel: K.carmel };
  const clutter = t < S.price.start + 0.4 ? 1 : t < S.inv.start ? 0.25 : t < S.asking.start ? 0 : t < K.call ? 0.45 : 0;
  return (
    <>
      {GEO.towns
        .filter((tw) => ["Fishers", "Carmel", "Noblesville", "Westfield", "Indianapolis"].includes(tw.name))
        .map((tw) => {
          const key = lit[tw.name];
          const o = (key ? ease.outBack(prog(t, key - 0.05, key + 0.3)) : fadeIn(t, 1.0, 0.6) * 0.62) * clutter;
          const p = project(cam, L.w, L.h, [tw.x, HAMILTON_TOP + 0.4, -tw.y]);
          if (!p.visible || o <= 0.01 || p.x < 20 || p.x > L.w - 40 || p.y < L.top + 90 || p.y > L.bottom - 40) return null;
          const big = !!key;
          return (
            <div key={tw.name} style={{ position: "absolute", left: p.x, top: p.y, transform: `translate(-50%, -100%) scale(${0.85 + 0.15 * Math.min(1, o)})`, opacity: Math.min(1, o), textAlign: "center" }}>
              <div style={{ fontFamily: FONT.display, fontWeight: big ? 800 : 600, fontSize: big ? (format === "portrait" ? 46 : 40) : 30, color: big ? C.snow : C.snowDim, textShadow: shadow, whiteSpace: "nowrap", marginBottom: 8 }}>
                {tw.name}
              </div>
              <div style={{ width: big ? 14 : 10, height: big ? 14 : 10, borderRadius: 99, background: big ? C.amberHot : C.snowDim, margin: "0 auto", boxShadow: `0 0 18px ${C.amber}` }} />
            </div>
          );
        })}
    </>
  );
}

function PriceCallout({ t, format, cam, shot }: Props) {
  if (shot === "street") return null;
  const L = LAYOUT[format];
  const { h, vis } = columnState(t);
  const inFirst = t >= K.price - 0.1 && t < S.inv.start + 0.4;
  const o = inFirst ? fadeIn(t, K.price - 0.1, 0.3) * fadeOut(t, S.inv.start + 0.4, 0.4) : 0;
  const down = inFirst ? fadeIn(t, K.down, 0.35) * fadeOut(t, S.inv.start + 0.4, 0.4) : 0;
  if (o <= 0.01 || vis <= 0.01) return null;
  void cam;
  void h;
  const big = format === "portrait" ? 150 : 124;
  return (
    <>
      <div style={{ position: "absolute", left: L.left, top: L.top + 20, opacity: o, transform: rise(o, 24), textShadow: shadow }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: big, lineHeight: 0.95, color: C.snow, letterSpacing: "-0.02em" }}>{usd(NUM.price)}</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 28, color: C.amber, marginTop: 14 }}>Median list price, October 2026</div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginTop: 22,
            padding: "12px 22px",
            borderRadius: 999,
            background: "rgba(63,224,197,0.16)",
            border: `2px solid ${C.teal}`,
            color: C.teal,
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 40,
            opacity: down,
            transform: `scale(${0.9 + 0.1 * down})`,
            transformOrigin: "left center",
          }}
        >
          −{Math.abs(NUM.pricePct)}%
          <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 26, color: C.snowDim }}>from {usd(NUM.priceYearAgo)} in October 2025</span>
        </div>
      </div>
    </>
  );
}

function InventoryCallout({ t, format, cam, shot }: Props) {
  if (shot === "street") return null;
  const L = LAYOUT[format];
  const o = fadeIn(t, DOTS.baseStart + 0.2, 0.35) * fadeOut(t, S.comps.start + 0.3, 0.35);
  if (o <= 0.01) return null;
  const then = fadeIn(t, DOTS.baseEnd - 0.3, 0.3);
  const now = fadeIn(t, DOTS.streamEnd - 0.25, 0.3);
  const i69 = fadeIn(t, DOTS.streamStart, 0.3) * fadeOut(t, DOTS.streamEnd + 0.6, 0.4);
  const mid = GEO.i69[Math.floor(GEO.i69.length * 0.35)];
  const lp = project(cam, L.w, L.h, [mid[0], HAMILTON_TOP + 0.5, -mid[1]]);
  const num = format === "portrait" ? 118 : 100;
  return (
    <>
      <div style={{ position: "absolute", left: L.left, top: L.top + 20, opacity: o, transform: rise(o, 20), textShadow: shadow }}>
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 30, color: C.snowDim }}>Active listings, Hamilton County</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 12 }}>
          <div style={{ opacity: then }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: num * 0.62, lineHeight: 1, color: C.snowDim }}>{fmt(NUM.listingsYearAgo)}</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: C.muted, marginTop: 8 }}>Oct 2025</div>
          </div>
          <div style={{ opacity: now, fontFamily: FONT.display, fontWeight: 800, fontSize: num * 0.5, color: C.teal, paddingBottom: 36 }}>→</div>
          <div style={{ opacity: now }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: num, lineHeight: 1, color: C.amberHot }}>{fmt(NUM.listings)}</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: C.amber, marginTop: 8 }}>Oct 2026</div>
          </div>
        </div>
        <div style={{ display: "inline-block", marginTop: 18, padding: "10px 20px", borderRadius: 999, background: "rgba(63,224,197,0.16)", border: `2px solid ${C.teal}`, color: C.teal, fontFamily: FONT.display, fontWeight: 800, fontSize: 34, opacity: now }}>
          +{fmt(NUM.listings - NUM.listingsYearAgo)} more to compare
        </div>
      </div>
      {i69 > 0.01 && lp.visible && (
        <div style={{ position: "absolute", left: lp.x, top: lp.y, transform: "translate(-50%,-50%)", opacity: i69, padding: "6px 14px", borderRadius: 8, background: "#1b3a8a", border: "2px solid #e8eefc", color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: 30 }}>
          I-69
        </div>
      )}
    </>
  );
}

function CompsCallout({ t, format, cam, shot }: Props) {
  if (shot !== "street") return null;
  const L = LAYOUT[format];
  const head = fadeIn(t, K.comparable - 0.25, 0.35) * fadeOut(t, S.asking.start, 0.25);
  const label = (p: [number, number, number], text: string, color: string, at: number, key: string) => {
    const o = ease.outBack(prog(t, at, at + 0.35));
    const s = project(cam, L.w, L.h, p);
    if (!s.visible || o <= 0.01 || s.y < L.top + 220 || s.y > L.bottom - 220 || s.x < L.left + 70 || s.x > L.right - 90) return null;
    return (
      <div key={key} style={{ position: "absolute", left: s.x, top: s.y, transform: `translate(-50%, -100%) scale(${Math.max(0.01, o)})`, transformOrigin: "50% 100%" }}>
        <div style={{ padding: "8px 18px", borderRadius: 999, background: "rgba(6,11,21,0.75)", border: `2px solid ${color}`, color, fontFamily: FONT.display, fontWeight: 800, fontSize: 30, whiteSpace: "nowrap" }}>{text}</div>
        <div style={{ width: 2, height: 26, background: color, margin: "0 auto" }} />
      </div>
    );
  };
  return (
    <>
      <div style={{ position: "absolute", left: L.left, top: L.top + 10, width: L.right - L.left, opacity: head, transform: rise(head, 20), textShadow: shadow }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: format === "portrait" ? 74 : 62, lineHeight: 1.02, color: C.snow }}>
          Price from today&rsquo;s <span style={{ color: C.amberHot }}>comps</span>
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 26, color: C.snowDim, marginTop: 12 }}>On your street, in your home&rsquo;s condition.</div>
      </div>
      {label(STREET_POINTS.subject, "Your home", C.teal, K.comparable - 0.45, "subject")}
      {STREET_POINTS.comps.map((p, i) => label(p, "Comp", C.amberHot, compTimes[i], `c${i}`))}
      <div style={{ position: "absolute", left: L.left, top: L.captionY - 190, opacity: head * 0.9, fontFamily: FONT.body, fontWeight: 600, fontSize: 20, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase" }}>
        Illustration
      </div>
    </>
  );
}

function AskingCallout({ t, format, cam, shot }: Props) {
  if (shot === "street") return null;
  const L = LAYOUT[format];
  const o = fadeIn(t, K.asking - 0.25, 0.35) * fadeOut(t, K.call, 0.3);
  if (o <= 0.01) return null;
  const { h } = columnState(t);
  const top = project(cam, L.w, L.h, [COLUMN.x, COLUMN.base + h, COLUMN.z]);
  const x = Math.min(Math.max(top.x - 300, L.left), L.right - 620);
  const y = Math.min(Math.max(top.y - 150, L.top + 140), L.bottom - 520);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: rise(o, 18) }}>
      <div style={{ padding: "18px 28px", borderRadius: 24, background: "rgba(6,11,21,0.72)", border: `2px solid ${C.amber}`, boxShadow: "0 10px 40px rgba(0,0,0,0.45)" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: format === "portrait" ? 50 : 44, color: C.snow, lineHeight: 1.05 }}>
          List prices,
          <br />
          <span style={{ color: C.amberHot }}>not closed prices</span>
        </div>
      </div>
    </div>
  );
}

function SourceLine({ t, format }: { t: number; format: Format }) {
  const L = LAYOUT[format];
  const on = (t > K.price - 0.1 && t < S.comps.start + 0.3) || (t > S.asking.start && t < K.call);
  const o = on ? 0.85 : 0;
  if (!o) return null;
  return (
    <div style={{ position: "absolute", left: L.left, top: L.captionY - 64, fontFamily: FONT.body, fontWeight: 500, fontSize: 21, color: C.snowDim, opacity: o, padding: "6px 14px", borderRadius: 10, background: "rgba(6,11,21,0.7)" }}>
      Source: Realtor.com via FRED, October 2026 · List prices
    </div>
  );
}

function Captions({ t, format }: { t: number; format: Format }) {
  const L = LAYOUT[format];
  const ps = T.phrases;
  const i = ps.findIndex((p, k) => t >= p.start - 0.08 && t < (ps[k + 1]?.start ?? p.end + 0.6) - 0.02);
  if (i < 0) return null;
  const p = ps[i];
  if (t > p.end + 0.6) return null;
  const o = fadeIn(t, p.start - 0.08, 0.14);
  const size = format === "portrait" ? 54 : 46;
  return (
    <div style={{ position: "absolute", left: L.left, width: L.right - L.left, top: L.captionY, display: "flex", justifyContent: "center", opacity: o, transform: rise(o, 10) }}>
      <div style={{ padding: "14px 26px", borderRadius: 22, background: "rgba(6,11,21,0.58)", textAlign: "center", maxWidth: L.right - L.left }}>
        {p.words.map((w, k) => {
          const said = t >= w.start - 0.02;
          const now = said && t < w.end + 0.05;
          return (
            <span key={k} style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: size, lineHeight: 1.22, color: now ? C.amberHot : C.snow, opacity: said ? 1 : 0.42, textShadow: shadow }}>
              {w.text}
              {k < p.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function EndCard({ t, format }: { t: number; format: Format }) {
  const L = LAYOUT[format];
  const o = fadeIn(t, K.call - 0.1, 0.5);
  if (o <= 0.01) return null;
  const stagger = (k: number) => fadeIn(t, K.call + 0.05 + k * 0.12, 0.45);
  const cx = (L.left + L.right) / 2;
  const top = format === "portrait" ? 560 : 330;
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(6,11,21,0.62) 0%, rgba(6,11,21,0.5) 45%, rgba(6,11,21,0.8) 85%)`, opacity: o }} />
      <div style={{ position: "absolute", left: cx, top, transform: "translateX(-50%)", width: L.right - L.left, textAlign: "center" }}>
        <div style={{ opacity: stagger(0), transform: rise(stagger(0)), fontFamily: FONT.body, fontWeight: 700, fontSize: 28, letterSpacing: "0.16em", color: C.amber, textTransform: "uppercase" }}>
          Winter pricing check
        </div>
        <div style={{ opacity: stagger(1), transform: rise(stagger(1), 22), fontFamily: FONT.display, fontWeight: 800, fontSize: format === "portrait" ? 112 : 100, color: C.snow, marginTop: 14, letterSpacing: "-0.01em" }}>
          317-863-9011
        </div>
        <div style={{ opacity: stagger(2), transform: rise(stagger(2)), fontFamily: FONT.body, fontWeight: 600, fontSize: 40, color: C.amberHot, marginTop: 6 }}>eveloteam.com</div>
        <div style={{ opacity: stagger(3), width: 120, height: 2, background: C.edgeDim, margin: "40px auto 30px" }} />
        <div style={{ opacity: stagger(3), fontFamily: FONT.body, fontWeight: 600, fontSize: 28, color: C.snowDim }}>Evelo Team | Keller Williams Indy Metro NE</div>
        <div style={{ opacity: stagger(4), fontFamily: FONT.body, fontWeight: 500, fontSize: 21, color: C.muted, marginTop: 18, lineHeight: 1.45 }}>
          Source: Realtor.com via FRED, October 2026.
          <br />
          List prices, not closed prices.
        </div>
        <div style={{ opacity: stagger(5), fontFamily: FONT.body, fontWeight: 500, fontSize: 19, color: C.muted, marginTop: 22 }}>Spec sample by Jarret Roloff. Not published by Evelo Team.</div>
      </div>
    </>
  );
}

function Flash({ t }: { t: number }) {
  const cuts = [SHOTS[1].start, SHOTS[2].start];
  const o = Math.max(...cuts.map((c) => (t < c - 0.06 ? 0 : t < c ? (t - (c - 0.06)) / 0.06 : Math.max(0, 1 - (t - c) / 0.2))));
  if (o <= 0.01) return null;
  return <AbsoluteFill style={{ background: "#dfe9ff", opacity: o * 0.55 }} />;
}

function Grain({ frame }: { frame: number }) {
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="g">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 24} stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    </>
  );
}

function TopScrim({ t }: { t: number }) {
  const o = fadeIn(t, S.price.start, 0.5) * fadeOut(t, K.call, 0.4);
  if (o <= 0.01) return null;
  return <AbsoluteFill style={{ opacity: o, background: "linear-gradient(to bottom, rgba(6,11,21,0.92) 0%, rgba(6,11,21,0.7) 16%, rgba(6,11,21,0.0) 34%)" }} />;
}

export function Overlay(props: Props & { frame: number }) {
  const { t, format } = props;
  return (
    <AbsoluteFill>
      <Grain frame={props.frame} />
      <TopScrim t={t} />
      <TownLabels {...props} />
      <PriceCallout {...props} />
      <InventoryCallout {...props} />
      <CompsCallout {...props} />
      <AskingCallout {...props} />
      <Eyebrow t={t} format={format} />
      <SourceLine t={t} format={format} />
      <EndCard t={t} format={format} />
      <Captions t={t} format={format} />
      <Flash t={t} />
    </AbsoluteFill>
  );
}
