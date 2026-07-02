import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getZone } from '../constants/depthZones'
import { todBucket, TOD_SURFACE } from '../constants/timeOfDay'

// ── Color interpolation ────────────────────────────────────────────────

// First two stops are retinted at module load to match the visitor's
// local time of day (see constants/timeOfDay.js)
const BG_STOPS = [
  { d: 0.00, r: 0x48, g: 0xb8, b: 0xb0 },
  { d: 0.15, r: 0x16, g: 0x6a, b: 0x60 },
  { d: 0.35, r: 0x0d, g: 0x3b, b: 0x5e },
  { d: 0.60, r: 0x04, g: 0x0d, b: 0x1a },
  { d: 0.85, r: 0x02, g: 0x08, b: 0x10 },
  { d: 1.00, r: 0x01, g: 0x04, b: 0x08 },
]

// Retint the surface stops for the local hour (module load = pre-render).
// index.html's pre-paint script sets data-tod + the initial bg color; this
// re-asserts both in case that script drifts out of sync.
{
  const tod = todBucket()
  const surf = TOD_SURFACE[tod]
  Object.assign(BG_STOPS[0], surf[0])
  Object.assign(BG_STOPS[1], surf[1])
  document.documentElement.setAttribute('data-tod', tod)
}

function lerp(a, b, t) { return a + (b - a) * t }

function interpolateOceanColor(d) {
  const depth = Math.max(0, Math.min(1, d))
  let i = 0
  while (i < BG_STOPS.length - 2 && BG_STOPS[i + 1].d <= depth) i++
  const a = BG_STOPS[i], b = BG_STOPS[i + 1]
  const t = (depth - a.d) / (b.d - a.d)
  return `rgb(${Math.round(lerp(a.r,b.r,t))},${Math.round(lerp(a.g,b.g,t))},${Math.round(lerp(a.b,b.b,t))})`
}

function interpolateTextPrimary(d) {
  const t = Math.min(1, d / 0.3)
  return `rgb(${Math.round(lerp(0x1e,0xe8,t))},${Math.round(lerp(0x3a,0xf4,t))},${Math.round(lerp(0x3a,0xf8,t))})`
}

function interpolateTextStroke(d) {
  // Inverse of text — light at surface, dark at depth
  const t = Math.min(1, d / 0.3)
  return `rgb(${Math.round(lerp(0xd0,0x08,t))},${Math.round(lerp(0xf0,0x18,t))},${Math.round(lerp(0xe8,0x20,t))})`
}

// Zone→likely culprit for perf warnings
const ZONE_CULPRIT = {
  SUNLIT:   'ReefFish / SeaTurtle',
  TWILIGHT: 'Jellyfish / Squid',
  MIDNIGHT: 'Anglerfish / DeepSeaFish',
  ABYSSAL:  'GiantSquid / AbyssalJellyfish / SnailFish',
}

// ── Context ────────────────────────────────────────────────────────────

const OceanDepthContext = createContext(null)

export function OceanDepthProvider({ children }) {
  const depthRef        = useRef(0)
  const [displayDepth, setDisplayDepth] = useState(0)

  // Subscriber registry — creatures register tick callbacks here
  const subscribers  = useRef(new Set())
  const frameRef     = useRef(null)
  const dirtyRef     = useRef(true)   // true → first frame initializes everything
  const lastDepthRef = useRef(-1)
  const themeRef     = useRef('shallow-reef')
  const lastUiRef    = useRef(0)
  const lastNowRef   = useRef(0)
  const reducedRef   = useRef(false)

  // Stable subscribe function — never changes reference
  const subscribe = useCallback((fn) => {
    subscribers.current.add(fn)
    return () => subscribers.current.delete(fn)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    // Initialize CSS vars synchronously (may already be set by index.html script)
    root.style.setProperty('--ocean-bg-color', interpolateOceanColor(0))
    root.style.setProperty('--text-primary',   interpolateTextPrimary(0))
    root.style.setProperty('--text-stroke',    interpolateTextStroke(0))
    root.style.setProperty('--plankton-opacity','0.8')
    root.style.setProperty('--ambient-glow',   '0')
    root.style.setProperty('--particle-opacity','0')
    root.style.setProperty('--beach-op',       '1')
    root.style.setProperty('--gauge-opacity',  '1')

    const onScroll = () => { dirtyRef.current = true }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Reduced motion — creatures hold position except while scrolling
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = motionQuery.matches
    const onMotionChange = (e) => { reducedRef.current = e.matches }
    motionQuery.addEventListener('change', onMotionChange)

    const loop = (now) => {
      let depthChanged = false

      // ── Depth update (scroll-dirty) ──────────────────────────────
      if (dirtyRef.current) {
        dirtyRef.current = false

        const scrollY    = window.scrollY
        const maxScroll  = document.documentElement.scrollHeight - window.innerHeight
        const d          = maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0

        if (Math.abs(d - lastDepthRef.current) >= 0.001) {
          depthChanged         = true
          lastDepthRef.current = d
          depthRef.current     = d

          root.style.setProperty('--ocean-depth-progress', d.toFixed(4))
          root.style.setProperty('--ocean-bg-color',       interpolateOceanColor(d))
          root.style.setProperty('--text-primary',         interpolateTextPrimary(d))
          root.style.setProperty('--text-stroke',          interpolateTextStroke(d))

          const ambientGlow    = d < 0.5 ? d * 2 : 2 - d * 2
          root.style.setProperty('--ambient-glow',   Math.max(0, ambientGlow).toFixed(3))

          const particleOp = d < 0.45 ? 0 : Math.min(0.7, (d - 0.45) / 0.2 * 0.7)
          root.style.setProperty('--particle-opacity', particleOp.toFixed(3))

          // Plankton: visible at surface, fades out by d=0.40
          const planktonOp = d < 0.05 ? 0.8 : d < 0.40 ? 0.8 * (1 - (d - 0.05) / 0.35) : 0
          root.style.setProperty('--plankton-opacity', planktonOp.toFixed(3))

          const beachOp = d < 0.12 ? 1 : d < 0.25 ? 1 - (d - 0.12) / 0.13 : 0
          root.style.setProperty('--beach-op', beachOp.toFixed(3))

          const ventOp = d < 0.82 ? 0 : Math.min(1, (d - 0.82) / 0.08)
          root.style.setProperty('--vent-op', ventOp.toFixed(3))

          // Update data-theme for section content styling (hysteresis)
          if (d < 0.30 && themeRef.current !== 'shallow-reef') {
            themeRef.current = 'shallow-reef'
            root.setAttribute('data-theme', 'shallow-reef')
          } else if (d > 0.40 && themeRef.current !== 'deep-sea') {
            themeRef.current = 'deep-sea'
            root.setAttribute('data-theme', 'deep-sea')
          }

          // Gauge always visible
          root.style.setProperty('--gauge-opacity', '1')
        }

        // Throttle React state to ~10fps for UI
        if (now - lastUiRef.current > 100) {
          lastUiRef.current = now
          setDisplayDepth(depthRef.current)
        }
      }

      // ── Creature subscribers — continuous animation, unless the user
      //    prefers reduced motion (then only tick while depth changes) ──
      const depth = depthRef.current
      if (!reducedRef.current || depthChanged) {
        subscribers.current.forEach(fn => fn(depth))
      }

      // ── Performance monitor ────────────────────────────────────────
      if (lastNowRef.current > 0) {
        const dt = now - lastNowRef.current
        if (dt > 20 && import.meta.env.DEV) {
          const zone = getZone(depth)
          console.warn(
            `[ocean] Frame drop ~${Math.round(1000 / dt)}fps — likely: ${ZONE_CULPRIT[zone.key]}`
          )
        }
      }
      lastNowRef.current = now

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('scroll', onScroll)
      motionQuery.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <OceanDepthContext.Provider value={{ depthRef, depth: displayDepth, subscribe }}>
      {children}
    </OceanDepthContext.Provider>
  )
}

export const useOceanDepthContext = () => useContext(OceanDepthContext)
