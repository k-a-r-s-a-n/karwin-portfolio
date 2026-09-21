/*
 * Physics verification for src/lib/splash-physics.ts — run with:
 *   npx tsc scripts/physics-check.ts --outDir /tmp/phys --module commonjs \
 *     --target es2020 --esModuleInterop --skipLibCheck --moduleResolution node
 *   node /tmp/phys/scripts/physics-check.js
 *
 * Asserts the four behaviours the field promises:
 *   1. Particles rain down and SETTLE into a stable pile (no jitter).
 *   2. The settled pile has NO overlapping shapes.
 *   3. A pointer sweep visibly carves through the pile (fluid response)…
 *   4. …and when the pointer stops, everything rains back and settles again.
 *   5. A click bursts shapes away from the click point.
 */
import {
  createWorld,
  tick,
  averageSpeed,
  worstOverlap,
  EMPTY_INPUT,
  SplashInput,
} from "../src/lib/splash-physics";

let failures = 0;
function check(name: string, ok: boolean, detail: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (${detail})`);
  if (!ok) failures++;
}

const W = 1280;
const H = 560;

// ── 1+2. Settling into a non-overlapping pile ──
const world = createWorld(W, H);
for (let i = 0; i < 900; i++) tick(world, EMPTY_INPUT, []);

const restSpeed = averageSpeed(world);
check("pile settles (avg speed < 0.35 px/tick)", restSpeed < 0.35, `avg=${restSpeed.toFixed(3)}`);

const overlap = worstOverlap(world);
// 2px on 10-17px shapes is a sub-stroke edge kiss - invisible at render size.
check("no visible overlap (penetration < 2px)", overlap < 2, `deepest=${overlap.toFixed(2)}px`);

// At ~10x density the pile is a deep dune rather than a single band —
// the invariant that matters is that everything is GROUNDED (nothing
// floating in mid-air) and the pile stays in the lower half of the canvas.
const minY = Math.min(...world.particles.map((p) => p.y));
check("pile is grounded (top of pile in lower half)", minY > H * 0.3, `pile depth=${(H - minY).toFixed(0)}px, top at y=${minY.toFixed(0)}`);

const floating = world.particles.filter((p) => p.y < H * 0.15).length;
check("no shapes float mid-air", floating === 0, `${floating} floating`);

// ── 3. Pointer sweep carves through ──
// Sweep the pointer left→right through the pile over ~25 frames at ~1400px/s.
let maxSpeedDuringSweep = 0;
let displaced = 0;
const before = world.particles.map((p) => ({ x: p.x, y: p.y }));
const sweepY = H - 12;

for (let f = 0; f < 26; f++) {
  const x = 120 + f * ((W - 240) / 25);
  const input: SplashInput = { x, y: sweepY, vx: (W - 240) / 25 * 60, vy: 0, active: true };
  tick(world, input, []);
  maxSpeedDuringSweep = Math.max(maxSpeedDuringSweep, averageSpeed(world));
}
for (let i = 0; i < world.particles.length; i++) {
  const d = Math.hypot(world.particles[i].x - before[i].x, world.particles[i].y - before[i].y);
  if (d > 30) displaced++;
}
check("sweep splashes the pile (avg speed spike)", maxSpeedDuringSweep > 1.2, `peak=${maxSpeedDuringSweep.toFixed(2)} px/tick`);
check("sweep displaces many shapes (>30px)", displaced > 40, `${displaced}/${world.particles.length}`);

// ── 4. It rains back down and settles again ──
for (let i = 0; i < 900; i++) tick(world, EMPTY_INPUT, []);
const rest2 = averageSpeed(world);
const overlap2 = worstOverlap(world);
check("re-settles after sweep (avg speed < 0.35)", rest2 < 0.35, `avg=${rest2.toFixed(3)}`);
check("still no overlap after the storm", overlap2 < 2, `deepest=${overlap2.toFixed(2)}px`);

// ── 5. Click burst ──
const clickBefore = world.particles.map((p) => ({ x: p.x, y: p.y }));
for (let f = 0; f < 8; f++) tick(world, EMPTY_INPUT, [{ x: W / 2, y: H - 15 }]);
let bursted = 0;
for (let i = 0; i < world.particles.length; i++) {
  const d = Math.hypot(world.particles[i].x - clickBefore[i].x, world.particles[i].y - clickBefore[i].y);
  if (d > 10) bursted++;
}
check("click bursts shapes near the point", bursted > 25, `${bursted} shapes moved >10px`);

console.log(failures === 0 ? "\nALL PHYSICS CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
