// ── Ocean depth zone definitions ──────────────────────────────────────
// All depths are normalized 0.0 (surface) → 1.0 (abyss floor).
// Scroll pacing is uneven on purpose (each zone gets a comfortable share
// of the page), so displayed meters are piecewise-linear through the zone
// boundaries — the readout always agrees with the zone label and the
// real-world ranges: sunlit 0–200 m, twilight 200–1,000 m, midnight
// 1,000–4,000 m, abyssal 4,000–6,000 m.

export const DEPTH_ZONES = {
  SUNLIT:   { min: 0.00, max: 0.20, meterMin: 0,    meterMax: 200,  label: 'Sunlit Zone',   meters: '0–200m'      },
  TWILIGHT: { min: 0.20, max: 0.50, meterMin: 200,  meterMax: 1000, label: 'Twilight Zone', meters: '200–1000m'   },
  MIDNIGHT: { min: 0.50, max: 0.72, meterMin: 1000, meterMax: 4000, label: 'Midnight Zone', meters: '1000–4000m'  },
  ABYSSAL:  { min: 0.72, max: 1.00, meterMin: 4000, meterMax: 6000, label: 'Abyssal Zone',  meters: '4000–6000m'  },
}

export function getZone(depth) {
  for (const [key, zone] of Object.entries(DEPTH_ZONES)) {
    if (depth >= zone.min && depth < zone.max) return { key, ...zone }
  }
  return { key: 'ABYSSAL', ...DEPTH_ZONES.ABYSSAL }
}

// Scroll fraction → displayed meters (piecewise through zone boundaries)
export function metersAt(depth) {
  const d = Math.max(0, Math.min(1, depth))
  const zone = getZone(d)
  const t = (d - zone.min) / (zone.max - zone.min)
  return zone.meterMin + t * (zone.meterMax - zone.meterMin)
}

// Meters → scroll fraction (inverse of metersAt)
export function depthAtMeters(m) {
  const clamped = Math.max(0, Math.min(6000, m))
  for (const zone of Object.values(DEPTH_ZONES)) {
    if (clamped <= zone.meterMax) {
      const t = (clamped - zone.meterMin) / (zone.meterMax - zone.meterMin)
      return zone.min + t * (zone.max - zone.min)
    }
  }
  return 1
}

// Vertical traverse: a creature enters its depth window swimming low in
// the frame and leaves it high — the diver sinks past it. Returns the px
// offset to SUBTRACT from the creature's base Y (negative below base at
// the start of its window, positive above base at the end).
const TRAVERSE_FRAC = 0.30
export function depthTraverse(depth, range, viewportH) {
  const p = Math.max(0, Math.min(1, (depth - range.enter) / (range.exit - range.enter)))
  return (2 * p - 1) * TRAVERSE_FRAC * viewportH
}

// Smooth ease-in-out for opacity ramps
export function easeInOut(t) {
  const c = Math.max(0, Math.min(1, t))
  return c < 0.5 ? 2 * c * c : -1 + (4 - 2 * c) * c
}

// Compute creature opacity from depth + depthRange
// Creatures stay at full opacity (1) throughout their zone.
// Only brief fade-in/fade-out at the boundaries (FADE depth units each).
const FADE = 0.025
export function creatureOpacity(depth, range) {
  const { enter, exit } = range
  if (depth <= enter || depth >= exit) return 0
  if (depth < enter + FADE) return easeInOut((depth - enter) / FADE)
  if (depth > exit  - FADE) return easeInOut((exit - depth)  / FADE)
  return 1
}
