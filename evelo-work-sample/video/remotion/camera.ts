// One camera, three shots. Keyframes hang off the timeline (scene starts and spoken words), so a
// new voice take re-times every move. Positions are world km (x east, y up, z south).
import * as THREE from "three";
import { T, scene, STREET_ORIGIN as D } from "./data";
import type { Format } from "./theme";

type V3 = [number, number, number];
type Key = { t: number; pos: V3; target: V3 };
type Shot = { id: "map" | "street" | "map2"; start: number; end: number; keys: Key[]; near: number; far: number; fog: number; drift: number };

const S = {
  hook: scene("hook"),
  price: scene("price"),
  inv: scene("inventory"),
  comps: scene("comps"),
  asking: scene("asking"),
  cta: scene("cta"),
};
const K = T.keyTimes;
export const DIVE = 0.5; // seconds of the map dive before the cut to street level
const d = (x: number, y: number, z: number): V3 => [D[0] + x, D[1] + y, D[2] + z];

export const SHOTS: Shot[] = [
  {
    id: "map",
    start: 0,
    end: S.comps.start + DIVE,
    near: 0.3,
    far: 700,
    fog: 0.0042,
    drift: 1,
    keys: [
      { t: 0, pos: [2, 112, 92], target: [0, 0, -10] },
      { t: K.fishers, pos: [6, 66, 62], target: [1, 0, -2] },
      { t: S.hook.end - 0.3, pos: [6, 30, 44], target: [-1, 0, 9] },
      { t: S.price.start + 0.6, pos: [-26, 13, 30], target: [-6, 8, 0] },
      { t: K.down, pos: [-15, 20, 37], target: [-6.5, 13, 0] },
      { t: S.price.end, pos: [2, 27, 38], target: [-6, 12, 0] },
      { t: S.inv.start + 1.0, pos: [2, 70, 46], target: [0, 0, -3] },
      { t: (S.inv.start + S.inv.end) / 2, pos: [10, 62, 40], target: [3, 0, 0] },
      { t: S.inv.end, pos: [12, 40, 30], target: [5, 0, 6] },
      { t: S.comps.start + DIVE, pos: [5.6, 2.2, 8.4], target: [5, 0.5, 7] },
    ],
  },
  {
    id: "street",
    start: S.comps.start + DIVE,
    end: S.asking.start,
    near: 0.001,
    far: 4,
    fog: 1.1,
    drift: 0.02,
    keys: [
      { t: S.comps.start + DIVE, pos: d(-0.11, 0.16, 0.2), target: d(0, 0, 0.005) },
      { t: K.comparable, pos: d(-0.06, 0.085, 0.15), target: d(0.01, 0.004, 0) },
      { t: K.street, pos: d(0.04, 0.07, 0.13), target: d(0.008, 0.004, 0) },
      { t: K.showing, pos: d(0.11, 0.1, 0.08), target: d(0.01, 0.004, -0.005) },
      { t: S.asking.start, pos: d(0.13, 0.14, 0.04), target: d(0.01, 0.004, -0.01) },
    ],
  },
  {
    id: "map2",
    start: S.asking.start,
    end: T.duration,
    near: 0.3,
    far: 700,
    fog: 0.0042,
    drift: 1,
    keys: [
      { t: S.asking.start, pos: [-17, 18, 30], target: [-4, 10, 0] },
      { t: S.asking.end, pos: [-10, 27, 40], target: [-4, 9, 0] },
      { t: S.cta.start + 2.2, pos: [-5, 96, 82], target: [0, 0, -4] },
      { t: T.duration, pos: [4, 124, 88], target: [0, 0, -7] },
    ],
  },
];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

const along = (keys: Key[], t: number, f: "pos" | "target"): V3 => {
  if (t <= keys[0].t) return keys[0][f];
  if (t >= keys[keys.length - 1].t) return keys[keys.length - 1][f];
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const u0 = (t - keys[i].t) / (keys[i + 1].t - keys[i].t);
  const u = u0 * u0 * (3 - 2 * u0) * 0.35 + u0 * 0.65; // gentle ease without full stops
  const k = (j: number) => keys[Math.max(0, Math.min(keys.length - 1, j))][f];
  return [0, 1, 2].map((c) => cr(k(i - 1)[c], k(i)[c], k(i + 1)[c], k(i + 2)[c], u)) as V3;
};

// Vertical FOV for portrait; the feed format keeps the same horizontal coverage.
const V_FOV_PORTRAIT = 48;
const H_FOV = 2 * Math.atan(Math.tan(((V_FOV_PORTRAIT / 2) * Math.PI) / 180) * (1080 / 1920));
export const fovFor = (aspect: number) => (2 * Math.atan(Math.tan(H_FOV / 2) / aspect) * 180) / Math.PI;

export type Pose = { shot: Shot["id"]; pos: V3; target: V3; fov: number; near: number; far: number; fog: number };

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.start && t < s.end) ?? SHOTS[SHOTS.length - 1];

export function cameraPose(t: number, format: Format): Pose {
  const shot = shotAt(t);
  const pos = along(shot.keys, t, "pos");
  const target = along(shot.keys, t, "target");
  const dist = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  const a = dist * 0.006 * shot.drift;
  const p: V3 = [pos[0] + Math.sin(t * 0.71) * a, pos[1] + Math.sin(t * 0.53 + 1) * a * 0.6, pos[2] + Math.cos(t * 0.61) * a];
  const aspect = format === "portrait" ? 1080 / 1920 : 1080 / 1350;
  return { shot: shot.id, pos: p, target, fov: fovFor(aspect), near: shot.near, far: shot.far, fog: shot.fog };
}

export function makeCamera(t: number, format: Format) {
  const p = cameraPose(t, format);
  const aspect = format === "portrait" ? 1080 / 1920 : 1080 / 1350;
  const cam = new THREE.PerspectiveCamera(p.fov, aspect, p.near, p.far);
  cam.position.set(...p.pos);
  cam.lookAt(...p.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}

// World point -> screen pixels (and whether it is in front of the camera).
export function project(cam: THREE.PerspectiveCamera, w: number, h: number, p: V3) {
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, visible: v.z < 1 && v.z > -1 };
}
