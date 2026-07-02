// ── Whale — rare ambient crossing event ────────────────────────────────
// ~1-in-6 visits: while the diver is in the twilight band (depth 0.2–0.5),
// a huge low-contrast silhouette crosses far in the background over ~35s.
// The terminal's `whale` command force-summons it. Seeing it logs the
// secret "Leviathan" dive-log entry.
import { useState, useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { markSeen } from '../../lib/diveLog'

const CROSS_MS = 35000
const SUMMON_DELAY_MS = 4000

// Sperm whale profile facing RIGHT — the direction it swims.
// Blunt massive head leading, back with a low dorsal hump, tail stock
// narrowing to broad flukes, small pectoral fin. (viewBox 620x240)
function WhaleSilhouette() {
  return (
    <svg viewBox="0 0 620 240" width="100%" height="100%" aria-hidden="true">
      <path
        className="whale-body"
        d="M 95 108
           C 150 86, 230 72, 310 70
           C 330 63, 348 63, 360 69
           C 420 64, 480 62, 522 70
           C 560 77, 585 93, 589 112
           C 591 126, 584 138, 568 143
           C 540 149, 512 147, 490 149
           C 432 161, 362 165, 300 158
           C 222 149, 150 132, 108 118
           C 102 115, 97 112, 95 108
           Z
           M 102 112
           C 72 96, 42 80, 14 62
           C 38 92, 46 102, 52 113
           C 46 126, 34 142, 16 170
           C 44 150, 74 134, 102 120
           Z
           M 430 152
           C 422 170, 410 182, 394 188
           C 408 178, 416 164, 419 150
           Z"
      />
      {/* Eye — just above the jaw corner */}
      <circle className="whale-eye" cx="536" cy="122" r="4.5" />
    </svg>
  )
}

export function Whale() {
  // idle | armed | crossing
  const [phase, setPhase] = useState('idle')
  const { depthRef } = useOceanDepthContext()
  const startedRef = useRef(false)
  const loggedRef = useRef(false)

  // Roll once per session; arm the depth watcher if it hits
  useEffect(() => {
    let roll
    try {
      roll = sessionStorage.getItem('ocean.whaleRoll')
      if (roll === null) {
        roll = Math.random() < 1 / 6 ? 'hit' : 'miss'
        sessionStorage.setItem('ocean.whaleRoll', roll)
      }
    } catch {
      roll = 'miss'
    }
    if (roll !== 'hit') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Watch depth until the diver lingers in the twilight band
    let delayTimer = null
    const watcher = setInterval(() => {
      if (startedRef.current) { clearInterval(watcher); return }
      const d = depthRef.current
      if (d > 0.2 && d < 0.5 && delayTimer === null) {
        delayTimer = setTimeout(() => {
          if (!startedRef.current) {
            startedRef.current = true
            setPhase('crossing')
          }
        }, SUMMON_DELAY_MS)
      } else if ((d <= 0.2 || d >= 0.5) && delayTimer !== null) {
        clearTimeout(delayTimer)
        delayTimer = null
      }
    }, 500)

    return () => { clearInterval(watcher); clearTimeout(delayTimer) }
  }, [depthRef])

  // Terminal summon — always works
  useEffect(() => {
    const onSummon = () => {
      startedRef.current = true
      setPhase('crossing')
    }
    window.addEventListener('ocean:summon-whale', onSummon)
    return () => window.removeEventListener('ocean:summon-whale', onSummon)
  }, [])

  // Crossing lifecycle: log the sighting, end after the animation
  useEffect(() => {
    if (phase !== 'crossing') return
    const logTimer = setTimeout(() => {
      if (!loggedRef.current) {
        loggedRef.current = true
        markSeen('whale')
      }
    }, 6000) // logged once it's well on screen
    const endTimer = setTimeout(() => setPhase('idle'), CROSS_MS + 500)
    return () => { clearTimeout(logTimer); clearTimeout(endTimer) }
  }, [phase])

  if (phase !== 'crossing') return null

  return (
    <div className="whale-track" aria-hidden="true">
      <div className="whale">
        <WhaleSilhouette />
      </div>
    </div>
  )
}
