// ── Bubble sim — lava-lamp motion for the course column ────────────────
// Soft circles in a box. Each bubble has its own slow buoyancy cycle
// (warm → rises, cool → sinks, 45–100 s periods, independent phases), a
// lazy sideways wander, soft repulsion from its neighbours and the
// walls, and a push away from the cursor and from sonar pings. No
// gravity, no hard collisions: neighbours are allowed to press into each
// other a little, which is what lets the metaball shader fuse them.
//
// Every constant is tuned per 60 fps step and scaled by dt (additive
// steps `* dt`, decays `Math.pow(k, dt)`), so the column moves at the
// same speed on any display.
//
// Pure module: no DOM, no React. CourseColumn.jsx owns the tick.

const BUOYANCY   = 0.012   // px/step² at the peak of a bubble's cycle
const WANDER     = 0.004   // px/step² sideways drift
const DRAG       = 0.965   // velocity kept per step — terminal speed ≈ 0.34 px/step
const PAIR_K     = 0.022   // spring per px of overlap between two bubbles
// Personal space, as a multiple of the two radii. The shader fuses two
// bubbles once the gap between them drops under ~0.38 r (a reach of
// 1.19), so this sits right on that edge: neighbours at rest are just
// apart and fuse only while something presses them together — necks
// form and break instead of freezing. VERY sensitive: measured over five
// simulated minutes, 1.16 keeps 13–20 pairs fused (a molecule diagram),
// 1.21 keeps none. Re-measure before changing it.
const PAIR_REACH = 1.19
const WALL_K     = 0.03    // spring per px past a wall
const MOUSE_R    = 120     // px — cursor's reach
const MOUSE_PUSH = 0.28    // px/step² at the cursor itself
const PING_PUSH  = 0.6     // px/step² from a sonar ping at its epicenter
const V_MAX      = 4       // px/step speed cap
const GROW       = 0.1     // radius lerp per step (scrubber in/out)

// Small seeded PRNG — the same column on every load (and every screenshot)
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createBubbleSim(count, seed = 418) {
  const rand = mulberry32(seed)
  const x  = new Float32Array(count)
  const y  = new Float32Array(count)
  const vx = new Float32Array(count)
  const vy = new Float32Array(count)
  const r  = new Float32Array(count)   // current radius (animates toward rt)
  const rt = new Float32Array(count)   // target radius; 0 = not in the column
  // Per-bubble cycle: angular speed (rad/step) and phase, for lift and wander
  const liftW  = Float32Array.from({ length: count }, () => (2 * Math.PI) / (60 * (45 + rand() * 55)))
  const liftP  = Float32Array.from({ length: count }, () => rand() * 2 * Math.PI)
  const driftW = Float32Array.from({ length: count }, () => (2 * Math.PI) / (60 * (20 + rand() * 30)))
  const driftP = Float32Array.from({ length: count }, () => rand() * 2 * Math.PI)

  let w = 1
  let h = 1
  let t = 0

  function resize(width, height) {
    w = Math.max(1, width)
    h = Math.max(1, height)
  }

  // Put a bubble in (or take it out of) the column. A bubble entering
  // starts below the floor and is carried up into view by the wall spring
  // — it rises out of the seep. `instant` skips the grow-in (first layout).
  function setRadius(i, radius, instant = false) {
    if (radius > 0 && rt[i] === 0 && !instant) {
      x[i] = radius + rand() * Math.max(1, w - 2 * radius)
      y[i] = h + radius * 0.5
      vx[i] = 0
      vy[i] = 0
    }
    rt[i] = radius
    if (instant) r[i] = radius
  }

  function scatter() {
    for (let i = 0; i < count; i++) {
      const rad = rt[i]
      x[i] = rad + rand() * Math.max(1, w - 2 * rad)
      y[i] = rad + rand() * Math.max(1, h - 2 * rad)
      vx[i] = 0
      vy[i] = 0
    }
  }

  // env.mouse: { x, y } in column coordinates, or null
  // env.ping:  (x, y) => { str, ux, uy } | null, in column coordinates
  function step(dt, env) {
    t += dt
    const drag = Math.pow(DRAG, dt)
    const grow = 1 - Math.pow(1 - GROW, dt)
    const mouse = env?.mouse || null
    const ping = env?.ping || null

    for (let i = 0; i < count; i++) {
      r[i] += (rt[i] - r[i]) * grow
      if (r[i] < 0.5) continue

      let ax = Math.sin(t * driftW[i] + driftP[i]) * WANDER
      let ay = -Math.sin(t * liftW[i] + liftP[i]) * BUOYANCY

      // Neighbours — soft spring on overlap
      for (let j = 0; j < count; j++) {
        if (j === i || r[j] < 0.5) continue
        const dx = x[i] - x[j]
        const dy = y[i] - y[j]
        const min = (r[i] + r[j]) * PAIR_REACH
        const d2 = dx * dx + dy * dy
        if (d2 >= min * min) continue
        const d = Math.sqrt(d2) || 0.001
        const f = (min - d) * PAIR_K
        ax += (dx / d) * f
        ay += (dy / d) * f
      }

      // Walls
      if (x[i] < r[i])     ax += (r[i] - x[i]) * WALL_K
      if (x[i] > w - r[i]) ax -= (x[i] - (w - r[i])) * WALL_K
      if (y[i] < r[i])     ay += (r[i] - y[i]) * WALL_K
      if (y[i] > h - r[i]) ay -= (y[i] - (h - r[i])) * WALL_K

      // Cursor
      if (mouse) {
        const dx = x[i] - mouse.x
        const dy = y[i] - mouse.y
        const d = Math.hypot(dx, dy)
        const reach = MOUSE_R + r[i]
        if (d < reach && d > 0) {
          const f = (1 - d / reach) * MOUSE_PUSH
          ax += (dx / d) * f
          ay += (dy / d) * f
        }
      }

      vx[i] = (vx[i] + ax * dt) * drag
      vy[i] = (vy[i] + ay * dt) * drag

      // Sonar — pushes for as long as the ping reports (~600 ms); the
      // speed cap below keeps the scatter from turning into a launch
      if (ping) {
        const p = ping(x[i], y[i])
        if (p) {
          vx[i] += p.ux * p.str * PING_PUSH * dt
          vy[i] += p.uy * p.str * PING_PUSH * dt
        }
      }

      const sp = Math.hypot(vx[i], vy[i])
      if (sp > V_MAX) {
        vx[i] *= V_MAX / sp
        vy[i] *= V_MAX / sp
      }
    }

    for (let i = 0; i < count; i++) {
      if (r[i] < 0.5) continue
      x[i] += vx[i] * dt
      y[i] += vy[i] * dt
    }
  }

  // Run the sim forward with nothing disturbing it — used to untangle the
  // random first layout before anything is drawn
  function settle(steps = 300) {
    for (let s = 0; s < steps; s++) step(1, null)
  }

  return { count, x, y, r, rt, resize, setRadius, scatter, step, settle }
}
