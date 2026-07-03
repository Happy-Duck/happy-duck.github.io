// ── Sonar ping — shared impulse state ──────────────────────────────────
// SonarPing.jsx fires pings (clicks / terminal); creature ticks query
// pingImpulse() and scatter away from the epicenter.

const ping = { x: 0, y: 0, t: -1e9 }

export function firePing(x, y) {
  ping.x = x
  ping.y = y
  ping.t = performance.now()
}

// Raw ping state — for GPU consumers that upload it as uniforms
export function getPing() {
  return ping
}

// Returns null if no active ping is in range of (x, y); otherwise the
// normalized away-vector and strength 0..1.
export function pingImpulse(x, y, radius = 320) {
  if (performance.now() - ping.t > 600) return null
  const dx = x - ping.x
  const dy = y - ping.y
  const dist = Math.hypot(dx, dy)
  if (dist >= radius || dist === 0) return null
  const str = (radius - dist) / radius
  return { str, ux: dx / dist, uy: dy / dist }
}
