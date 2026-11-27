import * as THREE from "three";
import { random } from "remotion";
import type { Pt } from "../data";

// Flat ribbon along a polyline in the ground plane. heightAt(x, y) gives the surface height.
// Returns an indexed BufferGeometry whose index can be revealed progressively with setDrawRange.
export function ribbon(coords: Pt[], width: number, heightAt: (x: number, y: number) => number, lift = 0.02, closed = false) {
  const pts = closed ? [...coords, coords[0]] : coords;
  const n = pts.length;
  const pos: number[] = [];
  const idx: number[] = [];
  const along: number[] = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const nx = -dy * (width / 2);
    const ny = dx * (width / 2);
    if (i > 0) acc += Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]);
    const h = heightAt(x, y) + lift;
    pos.push(x + nx, h, -(y + ny), x - nx, h, -(y - ny));
    along.push(acc, acc);
    if (i < n - 1) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return { geometry: g, length: acc, segments: n - 1 };
}

// Soft round sprite for lights and glows.
let glowTex: THREE.Texture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.65)");
  g.addColorStop(0.6, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

// Deterministic gaussian from remotion's seeded random.
export function gauss(seed: string) {
  const u = Math.max(1e-6, random(seed + "a"));
  const v = random(seed + "b");
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
