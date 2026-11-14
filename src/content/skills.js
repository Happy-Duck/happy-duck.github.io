// ── Skills ─────────────────────────────────────────────────────────────
// Names and hover tooltips. The icon for each id is wired up in
// src/components/Skills.jsx (the ICONS list) — adding a skill means adding
// a line here AND an icon there. Pure data, readable from Node.
//
//   id       how work.js / projects.js refer to this skill — never rename

export const SKILL_GROUPS = [
  {
    label: 'Languages',
    items: [
      { id: 'cpp',    name: 'C++',    tooltip: 'Data Structures and Unreal Engine' },
      { id: 'csharp', name: 'C#',     tooltip: 'All of my Unity Scripts' },
      { id: 'java',   name: 'Java',   tooltip: "Good ol' CS 124" },
      { id: 'python', name: 'Python', tooltip: 'Data analysis, Linear algebra, Computer vision research' },
    ],
  },
  {
    label: 'Tools & Frameworks',
    items: [
      { id: 'unity',   name: 'Unity',         tooltip: "What haven't I used Unity for" },
      { id: 'unreal',  name: 'Unreal Engine', tooltip: 'Game Dev coursework' },
      { id: 'blender', name: 'Blender',       tooltip: 'Asset creation & texturing for the ILL' },
      { id: 'django',  name: 'Django',        tooltip: 'A web app I built and will not elaborate on' },
      { id: 'sql',     name: 'SQL',           tooltip: "SportsBot's backbone" },
      { id: 'git',     name: 'Git',           tooltip: "Version control for everything that isn't Perforce" },
      { id: 'pytorch', name: 'PyTorch',       tooltip: 'Faster R-CNN vs. YOLOv8, benchmarked' },
    ],
  },
]
