// ── Coursework — the bubble column ─────────────────────────────────────
// One line per class. Every class is a bubble in the Education section;
// size follows credit hours, color follows the department in its code
// (see COURSE_CATEGORIES). Pure data — no JSX, no imports — so
// scripts/prerender.mjs can read it from Node.
//
//   slug         unique id, lowercase with a hyphen: 'cs-418'
//   code/title   what the bubble and the list show. The part of the code
//                before the space ('CS', 'MATH') sets the bubble's color
//   term         one of the ids in TERMS below
//   credits      credit hours (bubble size)
//   note         optional extra line in the hover card
//   links        optional buttons on the class page (a repo, a demo):
//                links: [{ label: 'MP2 source', href: 'https://github.com/...' }]
//
// MAKING A CLASS CLICKABLE: give it a `summary` and a `description`. That
// is all it takes — the bubble gets a glow ring and opens the class's own
// page at /courses/<slug>/. To put a longer write-up, photos, or demos on
// that page, add src/content/pages/courses/<slug>.mdx. To list a project
// on it, add  courses: ['<slug>']  to that project in projects.js.
//
// Grades are deliberately not recorded here.

export const TERMS = [
  { id: 'FA24', label: 'Fall 2024' },
  { id: 'SP25', label: 'Spring 2025' },
  { id: 'SU25', label: 'Summer 2025' },
  { id: 'FA25', label: 'Fall 2025' },
  { id: 'SP26', label: 'Spring 2026' },
  { id: 'FA26', label: 'Fall 2026' },
  { id: 'SP27', label: 'Spring 2027' },
]

// The semester happening right now. Classes in earlier terms show as
// completed, this term as in progress, later terms as planned. Bump this
// once a semester (and add the new term + classes above and below).
export const CURRENT_TERM = 'FA26'

// Bubble colors. THE RULE: a class takes the color of the department code
// printed on its bubble, and nothing else decides it. Every CS class is
// blue, every GSD class purple, MATH and PHYS green, every other
// department orange. (The first version colored by topic, which took
// judgement calls: CS 361 went green as math, CS 418 purple as graphics,
// and the owner read the result as inconsistent. A code cannot be
// misread.) A department not listed falls in the last group.
export const COURSE_CATEGORIES = [
  { id: 'cs',    label: 'CS',                depts: ['CS'],           color: '#22c7f5' },
  { id: 'gsd',   label: 'GSD',               depts: ['GSD'],          color: '#b58bff' },
  { id: 'math',  label: 'MATH and PHYS',     depts: ['MATH', 'PHYS'], color: '#3fe0a6' },
  { id: 'other', label: 'Other departments', depts: [],               color: '#ffb65c' },
]

// The group a class belongs to, from its code
export function courseCategory(course) {
  const dept = course.code.split(' ')[0]
  return COURSE_CATEGORIES.find(k => k.depts.includes(dept)) ?? COURSE_CATEGORIES[COURSE_CATEGORIES.length - 1]
}

export const COURSES = [
  // ── Fall 2024 ──
  { slug: 'cs-124',   code: 'CS 124',   title: 'Intro to Computer Science I',     term: 'FA24', credits: 3 },
  { slug: 'gsd-101',  code: 'GSD 101',  title: 'Intro to Game Studies & Design',  term: 'FA24', credits: 3 },
  { slug: 'gsd-390',  code: 'GSD 390',  title: 'Unity Programming in C#',         term: 'FA24', credits: 2 },
  { slug: 'math-221', code: 'MATH 221', title: 'Calculus I',                      term: 'FA24', credits: 4 },
  { slug: 'nres-103', code: 'NRES 103', title: 'The Great Lakes at Risk',         term: 'FA24', credits: 3 },

  // ── Spring 2025 ──
  { slug: 'cs-128',   code: 'CS 128',   title: 'Intro to Computer Science II',    term: 'SP25', credits: 3 },
  { slug: 'cs-173',   code: 'CS 173',   title: 'Discrete Structures',             term: 'SP25', credits: 3 },
  { slug: 'gsd-103',  code: 'GSD 103',  title: 'The Basics of Game Design',       term: 'SP25', credits: 3 },
  { slug: 'math-231', code: 'MATH 231', title: 'Calculus II',                     term: 'SP25', credits: 3 },
  { slug: 'thea-110', code: 'THEA 110', title: 'Broadway Musicals',               term: 'SP25', credits: 3 },

  // ── Summer 2025 ──
  { slug: 'phys-211', code: 'PHYS 211', title: 'University Physics: Mechanics',               term: 'SU25', credits: 5, note: 'Summer transfer credit' },
  { slug: 'phys-212', code: 'PHYS 212', title: 'University Physics: Electricity & Magnetism', term: 'SU25', credits: 5, note: 'Summer transfer credit' },

  // ── Fall 2025 ──
  {
    slug: 'cs-222', code: 'CS 222', title: 'Software Design Lab', term: 'FA25', credits: 1,
    // From the project proposal the owner shared (2026-11-15)
    summary:     "UIUC's software design lab: one team project for the whole semester. Ours was SportsBot, a Discord bot for sports statistics.",
    description: 'A one-credit lab built around a single team project that runs the whole semester, planned week by week and merged through pull requests. Our group of four built SportsBot, a Discord bot for sports statistics.',
  },
  { slug: 'cs-225',   code: 'CS 225',   title: 'Data Structures',                 term: 'FA25', credits: 4 },
  { slug: 'cs-233',   code: 'CS 233',   title: 'Computer Architecture',           term: 'FA25', credits: 4 },
  { slug: 'gsd-102',  code: 'GSD 102',  title: 'Intro to the Videogame Industry', term: 'FA25', credits: 3 },
  { slug: 'math-241', code: 'MATH 241', title: 'Calculus III',                    term: 'FA25', credits: 4 },

  // ── Spring 2026 ──
  { slug: 'cs-361',   code: 'CS 361',   title: 'Probability & Statistics for Computer Science', term: 'SP26', credits: 3 },
  { slug: 'cs-374',   code: 'CS 374',   title: 'Algorithms & Models of Computation',            term: 'SP26', credits: 4 },
  {
    slug: 'cs-415', code: 'CS 415', title: 'Game Development', term: 'SP26', credits: 3,
    // The class was a set of MPs, then a final project of about a month
    // (owner, 2026-11-17). The documents shared are the final project's.
    summary:     "UIUC's game development course. Final project: Party School, a multiplayer party game in Unreal Engine 5.",
    description: "UIUC's game development course: a set of machine problems, then a final project of about a month. Ours was Party School, a multiplayer sandbox party game built in Unreal Engine 5 by a team of five.",
  },
  { slug: 'math-257', code: 'MATH 257', title: 'Linear Algebra with Computational Applications', term: 'SP26', credits: 3 },

  // ── Fall 2026 ──
  { slug: 'cpsc-131', code: 'CPSC 131', title: 'Agriculture in Mythology',        term: 'FA26', credits: 3 },
  { slug: 'cs-357',   code: 'CS 357',   title: 'Numerical Methods I',             term: 'FA26', credits: 3 },
  {
    slug: 'cs-417', code: 'CS 417', title: 'Intro to Extended Reality', term: 'FA26', credits: 3,
    // Written from the design documents and contribution summaries the
    // owner shared (2026-11-15). The itch.io pages are public (owner,
    // 2026-11-17).
    summary:     "UIUC's introduction to extended reality: a VR escape room, a farm sim, and a final project, all built in Unity.",
    description: "UIUC's introduction to extended reality, taught through a run of VR projects in Unity: a room with a comet in orbit, an escape room built by four people, a farm sim built by five, and a final project that is still in progress.",
    links: [
      { label: 'MP2 source', href: 'https://github.com/Happy-Duck/CS417_MP2' },
      { label: 'The room on itch.io', href: 'https://happy-ducky.itch.io/the-room' },
      { label: 'Escape room on itch.io', href: 'https://happy-ducky.itch.io/shiny-hunter-simulator' },
      { label: 'Chicken farm on itch.io', href: 'https://happy-ducky.itch.io/chicken-farming-simulator' },
    ],
  },
  {
    slug: 'cs-418', code: 'CS 418', title: 'Interactive Computer Graphics', term: 'FA26', credits: 3,
    // PLACEHOLDER wording — replace once the demos are ready
    summary:     "UIUC's interactive computer graphics course: a semester of WebGL work.",
    description: "UIUC's interactive computer graphics course. A semester of WebGL work, in progress. Demos coming as they wrap.",
  },
  {
    slug: 'info-418', code: 'INFO 418', title: 'Makerspace: Escape Rooms', term: 'FA26', credits: 3,
    // Drawn from the repo description and the Keg Safe 2.0 schematic the
    // owner shared (2026-11-15). The owner designed the keg safe circuit
    // (confirmed 2026-11-17). Still in progress this semester.
    summary:     'A makerspace course on building escape rooms. I built the electronics and Arduino code behind two of the props in Riggs Escape.',
    description: 'A makerspace course on building escape rooms. For Riggs Escape I wrote the Arduino Uno code that controls the electronics for the sticker dispenser and the keg safe door, and designed the keg safe circuit: a keypad, a solenoid lock, two status lights, and a buzzer. In progress this semester.',
    links: [
      { label: 'Arduino source', href: 'https://github.com/Happy-Duck/MetaPuzzleArduinoCode' },
    ],
  },

  // ── Spring 2027 ──
  { slug: 'cs-341',   code: 'CS 341',   title: 'System Programming',               term: 'SP27', credits: 4 },
  { slug: 'cs-410',   code: 'CS 410',   title: 'Text Information Systems',         term: 'SP27', credits: 3 },
  { slug: 'cs-444',   code: 'CS 444',   title: 'Deep Learning for Computer Vision', term: 'SP27', credits: 3 },
  { slug: 'faa-201',  code: 'FAA 201',  title: 'Black Arts Today',                 term: 'SP27', credits: 3 },
]

// ── Helpers ────────────────────────────────────────────────────────────

const termIndex = (id) => TERMS.findIndex(t => t.id === id)

export function termLabel(id) {
  return TERMS.find(t => t.id === id)?.label ?? id
}

// 'done' | 'now' | 'next', from the class's term against CURRENT_TERM
export function courseStatus(course) {
  const diff = termIndex(course.term) - termIndex(CURRENT_TERM)
  return diff < 0 ? 'done' : diff === 0 ? 'now' : 'next'
}

export const STATUS_LABEL = { done: 'Completed', now: 'In progress', next: 'Planned' }

// A class has its own page once it has a description
export function courseHasPage(course) {
  return Boolean(course.description)
}
