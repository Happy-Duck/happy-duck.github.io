// ── Snail Fish — Deep Abyssal Zone (0.78 → 1.02) ─────────────────────
// Deepest known fish. Ghostly, translucent, barely moves.
// Easter egg for ocean biology enthusiasts.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { creatureOpacity } from '../../constants/depthZones'
import { tickSeen } from '../../lib/diveLog'

const W = 200, H = 67
const DEPTH_RANGE = { enter: 0.82, exit: 1.02 }

export function SnailFish() {
  const wrapperRef = useRef(null)
  const { subscribe } = useOceanDepthContext()

  const s = useRef({ x: null, y: null, t: 0 })

  useEffect(() => {
    const unsubscribe = subscribe((depth) => {
      const opacity = creatureOpacity(depth, DEPTH_RANGE)
      const el = wrapperRef.current
      if (!el) return

      if (opacity < 0.01) { el.style.opacity = '0'; return }
      if (opacity >= 0.5) tickSeen('snailfish')

      const VW = window.innerWidth
      const VH = window.innerHeight
      const p = s.current

      if (p.x === null) {
        p.x = VW * 0.4
        p.y = VH * 0.6
      }

      // Barely moves — very slow drift
      p.t++
      p.x += 0.08
      p.y += Math.sin(p.t * 0.003) * 0.15

      if (p.x > VW + W) { p.x = -W; p.y = VH * (0.5 + Math.random() * 0.3) }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollOffset = Math.min(VH * 0.35, Math.max(0, window.scrollY - DEPTH_RANGE.enter * maxScroll) * 0.15)
      const ny = p.y - scrollOffset
      el.style.transform = `translate(${p.x - W / 2}px, ${ny - H / 2}px)`
      el.style.opacity   = opacity.toFixed(3)
    })

    return unsubscribe
  }, [subscribe])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform', pointerEvents: 'none', opacity: 0 }}
    >
      <img src="/creatures/Lizardfish.webp" alt="" width={W} height={H} style={{ display: 'block', transform: 'scaleX(-1)' }} draggable={false} />
    </div>
  )
}
