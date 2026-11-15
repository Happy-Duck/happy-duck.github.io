# CLAUDE.md — working on this site

Rishi Garhyan's deep-sea portfolio (happy-duck.github.io). React 19 + Vite 8
+ Tailwind v4 + Framer Motion. The page is a side-on cross-section of the
ocean: scrolling = diving 0–6,000 m. Read this whole file before touching
the ocean systems; `docs/FEATURE_PLAN.md` (wave 1),
`docs/GRAPHICS_PLAN.md` (wave 2: WebGPU/WebGL/XR features), and
`docs/PORTFOLIO_PLAN.md` (wave 3: pages, content registry, courses —
IN PROGRESS on branch `feature/portfolio-wave-3`, phase table at the top)
hold the feature-by-feature history, specs, and hard-won gotchas.

## Commands

- `npm run dev` — dev server on :5173 (watcher ignores `public/` — OneDrive
  locks freshly-dropped files and crashes fs.watch with EBUSY otherwise)
- `npm run lint` — MUST stay at zero errors/warnings before every commit
- `npm run build` — prod build, then `scripts/prerender.mjs` writes a
  page shell per route + `sitemap.xml` into `dist/` (main bundle ≈ 445 kB
  / 144 kB gzip; devicons are imported per-icon from
  `devicons-react/lib/icons/*` — never from the package index, it's CJS
  and ships ~3,000 icons)
- `npm run preview` — serve `dist/`; the only way to check prerendered
  routes and their meta tags locally
- `npm run deploy` — build + push `dist/` to the `gh-pages` branch. This is
  the ONLY thing that changes the live site; merging to master does not.
  It publishes whatever is checked out — do NOT run it from the wave 3
  branch until the owner says that work is ready. It stops by itself
  while any page still holds placeholder content (see Placeholder content).

## Core architecture — the depth system

- `src/context/OceanDepthContext.jsx` owns a single rAF loop. Scroll maps
  to a 0–1 depth fraction; per-frame it writes CSS vars on `:root`
  (`--ocean-depth-progress`, `--ocean-bg-color`, `--beach-op`,
  `--particle-opacity`, …) and flips `data-theme`
  (shallow-reef ↔ deep-sea, hysteresis at 0.30/0.40).
- Creatures/effects register tick callbacks via `subscribe(fn)` from the
  context — never their own rAF (exceptions: the footer crab, the WebGL
  canvas). Under `prefers-reduced-motion`, subscribers only tick while
  depth changes; pure-CSS loops are stilled by the media-query block in
  `index.css`; Framer respects it via `MotionConfig reducedMotion="user"`.
- **Everything animates in delta time.** Subscribers receive
  `fn(depth, dt)` where dt is elapsed frame time in 60fps units (clamped
  0.25–2.5); loops with their own rAF (crab, GyroParallax, BoidSchool)
  compute the same dt themselves. EVERY per-frame motion constant must
  scale by dt — additive steps `* dt`, decays `Math.pow(k, dt)`, lerps
  `1 - Math.pow(1 - k, dt)` — or high-refresh displays fast-forward the
  animation (found live: fish ran 2× except while scroll jank held the
  page at 60fps). Time-driven systems (shader u_time, CSS animations,
  THREE.Clock) are already safe.
- **Meters ↔ scroll is PIECEWISE, not linear.** Zone scroll fractions are
  tuned for pacing (sunlit 0–0.20, twilight 0.20–0.50, midnight 0.50–0.72,
  abyssal 0.72–1.0) while meters follow the real ranges (0–200, 200–1,000,
  1,000–4,000, 4,000–6,000). Always convert with `metersAt()` /
  `depthAtMeters()` in `src/constants/depthZones.js`. Never `x * 6000`.

## Creatures

- Simple swimmers use `src/hooks/useCreatureAI.js` (sinusoidal path, mouse
  flee, peer repulsion). Bespoke ones (Anglerfish, Squid, GiantSquid,
  SnailFish, jellies) follow the same skeleton: subscribe → compute
  `creatureOpacity(depth, DEPTH_RANGE)` → early-return when invisible →
  move state in a ref → write `el.style.transform/opacity` directly (no
  React state in the hot path).
- Vertical placement: `depthTraverse(depth, range, vh)` sweeps a creature
  bottom→top across its own enter→exit window (±30 vh around its lane) —
  the diver sinks past it. Each creature LOW-PASS FILTERS the traverse
  (`p.trav += (target - p.trav) * 0.07`, snap when null) or fast scrolling
  teleports them. Jellyfish manage their own bottom-reset drift instead.
- A new creature needs: DEPTH_RANGE fractions consistent with its claimed
  meters (use the helpers), `inspectSeen('<id>', x, y, r, mouse)` when
  opacity ≥ 0.5 (dive log), `pingImpulse()` scatter reaction (sonar), an
  entry in `src/constants/species.js`, and a real photo cutout in
  `public/creatures/` — the owner strongly prefers real photos over
  drawn/generated art everywhere (whale + shipwreck are graded photos).

## Feature systems (event contracts)

- **Dive log** (`src/lib/diveLog.js`): persistence in localStorage under
  the `ocean.*` namespace, always try/catch (private mode). Discovery
  fires `window` CustomEvent `ocean:discovery`. Discovery is DELIBERATE:
  `inspectSeen(id, x, y, r, mouse)` per visible frame — ~130 ms of
  wall-clock cursor dwell on the body, or a sonar ping (click/tap)
  within 1.4r. Passive visibility does NOT count; `markSeen()` stays
  immediate.
- **Terminal** (`src/components/Terminal.jsx`): opens on typed `cmd` or
  backtick or the `>_` fab. `ls [kind]` lists pages and `open <slug>`
  opens one (both read the content registry). Commands dispatch events
  other systems listen for: `ocean:ping` (sonar), `ocean:summon-whale`, `ocean:set-tod` (live
  palette swap re-patching BG stops + ray uniforms). Debug commands live
  under `debug`: `tod`, `depth <m>`, `reset`. New debug tooling goes HERE,
  not as UI buttons.
- **Sonar** (`src/lib/sonar.js`): clicks outside `a,button,input,
  [data-no-ping]` fire pings. Put `data-no-ping` on any new interactive
  surface.
- **Time of day** (`src/constants/timeOfDay.js` + pre-paint script in
  `index.html` — keep hexes in sync): dawn/dusk tint water stops, waves,
  glow, sky gradient (`--tod-sky-grad`), and god-ray uniforms coherently;
  NIGHT INTENTIONALLY RENDERS AS DAY (dark sea would need light hero text).
- **God rays** (`src/components/Caustics.jsx`): raw WebGL2, buffer-less
  fullscreen triangle, half-res. Caustic webs were rejected — wrong physics
  for a side view. Never call `WEBGL_lose_context.loseContext()` in effect
  cleanup: StrictMode remounts inherit a dead context that paints opaque
  white.

## GPU / advanced-web systems (wave 2)

- **BoidSchool** (`creatures/BoidSchool.jsx`): WebGPU compute boids,
  ~380 fish, band 0.04–0.275 (≈40–400 m — anchovies are epipelagic,
  keep the claim realistic), z-2 — a hazy BACKGROUND layer behind the
  sprite creatures (owner wants it subtle and unhurried; schools stream
  as ribbons via anisotropic cohesion + speed floor, never discs). The
  sim integrates with a dt `step` uniform normalized to 60 fps — without
  it, high-refresh displays fast-forward the school (found live: fish
  "sped up" whenever scroll jank stopped). Rendered as textured
  quads carrying `public/creatures/anchovy.png` (real photo cutout,
  CC BY-SA 4.0 Ebachiller/Wikimedia — keep the attribution comment);
  mips are uploaded as pre-scaled ImageBitmaps (no auto mipgen in
  WebGPU); v-flip when dir.x<0 or leftward fish swim belly-up. Dive-log
  entry 'anchovy' is earned via a 6 kB position readback every 4th frame
  and GATED in species.js to WebGPU+motion so the journal stays
  completable. No `navigator.gpu` OR failed sprite fetch → transparent
  canvas, sprites carry the scene.
  Headless-testable with Edge flags `--enable-unsafe-webgpu
  --enable-features=Vulkan --use-webgpu-adapter=swiftshader`; judge
  WebGPU/WebGL canvases via page.screenshot — drawImage readback is
  blank between frames.
- **Water ripples: REMOVED, don't rebuild.** Two attempts died in wave
  2/2.1 (top-down 2D field: wrong physics for a side view; edge-on 1D
  waterline splash: owner tried it live and cut it). The SVG waves own
  the surface; sonar owns ALL open-water clicks. History + wave-sim
  laws (FBO clears, NaN scrub, dimension-dependent c² limits) live in
  docs/GRAPHICS_PLAN.md §2.
- **DeepParticles** (`DeepParticles.jsx`): GPU snow, motion computed in
  the vertex shader from seeds+time; brightens inside the beam; adds
  `:root.gpu-snow` which stands the CSS snow down.
- **Rays worker** (`lib/raysRenderer.js` + `workers/rays.worker.js` +
  `Caustics.jsx`): OffscreenCanvas rendering off-main-thread. NEVER
  re-transfer or terminate: worker is stashed on the canvas element and
  reused across StrictMode remounts; post transitions only.
- **XRDive** (`XRDive.jsx` + `lib/xrScene.js`): three.js via dynamic
  import (own lazy chunk — keep it that way); fab renders only where
  immersive-vr is supported; terminal `vr` command. Terminal debug
  `vr preview` renders the same scene sans headset and exposes
  `window.__xrPreview.{setSink,setView,close}` — screenshot THAT to
  verify visuals. In the render loop never call `clock.getElapsedTime()`
  then `getDelta()` (the first consumes the delta → dt≈0, everything
  freezes; shipped that way once); dt comes from the loop timestamp.
- **View Transitions** (`lib/router.js`): every navigation cross-fades in
  a View Transition. The old card↔modal shared-element morph went with
  the modal; if it comes back as card↔page, the rule still holds — the vt
  name is owned by ONE element per snapshot (card before, page after).
- **Scroll-driven animations** (`index.css` @supports block): depth fades
  on the compositor; keyframe percentages MUST mirror the JS ramps —
  update both together.
- **GyroParallax** (`GyroParallax.jsx`): tilt → `--tilt-x/-y` on coarse
  pointers; CSS consumes under `(pointer: coarse)`.

## Pages and content (wave 3)

- **Content registry** (`src/content/`): `work.js`, `projects.js`,
  `skills.js`, `courses.js`, `hobbies.js` are PURE DATA (no JSX, no
  imports); `index.js` has the lookups, `matchRoute()`, `entryPath()`,
  and relation helpers. It must stay Node-importable (explicit `.js`
  extensions, no `import.meta`) — the prerender script reads it.
  Components import from the registry; never put content lists back into
  component files. Four kinds of page: work, projects, courses, hobbies.
  They name fields differently, so read them through `entryTitle()`,
  `entrySummary()`, `entryDescription()`. A new kind = a new entry in
  `KINDS`; routing, prerender, and sitemap follow.
- **Ways in**: project AND career cards are whole-card links (the modal
  is gone) — spread `cardLinkProps(href, label)` from `lib/cardLink.js`,
  don't add an "open" label or arrow; Captain's Log hobby lines carry a `<Link>`;
  class bubbles with a page are `<Link>`s; skill-ping answers and
  terminal `open` navigate too. Each card carries
  `data-entry-anchor="<kind>-<slug>"`, and each section a bare
  `data-entry-anchor="<kind>"` fallback — that is where closing a
  directly-loaded page scrolls the dive to.
- **Courses** (`courses.js`): a class has a page iff it has a
  `description` (`courseHasPage`). Projects attach to a class with
  `courses: ['cs-418']`; `grid: false` keeps a project off the Projects
  grid. Status (done / now / next) derives from `CURRENT_TERM` — bump it
  each semester. NEVER store grades. Several entries carry PLACEHOLDER
  wording (marked in comments) until the owner supplies details.
- **Router** (`src/lib/router.js`): History API, no dependency. `usePath()`,
  `navigate()`, `goBack()`; `<Link>` in `components/Link.jsx`. Navigations
  run in a View Transition with the commit `flushSync`ed. Hrefs carry a
  trailing slash (GitHub Pages serves `<path>/index.html`); the router
  strips it for matching.
- **Page layer** (`components/pages/PageLayer.jsx`): every route except `/`
  is a layer portaled to body at z-75 holding ONE CENTERED SHEET
  (`.page-sheet`, 1120px) with its own scroll. THE DIVE NEVER UNMOUNTS —
  `App.jsx` wraps it in `.dive`, and with a page open it is
  `.dive--stowed` + `inert`: content and UI hidden, the water layers
  (`.dive-ocean`, `.ocean-backdrop`) still visible, dimmed, in the
  gutters. Clicking a gutter closes the page (press AND release outside
  the sheet; scrollbar excluded). The dimming is `.page-layer`'s own
  background, so it covers the whole window — a dim cast by the sheet
  (shadow, border) left creatures undimmed at the sheet edges and behind
  the scrollbar. The document never scrolls, so closing a page restores
  the exact depth. Terminal lives OUTSIDE `.dive` so it works over a
  page. Page text is NOT selectable, same as the dive.
- **Page styles** are all in `src/styles/pages.css` (imported by
  PageLayer), NOT index.css. Its header lists the design rules — the
  owner had AI-looking patterns removed and does not want them back: no
  uppercase letter-spaced mono eyebrow labels, no pill chips, no
  glow-border cards, no hover-lift, no left-accent-bar callouts, no
  pulsing dots/rings, no text arrows (→) or `//` decorations, no em
  dashes in UI strings, 4px corners, sentence case. Mono type is for
  code and the depth readout only.
- **The dive follows the same rules** (restyled 2026-11-15): cards are
  solid panels — NO `backdrop-filter` anywhere, 6px corners, no glow,
  lift, or tilt on hover (the border changes); tools are one plain line
  (`.card-stack`), not pills; no `text-transform: uppercase` or wide
  `letter-spacing` (the floor stamp is the one exception — it is a
  rubber stamp); contact buttons are plain round icon buttons with no
  pulse or glow; no em dashes in copy, titles, or meta tags. Glow
  belongs to the creatures, not to the interface.
- **Skill ping** (`Skills.jsx`): each skill is a button; pressing it
  dispatches `ocean:ping` from the icon, toggles `.card--answer` on
  every `[data-skills~=id]` card (career + project cards carry
  `data-skills`), and lists `pagesForSkill(id)` as links.
- **Depth gauge stops** (`DepthGauge.jsx`): any section with `id` +
  `data-waypoint="Label"` gets a clickable tick; positions are
  re-measured by a ResizeObserver on body (page length changes when
  the lazy course column arrives).
- **Tailored links** (`lib/profile.js`): `?for=<tag>` moves projects
  with that tag (projects.js `tags`) to the front of the grid, kept in
  sessionStorage for the visit. Career order never changes.
- **Pause contract** (`src/lib/oceanPause.js`): `isPaused()` is true while a
  page is open AND no water is in view beside it, i.e. the window is no
  wider than the sheet (PageLayer reports this via `setWaterVisible`;
  `:root.water-open` is the CSS signal). On a wide screen the dive keeps
  running under an open page — pausing it there read as a frozen
  background bug. The depth loop skips
  subscribers; any loop with its own rAF MUST check `isPaused()` wherever
  it checks `document.hidden`. Transitions fire `ocean:pause`; the rays
  worker gets a posted visibility message (never terminated).
- **No porthole.** A window in the page header onto the dive was built
  and removed: with the water visible both sides it showed the same thing
  twice. `.dive-ocean` (an UNPOSITIONED wrapper in App.jsx — it must not
  create a stacking context) and `.ocean-backdrop` are what stay visible
  under a page; a new water layer goes inside `.dive-ocean`, new UI stays
  outside it.
- **No Related lists.** The owner had them removed from every page. A
  class page lists the projects that came out of it; that is the only
  cross-link block.
- **Page bodies** (`src/content/bodies.js` + `components/mdx/`): add
  `src/content/pages/<kind>/<slug>.mdx` and that entry's page renders it,
  as its own lazy chunk. MDX + remark-gfm + rehype-pretty-code (shiki at
  BUILD time — no highlighter in the bundle). Register page components in
  `MDX_COMPONENTS` (MdxBody.jsx). `/dev/kitchen-sink` (dev server only)
  is the reference page for prose styles and new components;
  `pages/_TEMPLATE.mdx` is the owner's copy-and-fill starter (files
  starting with `_` are excluded from the glob). Media lives in
  `public/media/<kind>/<slug>/`.
- **Page blocks** (`components/mdx/blocks.jsx`, `Chart.jsx`): Draft,
  Stats, Note, Callout, Figure, Gallery, Clip, YouTube, Diagram,
  Redacted, RepoCard, Chart (Figure/Gallery/Clip draw a labelled
  placeholder frame when given no `src`) — each
  `lazy()` in `MDX_COMPONENTS`, so none ship in the main bundle. A new
  block needs: an entry there, an example in the kitchen sink AND the
  template, and a line in the Owner's Manual. Anything that opens over a
  page (lightbox) is portaled to body with `data-esc-layer`, or Esc will
  close the page under it; portaled UI cannot use the page's theme vars.
- **Charts** (`Chart.jsx`, plain SVG): one y-axis always; series colors
  are the fixed `--viz-s1…s8` order, validated against `--viz-surface`
  with the dataviz skill's `validate_palette.js` — re-run it if either
  changes. Scatter caps at 3 colored groups (all-pairs separation).
  Text never takes a series color; every value must stay reachable
  without hover (arrow keys + table view).
- **Course column** (`CourseColumn.jsx` + `lib/bubbleSim.js`): lazy chunk
  behind a fixed-height placeholder in `Education.jsx`. Sim ticks via
  `subscribe` (dt-scaled, IntersectionObserver-gated, state in typed
  arrays, transforms written directly); a WebGL2 metaball shader draws
  the wax under DOM label nodes; no WebGL2 → `.course-column--css`
  circles. Reduced motion never ticks — control changes call
  `apiRef.refresh()`. `PAIR_REACH` is tuned to the shader's fuse
  threshold and is VERY sensitive (see the comment and
  docs/PORTFOLIO_PLAN.md §3) — measure fused-pair counts offline before
  changing it; the kernel is (r²/d²)² on purpose. The sim module is pure
  (no DOM), so it can be driven from Node for that.
- **Placeholder content**: every page currently has a draft write-up
  opening with `<Draft />`. Filler text must describe what belongs
  there, never invent facts about the owner's work; invented numbers are
  captioned as sample. The build lists pages still containing `<Draft`,
  and `npm run deploy` (`--no-drafts`) refuses to publish while any
  remain. Remove the tag only when a page's content is real.
- **Prerender** (`scripts/prerender.mjs`): each tag swap must match
  exactly once or the build fails — if you restructure `index.html`'s
  meta tags, update the patterns there. Keep `SITE_TITLE` in
  `content/index.js` in sync with `<title>` in `index.html`.

## z-index map

0 backdrop · 1 caustics+water surface · 2 overlays, whale(reef), boid
school · 3 creatures · 4 snow/plankton · 5 ROV darkness · 6 sonar rings,
bio trail ·
10 content · 11 whale(deep, glides OVER content) · 50 sidebar/gauge ·
60 fabs (dive log, console) · 65 floor stamp · 70 toasts · 75 page layer
(PORTALED to body; console fab lifts to 76 while a page is open) ·
80 terminal · 100 skip link. (Anything fixed that must sit above page
content gets PORTALED to body — sections create stacking contexts that
trap fixed children.)

## Verification workflow (do this before every commit)

No chromium-cli/playwright here. Use system Edge:
`npm i --no-save playwright-core`, then
`chromium.launch({ channel: 'msedge', headless: true })`. Write a throwaway
`smoke.mjs`, screenshot, READ the screenshots (visuals lie in DOM checks),
delete the artifacts, `npm prune`. Scroll depth correctly:
`max = scrollHeight - innerHeight; scrollTo(0, max * fraction)` — and
remember `depth N` in the terminal for meter-accurate jumps. Fake the clock
with `context.addInitScript(() => { Date.prototype.getHours = () => 18 })`.
Installing any real dependency (`npm i -D x`) prunes the `--no-save`
playwright-core — reinstall it. Source files are CRLF on disk but Git
Bash tools (grep, sed, cat -A) HIDE the CRs: a Node script that matches
multi-line strings must normalize `\r\n` first or it finds nothing. Never `git stash -u` in this folder:
OneDrive denies removing empty dirs, so the stash is saved but the working
tree is left as-is and `stash pop` then refuses. Start test servers on your OWN ports (`npm run dev -- --port 5199
--strictPort`), never 5173 — the owner may have their dev server there,
and one was killed by a cleanup that matched on the command line. Git
Bash rewrites arguments that start with `/` into Windows paths; pass
URL paths without the leading slash. To drive the router from
a dev-server smoke script:
`page.evaluate(async () => (await import('/src/lib/router.js')).navigate('/work/brunswick/'))`.

## React gotchas already paid for (dev runs StrictMode)

- No side effects (timers!) inside setState updaters — they run twice and
  fork exponentially (the Captain's Log typewriter bug).
- No sync setState in effect bodies — subscribe to the depth loop or
  restructure (FloorStamp, useElapsed via useSyncExternalStore).
- No `Math.random()`/`Date.now()` during render — seed in module scope,
  effects, or first tick (lint enforces via react-hooks purity rules).
- GitHub events API strips `payload.commits` for browser-origin requests —
  fall back to ref/head (useGithubActivity).

## Conventions & owner preferences

- Real photos over generated/drawn art, always. Grade them with CSS filters
  (see `.shipwreck-img`, whale theme filters) to sit in the scene.
- Commit per feature/fix with explanatory messages; ALWAYS `git push`
  immediately after committing. Update `docs/FEATURE_PLAN.md` when adding
  features. Never commit `.claude/settings.local.json`.
- PowerShell 5.1: no `&&`, and double quotes inside `git commit -m`
  here-strings get mangled — avoid quotes in commit messages.
- Iterate visually: screenshot → judge → adjust. The owner reviews look and
  feel; expect several rounds on anything visual.
