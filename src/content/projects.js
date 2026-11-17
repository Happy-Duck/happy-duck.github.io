// ── Projects ───────────────────────────────────────────────────────────
// One block per project. Order here = order in the grid (first = top-left).
// Pure data — no JSX, no imports — so scripts/prerender.mjs can read it
// from Node as well as the app.
//
//   slug     the page address: /projects/<slug>/ — unique, lowercase, no spaces
//   summary  one sentence for search results and link previews
//   blurb    optional: what the CARD says when the description runs past
//            three lines. The page still opens with the description
//   link     corner button target; '#' hides the button
//   tags     which mission profiles feature this (games, xr, graphics, tools, research)
//   skills   ids from skills.js — drives the cross-links
//   courses  optional: slugs from courses.js for the class it came out of
//   grid     optional: false = has a page but no card in the Projects grid
//   links    optional extra buttons on the page: [{ label, href }]
//   cover    optional: a picture under /media/ for the card shown when the
//            page's link is shared (made by `npm run media`); without one
//            the card is the page title over the site's water
//   details  role / highlights / optional playable embed, shown on the page
//
// details.highlights wording drawn from the card descriptions + README —
// owner should review and punch up with specifics.

export const PROJECTS = [
  {
    slug:        'pelagos',
    title:       'Pelagos: A Marine Adventure',
    summary:     'A narrative-driven marine exploration game built in Unity, self-published on Steam with 30,000+ downloads.',
    description: 'A narrative-driven marine exploration game built entirely in Unity. Self-published on Steam and downloaded 30k+ times. Adopted by local schools as an interactive environmental science teaching tool.',
    stack:       ['Unity', 'C#', 'Steam', 'Steamworks SDK'],
    link:        'https://store.steampowered.com/app/2645390/Pelagos_A_Marine_Adventure',
    tags:        ['games'],
    skills:      ['unity', 'csharp'],
    cover:       '/media/projects/pelagos/steam-3.webp',
    details: {
      role: 'Solo developer: design, code, and publishing',
      highlights: [
        'Self-published on Steam with 30,000+ downloads',
        'Adopted by local schools as an environmental-science teaching tool',
        'Full production pipeline in Unity/C#, from gameplay to Steamworks integration',
      ],
      embed: { src: 'https://store.steampowered.com/widget/2645390/', height: 190, title: 'Pelagos on Steam' },
    },
  },
  {
    slug:        'party-school',
    title:       'Party School',
    summary:     'A multiplayer sandbox party game in Unreal Engine 5, built in a five-person team on a streamed real-world city map.',
    blurb:       'Multiplayer sandbox party game built in a five-person team. Built the shared multiplayer core, streamed a real-world city-scale map from the Google Map Tiles API, and implemented the racing minigame.',
    description: "Multiplayer sandbox party game with minigame activities built in a five-person team. Built the shared core project base supporting multiplayer integration, reviewed teammates' code, and streamed a real-world city-scale map into the engine from the Google Map Tiles API via the BLOSM plugin; also implementing the racing minigame using Unreal's Chaos Vehicle system.",
    stack:       ['Unreal Engine 5', 'Blueprints', 'Chaos Vehicles', 'BLOSM'],
    link:        '#',
    tags:        ['games'],
    skills:      ['unreal'],
    courses:     ['cs-415'],
    details: {
      role: 'Gameplay engineer on a five-person team',
      highlights: [
        "Built the shared core project base supporting multiplayer integration across all minigames, and reviewed teammates' code",
        "Streamed a real-world city-scale map into the engine from Google's Map Tiles API via the BLOSM plugin",
        "Implementing the racing minigame on Unreal's Chaos Vehicle system",
      ],
    },
  },
  {
    slug:        'flarp',
    title:       'Flarp',
    summary:     "A puzzle Metroidvania built around wind mechanics and momentum-based traversal, made with UIUC's ACM GameBuilders.",
    description: "A puzzle Metroidvania built around wind mechanics and momentum-based traversal. Developed with UIUC's ACM GameBuilders club.",
    stack:       ['GameMaker Studio', 'GML'],
    link:        'https://orangepainting.itch.io/flarp',
    tags:        ['games'],
    skills:      [],
    details: {
      role: 'Developer, UIUC ACM GameBuilders club project',
      highlights: [
        'Puzzle Metroidvania built around wind mechanics and momentum-based traversal',
        'Playable on itch.io',
      ],
      embed: { src: 'https://itch.io/embed/3890349?dark=true', height: 167, title: 'Flarp on itch.io' },
    },
  },
  {
    slug:        'sportsbot',
    title:       'SportsBot',
    summary:     'A Discord bot delivering live scores, player stats, and schedule alerts through slash commands.',
    description: 'Discord bot delivering live scores, player stats, and schedule alerts through a clean slash-command interface, using asyncio for concurrent, scheduled background tasks and REST sports APIs for data retrieval.',
    stack:       ['Python', 'discord.py', 'asyncio', 'REST APIs'],
    link:        'https://github.com/Happy-Duck/DiscordSportsBot',
    tags:        ['tools'],
    skills:      ['python', 'sql'],
    courses:     ['cs-222'],
    details: {
      // From the CS 222 project proposal: a team of four, with the owner
      // in the pair on the Discord side. Team size confirmed by the owner
      // (2026-11-17).
      role: 'Discord integration, on a four-person team',
      highlights: [
        'Live scores, player stats, and schedule alerts via slash commands',
        'Built with asyncio for concurrent, scheduled background tasks',
        'Backed by REST sports APIs with a SQL persistence layer',
      ],
    },
  },
  {
    slug:        'tide-toss',
    title:       'Tide Toss',
    summary:     'A physics-based tosser game built in 48 hours for the Game Builders Game Jam.',
    description: 'Physics-based "Tosser" game built in 48 hours for the Game Builders Game Jam. Combination of 2D art, 3D physics, and 1D gameplay',
    stack:       ['Unity', 'C#', 'Espresso'],
    link:        'https://happy-ducky.itch.io/tide-toss',
    tags:        ['games'],
    skills:      ['unity', 'csharp'],
    details: {
      role: '48-hour jam entry, Game Builders Game Jam',
      highlights: [
        'Physics "tosser" mixing 2D art, 3D physics, and 1D gameplay',
        'Concept to shipped build in one weekend',
      ],
      embed: { src: 'https://itch.io/embed/3856158?dark=true', height: 167, title: 'Tide Toss on itch.io' },
    },
  },
  {
    slug:        'cv-research',
    title:       'Computer Vision Research',
    summary:     'A benchmark of Faster R-CNN against YOLOv8 for real-time object detection on COCO, written up as a research paper.',
    description: 'Benchmark comparison of Faster R-CNN (Detectron2) against YOLOv8 for real-time object detection on the COCO dataset. Authored a research paper analyzing accuracy–latency tradeoffs.',
    stack:       ['Python', 'Detectron2', 'YOLOv8', 'COCO'],
    link:        '#',
    tags:        ['research', 'graphics'],
    skills:      ['python', 'pytorch'],
    details: {
      role: 'Undergraduate researcher',
      highlights: [
        'Benchmarked Faster R-CNN (Detectron2) against YOLOv8 on COCO',
        'Authored a research paper analyzing accuracy–latency tradeoffs for real-time object detection',
      ],
    },
  },
  {
    slug:        'this-site',
    title:       'This website',
    summary:     'A portfolio built as a dive from the surface to 6,000 m, with the water, light, and animals drawn live in the browser.',
    blurb:       'The site you are on, designed and written entirely by Claude as an experiment I rerun when a more capable model comes out. Scrolling is a dive from the surface to 6,000 metres, drawn live in the browser.',
    description: 'The site you are on. I did not write its code: Claude, Anthropic\'s AI model, designed and wrote all of it, and I rerun the experiment with an overhaul whenever a notably more capable model comes out. Scrolling is a dive from the surface to 6,000 metres: the water darkens, the light changes, and different animals live at each depth.',
    stack:       ['React', 'Vite', 'WebGL2', 'WebGPU', 'three.js'],
    link:        'https://github.com/Happy-Duck/happy-duck.github.io',
    tags:        ['graphics'],
    skills:      [],
    details: {
      // The owner asked (2026-11-15) for this page to be plain that the
      // site is Claude's work. Keep it that way in any rewording.
      role: 'Direction and review. Design, code, and this write-up by Claude (Anthropic)',
      highlights: [
        'Designed and written entirely by Claude: Opus 4.6, then Fable 5, then Fable 5.2',
        'One animation loop drives everything, scaled to real elapsed time',
        'About 380 fish simulated on the GPU with WebGPU',
        'Light shafts rendered in WebGL2, off the main thread',
      ],
    },
  },
]
