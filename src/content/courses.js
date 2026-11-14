// ── Coursework — the bubble column ─────────────────────────────────────
// One line per class. Every class is a bubble in the Education section;
// size follows credit hours, color follows category. Pure data — no JSX,
// no imports — so scripts/prerender.mjs can read it from Node.
//
//   slug         unique id, lowercase with a hyphen: 'cs-418'
//   code/title   what the bubble and the list show
//   term         one of the ids in TERMS below
//   credits      credit hours (bubble size)
//   category     one of the ids in COURSE_CATEGORIES below (bubble color)
//   note         optional extra line in the hover card
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

export const COURSE_CATEGORIES = [
  { id: 'core',    label: 'Computer science',     color: '#22c7f5' },
  { id: 'games',   label: 'Games, graphics & XR', color: '#b58bff' },
  { id: 'math',    label: 'Math & science',       color: '#3fe0a6' },
  { id: 'breadth', label: 'Breadth',              color: '#ffb65c' },
]

export const COURSES = [
  // ── Fall 2024 ──
  { slug: 'cs-124',   code: 'CS 124',   title: 'Intro to Computer Science I',     term: 'FA24', credits: 3, category: 'core' },
  { slug: 'gsd-101',  code: 'GSD 101',  title: 'Intro to Game Studies & Design',  term: 'FA24', credits: 3, category: 'games' },
  { slug: 'gsd-390',  code: 'GSD 390',  title: 'Unity Programming in C#',         term: 'FA24', credits: 2, category: 'games' },
  { slug: 'math-221', code: 'MATH 221', title: 'Calculus I',                      term: 'FA24', credits: 4, category: 'math' },
  { slug: 'nres-103', code: 'NRES 103', title: 'The Great Lakes at Risk',         term: 'FA24', credits: 3, category: 'breadth' },

  // ── Spring 2025 ──
  { slug: 'cs-128',   code: 'CS 128',   title: 'Intro to Computer Science II',    term: 'SP25', credits: 3, category: 'core' },
  { slug: 'cs-173',   code: 'CS 173',   title: 'Discrete Structures',             term: 'SP25', credits: 3, category: 'core' },
  { slug: 'gsd-103',  code: 'GSD 103',  title: 'The Basics of Game Design',       term: 'SP25', credits: 3, category: 'games' },
  { slug: 'math-231', code: 'MATH 231', title: 'Calculus II',                     term: 'SP25', credits: 3, category: 'math' },
  { slug: 'thea-110', code: 'THEA 110', title: 'Broadway Musicals',               term: 'SP25', credits: 3, category: 'breadth' },

  // ── Summer 2025 ──
  { slug: 'phys-211', code: 'PHYS 211', title: 'University Physics: Mechanics',               term: 'SU25', credits: 5, category: 'math', note: 'Summer transfer credit' },
  { slug: 'phys-212', code: 'PHYS 212', title: 'University Physics: Electricity & Magnetism', term: 'SU25', credits: 5, category: 'math', note: 'Summer transfer credit' },

  // ── Fall 2025 ──
  { slug: 'cs-222',   code: 'CS 222',   title: 'Software Design Lab',             term: 'FA25', credits: 1, category: 'core' },
  { slug: 'cs-225',   code: 'CS 225',   title: 'Data Structures',                 term: 'FA25', credits: 4, category: 'core' },
  { slug: 'cs-233',   code: 'CS 233',   title: 'Computer Architecture',           term: 'FA25', credits: 4, category: 'core' },
  { slug: 'gsd-102',  code: 'GSD 102',  title: 'Intro to the Videogame Industry', term: 'FA25', credits: 3, category: 'games' },
  { slug: 'math-241', code: 'MATH 241', title: 'Calculus III',                    term: 'FA25', credits: 4, category: 'math' },

  // ── Spring 2026 ──
  { slug: 'cs-361',   code: 'CS 361',   title: 'Probability & Statistics for Computer Science', term: 'SP26', credits: 3, category: 'math' },
  { slug: 'cs-374',   code: 'CS 374',   title: 'Algorithms & Models of Computation',            term: 'SP26', credits: 4, category: 'core' },
  {
    slug: 'cs-415', code: 'CS 415', title: 'Game Development', term: 'SP26', credits: 3, category: 'games',
    // PLACEHOLDER wording — replace with what you built
    summary:     "UIUC's game development course.",
    description: "UIUC's game development course. Project write-up coming soon.",
  },
  { slug: 'math-257', code: 'MATH 257', title: 'Linear Algebra with Computational Applications', term: 'SP26', credits: 3, category: 'math' },

  // ── Fall 2026 ──
  { slug: 'cpsc-131', code: 'CPSC 131', title: 'Agriculture in Mythology',        term: 'FA26', credits: 3, category: 'breadth' },
  { slug: 'cs-357',   code: 'CS 357',   title: 'Numerical Methods I',             term: 'FA26', credits: 3, category: 'math' },
  {
    slug: 'cs-417', code: 'CS 417', title: 'Intro to Extended Reality', term: 'FA26', credits: 3, category: 'games',
    // PLACEHOLDER wording — replace once the games are done
    summary:     "UIUC's introduction to extended reality: three VR games built over the semester.",
    description: "UIUC's introduction to extended reality. Three VR games, in progress this semester. Write-ups coming as they wrap.",
  },
  {
    slug: 'cs-418', code: 'CS 418', title: 'Interactive Computer Graphics', term: 'FA26', credits: 3, category: 'games',
    // PLACEHOLDER wording — replace once the demos are ready
    summary:     "UIUC's interactive computer graphics course: a semester of WebGL work.",
    description: "UIUC's interactive computer graphics course. A semester of WebGL work, in progress. Demos coming as they wrap.",
  },
  {
    slug: 'info-418', code: 'INFO 418', title: 'Makerspace: Escape Rooms', term: 'FA26', credits: 3, category: 'games',
    // PLACEHOLDER wording — replace once the build is done
    summary:     'A makerspace course on building escape rooms, with an electronics project.',
    description: 'A makerspace course on building escape rooms. An electronics project, in progress this semester. Write-up coming.',
  },

  // ── Spring 2027 ──
  { slug: 'cs-341',   code: 'CS 341',   title: 'System Programming',               term: 'SP27', credits: 4, category: 'core' },
  { slug: 'cs-410',   code: 'CS 410',   title: 'Text Information Systems',         term: 'SP27', credits: 3, category: 'core' },
  { slug: 'cs-444',   code: 'CS 444',   title: 'Deep Learning for Computer Vision', term: 'SP27', credits: 3, category: 'core' },
  { slug: 'faa-201',  code: 'FAA 201',  title: 'Black Arts Today',                 term: 'SP27', credits: 3, category: 'breadth' },
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
