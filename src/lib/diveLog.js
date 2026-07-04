// ── Dive log store — discovery + persistence ──────────────────────────
// Discovery is deliberate: the diver has to point at a creature (cursor
// dwelling on its body) or click/tap it (a sonar ping landing on it) —
// passive visibility doesn't count. Creatures call inspectSeen(id, x, y,
// r, mouse) every visible frame with their screen-space center and hit
// radius. markSeen(id) is immediate (crab poke, whale sighting).
// Discovery fires a window CustomEvent 'ocean:discovery' that the
// DiveLog UI listens for.

import { getPing } from './sonar'

const KEY = 'ocean.diveLog'
const HOVER_FRAMES = 8 // ~0.13s of cursor contact — a graze, not a fly-by
const CLICK_MS = 300 // a ping this fresh counts as a click at that spot

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

const store = loadStore() // { [speciesId]: { ts } }
const hover = Object.create(null) // { [speciesId]: { n, last } }

export function getDiscovered() {
  return store
}

export function isDiscovered(id) {
  return Boolean(store[id])
}

export function markSeen(id) {
  if (store[id]) return
  store[id] = { ts: Date.now() }
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // private mode — discoveries just won't persist
  }
  window.dispatchEvent(new CustomEvent('ocean:discovery', { detail: { id } }))
}

// Per-frame pointer check: hover (with a short dwell so sweeping the
// cursor across the screen doesn't log every fish it crosses) or a
// click/tap — the sonar ping doubles as the touch path on mobile.
// `dwell` overrides the contact-tick count for slow-polling callers.
export function inspectSeen(id, x, y, r, mouse, dwell = HOVER_FRAMES) {
  if (store[id]) return

  const ping = getPing()
  if (
    performance.now() - ping.t < CLICK_MS &&
    Math.hypot(ping.x - x, ping.y - y) < r * 1.4
  ) {
    markSeen(id)
    return
  }

  if (!mouse || Math.hypot(mouse.x - x, mouse.y - y) >= r) return

  // Count contact ticks, resetting on a GAP in contact rather than on
  // every miss — multi-instance species (two jellies, two squid, three
  // clownfish) share an id, and the far twin's misses would otherwise
  // zero the counter every frame. The gap allows for slow inspectors:
  // the boid school only polls every 4th frame (GPU readback).
  const now = performance.now()
  const h = hover[id] || (hover[id] = { n: 0, last: 0 })
  h.n = now - h.last < 150 ? h.n + 1 : 1
  h.last = now
  if (h.n >= dwell) markSeen(id)
}
