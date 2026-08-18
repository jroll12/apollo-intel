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

const SKY = '#D9E9F4';
const GRASS = '#4F9E4A';
const GRASS_DARK = '#458B41';
const DIRT = '#C68B54';
const DIRT_EDGE = 'rgba(90, 58, 28, 0.35)';
const LINE = '#FFFFFF';

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

    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, this.w, this.h);

    // Outfield turf, then one mown band. Two tones read as depth; three read
    // as stripes.
    ctx.fillStyle = GRASS;
    ctx.beginPath();
    this.arcPath(OUTFIELD_FENCE, true);
    ctx.fill();

    ctx.fillStyle = GRASS_DARK;
    ctx.beginPath();
    this.arcPath(148, true);
    ctx.fill();

    // Skinned infield: dirt arc with a soft edge where it meets the turf.
    ctx.fillStyle = DIRT;
    ctx.beginPath();
    this.arcPath(96, true);
    ctx.fill();
    ctx.strokeStyle = DIRT_EDGE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.arcPath(96, true);
    ctx.stroke();

    // Grass inside the basepaths — a true diamond shrunk toward its own
    // centre, not hand-nudged corners, so all four sides stay parallel to the
    // basepaths.
    ctx.fillStyle = GRASS;
    ctx.beginPath();
    this.polygon(this.infieldGrass());
    ctx.fill();
    ctx.strokeStyle = DIRT_EDGE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.polygon(this.infieldGrass());
    ctx.stroke();

    // Mound
    ctx.fillStyle = DIRT;
    ctx.beginPath();
    this.circlePath(0, 46, 8);
    ctx.fill();
    ctx.strokeStyle = DIRT_EDGE;
    ctx.beginPath();
    this.circlePath(0, 46, 8);
    ctx.stroke();

    // Foul lines
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      const [x0, y0] = this.project(0, 1.5);
      const [x1, y1] = this.project(sign * 141, 141);
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    for (const key of ['first', 'second', 'third']) this.baseMark(BASES[key], false);
    this.plateMark();
  }

  /** The four corners of the infield grass, inset from the basepaths. */
  infieldGrass() {
    const inset = 11; // feet in from each basepath
    const cx = 0;
    const cy = BASES.second[1] / 2;
    const shrink = 1 - inset / 34;
    return [BASES.home, BASES.first, BASES.second, BASES.third].map(([x, y]) => [
      cx + (x - cx) * shrink,
      cy + (y - cy) * shrink,
    ]);
  }

  /** A circle on the ground plane, projected — so it flattens with distance. */
  circlePath(cx, cy, radius) {
    const { ctx } = this;
    const steps = 22;
    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * Math.PI * 2;
      const [sx, sy] = this.project(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
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

  /**
   * Bases and the plate are drawn at a CONSTANT screen size, like the fielder
   * markers, rather than projected in perspective. Perspective is correct but
   * flattens second base into a sliver at that depth, and this drawing is a
   * diagram first — every base has to stay equally readable.
   */
  baseMark([x, y], occupied) {
    const { ctx } = this;
    const [sx, sy] = this.project(x, y);
    const w = 7.5;
    const h = 4.6;

    ctx.beginPath();
    ctx.moveTo(sx, sy - h);
    ctx.lineTo(sx + w, sy);
    ctx.lineTo(sx, sy + h);
    ctx.lineTo(sx - w, sy);
    ctx.closePath();

    ctx.fillStyle = occupied ? '#F88800' : '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = occupied ? '#8A4A0C' : 'rgba(70, 45, 22, 0.65)';
    ctx.stroke();
  }

  plateMark() {
    const { ctx } = this;
    const [sx, sy] = this.project(0, 0);
    const w = 6;

    ctx.beginPath();
    ctx.moveTo(sx - w, sy - 3);
    ctx.lineTo(sx + w, sy - 3);
    ctx.lineTo(sx + w, sy + 1);
    ctx.lineTo(sx, sy + 5);
    ctx.lineTo(sx - w, sy + 1);
    ctx.closePath();

    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = 'rgba(70, 45, 22, 0.65)';
    ctx.stroke();
  }

  /* ---------- Fielders ----------------------------------------------------- */

  drawFielders(youPos, highlightPos) {
    const { ctx } = this;
    for (const [pos, [x, y]] of Object.entries(FIELDER_SPOTS)) {
      const [sx, sy] = this.project(x, y);
      const isYou = pos === youPos;
      const isBall = pos === highlightPos;
      // Constant size, not scaled by depth: these are labels, and a two-letter
      // label needs room whether it is at first base or on the warning track.
      const r = isYou ? 12.5 : 10.5;
      const cy = sy - r * 0.55;

      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 1.5, r * 0.7, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = isYou ? '#F88800' : '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = isYou ? 2.5 : 1.75;
      ctx.strokeStyle = isYou ? '#8A4A0C' : isBall ? '#B26010' : 'rgba(40, 30, 20, 0.6)';
      ctx.stroke();

      ctx.font = `800 ${isYou ? 12 : 10.5}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#121212';
      ctx.fillText(pos, sx, cy + 0.5);
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
