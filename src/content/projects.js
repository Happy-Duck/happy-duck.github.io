// ── Projects ───────────────────────────────────────────────────────────
// One block per project. Order here = order in the grid (first = top-left).
// Pure data — no JSX, no imports — so scripts/prerender.mjs can read it
// from Node as well as the app.
//
//   slug     the page address: /projects/<slug>/ — unique, lowercase, no spaces
//   summary  one sentence for search results and link previews
//   link     corner button target; '#' hides the button
//   tags     which mission profiles feature this (games, xr, graphics, tools, research)
//   skills   ids from skills.js — drives the cross-links
//   courses  optional: slugs from courses.js for the class it came out of
//   grid     optional: false = has a page but no card in the Projects grid
//   links    optional extra buttons on the page: [{ label, href }]
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
    details: {
      role: 'Solo developer',
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
]
