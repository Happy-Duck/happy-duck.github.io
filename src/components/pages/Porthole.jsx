// ── Porthole — a window from the page onto the dive ────────────────────
// The page is the inside of the sub. This is not a picture of the ocean:
// the glass is a hole cut in the sheet, and what shows through is the
// live dive underneath at the depth the visitor left it (for a direct
// landing, the depth of the entry's card).
//
// Second version. The first was removed because, with the water already
// in view either side of the sheet, it showed the same thing twice. What
// is different now is that the water beside the sheet is dimmed and the
// water in the glass is not: the porthole is the one clear, lit view
// out, and an animal crossing behind the page passes through it at full
// strength. On a screen too narrow for water beside the sheet it is the
// only view of the dive there is.
//
// How the hole is cut (pages.css): the sheet's background is a
// pseudo-element masked with a radial gradient, centered on --ph-x /
// --ph-y with radius --ph-r. The glass and the sheet scroll together, so
// those are fixed by layout, not by scroll position: they are measured
// here whenever the sheet changes size and never while scrolling. The
// dimming over the water (.page-layer) leaves the column under the sheet
// clear, so nothing dims the view through the hole.
//
// lib/oceanPause.js keeps the dive running while the glass is on screen
// (on a narrow screen that is the only time it runs under a page).
import { useEffect, useLayoutEffect, useRef } from 'react'
import { setPortholeVisible } from '../../lib/oceanPause'
import { useOceanDepth } from '../../hooks/useOceanDepth'

export function Porthole() {
  const glassRef = useRef(null)
  const { depthMeters, zone } = useOceanDepth()

  // Where the hole goes, in the sheet's own coordinates
  useLayoutEffect(() => {
    const glass = glassRef.current
    const sheet = glass?.closest('.page-sheet')
    if (!sheet) return
    const measure = () => {
      const g = glass.getBoundingClientRect()
      const s = sheet.getBoundingClientRect()
      sheet.style.setProperty('--ph-x', `${g.left - s.left + g.width / 2}px`)
      sheet.style.setProperty('--ph-y', `${g.top - s.top + g.height / 2}px`)
      sheet.style.setProperty('--ph-r', `${g.width / 2}px`)
    }
    measure()
    // The sheet changes size when the write-up arrives, fonts load, or
    // the window is resized; the header when the title re-wraps
    const ro = new ResizeObserver(measure)
    ro.observe(sheet)
    ro.observe(glass.closest('.entry-head') || glass)
    return () => {
      ro.disconnect()
      for (const v of ['--ph-x', '--ph-y', '--ph-r']) sheet.style.removeProperty(v)
    }
  }, [])

  useEffect(() => {
    const glass = glassRef.current
    if (!glass) return
    const io = new IntersectionObserver(
      ([entry]) => setPortholeVisible(entry.isIntersecting),
      { root: glass.closest('.page-scroll') },
    )
    io.observe(glass)
    return () => {
      io.disconnect()
      setPortholeVisible(false)
    }
  }, [])

  // Decorative: the same depth is read out by the "Back to the dive" link
  return (
    <div className="porthole" aria-hidden="true">
      <div className="porthole-window">
        <div className="porthole-glass" ref={glassRef} />
        <div className="porthole-lens" />
        <div className="porthole-rim" />
      </div>
      <p className="porthole-caption">
        <span className="porthole-depth">{depthMeters.toLocaleString()} m</span>
        <span>outside, {zone.label.toLowerCase()}</span>
      </p>
    </div>
  )
}
