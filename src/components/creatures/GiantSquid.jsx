// ── Giant Squid — Abyssal Zone (0.55 → 0.88) ─────────────────────────
// Enters from one side, slowly traverses, exits, long pause before return.
import { useEffect, useRef } from 'react'
import { useMouse } from '../../context/MouseContext'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { creatureOpacity, depthTraverse } from '../../constants/depthZones'
import { inspectSeen } from '../../lib/diveLog'
import { pingImpulse } from '../../lib/sonar'

const W = 391, H = 157
const DEPTH_RANGE = { enter: 0.65, exit: 1.02 }
const TRAVERSE_SPEED = 0.5
const PAUSE_FRAMES   = 180  // ~3s at 60fps

export function GiantSquid() {
  const wrapperRef = useRef(null)
  const mouseRef   = useMouse()
  const { subscribe } = useOceanDepthContext()

  const s = useRef({
    x:       null,
    y:       null,
    dir:     1,
    phase:   'traverse',  // 'traverse' | 'pause'
    pauseT:  0,
    speedBoost: 0,
    dodgeY: 0,
    trav: null,
  })

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches

    const unsubscribe = subscribe((depth, dt) => {
      const opacity = creatureOpacity(depth, DEPTH_RANGE)
      const el = wrapperRef.current
      if (!el) return

      if (opacity < 0.01) { el.style.opacity = '0'; return }

      const VW = window.innerWidth
      const VH = window.innerHeight
      const p = s.current

      // Initialize just barely off-screen left
      if (p.x === null) {
        p.x   = -W / 2
        p.y   = VH * 0.55
        p.dir = 1
      }

      if (p.phase === 'traverse') {
        p.x += (TRAVERSE_SPEED + p.speedBoost) * p.dir * dt
        // Slow Y drift
        p.y += Math.sin(p.x * 0.005) * 0.3 * dt

        // Crossed viewport — start pause
        if (p.dir === 1 && p.x > VW + W + 20) {
          p.phase  = 'pause'
          p.pauseT = 0
          p.x      = VW + W + 30
          p.dir    = -1
          p.y      = VH * 0.5 + (Math.random() - 0.5) * VH * 0.2
        } else if (p.dir === -1 && p.x < -W - 20) {
          p.phase  = 'pause'
          p.pauseT = 0
          p.x      = -W - 30
          p.dir    = 1
          p.y      = VH * 0.5 + (Math.random() - 0.5) * VH * 0.2
        }
      } else {
        p.pauseT += dt
        if (p.pauseT > PAUSE_FRAMES) p.phase = 'traverse'
      }

      // Mouse flee — speed burst + vertical dodge
      if (!isMobile) {
        const mx = mouseRef.current.x, my = mouseRef.current.y
        const dx = mx - p.x, dy = my - (p.y + p.dodgeY)
        const dist = Math.hypot(dx, dy)

        if (dist < 200 && dist > 0) {
          const str = (200 - dist) / 200
          // Speed burst in traverse direction
          p.speedBoost = Math.max(p.speedBoost, str * TRAVERSE_SPEED * 5)
          // Mild vertical dodge
          p.dodgeY += -(dy / dist) * str * 2.0 * dt
        }
      }

      // Sonar ping — surge away
      const imp = pingImpulse(p.x, p.y + p.dodgeY)
      if (imp) {
        p.speedBoost = Math.max(p.speedBoost, imp.str * TRAVERSE_SPEED * 6)
        p.dodgeY += imp.uy * imp.str * 2.5 * dt
      }

      p.speedBoost *= Math.pow(0.94, dt)
      p.dodgeY *= Math.pow(0.97, dt)
      p.dodgeY = Math.max(-120, Math.min(120, p.dodgeY))

      const travTarget = depthTraverse(depth, DEPTH_RANGE, VH)
      p.trav = p.trav === null ? travTarget : p.trav + (travTarget - p.trav) * (1 - Math.pow(0.93, dt))
      const nx = p.x
      const ny = Math.max(-H, Math.min(VH + H, p.y + p.dodgeY - p.trav))
      const flip = p.dir === 1 ? '' : ' scaleX(-1)'

      if (opacity >= 0.5) inspectSeen('giantSquid', nx, ny, Math.max(W, H) * 0.5, mouseRef.current)

      el.style.transform = `translate(${nx - W / 2}px, ${ny - H / 2}px)${flip}`
      el.style.opacity   = opacity.toFixed(3)
    })

    return unsubscribe
  }, [subscribe, mouseRef])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform', pointerEvents: 'none', opacity: 0 }}
    >
      <img src="/creatures/jumboSquid-sm.webp" alt="" width={W} height={H} style={{ display: 'block', transform: 'scaleX(-1)', filter: 'brightness(0.55) saturate(0.7)' }} draggable={false} />
    </div>
  )
}
