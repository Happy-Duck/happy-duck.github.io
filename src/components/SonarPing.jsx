// ── Sonar ping rings — click open water to ping ────────────────────────
import { useState, useEffect, useRef } from 'react'
import { firePing } from '../lib/sonar'
import { useOceanDepthContext } from '../context/OceanDepthContext'
import { SPLASH_MAX_Y } from './WaterSim'

export function SonarPing() {
  const [rings, setRings] = useState([])
  const idRef = useRef(0)
  const { depthRef } = useOceanDepthContext()

  useEffect(() => {
    const spawn = (x, y) => {
      firePing(x, y)
      const id = idRef.current++
      setRings(r => [...r, { id, x, y }])
      setTimeout(() => setRings(r => r.filter(q => q.id !== id)), 1900)
    }

    const onClick = (e) => {
      if (e.target.closest('a,button,input,textarea,[data-no-ping]')) return
      // Near the surface, clicks at the waterline belong to the splash sim
      if (depthRef.current < 0.25 && e.clientY < SPLASH_MAX_Y) return
      spawn(e.clientX, e.clientY)
    }
    const onEvent = (e) => spawn(e.detail.x, e.detail.y)

    window.addEventListener('click', onClick)
    window.addEventListener('ocean:ping', onEvent)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('ocean:ping', onEvent)
    }
  }, [depthRef])

  return (
    <div className="sonar-layer" aria-hidden="true">
      {rings.map(r => (
        <span key={r.id} className="sonar-ring-wrap" style={{ left: r.x, top: r.y }}>
          <span className="sonar-ring" />
          <span className="sonar-ring sonar-ring--late" />
        </span>
      ))}
    </div>
  )
}
