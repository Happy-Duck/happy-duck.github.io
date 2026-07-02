// ── Bioluminescent cursor trail — stirred plankton below depth 0.5 ─────
// Imperative DOM (no React state churn at mousemove rates): motes are
// appended to a fixed container and removed on animationend.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'

const MIN_DEPTH = 0.5
const MIN_DIST = 24
const MIN_GAP_MS = 40
const MAX_MOTES = 40

export function BioTrail() {
  const wrapRef = useRef(null)
  const { depthRef } = useOceanDepthContext()

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let lastX = -1e4
    let lastY = -1e4
    let lastT = 0
    let live = 0

    const onMove = (e) => {
      const depth = depthRef.current
      if (depth < MIN_DEPTH || live >= MAX_MOTES) return

      const now = performance.now()
      if (now - lastT < MIN_GAP_MS) return
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < MIN_DIST) return
      lastX = e.clientX
      lastY = e.clientY
      lastT = now

      // Deeper water stirs more glow
      const intensity = (depth - MIN_DEPTH) / (1 - MIN_DEPTH) // 0..1
      const mote = document.createElement('span')
      mote.className = 'bio-mote'
      const size = 2 + Math.random() * 3 + intensity * 2
      mote.style.width = `${size}px`
      mote.style.height = `${size}px`
      mote.style.left = `${e.clientX + (Math.random() - 0.5) * 18}px`
      mote.style.top = `${e.clientY + (Math.random() - 0.5) * 18}px`
      mote.style.opacity = String(0.35 + intensity * 0.5)
      live++
      mote.addEventListener('animationend', () => {
        mote.remove()
        live--
      })
      wrap.appendChild(mote)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      wrap.textContent = ''
    }
  }, [depthRef])

  return <div ref={wrapRef} className="bio-trail" aria-hidden="true" />
}
