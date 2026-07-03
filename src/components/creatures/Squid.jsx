// ── Squid — Twilight Zone (0.18 → 0.45) ──────────────────────────────
// Darting bursts followed by slow glides. Two instances.
import { useEffect, useRef } from 'react'
import { useMouse } from '../../context/MouseContext'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { creatureOpacity, depthTraverse } from '../../constants/depthZones'
import { tickSeen } from '../../lib/diveLog'
import { pingImpulse } from '../../lib/sonar'

const W = 100, H = 138
const DEPTH_RANGE = { enter: 0.23, exit: 0.52 } // ≈280–1,050 m — twilight darters

const CONFIGS = [
  { yFrac: 0.38, speedMul: 1.0, sinAmp: 45, startOffset: 0.15, dartOffset: 0 },
  { yFrac: 0.65, speedMul: 0.75, sinAmp: 35, startOffset: 0.70, dartOffset: 67 },
]

function SingleSquid({ cfg, idx, peers }) {
  const wrapperRef = useRef(null)
  const mouseRef   = useMouse()
  const { subscribe } = useOceanDepthContext()

  const s = useRef({
    x: null, y: null,
    pathRawX: 0,
    t: 0,
    speedBoost: 0,
    dodgeY: 0,
    dartPhase: 0,       // 0 = glide, 1 = dart
    dartTimer: cfg.dartOffset,
    glideLen: 0,        // seeded on first tick — render stays pure
    dartLen:  0,
  })

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches

    const unsubscribe = subscribe((depth) => {
      const opacity = creatureOpacity(depth, DEPTH_RANGE)
      const el = wrapperRef.current
      if (!el) return

      if (opacity < 0.01) { el.style.opacity = '0'; return }
      if (opacity >= 0.5) tickSeen('squid')

      const VW = window.innerWidth
      const VH = window.innerHeight
      const p = s.current

      if (p.x === null) {
        p.x       = cfg.startOffset * VW
        p.y       = cfg.yFrac * VH
        p.pathRawX = p.x
        p.glideLen = 100 + Math.random() * 60   // randomized glide duration
        p.dartLen  = 18 + Math.random() * 15    // randomized dart duration
      }

      // Dart / glide cycle with randomized intervals
      p.dartTimer++
      if (p.dartTimer > p.glideLen && p.dartPhase === 0) {
        p.dartPhase = 1; p.dartTimer = 0
        p.dartLen = 18 + Math.random() * 15
      }
      if (p.dartTimer > p.dartLen && p.dartPhase === 1) {
        p.dartPhase = 0; p.dartTimer = 0
        p.glideLen = 100 + Math.random() * 60
      }

      const baseSpeed = (p.dartPhase === 1 ? 3.5 : 0.45) * cfg.speedMul
      p.t++
      p.pathRawX += (baseSpeed + p.speedBoost) * -1  // squids move left
      p.speedBoost *= 0.94
      p.x = ((p.pathRawX % VW) + VW) % VW
      const pathY = VH * cfg.yFrac + Math.sin(p.t * 0.009) * cfg.sinAmp

      // Mouse flee — speed burst + vertical dodge
      if (!isMobile) {
        const mx = mouseRef.current.x, my = mouseRef.current.y
        const dx = mx - p.x, dy = my - (pathY + p.dodgeY)
        const dist = Math.hypot(dx, dy)
        if (dist < 130 && dist > 0) {
          const str = (130 - dist) / 130
          p.speedBoost = Math.max(p.speedBoost, str * baseSpeed * 4)
          p.dodgeY += -(dy / dist) * str * 2.0
        }
      }

      // Sonar ping — burst away
      const imp = pingImpulse(p.x, pathY + p.dodgeY)
      if (imp) {
        p.speedBoost = Math.max(p.speedBoost, imp.str * baseSpeed * 5)
        p.dodgeY += imp.uy * imp.str * 2.5
      }

      // Peer repulsion
      if (peers) {
        const cx = p.x, cy = pathY + p.dodgeY
        for (let i = 0; i < peers.current.length; i++) {
          if (i === idx || !peers.current[i]) continue
          const peer = peers.current[i]
          const pdx = cx - peer.x, pdy = cy - peer.y
          const pdist = Math.hypot(pdx, pdy)
          const repelRadius = Math.max(W, H) * 1.8
          if (pdist < repelRadius && pdist > 0) {
            const force = (repelRadius - pdist) / repelRadius
            p.dodgeY += (pdy / pdist) * force * 1.2
          }
        }
      }

      p.dodgeY *= 0.97
      p.dodgeY = Math.max(-120, Math.min(120, p.dodgeY))

      const traverse = depthTraverse(depth, DEPTH_RANGE, VH)
      const nx = p.x
      const ny = Math.max(-H, Math.min(VH + H, pathY + p.dodgeY - traverse))

      if (peers) {
        peers.current[idx] = { x: nx, y: ny }
      }

      el.style.transform = `translate(${nx - W / 2}px, ${ny - H / 2}px)`
      el.style.opacity   = opacity.toFixed(3)
    })

    return unsubscribe
  }, [subscribe, idx, cfg, peers, mouseRef])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform', pointerEvents: 'none', opacity: 0 }}
    >
      <img src="/creatures/squid.jpg" alt="" width={W} height={H} style={{ display: 'block', transform: 'scaleX(-1)' }} draggable={false} />
    </div>
  )
}

export function Squid() {
  const peers = useRef(CONFIGS.map(() => null))
  return (
    <>
      {CONFIGS.map((cfg, i) => <SingleSquid key={i} cfg={cfg} idx={i} peers={peers} />)}
    </>
  )
}
