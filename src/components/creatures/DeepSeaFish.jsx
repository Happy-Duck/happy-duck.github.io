// ── Deep Sea Fish — Midnight Zone (0.30 → 0.65) ──────────────────────
// Two instances. Dark navy, bioluminescent lateral stripe.
import { useRef } from 'react'
import { useCreatureAI } from '../../hooks/useCreatureAI'

const W = 132, H = 72

const CONFIGS = [
  { centerYFrac: 0.35, speed: 0.55, amplitude: 38, freq: 0.007, dir:  1 },
  { centerYFrac: 0.68, speed: 0.40, amplitude: 28, freq: 0.009, dir: -1 },
]

const DEPTH_RANGE = { enter: 0.42, exit: 0.75 }

function SingleDeepFish({ cfg, idx, peers }) {
  const { wrapperRef } = useCreatureAI({
    W_SVG: W, H_SVG: H,
    centerYFrac: cfg.centerYFrac,
    speed:       cfg.speed,
    amplitude:   cfg.amplitude,
    freq:        cfg.freq,
    dir:         cfg.dir,
    depthRange:  DEPTH_RANGE,
    fleeRadius:  130,
    peers,
    peerIndex:   idx,
    speciesId:   'deepSeaFish',
  })

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform', pointerEvents: 'none', opacity: 0 }}
    >
      <img src="/creatures/deepSeaFish-sm.webp" alt="" width={W} height={H} style={{ display: 'block', transform: 'scaleX(-1) rotate(-15deg)' }} draggable={false} />
    </div>
  )
}

export function DeepSeaFish() {
  const peers = useRef(CONFIGS.map(() => null))
  return (
    <>
      {CONFIGS.map((cfg, i) => <SingleDeepFish key={i} cfg={cfg} idx={i} peers={peers} />)}
    </>
  )
}
