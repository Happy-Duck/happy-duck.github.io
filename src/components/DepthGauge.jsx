// ── Depth Gauge — fixed right edge ─────────────────────────────────────
// Hidden on mobile. Shows the zone and depth in metres, and doubles as
// the page's table of contents: each section marked data-waypoint gets a
// tick on the track at the depth where it starts, and clicking a tick
// dives there. The readout itself is decorative (aria-hidden); the ticks
// are real buttons inside a <nav>.
import { useEffect, useState } from 'react'
import { useOceanDepth } from '../hooks/useOceanDepth'

const TRACK = 140 // px, matches .depth-gauge-track

export function DepthGauge() {
  const { depth, depthMeters, zone } = useOceanDepth()
  const markerTop = Math.round(depth * TRACK)
  const [waypoints, setWaypoints] = useState([])

  // Where each section starts, as a fraction of the dive. Re-measured
  // whenever the page changes length (fonts, the lazy course column,
  // window resize) — the observer also fires once on attach, which is
  // the first measurement.
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      setWaypoints([...document.querySelectorAll('[data-waypoint]')].map(el => ({
        id: el.id,
        label: el.dataset.waypoint,
        at: Math.max(0, Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max)),
      })))
    }
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  const diveTo = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 16,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }

  return (
    <div className="depth-gauge" style={{ opacity: 1 }}>
      {/* Zone name */}
      <span className="depth-gauge-zone" aria-hidden="true">{zone.label}</span>

      {/* Track + marker + section ticks */}
      <div className="depth-gauge-track">
        <div className="depth-gauge-marker" style={{ top: markerTop }} aria-hidden="true" />
        <nav aria-label="Sections">
          {waypoints.map(w => (
            <button
              key={w.id}
              type="button"
              className="depth-gauge-stop"
              style={{ top: Math.round(w.at * TRACK) }}
              onClick={() => diveTo(w.id)}
            >
              <span className="depth-gauge-stop-label">{w.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Depth in meters */}
      <span className="depth-gauge-meters" aria-hidden="true">{depthMeters.toLocaleString()}m</span>
    </div>
  )
}
