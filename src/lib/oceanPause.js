// ── Ocean pause — stand the dive down when nobody can see it ───────────
// A page is a sheet laid over the dive. On a wide screen the water is
// still in view, dimmed, either side of the sheet, so the dive keeps
// running the whole time the page is open. On a narrow screen the sheet
// covers everything except the porthole in the page header, so the dive
// runs while that is on screen and, once it has scrolled away,
// everything under the sheet stops working: the
// depth loop skips its subscribers, and the loops that own their own rAF
// (boid school, GPU snow, god rays, crab, gyro) check isPaused() the same
// way they check document.hidden.
//
// CSS-side signals on :root —
//   .page-open   a page is open
//   .water-open  a page is open AND some water is in view (beside the
//                sheet, or through the porthole)
//
// Transitions fire window CustomEvent 'ocean:pause' ({ detail: { paused } })
// for systems that only act on changes (the rays worker gets a posted
// visibility message — it is never terminated).

let pageOpen = false
let waterVisible = false
let portholeVisible = false
let paused = false

function apply() {
  const root = document.documentElement
  const water = waterVisible || portholeVisible
  root.classList.toggle('page-open', pageOpen)
  root.classList.toggle('water-open', pageOpen && water)
  const next = pageOpen && !water
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

// Whether the porthole in the page header is on screen (Porthole.jsx)
export function setPortholeVisible(visible) {
  portholeVisible = visible
  apply()
}
