// ── Snail Fish — Deep Abyssal Zone (0.78 → 1.02) ─────────────────────
// Deepest known fish. Ghostly, translucent, barely moves.
// Easter egg for ocean biology enthusiasts.
import { useEffect, useRef } from 'react'
import { useMouse } from '../../context/MouseContext'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { creatureOpacity, depthTraverse } from '../../constants/depthZones'
import { inspectSeen } from '../../lib/diveLog'

const W = 200, H = 67
const DEPTH_RANGE = { enter: 0.82, exit: 1.02 }

export function SnailFish() {
  const wrapperRef = useRef(null)
  const mouseRef   = useMouse()
  const { subscribe } = useOceanDepthContext()

  const s = useRef({ x: null, y: null, t: 0, trav: null })

  useEffect(() => {
    const unsubscribe = subscribe((depth, dt) => {
      const opacity = creatureOpacity(depth, DEPTH_RANGE)
      const el = wrapperRef.current
      if (!el) return

      if (opacity < 0.01) { el.style.opacity = '0'; return }

      const VW = window.innerWidth
      const VH = window.innerHeight
      const p = s.current

      if (p.x === null) {
        p.x = VW * 0.4
        p.y = VH * 0.6
      }

      // Barely moves — very slow drift
      p.t += dt
      p.x += 0.08 * dt
      p.y += Math.sin(p.t * 0.003) * 0.15 * dt

      if (p.x > VW + W) { p.x = -W; p.y = VH * (0.5 + Math.random() * 0.3) }

      const travTarget = depthTraverse(depth, DEPTH_RANGE, VH)
      p.trav = p.trav === null ? travTarget : p.trav + (travTarget - p.trav) * (1 - Math.pow(0.93, dt))
      const ny = p.y - p.trav

      if (opacity >= 0.5) inspectSeen('snailfish', p.x, ny, Math.max(W, H) * 0.55, mouseRef.current)

      el.style.transform = `translate(${p.x - W / 2}px, ${ny - H / 2}px)`
      el.style.opacity   = opacity.toFixed(3)
    })

    return unsubscribe
  }, [subscribe, mouseRef])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform', pointerEvents: 'none', opacity: 0 }}
    >
      <img src="/creatures/Lizardfish-sm.webp" alt="" width={W} height={H} style={{ display: 'block', transform: 'scaleX(-1)' }} draggable={false} />
    </div>
  )
}
