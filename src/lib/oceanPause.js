// ── Ocean pause — stand the dive down while a page covers it ───────────
// An expedition-file page is an opaque layer over the dive. Nothing under
// it is visible, so everything under it stops working: the depth loop
// skips its subscribers, and the loops that own their own rAF (boid
// school, GPU snow, god rays, crab, gyro) check isPaused() the same way
// they check document.hidden.
//
// One exception: the porthole in a page's header (pages/Porthole.jsx) is
// a real window onto the dive. While it is on screen the ocean layers are
// shown again and the dive runs; scroll it away and everything stands
// back down.
//
// CSS-side signals on :root —
//   .page-open      a page is open
//   .porthole-open  a page is open AND its porthole is on screen
//
// Transitions fire window CustomEvent 'ocean:pause' ({ detail: { paused } })
// for systems that only act on changes (the rays worker gets a posted
// visibility message — it is never terminated).

let pageOpen = false
let porthole = false
let paused = false

function apply() {
  const root = document.documentElement
  root.classList.toggle('page-open', pageOpen)
  root.classList.toggle('porthole-open', pageOpen && porthole)
  const next = pageOpen && !porthole
  if (next === paused) return
  paused = next
  window.dispatchEvent(new CustomEvent('ocean:pause', { detail: { paused } }))
}

export function isPaused() {
  return paused
}

// A page opened (true) or closed (false) over the dive
export function setOceanPaused(open) {
  pageOpen = open
  if (!open) porthole = false
  apply()
}

// The open page's porthole scrolled into (true) or out of (false) view
export function setPortholeVisible(visible) {
  porthole = visible
  apply()
}
