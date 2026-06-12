// ── Sea Turtle — Sunlit Zone (0.0 → 0.18) ────────────────────────────
// Large, slow, majestic. High flee threshold.
import { useCreatureAI } from '../../hooks/useCreatureAI'

const W = 250, H = 155

const DEPTH_RANGE = { enter: 0.00, exit: 0.28 }

export function SeaTurtle() {
  const { wrapperRef } = useCreatureAI({
    W_SVG: W, H_SVG: H,
    centerYFrac: 0.28,
    speed:       0.18,
    amplitude:   28,
    freq:        0.004,
    dir:         -1,
    depthRange:  DEPTH_RANGE,
    fleeRadius:  200,
    speciesId:   'seaTurtle',
  })

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute', top: 0, left: 0,
        willChange: 'transform', pointerEvents: 'none', opacity: 0,
      }}
    >
      <img src="/creatures/GreenTurtle.png" alt="" width={W} height={H} style={{ display: 'block', transform: 'scaleX(-1)' }} draggable={false} />
    </div>
  )
}
