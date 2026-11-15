// ── Depth Gauge — fixed right edge ─────────────────────────────────────
// Shows the zone and depth in metres, and doubles as the page's table of
// contents: each section marked data-waypoint gets a tick on the track
// at the depth where it starts, and clicking a tick dives there. The
// readout itself is decorative (aria-hidden); the ticks are real buttons
// inside a <nav>.
//
// A phone has no room for the track, so there the same data is a small
// depth readout in the top corner that opens the list of sections
// (SectionMenu). CSS shows one or the other at 768px.
import { useEffect, useRef, useState } from 'react'
import { useOceanDepth } from '../hooks/useOceanDepth'
import { metersAt } from '../constants/depthZones'

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
    <>
    <SectionMenu waypoints={waypoints} depth={depth} depthMeters={depthMeters} onGo={diveTo} />
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
    </>
  )
}

// ── Section menu — the gauge's phone form ──────────────────────────────
// The button is the depth readout; pressing it lists the sections with
// the depth each starts at. The section you are in is marked.

function SectionMenu({ waypoints, depth, depthMeters, onGo }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const stops = [{ id: null, label: 'Surface', at: 0 }, ...waypoints]
  // the last stop whose start has been passed (with a little slack, so a
  // section counts as soon as its heading is on screen)
  const current = stops.reduce((cur, s) => (s.at <= depth + 0.02 ? s.label : cur), 'Surface')

  const go = (id) => {
    setOpen(false)
    if (id) onGo(id)
    else {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  return (
    <div className="depth-menu" data-no-ping ref={ref}>
      {/* While the list is open, a tap on the dive only closes it. Without
          this the same tap would also open whatever card was under it. */}
      {open && <div className="depth-menu-scrim" onClick={() => setOpen(false)} />}
      <button
        type="button"
        className="depth-menu-btn"
        aria-expanded={open}
        aria-controls="depth-menu-list"
        aria-label={`Sections. Depth ${depthMeters.toLocaleString()} metres`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="depth-menu-meters" aria-hidden="true">{depthMeters.toLocaleString()} m</span>
        <svg className="depth-menu-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1.5 1.5 L6 6 L10.5 1.5" /></svg>
      </button>
      {open && (
        <nav id="depth-menu-list" className="depth-menu-list" aria-label="Sections">
          {stops.map(s => (
            <button
              key={s.label}
              type="button"
              className="depth-menu-item"
              aria-current={s.label === current ? 'location' : undefined}
              onClick={() => go(s.id)}
            >
              <span>{s.label}</span>
              <span className="depth-menu-at">{Math.round(metersAt(s.at)).toLocaleString()} m</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
