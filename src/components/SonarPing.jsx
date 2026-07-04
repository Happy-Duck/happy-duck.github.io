// ── Sonar ping rings — click open water to ping ────────────────────────
import { useState, useEffect, useRef } from 'react'
import { firePing } from '../lib/sonar'

export function SonarPing() {
  const [rings, setRings] = useState([])
  const idRef = useRef(0)

  useEffect(() => {
    const spawn = (x, y) => {
      firePing(x, y)
      const id = idRef.current++
      setRings(r => [...r, { id, x, y }])
      setTimeout(() => setRings(r => r.filter(q => q.id !== id)), 1600)
    }

    const onClick = (e) => {
      if (e.target.closest('a,button,input,textarea,[data-no-ping]')) return
      spawn(e.clientX, e.clientY)
    }
    const onEvent = (e) => spawn(e.detail.x, e.detail.y)

    window.addEventListener('click', onClick)
    window.addEventListener('ocean:ping', onEvent)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('ocean:ping', onEvent)
    }
  }, [])

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
