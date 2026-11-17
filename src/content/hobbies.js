// ── Captain's Log lines and hobby pages ────────────────────────────────
// The rotating "> …" lines in the Captain's Log. Pure data — no JSX, no
// imports — so scripts/prerender.mjs can read it from Node.
//
// LOG_INTRO is the sentence under the "Captain's Log" heading. Every
// block in HOBBIES is one log line AND a page of its own at
// /hobbies/<slug>/ — the line opens it.
//
//   slug   the page address — unique, lowercase, hyphens between words
//   title  the page heading
//   log    the line as typed in the Captain's Log (also the page's opener
//          and its search/share description)
//
// To fill a page with photos and stories, add
// src/content/pages/hobbies/<slug>.mdx.

export const LOG_INTRO =
  "I'm just a man trying to make cool stuff: games, boat simulations, the occasional VR experience for a space agency."

export const HOBBIES = [
  {
    slug:  'gaming',
    title: 'Gaming',
    log:   'Gamer at heart: Zelda is an all-time favorite, Minecraft is timeless.',
  },
  {
    slug:  'musical-theater',
    title: 'Musical theater',
    log:   'Musical theater nerd: catching every touring production I ever can',
  },
  {
    slug:  'cooking',
    title: 'Cooking',
    log:   "Cooking enthusiast: my favorite thing to cook is something I've never cooked before",
  },
  {
    slug:  'fly-fishing',
    title: 'Fly fishing',
    // The count is the total of the catch table in
    // src/content/pages/hobbies/fly-fishing.mdx. Change both together.
    log:   'Avid fly fisherman: fished the Wisconsin Driftless, the Appalachians in Virginia, and the White River. Current trout count: 6',
  },
  {
    slug:  'scuba',
    title: 'Scuba diving',
    log:   'Newly PADI certified open water diver, shout out to Pacific Scuba Divers!',
  },
  {
    slug:  'ttrpg',
    title: 'Tabletop RPGs',
    log:   'TTRPG Player: if I use the name, then Wizards of the Coast™ might get me',
  },
]
