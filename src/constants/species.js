// ── Species registry — dive log entries ───────────────────────────────
// ids match the inspectSeen()/markSeen() calls inside each creature.

// The anchovy school is WebGPU-only and stands down under reduced motion
// (see BoidSchool.jsx) — its entry is only listed where the school can
// actually render, so the journal stays completable everywhere else.
const HAS_SCHOOL =
  typeof navigator !== 'undefined' && Boolean(navigator.gpu) &&
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const SPECIES = [
  ...(HAS_SCHOOL ? [
    { id: 'anchovy',        name: 'Anchovy School',    zone: 'Sunlit Zone',   depth: '0–400 m',       note: 'Moves as one. Thinks as none.' },
  ] : []),
  { id: 'reefFish',         name: 'Clownfish',         zone: 'Sunlit Zone',   depth: '0–200 m',       note: 'You found Nemo!' },
  { id: 'seaTurtle',        name: 'Green Sea Turtle',  zone: 'Sunlit Zone',   depth: '0–200 m',       note: 'Unbothered. Moisturized. Going with the flow.' },
  { id: 'jellyfish',        name: 'Moon Jellyfish',    zone: 'Twilight Zone', depth: '200–1,000 m',   note: '95% water, 100% vibes.' },
  { id: 'squid',            name: 'Firefly Squid',     zone: 'Twilight Zone', depth: '200–1,000 m',   note: 'Darts when startled. Easily startled.' },
  { id: 'anglerfish',       name: 'Anglerfish',        zone: 'Midnight Zone', depth: '1,000–4,000 m', note: 'Brings its own lighting to every occasion.' },
  { id: 'deepSeaFish',      name: 'Fangtooth',         zone: 'Midnight Zone', depth: '1,000–4,000 m', note: 'All teeth, no dental plan.' },
  { id: 'abyssalJellyfish', name: 'Abyssal Medusa',    zone: 'Abyssal Zone',  depth: '4,000–6,000 m', note: "Probably shouldn't touch this one." },
  { id: 'giantSquid',       name: 'Giant Squid',       zone: 'Abyssal Zone',  depth: '4,000–6,000 m', note: 'Architeuthis. Seldom seen alive.' },
  { id: 'snailfish',        name: 'Hadal Snailfish',   zone: 'Abyssal Zone',  depth: '6,000 m+',      note: "Deepest fish ever recorded. But it's not that deep." },
  { id: 'crab',             name: 'Bottom-Dweller Crab', zone: 'Ocean Floor', depth: '6,000 m',       note: 'Be Aware: Highly Pokeable.' },
]

// Secret bonus entry — only listed in the journal once seen
export const BONUS_SPECIES = {
  id:    'whale',
  name:  'Moby?',
  zone:  '???',
  depth: '???',
  note:  'Some things in the deep are only seen once.',
}
