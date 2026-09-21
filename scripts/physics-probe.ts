import { tick, worstOverlap, averageSpeed, EMPTY_INPUT, type SplashWorld, type SplashParticle } from "../src/lib/splash-physics";

function makeWorld(W: number, H: number, count: number): SplashWorld {
  const particles: SplashParticle[] = [];
  for (let i = 0; i < count; i++) {
    const r = 5 + Math.random() * 3.4;
    const x = r + Math.random() * (W - r * 2);
    const y = -Math.random() * H;
    particles.push({ x, y, ox: x, oy: y, angle: 0, av: 0, r, shape: 1, tone: 0 });
  }
  return { particles, width: W, height: H };
}

function report(name: string, W: number, H: number, world: SplashWorld) {
  const minY = Math.min(...world.particles.map(p => p.y));
  const depth = Math.max(1, H - minY);
  const area = world.particles.reduce((s, p) => s + Math.PI * p.r * p.r, 0);
  const packing = (area / (W * depth)) * 100;
  const pen = worstOverlap(world);
  const speed = averageSpeed(world);
  // % of pairs overlapping >2px
  let bad = 0;
  const ps = world.particles;
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++) {
      const d = Math.hypot(ps[j].x - ps[i].x, ps[j].y - ps[i].y);
      if ((ps[i].r + ps[j].r) * 0.96 - d > 2) bad++;
    }
  console.log(`${name}: count=${ps.length} depth=${depth.toFixed(0)}px packing=${packing.toFixed(1)}% worstPen=${pen.toFixed(2)}px badPairs=${bad} (${((bad / ps.length) * 100).toFixed(1)}% of particles) avgSpeed=${speed.toFixed(3)}`);
}

// Low density: 200 shapes, wide canvas
const a = makeWorld(1280, 560, 200);
for (let i = 0; i < 700; i++) tick(a, EMPTY_INPUT, []);
report("LOW  200 ", 1280, 560, a);

// Medium: 600
const b = makeWorld(1280, 560, 600);
for (let i = 0; i < 800; i++) tick(b, EMPTY_INPUT, []);
report("MED  600 ", 1280, 560, b);

// High: 1792 (the 10x target)
const c = makeWorld(1280, 560, 1792);
for (let i = 0; i < 900; i++) tick(c, EMPTY_INPUT, []);
report("HIGH 1792", 1280, 560, c);

// High with a taller canvas (the room it wants)
const d = makeWorld(1280, 800, 1792);
for (let i = 0; i < 1000; i++) tick(d, EMPTY_INPUT, []);
report("HIGH+800h", 1280, 800, d);
