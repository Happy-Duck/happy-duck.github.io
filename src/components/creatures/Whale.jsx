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

// Blue whale artwork (public/creatures/blue-whale.png) faces LEFT, so the
// crossing runs right-to-left — the whale always swims head-first.

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
        <img src="/creatures/blue-whale.png" alt="" draggable={false} />
      </div>
    </div>
  )
}
