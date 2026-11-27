import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import * as THREE from "three";
import { BODY_FONT, DISPLAY_FONT } from "./fonts";

// Smoke test for headless 3D: extruded county, ~1k instanced spheres, a translucent
// price column, glowing roads (THREE.Line), ambient + directional light, moving camera,
// and a 2D overlay in the bundled Bricolage Grotesque / Inter fonts.

const NAVY = "#0a1128";
const DEPTH = 0.5; // county extrusion height
const DOT_COUNT = 1000;
const DOT_RADIUS = 0.06;

type Pt = [number, number];

// Irregular county outline in the shape's XY plane (becomes XZ after the -90deg X rotation).
const makeOutline = (): Pt[] => {
  const n = 15;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 4.2 + random(`county-r-${i}`) * 1.6;
    pts.push([Math.cos(a) * r * 1.05, Math.sin(a) * r * 0.95]);
  }
  return pts;
};

const insidePolygon = ([x, y]: Pt, poly: Pt[]): boolean => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

// Shape (x, y) -> world (x, top, -y) after rotating the extrusion -90deg about X.
const toWorld = ([x, y]: Pt, lift = 0): THREE.Vector3 =>
  new THREE.Vector3(x, DEPTH + lift, -y);

const County: React.FC<{ outline: Pt[] }> = ({ outline }) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    return new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2,
    });
  }, [outline]);

  const edge = useMemo(() => {
    const pts = outline.map((p) => toWorld(p, 0.045));
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: "#8fb8ff", transparent: true, opacity: 0.9 });
    return new THREE.LineLoop(geom, mat);
  }, [outline]);

  return (
    <>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1f3460" roughness={0.75} metalness={0.1} />
      </mesh>
      <primitive object={edge} />
    </>
  );
};

const Dots: React.FC<{ outline: Pt[] }> = ({ outline }) => {
  const frame = useCurrentFrame();
  const ref = useRef<THREE.InstancedMesh>(null);

  const points = useMemo(() => {
    const out: { p: Pt; phase: number }[] = [];
    let i = 0;
    while (out.length < DOT_COUNT) {
      const p: Pt = [(random(`dx-${i}`) - 0.5) * 12, (random(`dy-${i}`) - 0.5) * 12];
      if (insidePolygon(p, outline)) out.push({ p, phase: random(`ph-${i}`) * Math.PI * 2 });
      i++;
    }
    return out;
  }, [outline]);

  // Colors once.
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    points.forEach((_, i) => {
      c.setHSL(0.52 + random(`hue-${i}`) * 0.12, 0.85, 0.55 + random(`l-${i}`) * 0.15);
      mesh.setColorAt(i, c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [points]);

  // Matrices every frame. useLayoutEffect runs before <ThreeCanvas>'s advance() effect,
  // so the frame that gets drawn already has this frame's positions.
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const t = frame / 30;
    points.forEach(({ p, phase }, i) => {
      const bob = 0.05 * Math.sin(t * Math.PI * 2 + phase);
      const v = toWorld(p, DOT_RADIUS + 0.05 + bob);
      m.makeTranslation(v.x, v.y, v.z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [frame, points]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, DOT_COUNT]}>
      <sphereGeometry args={[DOT_RADIUS, 12, 8]} />
      <meshStandardMaterial roughness={0.4} emissive="#0d3b66" emissiveIntensity={0.6} />
    </instancedMesh>
  );
};

const PriceColumn: React.FC = () => {
  const frame = useCurrentFrame();
  const height = interpolate(frame, [0, 29], [2.5, 5], { extrapolateRight: "clamp" });
  return (
    <mesh position={[1.1, DEPTH + height / 2, -0.6]}>
      <boxGeometry args={[0.7, height, 0.7]} />
      <meshStandardMaterial
        color="#ffb347"
        emissive="#ff8c1a"
        emissiveIntensity={0.5}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </mesh>
  );
};

const Roads: React.FC<{ outline: Pt[] }> = ({ outline }) => {
  const lines = useMemo(() => {
    const group = new THREE.Group();
    const offsets: Pt[] = [
      [0, 0],
      [0.015, 0],
      [-0.015, 0],
      [0, 0.015],
      [0, -0.015],
    ];
    for (let r = 0; r < 7; r++) {
      // A wobbly road across the county; keep only the points inside it.
      const a = random(`road-a-${r}`) * Math.PI;
      const dir: Pt = [Math.cos(a), Math.sin(a)];
      const off = (random(`road-o-${r}`) - 0.5) * 5;
      const pts: Pt[] = [];
      for (let s = -40; s <= 40; s++) {
        const k = s * 0.15;
        const wob = Math.sin(k * 0.9 + r) * 0.35;
        const p: Pt = [dir[0] * k - dir[1] * (off + wob), dir[1] * k + dir[0] * (off + wob)];
        if (insidePolygon(p, outline)) pts.push(p);
      }
      if (pts.length < 2) continue;
      offsets.forEach(([ox, oy], i) => {
        const geom = new THREE.BufferGeometry().setFromPoints(
          pts.map(([x, y]) => toWorld([x + ox, y + oy], 0.05)),
        );
        const mat = new THREE.LineBasicMaterial({
          color: i === 0 ? "#e0fbff" : "#4cc9f0",
          transparent: true,
          opacity: i === 0 ? 1 : 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        });
        group.add(new THREE.Line(geom, mat));
      });
    }
    return group;
  }, [outline]);

  return <primitive object={lines} />;
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const t = frame / 29;
    const angle = interpolate(t, [0, 1], [0.35, 0.95]) + Math.PI / 2;
    const radius = interpolate(t, [0, 1], [15.5, 13.5]);
    const height = interpolate(t, [0, 1], [16.5, 13.5]);
    camera.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    camera.lookAt(0, 1.2, 0);
    camera.updateProjectionMatrix();
  }, [frame, camera]);
  return null;
};

const useFontReport = (): string => {
  const [report, setReport] = useState("fonts: checking");
  const [handle] = useState(() => delayRender("Font report"));
  useEffect(() => {
    document.fonts.ready.then(() => {
      const loaded = (family: string) =>
        Array.from(document.fonts).filter((f) => f.family.replace(/"/g, "") === family && f.status === "loaded").length;
      setReport(`fonts loaded · Bricolage Grotesque ×${loaded("Bricolage Grotesque")} · Inter ×${loaded("Inter")}`);
      continueRender(handle);
    });
  }, [handle]);
  return report;
};

export const Smoke: React.FC = () => {
  const { width, height } = useVideoConfig();
  const outline = useMemo(makeOutline, []);
  const fontReport = useFontReport();

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 16, 15] }}
        onCreated={({ gl }) => {
          // Logged once per tab; visible with --log=verbose. Shows which software GL is in use.
          const ctx = gl.getContext();
          const info = ctx.getExtension("WEBGL_debug_renderer_info");
          console.log("[smoke] WebGL renderer:", info ? ctx.getParameter(info.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER));
        }}
      >
        <color attach="background" args={[NAVY]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 12, 4]} intensity={2.2} />
        <CameraRig />
        <County outline={outline} />
        <Dots outline={outline} />
        <Roads outline={outline} />
        <PriceColumn />
      </ThreeCanvas>

      <div
        style={{
          position: "absolute",
          top: 140,
          left: 80,
          right: 80,
          color: "white",
          fontFamily: DISPLAY_FONT,
        }}
      >
        <div style={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: 34, letterSpacing: 4, opacity: 0.75 }}>
          SMOKE TEST · HEADLESS 3D
        </div>
        <div style={{ fontWeight: 800, fontSize: 132, lineHeight: 1.0, marginTop: 24 }}>
          Quiet county, loud prices.
        </div>
        <div style={{ fontWeight: 500, fontSize: 56, marginTop: 28, color: "#ffb347" }}>
          Median sale $412,500 ↑ 6.2%
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 80,
          right: 80,
          color: "#9fb3d9",
          fontFamily: BODY_FONT,
          fontWeight: 400,
          fontSize: 30,
        }}
      >
        {fontReport}
      </div>
    </AbsoluteFill>
  );
};
