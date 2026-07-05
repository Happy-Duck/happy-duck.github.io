// ── Shipwreck — real wreck photo settled on the ocean floor ────────────
// Underwater grading + list applied in CSS. The treasure glow in the hull
// opens the real treasure: the resume. Bubbles included.
import { useState, useRef } from 'react'

export function Shipwreck() {
  const [bubbles, setBubbles] = useState([])
  const idRef = useRef(0)

  const onTreasureClick = () => {
    // Bubble burst from the breach
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
      <img
        className="shipwreck-img"
        src="/creatures/shipwreck.webp"
        alt=""
        draggable={false}
        aria-hidden="true"
      />

      {/* Treasure — warm light spilling from the hull breach */}
      <button
        type="button"
        className="treasure-btn"
        data-no-ping
        onClick={onTreasureClick}
        aria-label="Something glints inside the wreck (the captain's resume)"
      >
        <span className="treasure-glow" aria-hidden="true" />
        <span className="treasure-spark treasure-spark--1" aria-hidden="true" />
        <span className="treasure-spark treasure-spark--2" aria-hidden="true" />
        <span className="treasure-spark treasure-spark--3" aria-hidden="true" />
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
