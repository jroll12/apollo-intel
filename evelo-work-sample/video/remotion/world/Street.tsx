// A fictional winter street at night for the "today's comparable homes" beat. Built in meters,
// scaled to km, and placed far from the map. No real addresses, layouts or listings.
import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { C } from "../theme";
import { T, STREET_ORIGIN as D, prog, ease } from "../data";
import { glowTexture } from "./geom";

const LOTS = Array.from({ length: 11 }, (_, k) => -110 + 22 * k);
type House = { x: number; z: number; side: 1 | -1; color: string; role: "subject" | "comp" | "other"; compIndex?: number; lit: boolean[] };
const PALETTE = ["#3a4a63", "#4a4038", "#3d4f4a", "#55505c", "#40485a", "#4b5566"];
const COMPS = [
  { x: -66, side: -1 as const },
  { x: 44, side: 1 as const },
  { x: 110, side: -1 as const },
];

const HOUSES: House[] = LOTS.flatMap((x) =>
  ([-1, 1] as const).map((side) => {
    const ci = COMPS.findIndex((c) => c.x === x && c.side === side);
    const role: House["role"] = x === 0 && side === -1 ? "subject" : ci >= 0 ? "comp" : "other";
    return {
      x,
      z: side * 17,
      side,
      color: PALETTE[Math.floor(random(`hc-${x}-${side}`) * PALETTE.length)],
      role,
      compIndex: ci >= 0 ? ci : undefined,
      lit: [random(`w1-${x}-${side}`) > 0.3, random(`w2-${x}-${side}`) > 0.35],
    };
  }),
);

const S = 0.001; // meters -> km
export const toWorld = (x: number, y: number, z: number): [number, number, number] => [D[0] + x * S, D[1] + y * S, D[2] + z * S];
export const STREET_POINTS = {
  subject: toWorld(0, 19, -17),
  comps: COMPS.map((c) => toWorld(c.x, 17, c.side * 17)),
};
export const compTimes = COMPS.map((_, i) => T.keyTimes.comparable + 0.05 + i * 0.32);

const HouseMesh: React.FC<{ h: House; t: number }> = ({ h, t }) => {
  const bodyEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(12, 6, 10)), []);
  const roofEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.ConeGeometry(8.4, 4.6, 4, 1)), []);
  const highlight =
    h.role === "subject"
      ? ease.outCubic(prog(t, T.keyTimes.comparable - 0.6, T.keyTimes.comparable - 0.1))
      : h.role === "comp"
        ? ease.outBack(prog(t, compTimes[h.compIndex!], compTimes[h.compIndex!] + 0.4))
        : 0;
  const hc = h.role === "subject" ? C.teal : C.amber;
  const pulse = 0.75 + 0.25 * Math.sin(t * 5 + h.x);
  const face = -h.side; // windows face the street
  return (
    <group position={[h.x, 0, h.z]}>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[12, 6, 10]} />
        <meshStandardMaterial color={h.color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 8.3, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 10 / 12]}>
        <coneGeometry args={[8.4, 4.6, 4, 1]} />
        <meshStandardMaterial color="#d6dfeb" emissive="#9fb2cc" emissiveIntensity={0.08} roughness={0.9} flatShading />
      </mesh>
      {/* windows */}
      {[-3, 3].map((wx, i) => (
        <mesh key={wx} position={[wx, 3.4, face * 5.02]} rotation={[0, face > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[2.4, 1.7]} />
          <meshStandardMaterial color={h.lit[i] ? "#ffcf7a" : "#1b2433"} emissive={h.lit[i] ? "#ffb24d" : "#000"} emissiveIntensity={h.lit[i] ? 1.6 : 0} />
        </mesh>
      ))}
      <mesh position={[0, 1.2, face * 5.03]} rotation={[0, face > 0 ? 0 : Math.PI, 0]}>
        <planeGeometry args={[1.3, 2.3]} />
        <meshStandardMaterial color="#20293a" />
      </mesh>
      {/* driveway */}
      <mesh position={[4.5, 0.03, face * 8.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 7]} />
        <meshStandardMaterial color="#1a2232" roughness={1} />
      </mesh>
      {highlight > 0.001 && (
        <>
          <lineSegments geometry={bodyEdges} position={[0, 3, 0]} scale={1.02}>
            <lineBasicMaterial color={hc} transparent opacity={highlight} />
          </lineSegments>
          <lineSegments geometry={roofEdges} position={[0, 8.3, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.02, 1.02, (10 / 12) * 1.02]}>
            <lineBasicMaterial color={hc} transparent opacity={highlight} />
          </lineSegments>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[9, 10.5 + 1.2 * pulse, 48]} />
            <meshBasicMaterial color={hc} transparent opacity={0.55 * highlight} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[11, 48]} />
            <meshBasicMaterial color={hc} transparent opacity={0.12 * highlight} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Dashed arcs from each comp to the subject home, drawn on when "your street" is spoken.
const Arcs: React.FC<{ t: number }> = ({ t }) => {
  const lines = useMemo(
    () =>
      COMPS.map((c) => {
        const a = new THREE.Vector3(c.x, 10.8, c.side * 17);
        const b = new THREE.Vector3(0, 10.8, -17);
        const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 24, 0));
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
        const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: C.amberHot, dashSize: 2.2, gapSize: 1.4, transparent: true }));
        line.computeLineDistances();
        return line;
      }),
    [],
  );
  lines.forEach((l, i) => {
    const p = ease.inOutCubic(prog(t, T.keyTimes.street - 0.2 + i * 0.25, T.keyTimes.street + 0.9 + i * 0.25));
    l.geometry.setDrawRange(0, Math.ceil(81 * p));
    (l.material as THREE.LineDashedMaterial).opacity = p > 0 ? 0.95 : 0;
  });
  return (
    <>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </>
  );
};

const StreetLights: React.FC = () => {
  const xs = [-132, -88, -44, 0, 44, 88, 132];
  return (
    <>
      {xs.flatMap((x) =>
        [-1, 1].map((s) => (
          <group key={`${x}${s}`} position={[x + s * 11, 0, s * 7.4]}>
            <mesh position={[0, 3.2, 0]}>
              <cylinderGeometry args={[0.12, 0.16, 6.4, 6]} />
              <meshStandardMaterial color="#2a3446" />
            </mesh>
            <mesh position={[0, 6.5, 0]}>
              <sphereGeometry args={[0.35, 10, 8]} />
              <meshBasicMaterial color="#ffe3b0" />
            </mesh>
            <sprite position={[0, 6.5, 0]} scale={[9, 9, 1]}>
              <spriteMaterial map={glowTexture()} color={C.amber} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
            <mesh position={[0, 0.04, -s * 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[6.5, 32]} />
              <meshBasicMaterial color={C.amber} transparent opacity={0.13} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        )),
      )}
    </>
  );
};

const Trees: React.FC = () => {
  const trees = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        return {
          x: -150 + random(`tx-${i}`) * 300,
          z: side * (31 + random(`tz-${i}`) * 26),
          h: 8 + random(`th-${i}`) * 7,
          r: 2.6 + random(`tr-${i}`) * 2,
        };
      }),
    [],
  );
  return (
    <>
      {trees.map((tr, i) => (
        <mesh key={i} position={[tr.x, tr.h / 2, tr.z]}>
          <coneGeometry args={[tr.r, tr.h, 7]} />
          <meshStandardMaterial color="#10292c" roughness={1} flatShading />
        </mesh>
      ))}
    </>
  );
};

export const StreetWorld: React.FC<{ t: number }> = ({ t }) => (
  <group position={D} scale={S}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[900, 900]} />
      <meshStandardMaterial color="#1b2a40" roughness={0.95} />
    </mesh>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[340, 11]} />
      <meshStandardMaterial color="#0c121d" roughness={0.8} />
    </mesh>
    <mesh position={[55, 0.02, -80]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[9, 160]} />
      <meshStandardMaterial color="#0c121d" roughness={0.8} />
    </mesh>
    {HOUSES.filter((h) => !(h.side === -1 && Math.abs(h.x - 55) < 12)).map((h) => (
      <HouseMesh key={`${h.x}${h.side}`} h={h} t={t} />
    ))}
    <Arcs t={t} />
    <StreetLights />
    <Trees />
  </group>
);
