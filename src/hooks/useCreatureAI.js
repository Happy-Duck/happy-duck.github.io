// ── useCreatureAI — horizontal sinusoidal swimmer with mouse flee ─────
// Subscribes to OceanDepthContext's single rAF loop.
// Updates wrapperRef.current.style.transform (translate) directly.

import { useEffect, useRef } from 'react'
import { useMouse } from '../context/MouseContext'
import { useOceanDepthContext } from '../context/OceanDepthContext'
import { creatureOpacity } from '../constants/depthZones'
import { tickSeen } from '../lib/diveLog'

export function useCreatureAI({
  W_SVG       = 50,
  H_SVG       = 24,
  centerYFrac = 0.5,
  speed       = 0.5,
  amplitude   = 40,
  freq        = 0.007,
  dir         = 1,          // 1 = moves right, -1 = moves left
  depthRange,               // { enter, exit }
  fleeRadius  = 130,
  peers       = null,       // shared useRef([]) for peer repulsion
  peerIndex   = 0,
  speciesId   = null,       // dive-log species id
}) {
  const wrapperRef = useRef(null)
  const mouseRef   = useMouse()
  const { subscribe } = useOceanDepthContext()
  const isMobile   = useRef(false)

  // Persistent animation state (outside React state to avoid re-renders).
  // Seeded in the effect — render stays pure.
  const s = useRef(null)

  useEffect(() => {
    isMobile.current = window.matchMedia('(pointer: coarse)').matches

    if (!s.current) {
      const W = window.innerWidth
      const H = window.innerHeight
      s.current = {
        t:          Math.random() * 6000,
        pathRawX:   Math.random() * W,
        pathX:      Math.random() * W,
        speedBoost: 0,
        dodgeY:     0,
        baseY:      H * centerYFrac,
      }
    }

    const unsubscribe = subscribe((depth) => {
      const opacity = creatureOpacity(depth, depthRange)
      const el = wrapperRef.current
      if (!el) return

      // Skip position updates when invisible
      if (opacity < 0.01) {
        el.style.opacity = '0'
        return
      }

      if (speciesId && opacity >= 0.5) tickSeen(speciesId)

      const W = window.innerWidth
      const H = window.innerHeight
      const p = s.current

      p.t         += 1
      p.pathRawX  += (speed + p.speedBoost) * dir
      p.speedBoost *= 0.94  // decay speed burst
      p.pathX      = ((p.pathRawX % W) + W) % W

      const pathY = p.baseY + Math.sin(p.t * freq) * amplitude

      // Mouse flee — speed burst + mild vertical dodge
      if (!isMobile.current) {
        const mx   = mouseRef.current.x
        const my   = mouseRef.current.y
        const cx   = p.pathX
        const cy   = pathY + p.dodgeY
        const dx   = mx - cx
        const dy   = my - cy
        const dist = Math.hypot(dx, dy)

        if (dist < fleeRadius && dist > 0) {
          const str = (fleeRadius - dist) / fleeRadius
          // Speed burst — swim faster in current direction
          p.speedBoost = Math.max(p.speedBoost, str * speed * 5)
          // Mild vertical dodge away from cursor
          p.dodgeY += -(dy / dist) * str * 2.0
        }
      }

      // Peer repulsion — gentle vertical separation
      if (peers) {
        const cx = p.pathX, cy = pathY + p.dodgeY
        for (let i = 0; i < peers.current.length; i++) {
          if (i === peerIndex || !peers.current[i]) continue
          const peer = peers.current[i]
          const pdx = cx - peer.x, pdy = cy - peer.y
          const pdist = Math.hypot(pdx, pdy)
          const repelRadius = Math.max(W_SVG, H_SVG) * 1.8
          if (pdist < repelRadius && pdist > 0) {
            const force = (repelRadius - pdist) / repelRadius
            p.dodgeY += (pdy / pdist) * force * 1.2
          }
        }
      }

      // Decay dodge and clamp
      p.dodgeY *= 0.97
      p.dodgeY = Math.max(-120, Math.min(120, p.dodgeY))

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const enterScrollY = depthRange.enter * maxScroll
      const scrollOffset = Math.min(window.innerHeight * 0.35, Math.max(0, window.scrollY - enterScrollY) * 0.15)
      const newX = p.pathX
      const newY = Math.max(-H_SVG, Math.min(H + H_SVG, pathY + p.dodgeY - scrollOffset))

      // Write position for peer repulsion
      if (peers) {
        peers.current[peerIndex] = { x: newX, y: newY }
      }

      // Consistent centering for both directions
      el.style.transform = dir === 1
        ? `translate(${newX - W_SVG / 2}px, ${newY - H_SVG / 2}px)`
        : `translate(${newX - W_SVG / 2}px, ${newY - H_SVG / 2}px) scaleX(-1)`
      el.style.opacity = opacity.toFixed(3)
    })

    return unsubscribe
  }, [subscribe, mouseRef, depthRange, speed, dir, freq, amplitude, centerYFrac, fleeRadius, W_SVG, H_SVG, peers, peerIndex, speciesId])

  return { wrapperRef }
}
