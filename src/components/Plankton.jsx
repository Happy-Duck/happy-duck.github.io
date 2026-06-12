// ── Plankton — CSS-only, shallow-zone particles ───────────────────────
// Tiny green/yellow particles drifting upward. Visible at depth < 0.30.
// Opacity driven by --plankton-opacity CSS var set in OceanDepthContext.

const PARTICLE_COUNT = 30

// Randomized once at module load — render stays pure
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const shade = Math.random()
  return {
    id:       i,
    left:     Math.random() * 100,
    size:     Math.random() * 3.0 + 1.5,
    duration: Math.random() * 11 + 7,
    delay:    -(Math.random() * 18),
    opacity:  Math.random() * 0.4 + 0.35,
    color:    shade < 0.4
      ? `rgba(60,220,80,`     // bright green
      : shade < 0.7
      ? `rgba(100,230,60,`    // yellow-green
      : `rgba(140,240,100,`,  // light green
  }
})

export function Plankton() {
  const particles = PARTICLES

  return (
    <div className="plankton-wrap" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="plankton-particle"
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
