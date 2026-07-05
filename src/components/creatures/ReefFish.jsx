// ── Reef Fish — Sunlit Zone (0.0 → 0.20) ─────────────────────────────
// Small tropical clownfish. 3 instances at different lanes.
import { useRef } from 'react'
import { useCreatureAI } from '../../hooks/useCreatureAI'

const W = 48, H = 44

// Lanes spread across the frame; the depth traverse sweeps each ±30vh,
// so bases live in the 0.3–0.75 band to stay mostly on screen
const CONFIGS = [
  { centerYFrac: 0.32, speed: 0.60, amplitude: 32, freq: 0.008, dir:  1, scale: 1.00 },
  { centerYFrac: 0.55, speed: 0.42, amplitude: 22, freq: 0.010, dir: -1, scale: 0.85 },
  { centerYFrac: 0.75, speed: 0.55, amplitude: 38, freq: 0.006, dir:  1, scale: 1.10 },
]

const DEPTH_RANGE = { enter: 0.00, exit: 0.22 } // ≈0–250 m — clownfish are shallow

function SingleFish({ cfg, idx, peers }) {
  const { wrapperRef } = useCreatureAI({
    W_SVG: W * cfg.scale, H_SVG: H * cfg.scale,
    centerYFrac: cfg.centerYFrac,
    speed:       cfg.speed,
    amplitude:   cfg.amplitude,
    freq:        cfg.freq,
    dir:         cfg.dir,
    depthRange:  DEPTH_RANGE,
    fleeRadius:  110,
    peers,
    peerIndex:   idx,
    speciesId:   'reefFish',
  })

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute', top: 0, left: 0,
        willChange: 'transform', pointerEvents: 'none', opacity: 0,
      }}
    >
      <img src="/creatures/clownfish-sm.webp" alt="" width={W * cfg.scale} height={H * cfg.scale} style={{ display: 'block', transform: 'scaleX(-1)' }} draggable={false} />
    </div>
  )
}

export function ReefFish() {
  const peers = useRef(CONFIGS.map(() => null))
  return (
    <>
      {CONFIGS.map((cfg, i) => <SingleFish key={i} cfg={cfg} idx={i} peers={peers} />)}
    </>
  )
}
