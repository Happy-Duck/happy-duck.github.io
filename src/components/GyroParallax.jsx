// ── GyroParallax — tilt the phone, tilt the water ──────────────────────
// On coarse-pointer devices, device orientation lerps into --tilt-x/-y
// CSS vars on :root (clamped ±1, smoothed via rAF). CSS consumes them
// under (pointer: coarse): creature layers shift a few px and the ROV
// beam's resting spot follows the tilt — the mobile stand-in for cursor
// parallax. iOS requires a user gesture to grant orientation access, so
// permission is requested on the first touch.
import { useEffect } from 'react'

export function GyroParallax() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let rafId = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0

    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return
      // gamma: left/right roll. beta: front/back pitch, centered on a
      // comfortable ~40° holding angle.
      tx = Math.max(-1, Math.min(1, e.gamma / 25))
      ty = Math.max(-1, Math.min(1, (e.beta - 40) / 25))
    }

    let lastT = 0
    const loop = (now) => {
      rafId = requestAnimationFrame(loop)
      // Normalize the lerp to 60fps units — same tilt response at any
      // display refresh rate
      const dt = lastT > 0 ? Math.min(2.5, Math.max(0.25, (now - lastT) / (1000 / 60))) : 1
      lastT = now
      const k = 1 - Math.pow(0.92, dt)
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      root.style.setProperty('--tilt-x', cx.toFixed(4))
      root.style.setProperty('--tilt-y', cy.toFixed(4))
    }

    const attach = () =>
      window.addEventListener('deviceorientation', onOrient, { passive: true })

    let touchHandler = null
    if (typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS: needs a user gesture
      touchHandler = () => {
        DeviceOrientationEvent.requestPermission()
          .then(s => { if (s === 'granted') attach() })
          .catch(() => {})
      }
      window.addEventListener('touchend', touchHandler, { once: true })
    } else {
      attach()
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('deviceorientation', onOrient)
      if (touchHandler) window.removeEventListener('touchend', touchHandler)
      root.style.removeProperty('--tilt-x')
      root.style.removeProperty('--tilt-y')
    }
  }, [])

  return null
}
