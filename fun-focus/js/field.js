/* ============================================================================
   FIELD VIEW — a canvas drawing of the diamond from behind home plate, with
   the batted ball animating along its flight and leaving a trail.

   Canvas rather than SVG because the ball, its trail and the fielder dots
   redraw every frame; hand-authoring that as SVG path data would be slower
   and much harder to read.

   The projection is a cheap one-point perspective: everything shrinks and
   rises toward a vanishing point as depth increases. It is not a real 3D
   camera and does not need to be — it needs to read instantly as "a baseball
   field seen from behind the plate" on a 6-inch screen.
   ========================================================================= */

import { BASES, FIELDER_SPOTS, OUTFIELD_FENCE } from './data/field-geometry.js';

const SKY = '#DCEBF5';
const GRASS = '#4E9A4B';
const GRASS_DARK = '#43873F';
const DIRT = '#C08B52';
const DIRT_LIGHT = '#CE9A61';
const LINE = 'rgba(255,255,255,0.85)';

/** Depth falloff. Smaller = more compression, outfield pushed further up. */
const DEPTH = 78;

export class FieldView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = 0;
    this.h = 0;
    this.state = null;
    this.raf = null;
    this.onSettle = null;
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Field feet -> screen pixels. z is height above the ground, in feet. */
  project(x, y, z = 0) {
    const d = DEPTH / (DEPTH + y);
    // Home sits at 86%, not lower — the catcher stands behind the plate at
    // negative y and needs room below it or he is clipped off the canvas.
    const homeY = this.h * 0.86;
    const horizon = this.h * 0.14;
    const sx = this.w / 2 + x * d * (this.w / 118);
    const sy = homeY - (homeY - horizon) * (y / (y + DEPTH)) - z * d * (this.h / 130);
    return [sx, sy];
  }

  /* ---------- Static field ------------------------------------------------- */

  drawField() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);

    // Sky
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, this.w, this.h);

    // Outfield grass — a wedge from home out to the fence arc.
    ctx.fillStyle = GRASS;
    ctx.beginPath();
    this.arcPath(OUTFIELD_FENCE, true);
    ctx.fill();

    // A mown band for depth cueing.
    ctx.fillStyle = GRASS_DARK;
    ctx.beginPath();
    this.arcPath(150, true);
    ctx.fill();
    ctx.fillStyle = GRASS;
    ctx.beginPath();
    this.arcPath(112, true);
    ctx.fill();

    // Infield dirt
    ctx.fillStyle = DIRT;
    ctx.beginPath();
    this.arcPath(95, true);
    ctx.fill();

    // Infield grass inside the basepaths
    ctx.fillStyle = GRASS;
    ctx.beginPath();
    this.polygon([
      [0, 13],
      [BASES.first[0] - 9, BASES.first[1] - 3],
      [BASES.second[0], BASES.second[1] - 11],
      [BASES.third[0] + 9, BASES.third[1] - 3],
    ]);
    ctx.fill();

    // Mound
    ctx.fillStyle = DIRT_LIGHT;
    this.dot(0, 46, 7.5);

    // Foul lines
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      const [x0, y0] = this.project(0, 1);
      const [x1, y1] = this.project(sign * 141, 141);
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    // Bases
    for (const key of ['first', 'second', 'third']) {
      this.baseMark(BASES[key], false);
    }
    this.plateMark();
  }

  arcPath(radius, close) {
    const { ctx } = this;
    const steps = 26;
    const [hx, hy] = this.project(0, 0);
    ctx.moveTo(hx, hy);
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const angle = (Math.PI / 4) + t * (Math.PI / 2); // 45deg to 135deg
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const [sx, sy] = this.project(x, y);
      ctx.lineTo(sx, sy);
    }
    if (close) ctx.closePath();
  }

  polygon(points) {
    const { ctx } = this;
    points.forEach(([x, y], i) => {
      const [sx, sy] = this.project(x, y);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
  }

  dot(x, y, radiusFeet) {
    const { ctx } = this;
    const [sx, sy] = this.project(x, y);
    const d = DEPTH / (DEPTH + y);
    ctx.beginPath();
    ctx.ellipse(sx, sy, radiusFeet * d * (this.w / 118), radiusFeet * d * (this.w / 118) * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  baseMark([x, y], occupied) {
    const { ctx } = this;
    const [sx, sy] = this.project(x, y);
    const d = DEPTH / (DEPTH + y);
    const s = Math.max(4, 5.2 * d * (this.w / 118) * 1.6);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, 0.55);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = occupied ? '#F88800' : '#FFFFFF';
    ctx.strokeStyle = occupied ? '#B26010' : 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.strokeRect(-s / 2, -s / 2, s, s);
    ctx.restore();
  }

  plateMark() {
    const { ctx } = this;
    const [sx, sy] = this.project(0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---------- Fielders ----------------------------------------------------- */

  drawFielders(youPos, highlightPos) {
    const { ctx } = this;
    for (const [pos, [x, y]] of Object.entries(FIELDER_SPOTS)) {
      const [sx, sy] = this.project(x, y);
      const isYou = pos === youPos;
      const isBall = pos === highlightPos;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 2, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, sy - 5, isYou ? 8 : 6.5, 0, Math.PI * 2);
      ctx.fillStyle = isYou ? '#F88800' : isBall ? '#FFFFFF' : 'rgba(255,255,255,0.92)';
      ctx.fill();
      ctx.lineWidth = isYou ? 2.5 : 1.5;
      ctx.strokeStyle = isYou ? '#B26010' : 'rgba(18,18,18,0.55)';
      ctx.stroke();

      // Position label
      ctx.font = `700 ${isYou ? 11 : 9.5}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isYou ? '#121212' : '#1c1c1c';
      ctx.fillText(pos, sx, sy - 5);
    }
  }

  drawRunners(bases) {
    for (const b of bases) {
      const key = { 1: 'first', 2: 'second', 3: 'third' }[b];
      this.baseMark(BASES[key], true);
    }
  }

  /* ---------- Ball flight -------------------------------------------------- */

  /**
   * Animate the ball from the plate to `to` along an arc of height `arc`.
   * Resolves when the ball settles.
   */
  playFlight({ to, arc, type, duration }, { youPos, bases }, onDone) {
    cancelAnimationFrame(this.raf);
    const start = performance.now();
    const [tx, ty] = to;
    const trail = [];

    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease out slightly so the ball decelerates into its landing spot.
      const p = type === 'grounder' || type === 'bunt' ? 1 - Math.pow(1 - t, 1.8) : t;

      const x = tx * p;
      const y = ty * p;
      let z = arc * Math.sin(Math.PI * p);
      if (type === 'grounder' || type === 'bunt') {
        // Low bounces rather than a smooth arc.
        z = Math.abs(Math.sin(p * Math.PI * 3.2)) * 3.2 * (1 - p);
      }

      trail.push([x, y, z]);
      if (trail.length > 90) trail.shift();

      this.drawField();
      this.drawRunners(bases);
      this.drawFielders(youPos, null);
      this.drawTrail(trail);
      this.drawBall(x, y, z);

      if (t < 1) {
        this.raf = requestAnimationFrame(frame);
      } else {
        this.lastTrail = trail;
        if (onDone) onDone();
      }
    };

    this.raf = requestAnimationFrame(frame);
  }

  drawTrail(trail) {
    const { ctx } = this;
    if (trail.length < 2) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i += 1) {
      const [x0, y0, z0] = trail[i - 1];
      const [x1, y1, z1] = trail[i];
      const [ax, ay] = this.project(x0, y0, z0);
      const [bx, by] = this.project(x1, y1, z1);
      ctx.strokeStyle = `rgba(255,255,255,${0.15 + 0.7 * (i / trail.length)})`;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }

  drawBall(x, y, z) {
    const { ctx } = this;
    const [sx, sy] = this.project(x, y, z);
    const [gx, gy] = this.project(x, y, 0);
    const d = DEPTH / (DEPTH + y);

    // Ground shadow, so height reads even on a flat drawing.
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(gx, gy, 4 * d + 1.5, 2 * d + 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(3, 5 * d + 1.5), 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(18,18,18,0.5)';
    ctx.stroke();
  }

  /** The frozen end state: field, fielders, and the full flight path. */
  drawSettled({ youPos, bases, ballPos, ballHandler }) {
    this.drawField();
    this.drawRunners(bases);
    this.drawFielders(youPos, ballHandler);
    if (this.lastTrail) this.drawTrail(this.lastTrail);
    if (ballPos) this.drawBall(ballPos[0], ballPos[1], 0);
  }

  drawPrePitch({ youPos, bases }) {
    cancelAnimationFrame(this.raf);
    this.lastTrail = null;
    this.drawField();
    this.drawRunners(bases);
    this.drawFielders(youPos, null);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }
}
