import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "../theme";
import { GEO, HAMILTON_TOP, scene, prog, ease, type Pt } from "../data";

const inv = scene("inventory");
const asking = scene("asking");
export const DOTS = {
  baseStart: inv.start + 0.15,
  baseEnd: inv.start + 1.5,
  streamStart: inv.start + 1.6,
  streamEnd: inv.start + 4.0,
};
const R = 0.31;
const Y = HAMILTON_TOP + R;

// Unit chart: 1 dot = 1 active listing, positions illustrative. The 180 new dots are spread evenly
// across the county (every ~6th grid point) so the chart never implies where new listings are.
const ALL = [...GEO.dots].sort((a, b) => a.order - b.order);
const N_NEW = GEO.dots.filter((d) => d.group === "new").length;
const step = ALL.length / N_NEW;
const newIdx = new Set(Array.from({ length: N_NEW }, (_, k) => Math.floor(k * step + step / 2)));
const base = ALL.filter((_, i) => !newIdx.has(i));
const fresh = ALL.filter((_, i) => newIdx.has(i)).sort((a, b) => a.y - b.y);

// Each new dot travels up I-69 from the southwest, then hops to its place.
const paths = fresh.map((d) => {
  let best = 0;
  let bestD = Infinity;
  GEO.i69.forEach(([x, y], i) => {
    const dd = Math.hypot(x - d.x, y - d.y);
    if (dd < bestD) {
      bestD = dd;
      best = i;
    }
  });
  const pts: Pt[] = [...GEO.i69.slice(0, best + 1), [d.x, d.y]];
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
});
const pointAt = (p: (typeof paths)[number], u: number): Pt => {
  const s = u * p.len;
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < s) i++;
  const k = (s - p.cum[i - 1]) / Math.max(1e-6, p.cum[i] - p.cum[i - 1]);
  return [p.pts[i - 1][0] + (p.pts[i][0] - p.pts[i - 1][0]) * k, p.pts[i - 1][1] + (p.pts[i][1] - p.pts[i - 1][1]) * k];
};

export function dotsVisibility(t: number, shot: string) {
  if (shot === "street") return 0;
  if (t < DOTS.baseStart) return 0;
  if (t >= asking.start) return 0.55;
  return 1;
}

export const Dots: React.FC<{ t: number; shot: string }> = ({ t, shot }) => {
  const baseRef = useRef<THREE.InstancedMesh>(null);
  const newRef = useRef<THREE.InstancedMesh>(null);
  const vis = dotsVisibility(t, shot);
  const m = useMemo(() => new THREE.Matrix4(), []);

  useLayoutEffect(() => {
    const mesh = baseRef.current;
    if (!mesh) return;
    base.forEach((d, i) => {
      const at = DOTS.baseStart + (i / base.length) * (DOTS.baseEnd - DOTS.baseStart);
      const s = t >= asking.start ? 1 : ease.outBack(prog(t, at, at + 0.28));
      m.makeScale(s || 0.0001, s || 0.0001, s || 0.0001).setPosition(d.x, Y, -d.y);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [t, m]);

  useLayoutEffect(() => {
    const mesh = newRef.current;
    if (!mesh) return;
    fresh.forEach((_, i) => {
      const depart = DOTS.streamStart + (i / fresh.length) * (DOTS.streamEnd - DOTS.streamStart - 0.9);
      const u = t >= asking.start ? 1 : ease.inOutCubic(prog(t, depart, depart + 0.9));
      const [x, y] = pointAt(paths[i], u);
      const hop = Math.sin(Math.min(1, Math.max(0, (u - 0.8) / 0.2)) * Math.PI) * 0.9;
      const s = u <= 0 ? 0.0001 : 1.08;
      m.makeScale(s, s, s).setPosition(x, Y + hop, -y);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [t, m]);

  return (
    <group visible={vis > 0}>
      <instancedMesh ref={baseRef} args={[undefined, undefined, base.length]} frustumCulled={false}>
        <sphereGeometry args={[R, 12, 8]} />
        <meshStandardMaterial color={C.snowDim} emissive="#8fa6c6" emissiveIntensity={0.35} roughness={0.5} transparent opacity={vis} />
      </instancedMesh>
      <instancedMesh ref={newRef} args={[undefined, undefined, fresh.length]} frustumCulled={false}>
        <sphereGeometry args={[R, 12, 8]} />
        <meshStandardMaterial color={C.amberHot} emissive={C.amber} emissiveIntensity={1.1} roughness={0.4} transparent opacity={vis} />
      </instancedMesh>
    </group>
  );
};
