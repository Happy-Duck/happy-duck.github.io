// ── Whale — rare ambient crossing event ────────────────────────────────
// ~1-in-6 visits: while the diver is in the twilight band (depth 0.2–0.5),
// a huge low-contrast silhouette crosses far in the background over ~35s.
// The terminal's `whale` command force-summons it. Pointing at it (or
// clicking it) while it crosses logs the secret "Leviathan" entry.
import { useState, useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { markSeen } from '../../lib/diveLog'

const CROSS_MS = 35000
const SUMMON_DELAY_MS = 4000

// Blue whale artwork (public/creatures/blue-whale.webp) faces LEFT, so the
// crossing runs right-to-left — the whale always swims head-first.

export function Whale() {
  // idle | armed | crossing
  const [phase, setPhase] = useState('idle')
  const { depthRef } = useOceanDepthContext()
  const startedRef = useRef(false)
  const imgRef = useRef(null)

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

  // Crossing lifecycle: pointing at / clicking the whale logs the
  // sighting (discovery is deliberate — passive viewing doesn't count),
  // and the crossing ends after the animation
  useEffect(() => {
    if (phase !== 'crossing') return
    const hit = (e) => {
      const img = imgRef.current
      if (!img) return
      const r = img.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top && e.clientY <= r.bottom) {
        markSeen('whale')
      }
    }
    window.addEventListener('mousemove', hit, { passive: true })
    window.addEventListener('click', hit)
    const endTimer = setTimeout(() => setPhase('idle'), CROSS_MS + 500)
    return () => {
      window.removeEventListener('mousemove', hit)
      window.removeEventListener('click', hit)
      clearTimeout(endTimer)
    }
  }, [phase])

  if (phase !== 'crossing') return null

  return (
    <div className="whale-track" aria-hidden="true">
      <div className="whale">
        <img ref={imgRef} src="/creatures/blue-whale.webp" alt="" draggable={false} />
      </div>
    </div>
  )
}
