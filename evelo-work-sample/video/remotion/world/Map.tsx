import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { C } from "../theme";
import { GEO, HAMILTON_TOP, OTHER_TOP, groundAt, inside, HAM_RING, prog, ease, type Pt } from "../data";
import { ribbon, glowTexture, gauss } from "./geom";

const ROAD = {
  interstate: { w: 0.34, color: C.amberHot, opacity: 1, glow: 1.6, glowOpacity: 0.16, step: 0.22, jitter: 0.5 },
  us: { w: 0.17, color: C.amber, opacity: 0.9, glow: 0.8, glowOpacity: 0.08, step: 0.38, jitter: 0.6 },
  state: { w: 0.09, color: C.amberDim, opacity: 0.55, glow: 0, glowOpacity: 0, step: 0.7, jitter: 0.7 },
} as const;

const Counties: React.FC<{ t: number }> = ({ t }) => {
  const items = useMemo(
    () =>
      GEO.counties.map((c) => {
        const shape = new THREE.Shape(c.rings[0].map(([x, y]) => new THREE.Vector2(x, y)));
        const depth = c.highlight ? HAMILTON_TOP : OTHER_TOP;
        const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        const edge = new THREE.BufferGeometry().setFromPoints(c.rings[0].map(([x, y]) => new THREE.Vector3(x, depth + 0.03, -y)));
        return { c, geometry, edge };
      }),
    [],
  );
  // Hamilton lifts slightly as its border ignites in the hook.
  const lift = 0;
  return (
    <group>
      {items.map(({ c, geometry, edge }) => (
        <group key={c.fips} position={[0, c.highlight ? lift : 0, 0]}>
          <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={c.highlight ? C.hamilton : C.county} roughness={0.92} metalness={0.05} />
          </mesh>
          {!c.highlight && (
            <lineLoop geometry={edge}>
              <lineBasicMaterial color={C.edgeDim} transparent opacity={0.8} />
            </lineLoop>
          )}
        </group>
      ))}
    </group>
  );
};

// The Hamilton border draws itself on in the hook, then stays lit.
const HamiltonBorder: React.FC<{ t: number }> = ({ t }) => {
  const { core, glow } = useMemo(() => {
    const h = () => HAMILTON_TOP;
    return { core: ribbon(HAM_RING, 0.32, h, 0.05, true), glow: ribbon(HAM_RING, 2.2, h, 0.04, true) };
  }, []);
  const p = ease.inOutCubic(prog(t, 0.0, 0.9));
  const lift = 0;
  core.geometry.setDrawRange(0, Math.ceil(core.segments * p) * 6);
  glow.geometry.setDrawRange(0, Math.ceil(glow.segments * p) * 6);
  return (
    <group position={[0, lift, 0]}>
      <mesh geometry={glow.geometry}>
        <meshBasicMaterial color={C.amber} transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh geometry={core.geometry}>
        <meshBasicMaterial color={C.amberHot} transparent opacity={0.95} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Roads: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const items = useMemo(
    () =>
      GEO.roads.flatMap((r) => {
        const s = ROAD[r.kind];
        const out = [{ key: r.name + r.coords[0].join(), kind: r.kind, geo: ribbon(r.coords, s.w, groundAt, 0.06).geometry, glow: false }];
        if (s.glow) out.push({ key: r.name + r.coords[0].join() + "g", kind: r.kind, geo: ribbon(r.coords, s.glow, groundAt, 0.05).geometry, glow: true });
        return out;
      }),
    [],
  );
  const on = 1;
  void t;
  return (
    <group>
      {items.map((it) => {
        const s = ROAD[it.kind];
        return (
          <mesh key={it.key} geometry={it.geo}>
            <meshBasicMaterial
              color={s.color}
              transparent
              opacity={(it.glow ? s.glowOpacity : s.opacity) * on * dim}
              depthWrite={false}
              blending={it.glow ? THREE.AdditiveBlending : THREE.NormalBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Night lights: points scattered along the roads and around the towns, like a winter flight.
const CityLights: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const geometry = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const warm = new THREE.Color(C.amber);
    const white = new THREE.Color("#fff1d8");
    const add = (x: number, y: number, seed: string) => {
      pos.push(x, groundAt(x, y) + 0.08, -y);
      const c = random(seed + "c") < 0.72 ? warm : white;
      const k = 0.55 + random(seed + "k") * 0.45;
      col.push(c.r * k, c.g * k, c.b * k);
    };
    GEO.roads.forEach((r, ri) => {
      const s = ROAD[r.kind];
      for (let i = 0; i < r.coords.length - 1; i++) {
        const [x0, y0] = r.coords[i];
        const [x1, y1] = r.coords[i + 1];
        const len = Math.hypot(x1 - x0, y1 - y0);
        const n = Math.floor(len / s.step);
        for (let k = 0; k < n; k++) {
          const seed = `rl-${ri}-${i}-${k}`;
          if (random(seed) < 0.35) continue;
          const u = (k + random(seed + "u")) / Math.max(1, n);
          add(x0 + (x1 - x0) * u + gauss(seed + "x") * s.jitter, y0 + (y1 - y0) * u + gauss(seed + "y") * s.jitter, seed);
        }
      }
    });
    const towns: { name: string; n: number; sigma: number }[] = [
      { name: "Fishers", n: 900, sigma: 2.6 },
      { name: "Carmel", n: 900, sigma: 2.6 },
      { name: "Noblesville", n: 600, sigma: 2.2 },
      { name: "Westfield", n: 500, sigma: 2.2 },
      { name: "Zionsville", n: 300, sigma: 1.8 },
      { name: "Indianapolis", n: 2600, sigma: 7.5 },
    ];
    towns.forEach((tw) => {
      const town = GEO.towns.find((x) => x.name === tw.name);
      if (!town) return;
      for (let i = 0; i < tw.n; i++) {
        const seed = `tl-${tw.name}-${i}`;
        add(town.x + gauss(seed + "x") * tw.sigma, town.y + gauss(seed + "y") * tw.sigma, seed);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);
  const on = 1;
  const shimmer = 0.9 + 0.1 * Math.sin(t * 2.1);
  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.34}
        sizeAttenuation
        map={glowTexture()}
        vertexColors
        transparent
        opacity={on * shimmer * dim}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const MapWorld: React.FC<{ t: number; dim?: number }> = ({ t, dim = 1 }) => (
  <group>
    <Counties t={t} />
    <HamiltonBorder t={t} />
    <Roads t={t} dim={dim} />
    <CityLights t={t} dim={dim} />
  </group>
);

export const insideHamilton = (p: Pt) => inside(p, HAM_RING);
