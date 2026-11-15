// ── Engine controls — drive the real dive from a page ──────────────────
// Used on the page about this site. The page is a sheet over the dive
// and the water stays in view either side of it, so these are not a demo:
// they act on the live systems through the same events the terminal
// uses (ocean:set-tod, ocean:ping, ocean:summon-whale) and by moving the
// dive itself to another depth.
//
// Everything is put back when the page closes: the visitor returns to
// the depth and the time of day they left.
import { useEffect, useRef, useState } from 'react'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { depthAtMeters, metersAt, getZone } from '../../constants/depthZones'

const DEPTHS = [50, 600, 2500, 5500]
const TIMES = [
  { id: 'dawn', label: 'Dawn' },
  { id: 'day', label: 'Day' },
  { id: 'dusk', label: 'Dusk' },
]

export default function EngineControls() {
  const { subscribe, depthRef } = useOceanDepthContext()
  const [tod, setTod] = useState(null)
  const [wide, setWide] = useState(true)
  const frameRef = useRef(null)
  const depthOut = useRef(null)

  // Put the dive back the way it was found
  useEffect(() => {
    const startY = window.scrollY
    return () => {
      window.scrollTo({ top: startY, behavior: 'instant' })
      window.dispatchEvent(new CustomEvent('ocean:set-tod', { detail: {} }))
    }
  }, [])

  // Is any water in view beside the sheet? (same breakpoint as PageLayer)
  useEffect(() => {
    const q = window.matchMedia('(min-width: 1121px)')
    const report = () => setWide(q.matches)
    report()
    q.addEventListener('change', report)
    return () => q.removeEventListener('change', report)
  }, [])

  // Live readout from the depth loop: frame time and where the dive is.
  // Written straight to the DOM, a few times a second.
  useEffect(() => {
    let acc = 0
    let frames = 0
    let since = 0
    return subscribe((depth, dt) => {
      acc += dt
      frames++
      since += dt
      if (since < 20) return // roughly every third of a second
      const ms = (acc / frames) * (1000 / 60)
      if (frameRef.current) frameRef.current.textContent = `${ms.toFixed(1)} ms a frame`
      if (depthOut.current) {
        depthOut.current.textContent =
          `${Math.round(metersAt(depth)).toLocaleString()} m, ${getZone(depth).label.toLowerCase()}`
      }
      acc = 0
      frames = 0
      since = 0
    })
  }, [subscribe])

  const diveTo = (m) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: max * depthAtMeters(m), behavior: 'smooth' })
  }

  const setTime = (id) => {
    const next = tod === id ? null : id
    setTod(next)
    window.dispatchEvent(new CustomEvent('ocean:set-tod', { detail: next ? { tod: next } : {} }))
  }

  // Aim at the middle of the left-hand strip of water
  const ping = () => {
    const x = wide ? Math.max(40, (window.innerWidth - 1120) / 4) : window.innerWidth / 2
    window.dispatchEvent(new CustomEvent('ocean:ping', { detail: { x, y: window.innerHeight / 2 } }))
  }

  return (
    <section className="blk-engine blk-wide" aria-label="Live controls for the dive">
      {!wide && (
        <p className="blk-engine-note">
          On a screen this narrow the page covers the water. Open it on a wider one to watch these
          change the ocean either side.
        </p>
      )}

      <div className="blk-engine-row">
        <span className="blk-engine-label">Depth</span>
        <div className="blk-engine-buttons">
          {DEPTHS.map(m => (
            <button key={m} type="button" onClick={() => diveTo(m)}>
              {m.toLocaleString()} m
            </button>
          ))}
        </div>
      </div>

      <div className="blk-engine-row">
        <span className="blk-engine-label">Surface light</span>
        <div className="blk-engine-buttons">
          {TIMES.map(t => (
            <button key={t.id} type="button" aria-pressed={tod === t.id} onClick={() => setTime(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="blk-engine-row">
        <span className="blk-engine-label">Send</span>
        <div className="blk-engine-buttons">
          <button type="button" onClick={ping}>A sonar ping</button>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('ocean:summon-whale'))}>
            The whale
          </button>
        </div>
      </div>

      <p className="blk-engine-readout">
        <span ref={depthOut}>
          {Math.round(metersAt(depthRef.current)).toLocaleString()} m
        </span>
        <span ref={frameRef}>measuring</span>
      </p>
    </section>
  )
}
