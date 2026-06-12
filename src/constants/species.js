// ── Species registry — dive log entries ───────────────────────────────
// ids match the tickSeen()/markSeen() calls inside each creature.

export const SPECIES = [
  { id: 'reefFish',         name: 'Clownfish',         zone: 'Sunlit Zone',   depth: '0–200 m',       note: 'Travels in threes. Refuses to discuss the anemone incident.' },
  { id: 'seaTurtle',        name: 'Green Sea Turtle',  zone: 'Sunlit Zone',   depth: '0–200 m',       note: 'Unbothered. Moisturized. In its lane.' },
  { id: 'jellyfish',        name: 'Moon Jellyfish',    zone: 'Twilight Zone', depth: '200–1,000 m',   note: '95% water, 100% vibes.' },
  { id: 'squid',            name: 'Firefly Squid',     zone: 'Twilight Zone', depth: '200–1,000 m',   note: 'Darts when startled. Easily startled.' },
  { id: 'anglerfish',       name: 'Anglerfish',        zone: 'Midnight Zone', depth: '1,000–4,000 m', note: 'Brings its own lighting to every occasion.' },
  { id: 'deepSeaFish',      name: 'Fangtooth',         zone: 'Midnight Zone', depth: '1,000–4,000 m', note: 'All teeth, no dental plan.' },
  { id: 'abyssalJellyfish', name: 'Abyssal Medusa',    zone: 'Abyssal Zone',  depth: '4,000–6,000 m', note: "Glows like it knows something you don't." },
  { id: 'giantSquid',       name: 'Giant Squid',       zone: 'Abyssal Zone',  depth: '4,000–6,000 m', note: 'Architeuthis. Seldom seen. Sees you often.' },
  { id: 'snailfish',        name: 'Hadal Snailfish',   zone: 'Abyssal Zone',  depth: '6,000 m+',      note: "Deepest fish ever recorded. Doesn't brag about it." },
  { id: 'crab',             name: 'Bottom-Dweller Crab', zone: 'Ocean Floor', depth: '6,000 m',       note: 'Scuttles. Has places to be. Pokeable.' },
]

// Secret bonus entry — only listed in the journal once seen
export const BONUS_SPECIES = {
  id:    'whale',
  name:  'The Leviathan',
  zone:  '???',
  depth: '???',
  note:  'Some things in the deep are only seen once.',
}
