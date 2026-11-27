import { useMemo } from "react";
import * as THREE from "three";
import { C } from "../theme";
import { T, NUM, KM_PER_DOLLAR, HAMILTON_TOP, scene, prog, ease } from "../data";

export const COLUMN = { x: 0, z: 0, w: 2.6, base: HAMILTON_TOP + 0.02 };
export const H_NOW = NUM.price * KM_PER_DOLLAR; // 17.8 km
export const H_THEN = NUM.priceYearAgo * KM_PER_DOLLAR; // 19.0 km

const price = scene("price");
const inv = scene("inventory");
const asking = scene("asking");

// 0..1 visibility and current height, shared with the overlay so labels track the column top.
export function columnState(t: number) {
  const rise = ease.outBack(prog(t, price.start + 0.35, T.keyTimes.price + 0.15));
  const sink = 1 - ease.inOutCubic(prog(t, inv.start, inv.start + 0.5));
  const back = ease.outCubic(prog(t, asking.start - 0.1, asking.start + 0.7));
  const firstPass = t < asking.start - 0.1;
  const h = firstPass ? H_NOW * rise * sink : H_NOW * back;
  const endFade = 1 - ease.inOutCubic(prog(t, T.keyTimes.call - 0.2, T.keyTimes.call + 0.5));
  const vis = (firstPass ? (t < price.start + 0.35 ? 0 : sink) : back) * endFade;
  const ghost = (firstPass ? ease.outCubic(prog(t, T.keyTimes.down - 0.45, T.keyTimes.down + 0.35)) * sink : back * 0.8) * endFade;
  return { h: Math.max(0.001, h), vis, ghost, scale: firstPass ? sink : 1 };
}

export const PriceColumn: React.FC<{ t: number }> = ({ t }) => {
  const { h, vis, ghost, scale } = columnState(t);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);
  const ghostEdges = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(COLUMN.w, H_THEN, COLUMN.w));
    return g;
  }, []);
  if (vis <= 0.001 && ghost <= 0.001) return null;
  const w = COLUMN.w;
  return (
    <group position={[COLUMN.x, COLUMN.base, COLUMN.z]}>
      {/* solid column */}
      <mesh position={[0, h / 2, 0]} scale={[w, h, w]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={0.55} roughness={0.35} metalness={0.1} transparent opacity={0.96 * vis} depthWrite={vis > 0.9} />
      </mesh>
      <lineSegments geometry={edges} position={[0, h / 2, 0]} scale={[w * 1.002, h, w * 1.002]}>
        <lineBasicMaterial color={C.amberHot} transparent opacity={vis} />
      </lineSegments>
      {/* ground pool of light */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[w * 2.4, 40]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.16 * vis} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* last year's height: teal ghost outline */}
      {ghost > 0.001 && (
        <>
          <group scale={[1, Math.max(0.001, scale), 1]}>
          <lineSegments geometry={ghostEdges} position={[0, H_THEN / 2, 0]}>
            <lineBasicMaterial color={C.teal} transparent opacity={0.85 * ghost} />
          </lineSegments>
          <mesh position={[0, (H_NOW + H_THEN) / 2, 0]}>
            <boxGeometry args={[w * 1.01, H_THEN - H_NOW, w * 1.01]} />
            <meshBasicMaterial color={C.teal} transparent opacity={0.16 * ghost} depthWrite={false} />
          </mesh>
          </group>
        </>
      )}
    </group>
  );
};
