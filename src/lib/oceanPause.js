// ── Ocean pause — stand the dive down when nobody can see it ───────────
// A page is a sheet laid over the dive. On a wide screen the water is
// still in view, dimmed, either side of the sheet, so the dive keeps
// running the whole time the page is open. On a narrow screen the sheet
// covers everything, and then everything under it stops working: the
// depth loop skips its subscribers, and the loops that own their own rAF
// (boid school, GPU snow, god rays, crab, gyro) check isPaused() the same
// way they check document.hidden.
//
// CSS-side signals on :root —
//   .page-open   a page is open
//   .water-open  a page is open AND the water beside it is in view
//
// Transitions fire window CustomEvent 'ocean:pause' ({ detail: { paused } })
// for systems that only act on changes (the rays worker gets a posted
// visibility message — it is never terminated).

let pageOpen = false
let waterVisible = false
let paused = false

function apply() {
  const root = document.documentElement
  root.classList.toggle('page-open', pageOpen)
  root.classList.toggle('water-open', pageOpen && waterVisible)
  const next = pageOpen && !waterVisible
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
  apply()
}

// Whether the water either side of the open page's sheet is in view
// (PageLayer reports this from the viewport width)
export function setWaterVisible(visible) {
  waterVisible = visible
  apply()
}
