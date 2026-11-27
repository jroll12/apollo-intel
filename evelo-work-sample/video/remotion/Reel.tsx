import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import * as THREE from "three";
import { C, type Format } from "./theme";
import { T } from "./data";
import { cameraPose, makeCamera } from "./camera";
import { MapWorld } from "./world/Map";
import { PriceColumn } from "./world/Column";
import { Dots } from "./world/Dots";
import { StreetWorld } from "./world/Street";
import { Overlay } from "./Overlay";

export type Segment = [number, number]; // source seconds [start, end)
export type ReelProps = { format: Format; segments?: Segment[] };

export const fullSegments = (): Segment[] => [[0, T.duration]];
export const segmentsFrames = (segs: Segment[]) => segs.reduce((n, [a, b]) => n + Math.round((b - a) * T.fps), 0);

// Output frame -> source time, across cut segments.
function sourceTime(frame: number, segs: Segment[]) {
  let f = frame;
  for (const [a, b] of segs) {
    const n = Math.round((b - a) * T.fps);
    if (f < n) return a + f / T.fps;
    f -= n;
  }
  const last = segs[segs.length - 1];
  return last[1] - 1 / T.fps;
}

const Rig: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    const p = cameraPose(t, format);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = p.fov;
    cam.near = p.near;
    cam.far = p.far;
    cam.position.set(...p.pos);
    cam.lookAt(...p.target);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = p.fog;
  }, [t, format, camera, scene]);
  return null;
};

const World: React.FC<{ t: number; format: Format; shot: string }> = ({ t, format, shot }) => (
  <>
    <Rig t={t} format={format} />
    <color attach="background" args={[C.ink]} />
    <fogExp2 attach="fog" args={[C.ink, 0.004]} />
    <hemisphereLight args={["#3d5a8a", "#05080f", 0.55]} />
    <ambientLight intensity={0.25} color="#8fa6c6" />
    <directionalLight position={[-60, 90, -40]} intensity={1.25} color="#a9c1ec" />
    <directionalLight position={[50, 30, 60]} intensity={0.25} color={C.amber} />
    {shot !== "street" ? (
      <>
        <MapWorld t={t} />
        <PriceColumn t={t} />
        <Dots t={t} shot={shot} />
      </>
    ) : (
      <StreetWorld t={t} />
    )}
  </>
);

// ---------------- audio ----------------
const speech = (() => {
  const out: [number, number][] = [];
  for (const w of T.words) {
    const last = out[out.length - 1];
    if (last && w.start - last[1] < 0.45) last[1] = w.end;
    else out.push([w.start, w.end]);
  }
  return out;
})();
const duck = (src: number) => {
  // music level: low under the voice, up in the gaps, with 0.25 s ramps
  let level = 0.42;
  for (const [a, b] of speech) {
    if (src > a - 0.25 && src < b + 0.25) {
      const k = Math.min(1, (src - (a - 0.25)) / 0.25, (b + 0.25 - src) / 0.25);
      level = Math.min(level, 0.42 - (0.42 - 0.17) * Math.max(0, k));
    }
  }
  return level;
};

const SegmentAudio: React.FC<{ seg: Segment; edgeFade: boolean }> = ({ seg: [a, b], edgeFade }) => {
  const fps = T.fps;
  const n = Math.round((b - a) * fps);
  const edge = (f: number) => (edgeFade ? Math.min(1, f / (0.12 * fps), (n - f) / (0.12 * fps)) : 1);
  const voFrom = Math.max(0, Math.round((T.voOffset - a) * fps));
  const voStart = Math.max(0, Math.round((a - T.voOffset) * fps));
  return (
    <>
      <Sequence from={voFrom} durationInFrames={Math.max(1, n - voFrom)}>
        <Audio src={staticFile("audio/vo.mp3")} startFrom={voStart} volume={(f) => edge(f + voFrom)} />
      </Sequence>
      <Audio src={staticFile("audio/music.mp3")} startFrom={Math.round((T.music.skip + a) * fps)} volume={(f) => duck(a + f / fps) * edge(f)} />
      {T.sfx
        .filter((s) => s.at >= a && s.at < b - 0.05)
        .map((s, i) => (
          <Sequence key={i} from={Math.round((s.at - a) * fps)} durationInFrames={Math.max(1, n - Math.round((s.at - a) * fps))}>
            <Audio src={staticFile(`audio/sfx/${s.file}.wav`)} volume={s.gain} />
          </Sequence>
        ))}
    </>
  );
};

export const Reel: React.FC<ReelProps> = ({ format, segments }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const segs = segments ?? fullSegments();
  const t = sourceTime(frame, segs);
  const pose = cameraPose(t, format);
  const cam = useMemo(() => makeCamera(t, format), [t, format]);
  let offset = 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: pose.fov, near: pose.near, far: pose.far }}>
        <World t={t} format={format} shot={pose.shot} />
      </ThreeCanvas>
      <Overlay t={t} format={format} cam={cam} shot={pose.shot} frame={frame} />
      {segs.map((seg, i) => {
        const from = offset;
        const n = Math.round((seg[1] - seg[0]) * T.fps);
        offset += n;
        return (
          <Sequence key={i} from={from} durationInFrames={n}>
            <SegmentAudio seg={seg} edgeFade={segs.length > 1} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const fadeLevel = interpolate;
