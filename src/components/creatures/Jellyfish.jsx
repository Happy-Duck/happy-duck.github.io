// ── Jellyfish — Twilight Zone (0.12 → 0.40) ──────────────────────────
// Two instances. Drift upward, reset to bottom.
import { useEffect, useRef } from 'react'
import { useMouse } from '../../context/MouseContext'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { creatureOpacity } from '../../constants/depthZones'
import { inspectSeen } from '../../lib/diveLog'
import { pingImpulse } from '../../lib/sonar'

const W = 120, H = 170
const DEPTH_RANGE = { enter: 0.20, exit: 0.52 } // ≈200–1,050 m — twilight drifters

const CONFIGS = [
  { xFrac: 0.20, yFrac: 0.40, scale: 1.0, driftSpeed: 0.22 },
  { xFrac: 0.60, yFrac: 0.65, scale: 0.75, driftSpeed: 0.28 },
]

function SingleJelly({ cfg, idx, peers }) {
  const wrapperRef = useRef(null)
  const mouseRef   = useMouse()
  const { subscribe } = useOceanDepthContext()

  const sw = W * cfg.scale
  const sh = H * cfg.scale

  const s = useRef({
    x: null, y: null,
    dodgeX: 0,
    driftBoost: 0,
  })

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches

    const unsubscribe = subscribe((depth) => {
      const opacity = creatureOpacity(depth, DEPTH_RANGE)
      const el = wrapperRef.current
      if (!el) return

      if (opacity < 0.01) { el.style.opacity = '0'; return }

      const VW = window.innerWidth
      const VH = window.innerHeight
      const p = s.current

      if (p.x === null) {
        p.x = cfg.xFrac * VW
        p.y = cfg.yFrac * VH
      }

      // Drift upward + slow horizontal sway
      p.y -= cfg.driftSpeed + p.driftBoost
      p.driftBoost *= 0.94
      p.x += Math.sin(p.y * 0.012 + idx * 1.4) * 0.35

      // Parallax — compute early so reset uses rendered position
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollOffset = Math.min(VH * 0.35, Math.max(0, window.scrollY - DEPTH_RANGE.enter * maxScroll) * 0.15)

      // Reset to bottom (use rendered position so parallax can't strand them)
      if (p.y - scrollOffset < -sh - 20) {
        p.y = VH + sh + scrollOffset
        p.x = (0.15 + Math.random() * 0.7) * VW
      }

      // Mouse flee — drift faster upward + horizontal dodge
      if (!isMobile) {
        const mx = mouseRef.current.x, my = mouseRef.current.y
        const dx = mx - p.x, dy = my - p.y
        const dist = Math.hypot(dx, dy)
        if (dist < 120 && dist > 0) {
          const str = (120 - dist) / 120
          p.driftBoost = Math.max(p.driftBoost, str * 1.5)
          p.dodgeX += -(dx / dist) * str * 1.5
        }
      }

      // Sonar ping — dart upward and away
      const imp = pingImpulse(p.x + p.dodgeX, p.y)
      if (imp) {
        p.driftBoost = Math.max(p.driftBoost, imp.str * 2.2)
        p.dodgeX += imp.ux * imp.str * 2.0
      }

      p.dodgeX *= 0.96
      p.dodgeX = Math.max(-80, Math.min(80, p.dodgeX))

      // Peer repulsion
      if (peers) {
        for (let i = 0; i < peers.current.length; i++) {
          if (i === idx || !peers.current[i]) continue
          const peer = peers.current[i]
          const pdx = (p.x + p.dodgeX) - peer.x, pdy = p.y - peer.y
          const pdist = Math.hypot(pdx, pdy)
          const repelRadius = Math.max(sw, sh) * 1.8
          if (pdist < repelRadius && pdist > 0) {
            const force = (repelRadius - pdist) / repelRadius
            p.dodgeX += (pdx / pdist) * force * 1.0
          }
        }
      }

      const nx = Math.max(sw / 2, Math.min(VW - sw / 2, p.x + p.dodgeX))
      const ny = p.y - scrollOffset

      if (peers) {
        peers.current[idx] = { x: nx, y: ny }
      }

      if (opacity >= 0.5) inspectSeen('jellyfish', nx, ny, Math.max(sw, sh) * 0.55, mouseRef.current)

      el.style.transform = `translate(${nx - sw / 2}px, ${ny - sh / 2}px)`
      el.style.opacity = opacity.toFixed(3)
    })

    return unsubscribe
  }, [subscribe, idx, cfg, peers, mouseRef, sw, sh])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform', pointerEvents: 'none', opacity: 0 }}
    >
      <img src="/creatures/Jellyfish.png" alt="" width={sw} height={sh} style={{ display: 'block', transform: 'rotate(-40deg)' }} draggable={false} />
    </div>
  )
}

export function Jellyfish() {
  const peers = useRef(CONFIGS.map(() => null))
  return (
    <>
      {CONFIGS.map((cfg, i) => <SingleJelly key={i} cfg={cfg} idx={i} peers={peers} />)}
    </>
  )
}
