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
// (depth 0.00 and 0.15). Deeper stops are unaffected — night falls
// on the surface, not the abyss.
export const TOD_SURFACE = {
  dawn:  [{ r: 0x62, g: 0xb0, b: 0xb6 }, { r: 0x1e, g: 0x6a, b: 0x6a }],
  day:   [{ r: 0x48, g: 0xb8, b: 0xb0 }, { r: 0x16, g: 0x6a, b: 0x60 }],
  dusk:  [{ r: 0x58, g: 0x9e, b: 0x9a }, { r: 0x1d, g: 0x5f, b: 0x62 }],
  night: [{ r: 0x35, g: 0x84, b: 0x8c }, { r: 0x10, g: 0x4a, b: 0x52 }],
}
