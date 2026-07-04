// ── useCreatureAI — horizontal sinusoidal swimmer with mouse flee ─────
// Subscribes to OceanDepthContext's single rAF loop.
// Updates wrapperRef.current.style.transform (translate) directly.

import { useEffect, useRef } from 'react'
import { useMouse } from '../context/MouseContext'
import { useOceanDepthContext } from '../context/OceanDepthContext'
import { creatureOpacity, depthTraverse } from '../constants/depthZones'
import { inspectSeen } from '../lib/diveLog'
import { pingImpulse } from '../lib/sonar'

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
        trav:       null, // smoothed depth-traverse offset
      }
    }

    // dt is the depth loop's elapsed frame time in 60 fps units — every
    // per-frame constant scales by it (decays via Math.pow) so motion
    // speed is refresh-rate independent
    const unsubscribe = subscribe((depth, dt) => {
      const opacity = creatureOpacity(depth, depthRange)
      const el = wrapperRef.current
      if (!el) return

      // Skip position updates when invisible
      if (opacity < 0.01) {
        el.style.opacity = '0'
        return
      }

      const W = window.innerWidth
      const H = window.innerHeight
      const p = s.current

      p.t         += dt
      p.pathRawX  += (speed + p.speedBoost) * dir * dt
      p.speedBoost *= Math.pow(0.94, dt)  // decay speed burst
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
          p.dodgeY += -(dy / dist) * str * 2.0 * dt
        }
      }

      // Sonar ping — scatter away from the epicenter
      const imp = pingImpulse(p.pathX, pathY + p.dodgeY)
      if (imp) {
        p.speedBoost = Math.max(p.speedBoost, imp.str * speed * 6)
        p.dodgeY += imp.uy * imp.str * 2.5 * dt
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
            p.dodgeY += (pdy / pdist) * force * 1.2 * dt
          }
        }
      }

      // Decay dodge and clamp
      p.dodgeY *= Math.pow(0.97, dt)
      p.dodgeY = Math.max(-120, Math.min(120, p.dodgeY))

      // Rise through the frame across the depth window — enters low,
      // leaves high, as the diver sinks past it. Low-pass filtered so
      // fast scrolling reads as swimming, not teleporting (snap on the
      // first visible frame).
      const travTarget = depthTraverse(depth, depthRange, H)
      p.trav = p.trav === null ? travTarget : p.trav + (travTarget - p.trav) * (1 - Math.pow(0.93, dt))
      const newX = p.pathX
      const newY = Math.max(-H_SVG, Math.min(H + H_SVG, pathY + p.dodgeY - p.trav))

      // Write position for peer repulsion
      if (peers) {
        peers.current[peerIndex] = { x: newX, y: newY }
      }

      // Deliberate discovery — cursor on the body, or a click/tap ping
      if (speciesId && opacity >= 0.5) {
        inspectSeen(speciesId, newX, newY, Math.max(W_SVG, H_SVG) * 0.6 + 14, mouseRef.current)
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
