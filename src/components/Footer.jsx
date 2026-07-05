import { useEffect, useRef, useState } from 'react'
import { useMouse } from '../context/MouseContext'
import { markSeen } from '../lib/diveLog'
import { Shipwreck } from './Shipwreck'

// ── Dimensions ─────────────────────────────────────────────────────────

const CRAB_W = 96
const CRAB_H = 96

// ── Crab movement ──────────────────────────────────────────────────────

function Crab() {
  const outerRef = useRef(null)   // translateX — position
  const innerRef = useRef(null)   // scaleX    — facing direction
  const mouseRef = useMouse()
  const pokeRef  = useRef({ until: 0, dir: 1 })
  const [poked, setPoked] = useState(false)

  const onPoke = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    pokeRef.current = {
      until: performance.now() + 900,
      dir:   e.clientX >= center ? -1 : 1,   // run away from the poke
    }
    setPoked(true)
    setTimeout(() => setPoked(false), 900)
    markSeen('crab')
  }

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const floorEl = outer.parentElement
    let floorW    = floorEl ? floorEl.clientWidth : window.innerWidth

    // Reduced motion — park the crab, no walking or fleeing
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      outer.style.transform = `translateX(${floorW * 0.4}px)`
      return
    }

    const onResize = () => {
      floorW = floorEl ? floorEl.clientWidth : window.innerWidth
    }
    window.addEventListener('resize', onResize, { passive: true })

    let x       = floorW * 0.4    // start 40% from left
    let vx      = 0.38            // slow rightward drift
    let fleeX   = 0
    let facing  = 1               // 1 = right, -1 = left
    let rafId
    let lastT   = 0

    // The shipwreck occupies the bottom-left corner — the crab's beach
    // starts to its right
    const wreckEdge = () => Math.min(floorW * 0.28, 380)

    const tick = (now) => {
      // Own rAF loop, so normalize elapsed time to 60fps units itself —
      // motion constants below are tuned per-60fps-step
      const dt = lastT > 0 ? Math.min(2.5, Math.max(0.25, (now - lastT) / (1000 / 60))) : 1
      lastT = now

      const mouse = mouseRef.current

      // Crab centre in screen space — read floor position live each frame
      // (safe in rAF; jitter was fixed by overflow:clip + pointerEvents:none)
      const floorRect = floorEl ? floorEl.getBoundingClientRect() : { top: 0, bottom: 0 }
      const cx = x + CRAB_W / 2
      const cy = floorRect.bottom - 14 - CRAB_H / 2

      // Flee
      const dx   = cx - mouse.x
      const dy   = cy - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150 && dist > 0) {
        fleeX += (dx / dist) * ((150 - dist) / 150) * 6.5 * dt
      }

      // Dive-log discovery — catching it with the cursor counts (it
      // flees, so this is earned); the poke click logs it too
      if (dist < 60) markSeen('crab')

      // Startled by a poke — sprint away
      if (performance.now() < pokeRef.current.until) {
        fleeX += pokeRef.current.dir * 4.5 * dt
      }

      fleeX *= Math.pow(0.90, dt)

      // Move + clamp (left wall = the wreck)
      const minX = wreckEdge()
      x = Math.max(minX, Math.min(floorW - CRAB_W, x + (vx + fleeX) * dt))

      // Bounce at walls
      if (x <= minX)            vx =  Math.abs(vx)
      if (x >= floorW - CRAB_W) vx = -Math.abs(vx)

      // Facing
      const totalVx = vx + fleeX
      if (Math.abs(totalVx) > 0.08) facing = totalVx > 0 ? 1 : -1

      outer.style.transform = `translateX(${x}px)`
      inner.style.transform = `scaleX(${facing})`

      rafId = requestAnimationFrame(tick)
    }

    tick(performance.now())
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [mouseRef])

  return (
    /* outer: position  |  inner: flip  |  img: crab gif */
    <div
      ref={outerRef}
      style={{ position: 'absolute', bottom: '14px', left: 0, willChange: 'transform', pointerEvents: 'none' }}
    >
      {poked && <span className="crab-exclaim" aria-hidden="true">!</span>}
      <div ref={innerRef} style={{ transformOrigin: `${CRAB_W / 2}px ${CRAB_H / 2}px` }}>
        <img
          src="/creatures/crab-sm.gif"
          alt=""
          width={CRAB_W}
          height={CRAB_H}
          className={poked ? 'crab-img crab-img--hop' : 'crab-img'}
          data-no-ping
          onClick={onPoke}
          style={{ display: 'block', filter: 'hue-rotate(180deg) saturate(1.4) brightness(0.7)' }}
          draggable={false}
        />
      </div>
    </div>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="footer-wrap" style={{ zIndex: 10, position: 'relative' }}>

      {/* Ocean floor — sandy/rocky texture */}
      <div className="footer-floor">
        <Shipwreck />
        <Crab />
      </div>

    </footer>
  )
}
