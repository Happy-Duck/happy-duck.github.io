// ── ROV Headlight — deep-zone darkness with a cursor light cone ────────
// The wrapper's opacity ramps in below depth ~0.55 (pure CSS, driven by
// --ocean-depth-progress). The "beam" is one huge radial-gradient div
// centered on the cursor and moved with transform — compositor-only,
// no repaints while the mouse moves.
import { useEffect, useRef } from 'react'

export function RovLight() {
  const beamRef = useRef(null)

  useEffect(() => {
    const beam = beamRef.current
    if (!beam) return

    // Touch devices keep the default fixed light (50% / 38%)
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e) => {
      beam.style.transform =
        `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="rov-dark" aria-hidden="true">
      <div ref={beamRef} className="rov-beam" />
    </div>
  )
}
