// ── Time-of-day debug switcher — DEV BUILDS ONLY ───────────────────────
// Cycles auto → dawn → day → dusk → night, dispatching ocean:set-tod so
// the water stops, CSS tints, and ray uniforms all retint live. Absent
// from production builds; the terminal `tod` command works everywhere.
import { useState } from 'react'
import { todBucket } from '../constants/timeOfDay'

const CYCLE = ['auto', 'dawn', 'day', 'dusk', 'night']

// Captured once at load — keeps render pure
const AUTO_BUCKET = todBucket()

export function TodDebug() {
  const [idx, setIdx] = useState(0)

  if (!import.meta.env.DEV) return null

  const mode = CYCLE[idx]
  const cycle = () => {
    const n = (idx + 1) % CYCLE.length
    setIdx(n)
    const m = CYCLE[n]
    window.dispatchEvent(new CustomEvent('ocean:set-tod', {
      detail: { tod: m === 'auto' ? AUTO_BUCKET : m },
    }))
  }

  return (
    <button
      type="button"
      className="tod-debug"
      data-no-ping
      onClick={cycle}
      aria-label="Cycle time-of-day palette (dev only)"
    >
      ◐ {mode === 'auto' ? `auto (${AUTO_BUCKET})` : mode}
    </button>
  )
}
