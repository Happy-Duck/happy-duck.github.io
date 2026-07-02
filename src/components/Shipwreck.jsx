// ── Shipwreck — wrecked hull on the ocean floor + treasure chest ───────
// The chest opens the "treasure": the resume. Bubbles included.
import { useState, useRef } from 'react'

function WreckSvg() {
  return (
    <svg viewBox="0 0 320 150" width="100%" height="100%" aria-hidden="true">
      <g transform="rotate(-7 160 100)">
        {/* Hull */}
        <path
          className="wreck-hull"
          d="M18 112
             C 40 82, 92 62, 152 58
             L 284 50
             L 294 96
             C 244 120, 122 128, 62 120
             C 42 117, 24 115, 18 112 Z"
        />
        {/* Deck line */}
        <path
          className="wreck-detail-stroke"
          d="M30 104 C 80 84, 180 68, 286 56"
          fill="none"
          strokeWidth="3"
        />
        {/* Broken mast */}
        <path
          className="wreck-detail"
          d="M150 60 L 144 14 L 152 10 L 154 26 L 160 24 L 158 59 Z"
        />
        {/* Hull breach — jagged hole */}
        <path
          className="wreck-hole"
          d="M96 92 L 116 84 L 112 98 L 130 94 L 122 110 L 100 108 Z"
        />
        {/* Ribs showing through the breach */}
        <path className="wreck-detail-stroke" d="M102 90 L 104 106" strokeWidth="2" fill="none" />
        <path className="wreck-detail-stroke" d="M114 88 L 116 104" strokeWidth="2" fill="none" />
        {/* Portholes */}
        <circle className="wreck-porthole" cx="190" cy="84" r="5" />
        <circle className="wreck-porthole wreck-porthole--lit bio-pulse" cx="222" cy="78" r="5" />
        <circle className="wreck-porthole" cx="254" cy="72" r="5" />
      </g>
    </svg>
  )
}

function ChestSvg() {
  return (
    <svg viewBox="0 0 34 26" width="100%" height="100%" aria-hidden="true">
      {/* Lid, slightly ajar */}
      <path className="chest-lid" d="M3 11 Q 17 -1 31 11 L 31 13 L 3 13 Z" transform="rotate(-6 17 12)" />
      {/* Glow escaping the seam */}
      <rect className="chest-glow-seam" x="4" y="11.5" width="26" height="2" rx="1" />
      {/* Base */}
      <rect className="chest-base" x="4" y="13" width="26" height="11" rx="2" />
      {/* Lock */}
      <rect className="chest-lock" x="15" y="12" width="4" height="6" rx="1" />
    </svg>
  )
}

export function Shipwreck() {
  const [bubbles, setBubbles] = useState([])
  const idRef = useRef(0)

  const onChestClick = () => {
    // Bubble burst
    const burst = Array.from({ length: 5 }, () => ({
      id: idRef.current++,
      dx: (Math.random() - 0.5) * 36,
      delay: Math.random() * 0.18,
      size: 4 + Math.random() * 6,
    }))
    setBubbles(b => [...b, ...burst])
    setTimeout(() => {
      setBubbles(b => b.filter(x => !burst.some(y => y.id === x.id)))
    }, 1600)

    window.open('/Rishi Garhyan Resume.pdf', '_blank', 'noopener')
  }

  return (
    <div className="shipwreck" aria-hidden="false">
      <div className="shipwreck-svg" aria-hidden="true">
        <WreckSvg />
      </div>

      <button
        type="button"
        className="chest-btn"
        data-no-ping
        onClick={onChestClick}
        aria-label="Open the treasure chest (the captain's resume)"
      >
        <ChestSvg />
        <span className="chest-tip">the real treasure</span>
        {bubbles.map(b => (
          <span
            key={b.id}
            className="chest-bubble"
            style={{
              width: b.size,
              height: b.size,
              '--bx': `${b.dx}px`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </button>
    </div>
  )
}
