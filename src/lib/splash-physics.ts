/**
 * Splash-field physics — pure module, no DOM.
 *
 * Verlet integration (position-based dynamics): velocity is implied by the
 * previous position, constraints project positions directly. This is the
 * classic approach for sand/pile simulations because piles come to rest
 * without jitter and shapes settle into a stable, non-overlapping packing.
 *
 * Everything is expressed per fixed 1/60s tick (the caller accumulates real
 * time and drains fixed steps), which keeps the simulation deterministic and
 * unit-testable.
 *
 * Units: positions in px, implied velocities in px/tick.
 * Pointer velocity arrives in px/s and is scaled by dt at the point of use.
 */

export const SHAPE_RECT = 0;
export const SHAPE_CIRCLE = 1;
export const SHAPE_TRIANGLE = 2;
export const SHAPE_CROSS = 3;
export const SHAPE_PLUS = 4;
export const SHAPE_RING = 5;

export interface SplashParticle {
  x: number;
  y: number;
  /** Previous position — the Verlet "velocity memory". */
  ox: number;
  oy: number;
  angle: number;
  /** Angular velocity, rad/tick. */
  av: number;
  /** Collision radius; drawn extents stay within this. */
  r: number;
  shape: number;
  /** 0 = primary ink, 1 = inverse sparkle. */
  tone: 0 | 1;
}

export interface SplashInput {
  /** Pointer position in canvas coordinates. */
  x: number;
  y: number;
  /** Pointer velocity in px/s. */
  vx: number;
  vy: number;
  /** When false the pointer exerts no force. */
  active: boolean;
}

export const EMPTY_INPUT: SplashInput = {
  x: -9999,
  y: -9999,
  vx: 0,
  vy: 0,
  active: false,
};

const GRAVITY = 1250; // px/s²
const AIR = 0.988; // implied-velocity retention per tick
const POINTER_RADIUS = 130;
const POINTER_ENTRAIN = 1.15; // how strongly the pointer drags shapes with it
const POINTER_RADIAL = 300; // px/s of gentle inflation around the pointer
const FLOOR_FRICTION = 0.55; // tangential velocity kept on floor contact
const WALL_RESTITUTION = 0.4;
const COLLISION_ITERS = 3;
const CELL = 22;

const SHAPE_WEIGHTS: [number, number][] = [
  [SHAPE_RECT, 0.24],
  [SHAPE_CIRCLE, 0.2],
  [SHAPE_TRIANGLE, 0.16],
  [SHAPE_CROSS, 0.16],
  [SHAPE_PLUS, 0.14],
  [SHAPE_RING, 0.1],
];

function pickShape(): number {
  let r = Math.random();
  for (const [shape, w] of SHAPE_WEIGHTS) {
    r -= w;
    if (r <= 0) return shape;
  }
  return SHAPE_CIRCLE;
}

export interface SplashWorld {
  particles: SplashParticle[];
  width: number;
  height: number;
}

export function createWorld(width: number, height: number): SplashWorld {
  const count = Math.max(120, Math.min(340, Math.round(width * 0.14)));
  const particles: SplashParticle[] = [];

  for (let i = 0; i < count; i++) {
    const r = 5 + Math.random() * 3.4; // 5 … 8.4
    const x = r + Math.random() * (width - r * 2);
    const y = -Math.random() * height * 0.6;
    particles.push({
      x,
      y,
      ox: x,
      oy: y,
      angle: Math.random() * Math.PI * 2,
      av: (Math.random() - 0.5) * 0.06,
      r,
      shape: pickShape(),
      tone: Math.random() < 0.14 ? 1 : 0,
    });
  }

  return { particles, width, height };
}

/** Spatial hash over the current positions. */
class Grid {
  cols: number;
  rows: number;
  head: Int32Array;
  next: Int32Array;

  constructor(width: number, height: number, n: number) {
    this.cols = Math.max(1, Math.ceil(width / CELL));
    this.rows = Math.max(1, Math.ceil(height / CELL));
    this.head = new Int32Array(this.cols * this.rows).fill(-1);
    this.next = new Int32Array(n);
  }

  cell(x: number, y: number): number {
    const c = Math.min(this.cols - 1, Math.max(0, Math.floor(x / CELL)));
    const r = Math.min(this.rows - 1, Math.max(0, Math.floor(y / CELL)));
    return r * this.cols + c;
  }

  build(particles: SplashParticle[]) {
    this.head.fill(-1);
    for (let i = 0; i < particles.length; i++) {
      const idx = this.cell(particles[i].x, particles[i].y);
      this.next[i] = this.head[idx];
      this.head[idx] = i;
    }
  }
}

let grid: Grid | null = null;

/**
 * Advance the world by one fixed 1/60s tick.
 * `clicks` are canvas-space burst points applied at the start of the tick.
 */
export function tick(
  world: SplashWorld,
  input: SplashInput,
  clicks: { x: number; y: number }[]
): void {
  const { particles, width, height } = world;
  const dt = 1 / 60;
  const dt2 = dt * dt;
  const n = particles.length;

  // ── Click bursts: radial impulse + upward bias + spin ──
  for (const click of clicks) {
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const dx = p.x - click.x;
      const dy = p.y - click.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const R = 220;
      if (d < R) {
        const f = 1 - d / R;
        const power = f * (7 + Math.random() * 5); // px/tick impulse
        p.ox -= (dx / d) * power;
        p.oy -= (dy / d) * power - f * 5; // upward bias
        p.av += (Math.random() - 0.5) * 0.5 * f;
      }
    }
  }

  // ── Integrate + pointer forces ──
  for (let i = 0; i < n; i++) {
    const p = particles[i];

    const vx = (p.x - p.ox) * AIR;
    const vy = (p.y - p.oy) * AIR + GRAVITY * dt2;

    p.ox = p.x;
    p.oy = p.y;
    p.x += vx;
    p.y += vy;

    if (input.active) {
      const dx = p.x - input.x;
      const dy = p.y - input.y;
      const d = Math.hypot(dx, dy);
      if (d < POINTER_RADIUS) {
        const f = 1 - d / POINTER_RADIUS;
        // Entrainment: shapes get dragged along with the moving pointer
        // (px/s scaled into px/tick). This is what makes a sweep carve.
        const drag = f * POINTER_ENTRAIN * dt;
        p.x += input.vx * drag;
        p.y += input.vy * drag;
        // Gentle radial inflation so the pile loosens around the pointer.
        if (d > 0.5) {
          const f2 = f * f;
          p.x += (dx / d) * f2 * POINTER_RADIAL * dt;
          p.y += (dy / d) * f2 * POINTER_RADIAL * dt;
        }
        p.av += (input.vx * 0.00002 + (Math.random() - 0.5) * 0.02) * f;
      }
    }

    // Tumble driven by motion.
    p.av += vx * 0.0035;
    p.av *= 0.985;
    p.angle += p.av;
  }

  // ── Collision constraints (this is what prevents overlap) ──
  if (!grid || grid.next.length !== n || grid.cols * CELL < width) {
    grid = new Grid(width, height, n);
  }
  grid.build(particles);

  for (let iter = 0; iter < COLLISION_ITERS; iter++) {
    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const c = Math.min(grid.cols - 1, Math.max(0, Math.floor(p.x / CELL)));
      const r = Math.min(grid.rows - 1, Math.max(0, Math.floor(p.y / CELL)));

      for (let ro = -1; ro <= 1; ro++) {
        const rr = r + ro;
        if (rr < 0 || rr >= grid.rows) continue;
        for (let co = -1; co <= 1; co++) {
          const cc = c + co;
          if (cc < 0 || cc >= grid.cols) continue;

          let j = grid.head[rr * grid.cols + cc];
          while (j !== -1) {
            if (j > i) {
              const q = particles[j];
              const ddx = q.x - p.x;
              const ddy = q.y - p.y;
              const minD = (p.r + q.r) * 0.96;
              const d2 = ddx * ddx + ddy * ddy;
              if (d2 < minD * minD && d2 > 0.0001) {
                const d = Math.sqrt(d2);
                // Split the correction evenly — a firm positional projection.
                const push = ((minD - d) / d) * 0.5;
                const ox = ddx * push;
                const oy = ddy * push;
                p.x -= ox;
                p.y -= oy;
                q.x += ox;
                q.y += oy;
              }
            }
            j = grid.next[j];
          }
        }
      }
    }
  }

  // ── Boundaries with friction so the pile settles instead of sliding ──
  for (let i = 0; i < n; i++) {
    const p = particles[i];

    if (p.y > height - p.r) {
      p.y = height - p.r;
      // Floor friction: damp the implied tangential velocity.
      p.ox = p.x - (p.x - p.ox) * FLOOR_FRICTION;
      // Restitution via the implied normal velocity.
      p.oy = p.y + (p.y - p.oy) * 0.25;
    } else if (p.y < p.r) {
      p.y = p.r;
      p.oy = p.y + (p.y - p.oy) * WALL_RESTITUTION;
    }

    if (p.x < p.r) {
      p.x = p.r;
      p.ox = p.x + (p.x - p.ox) * WALL_RESTITUTION;
    } else if (p.x > width - p.r) {
      p.x = width - p.r;
      p.ox = p.x + (p.x - p.ox) * WALL_RESTITUTION;
    }
  }
}

/** Average implied speed in px/tick — used to assert the pile is at rest. */
export function averageSpeed(world: SplashWorld): number {
  let total = 0;
  for (const p of world.particles) {
    total += Math.hypot(p.x - p.ox, p.y - p.oy);
  }
  return total / world.particles.length;
}

/** Worst pairwise penetration factor (1 = touching, < 1 = gap). */
export function worstOverlap(world: SplashWorld): number {
  let worst = 0;
  const { particles } = world;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      const minD = (a.r + b.r) * 0.96;
      if (d < minD) {
        worst = Math.max(worst, minD - d);
      }
    }
  }
  return worst; // px of deepest penetration
}
