// ── Marine Snow — CSS-only, 35 particles ──────────────────────────────
// No canvas, no JS animation. Opacity driven by --particle-opacity CSS var.
// Only visible at depth > 0.35 (OceanDepthContext sets --particle-opacity).

const PARTICLE_COUNT = 35

// Randomized once at module load — render stays pure
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const isBio = Math.random() < 0.18
  return {
    id:       i,
    left:     Math.random() * 100,
    size:     Math.random() * 2.2 + 0.7,
    duration: Math.random() * 9 + 6,
    delay:    -(Math.random() * 15),
    opacity:  Math.random() * 0.45 + 0.20,
    color:    isBio
      ? (Math.random() > 0.5 ? 'rgba(80,220,255,' : 'rgba(100,160,255,')
      : 'rgba(220,235,255,',
  }
})

export function MarineSnow() {
  const particles = PARTICLES

  return (
    <div className="marine-snow-wrap" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="snow-particle"
          style={{
            left:              `${p.left}vw`,
            width:             p.size,
            height:            p.size,
            background:        `${p.color}${p.opacity})`,
            animationDuration: `${p.duration}s`,
            animationDelay:    `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
