// ── Ocean pause — stand the dive down while a page covers it ───────────
// An expedition-file page is an opaque layer over the dive. Nothing under
// it is visible, so everything under it stops working: the depth loop
// skips its subscribers, and the loops that own their own rAF (boid
// school, GPU snow, god rays, crab, gyro) check isPaused() the same way
// they check document.hidden. `:root.page-open` is the CSS-side signal.
//
// Transitions fire window CustomEvent 'ocean:pause' ({ detail: { paused } })
// for systems that only act on changes (the rays worker gets a posted
// visibility message — it is never terminated).

let paused = false

export function isPaused() {
  return paused
}

export function setOceanPaused(next) {
  if (next === paused) return
  paused = next
  document.documentElement.classList.toggle('page-open', paused)
  window.dispatchEvent(new CustomEvent('ocean:pause', { detail: { paused } }))
}
