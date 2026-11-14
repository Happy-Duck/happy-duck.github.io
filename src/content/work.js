// ── Career entries ─────────────────────────────────────────────────────
// One block per job. Order here = order on the page (newest first).
// Pure data — no JSX, no imports — so scripts/prerender.mjs can read it
// from Node as well as the app.
//
//   slug     the page address: /work/<slug>/ — unique, lowercase, no spaces
//   summary  one sentence for search results and link previews
//   tags     which mission profiles feature this (games, xr, graphics, tools, research)
//   skills   ids from skills.js — drives the cross-links

export const WORK = [
  {
    slug:        'brunswick',
    company:     'Brunswick BI Design Lab',
    role:        'Software Development Intern, Computer Graphics',
    period:      'May 2026 – Present',
    summary:     "Primary developer on the Unreal Engine 5.7 simulator behind Future Helm, Brunswick's CES 2027 marine showcase.",
    description: "Primary developer on the UE5.7 simulator behind Future Helm, Brunswick's flagship CES 2027 marine showcase, reviewed and approved by the C-suite ahead of its January public exhibition. Own the multiprotocol C++ data layer (TCP, UDP, CAN) exchanging live vessel state, engine telemetry, and navigation data with a teammate's multi-function display app, and prototyped collision prevention and spline-based intelligent navigation. Optimized runtime to a 60 fps target with custom LOD tuning and event-driven Blueprint messaging in place of per-frame polling. Top-3 finalist for Most Outstanding Undergraduate Intern at the 2026 UIUC Research Park Intern Awards (800+ interns, 120+ companies).",
    stack:       ['Unreal Engine 5', 'C++', 'TCP/UDP', 'CAN bus', 'Perforce'],
    tags:        ['graphics', 'tools'],
    skills:      ['unreal', 'cpp'],
  },
  {
    slug:        'immersive-learning-lab',
    company:     'Immersive Learning Lab',
    role:        'Virtual Reality Software Developer',
    period:      'Oct 2025 – Present',
    summary:     "Built a VR educational app in Unity visualizing the University of Bern's MANiaC mass spectrometer for ESA's Comet Interceptor mission.",
    description: "Designed and programmed a VR educational application in Unity/C# visualizing the University of Bern's MANiaC mass spectrometer (ESA's Comet Interceptor mission) and built a near-photorealistic replica of the ISSI lobby in Bern, with physics simulations, live data graphing via XCharts, animation systems, and custom interaction scripts driving NavMesh-driven NPCs. Presented at the IMMERSE Annual Symposium (April 2026) via poster and live demo.",
    stack:       ['Unity', 'C#', 'Blender', 'VR', 'XR Toolkit', 'XCharts', 'OpenXR'],
    tags:        ['xr'],
    skills:      ['unity', 'csharp', 'blender'],
  },
  {
    slug:        'origami-games',
    company:     'Origami Games',
    role:        'Game Development Intern',
    period:      'June – July 2023',
    summary:     'Built endless runner and maze escape prototypes in Unity with procedural level generation.',
    description: 'Built prototypes for endless runner and maze escape games in Unity/C#; implemented procedural level generation.',
    stack:       ['Unity', 'C#', 'Procedural Gen'],
    tags:        ['games'],
    skills:      ['unity', 'csharp'],
  },
]
