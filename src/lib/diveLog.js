// ── Dive log store — discovery accumulation + persistence ─────────────
// Creatures call tickSeen(id) every visible frame; ~1.5s of cumulative
// visibility marks the species discovered. markSeen(id) is immediate
// (crab poke, whale sighting). Discovery fires a window CustomEvent
// 'ocean:discovery' that the DiveLog UI listens for.

const KEY = 'ocean.diveLog'
const NEED_FRAMES = 90 // ~1.5s at 60fps

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

const store = loadStore() // { [speciesId]: { ts } }
const frames = Object.create(null)

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

export function tickSeen(id) {
  if (store[id]) return
  frames[id] = (frames[id] || 0) + 1
  if (frames[id] >= NEED_FRAMES) markSeen(id)
}
