// ── rays.worker — god rays rendered off the main thread ───────────────
// Owns an OffscreenCanvas transferred from Caustics.jsx. The main thread
// only sends transitions: init / resize / tod / visible / stop.
import { createRaysRenderer } from '../lib/raysRenderer'

const rAF = typeof requestAnimationFrame === 'function'
  ? requestAnimationFrame
  : (cb) => setTimeout(() => cb(performance.now()), 16)
const cAF = typeof cancelAnimationFrame === 'function'
  ? cancelAnimationFrame
  : clearTimeout

let renderer = null
let visible = false
let reduced = false
let rafId = 0
const start = performance.now()

function loop() {
  rafId = rAF(loop)
  if (!visible || !renderer) return
  renderer.draw((performance.now() - start) / 1000)
}

self.onmessage = (e) => {
  const m = e.data
  switch (m.type) {
    case 'init':
      renderer = createRaysRenderer(m.canvas)
      if (!renderer) return
      reduced = m.reduced
      renderer.resize(m.w, m.h)
      renderer.setTod(m.rays)
      if (reduced) renderer.draw(0)
      else rafId = rAF(loop)
      break
    case 'resize':
      renderer?.resize(m.w, m.h)
      if (reduced) renderer?.draw(0)
      break
    case 'tod':
      renderer?.setTod(m.rays)
      if (reduced) renderer?.draw(0)
      break
    case 'visible':
      visible = m.visible
      break
    case 'stop':
      cAF(rafId)
      visible = false
      break
  }
}
