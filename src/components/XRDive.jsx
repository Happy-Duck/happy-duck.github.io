// ── XRDive — immersive VR entry point ──────────────────────────────────
// The fab renders ONLY where immersive-vr is actually supported (headset
// browsers); ordinary desktops never see it. three.js + the scene load
// on demand when entering. The terminal `vr` command dispatches
// ocean:enter-vr for the same path.
import { useState, useEffect } from 'react'

export function XRDive() {
  const [supported, setSupported] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    navigator.xr?.isSessionSupported('immersive-vr')
      .then(ok => { if (!cancelled && ok) setSupported(true) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const enter = async () => {
      if (busy) return
      setBusy(true)
      try {
        const { startXR } = await import('../lib/xrScene')
        await startXR()
      } catch { /* headset declined / session failed — stay on the page */ }
      setBusy(false)
    }
    const onEvent = () => { enter() }
    window.addEventListener('ocean:enter-vr', onEvent)
    return () => window.removeEventListener('ocean:enter-vr', onEvent)
  }, [busy])

  // Desktop preview of the same scene — terminal `vr preview` (debug)
  useEffect(() => {
    const onPreview = async () => {
      const { startPreview } = await import('../lib/xrScene')
      startPreview()
    }
    window.addEventListener('ocean:vr-preview', onPreview)
    return () => window.removeEventListener('ocean:vr-preview', onPreview)
  }, [])

  if (!supported) return null

  return (
    <button
      type="button"
      className="xr-fab"
      data-no-ping
      disabled={busy}
      onClick={() => window.dispatchEvent(new CustomEvent('ocean:enter-vr'))}
      aria-label="Enter the water in virtual reality"
    >
      <span aria-hidden="true">🥽</span>
      <span className="xr-fab-label">{busy ? 'donning…' : 'dive in VR'}</span>
    </button>
  )
}
