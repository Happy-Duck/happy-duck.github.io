// ── Caustics (god rays) — orchestrator ─────────────────────────────────
// The site is a side-on cross-section of the water column, so the surface
// light effect is slanted crepuscular rays (see lib/raysRenderer.js for
// the shader). Where OffscreenCanvas exists, rendering runs in a worker —
// the main thread only sends init/resize/tod/visibility transitions.
// Elsewhere, the same renderer module runs on a main-thread rAF.
//
// StrictMode traps (paid for): transferControlToOffscreen() throws on a
// second call and a transferred canvas can never be reclaimed, so the
// worker is stashed on the canvas element and reused across remounts,
// and it is never terminated — just told to stop.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'
import { todBucket } from '../constants/timeOfDay'
import { createRaysRenderer, TOD_RAYS } from '../lib/raysRenderer'

export function Caustics() {
  const canvasRef = useRef(null)
  const { depthRef, subscribe } = useOceanDepthContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rays = TOD_RAYS[todBucket()]
    const size = () => ({ w: canvas.clientWidth, h: canvas.clientHeight })

    let post
    let mainStop = null

    if ('transferControlToOffscreen' in canvas) {
      if (!canvas._raysWorker) {
        const worker = new Worker(
          new URL('../workers/rays.worker.js', import.meta.url),
          { type: 'module' },
        )
        const off = canvas.transferControlToOffscreen()
        worker.postMessage({ type: 'init', canvas: off, ...size(), reduced, rays }, [off])
        canvas._raysWorker = worker
      } else {
        // StrictMode remount — same canvas, same worker
        canvas._raysWorker.postMessage({ type: 'tod', rays })
      }
      post = (msg) => canvas._raysWorker.postMessage(msg)
    } else {
      // Main-thread fallback via the identical renderer module
      const renderer = createRaysRenderer(canvas)
      if (!renderer) return
      renderer.resize(size().w, size().h)
      renderer.setTod(rays)
      let vis = false
      let rafId = 0
      const start = performance.now()
      const loop = () => {
        rafId = requestAnimationFrame(loop)
        if (!vis) return
        renderer.draw((performance.now() - start) / 1000)
      }
      if (reduced) renderer.draw(0)
      else rafId = requestAnimationFrame(loop)
      post = (msg) => {
        if (msg.type === 'visible') vis = msg.visible
        else if (msg.type === 'resize') { renderer.resize(msg.w, msg.h); if (reduced) renderer.draw(0) }
        else if (msg.type === 'tod') { renderer.setTod(msg.rays); if (reduced) renderer.draw(0) }
      }
      mainStop = () => cancelAnimationFrame(rafId)
    }

    // Visibility: post only on transitions, not per frame
    let lastVis = null
    const check = () => {
      const v = !document.hidden && depthRef.current <= 0.3
      if (v !== lastVis) {
        lastVis = v
        post({ type: 'visible', visible: v })
      }
    }
    check()
    const unsubscribe = subscribe(check)
    const onVis = () => check()
    document.addEventListener('visibilitychange', onVis)

    const onResize = () => post({ type: 'resize', ...size() })
    window.addEventListener('resize', onResize, { passive: true })

    const onSetTod = (e) => post({
      type: 'tod',
      rays: TOD_RAYS[e.detail?.tod] || TOD_RAYS[todBucket()],
    })
    window.addEventListener('ocean:set-tod', onSetTod)

    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('ocean:set-tod', onSetTod)
      post({ type: 'visible', visible: false })
      mainStop?.()
    }
  }, [subscribe, depthRef])

  return <canvas ref={canvasRef} className="caustics-canvas" aria-hidden="true" />
}
