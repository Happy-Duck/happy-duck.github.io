// ── Time-of-day surface palette ────────────────────────────────────────
// The sunlit zone tints to the visitor's local clock. Values stay in the
// teal family so the dark hero text keeps contrast (never true black).
// NOTE: the hex values in index.html's pre-paint script must stay in sync
// with TOD_SURFACE[tod][0].

export function todBucket(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

// Replacement colors for the first two ocean background stops
// (depth 0.00 and 0.15). Deeper stops are unaffected — daylight falls
// on the surface, not the abyss. Night intentionally renders as day:
// a truly dark night sea would need light hero text (owner decision —
// keep contrast simple, let dawn/dusk carry the feature).
// At dawn/dusk the water warms toward the sky's color. The base stays
// recognizably "water" — the strong top-down sky gradient lives in the
// .overlay-reef layer (--tod-sky-grad), which blends warm → teal within
// the first viewport. Red light dies in the first ~150 m, so the second
// stop returns to the usual teal.
export const TOD_SURFACE = {
  dawn:  [{ r: 0x93, g: 0xb9, b: 0xb0 }, { r: 0x2f, g: 0x75, b: 0x70 }],
  day:   [{ r: 0x48, g: 0xb8, b: 0xb0 }, { r: 0x16, g: 0x6a, b: 0x60 }],
  dusk:  [{ r: 0x74, g: 0xa2, b: 0x8c }, { r: 0x2e, g: 0x6a, b: 0x5e }],
  night: [{ r: 0x48, g: 0xb8, b: 0xb0 }, { r: 0x16, g: 0x6a, b: 0x60 }],
}
