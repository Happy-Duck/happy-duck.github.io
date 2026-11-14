// ── Porthole — a real window from the page onto the dive ───────────────
// The page is the inside of the sub. This is not a picture of the ocean:
// the glass is a hole in the page layer, and what shows through is the
// live dive underneath, at the depth the visitor left it (for a direct
// landing, the depth of the entry's card).
//
// How the hole is cut: while the porthole is on screen the page layer's
// own background is switched off (:root.porthole-open) and the glass
// casts a 200vmax box-shadow in the same color — everything except the
// circle stays covered. The shadow is part of the scrolling content, so
// the hole tracks the frame on the compositor with no scroll lag.
//
// lib/oceanPause.js un-pauses the dive while this is visible and stands
// it down again when it scrolls away or the page closes.
import { useEffect, useRef } from 'react'
import { setPortholeVisible } from '../../lib/oceanPause'
import { useOceanDepth } from '../../hooks/useOceanDepth'

export function Porthole() {
  const glassRef = useRef(null)
  const { depthMeters, zone } = useOceanDepth()

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

  // Decorative: the same depth is announced by the "Back to the dive" link
  return (
    <div className="porthole" aria-hidden="true">
      <div className="porthole-window">
        {/* The glass's shadow is the page's background, so it must paint
            under everything else: index.css puts all page content, and
            this frame (rim + lens), at z-index 1 above it. */}
        <div className="porthole-glass" ref={glassRef} />
        <div className="porthole-frame" />
      </div>
      <span className="porthole-caption">
        <span className="porthole-live">live</span>
        {depthMeters.toLocaleString()} m · {zone.label}
      </span>
    </div>
  )
}
