# Wave 3 — from personal site to portfolio

Branch: `feature/portfolio-wave-3`. This doc is the handoff artifact if a
session ends mid-build: update the status table and each phase's Status
line as work lands. Edit with the Write/Edit tools only.

| Phase | What | Status |
|---|---|---|
| 0 | Foundations: registry, router, page layer, pause, prerender, MDX | DONE |
| 1 | Project pages | MOSTLY: cards open pages, write-up template, page blocks and charts. Left: code tours, before/after slider, media script, summary toggle, the write-ups themselves |
| 2 | Job and hobby pages | PARTLY: every hobby and job has a page and a way in. No write-ups yet (waiting on the owner's photos and stories) |
| 3 | Course bubble column | DONE (four class pages carry placeholder wording) |
| 4 | Findability | not started |
| 5 | Showpieces and polish | PARTLY: porthole header done. Engine Room and the rest not started |

## Context

The site today is one long dive: Hero → Career → Projects → Skills → Captain's Log. It is strong on atmosphere and thin on evidence. Each job is one paragraph, each project is a card plus a small modal, hobbies are seven typewriter lines, and coursework is shelved in `Education.jsx`. There are no URLs other than `/`, so nothing can be linked from a resume or shared on its own.

The goal is to keep the dive as the front door and add depth behind it: a real page for every job, project, and hobby, a course bubble column, and a set of new features (below) that make it work as a portfolio a recruiter can skim or dig into.

## Branch

All work happens on `feature/portfolio-wave-3`, created from `master` before the first change. Every commit is pushed to that branch. `master` and the live site stay exactly as they are; `git switch master` gets you the current version back at any time.

`npm run deploy` publishes whatever is built locally, whichever branch you are on, so it is not run from this branch until you say the work is ready. Merging to `master` happens at the end (or per phase, if you want to ship early phases).

## Ideas beyond your list

These are my additions. The ones marked ★ are the ones I would build; the rest are a backlog to pick from. Each is slotted into a phase further down.

### For the recruiter with 30 seconds

- ★ **Ship's Manifest** (`/manifest`): a plain, fast, printable index of everything, no ocean. Linked from the hero as "in a hurry? skip the dive". Because it reads from the same data as the cards, the site and the resume stop drifting apart (two of your last three commits were resume sync fixes).
- ★ **Mission profiles**: one site, several tailored links. `?for=graphics`, `?for=xr`, `?for=gamedev` reorder and feature the matching work, so the link on a graphics application leads with Brunswick and the shaders, and the one on a game studio application leads with Pelagos.
- ★ **Surface summary / deep dive toggle**: every page opens with a three-line version (problem, what I did, result) and expands into the full write-up.
- **Captain's tour**: a "60-second tour" button that auto-scrolls the dive and stops at three highlights with captain's-voice captions.
- **Signal buoy and message in a bottle**: an availability line in the hero ("open to Summer 2027 internships") as a blinking buoy; clicking it opens a contact form styled as a bottle. A static site needs a form service (Formspree or similar) for this, which is your call.

### To show the engineering, not just describe it

- ★ **The Engine Room**: this site as its own case study. It is your best graphics demo and it has no page. Live controls on the real systems: god-ray uniform sliders, boid count and cohesion, a debug overlay with frame time, and the depth system drawn as a diagram.
- ★ **Code tours**: instead of a static snippet, a step-through walkthrough where the explanation sits beside the code and each step highlights the lines it is about.
- ★ **Live system diagrams**: animated data-flow diagrams, such as packets moving between the UE5 simulator and the display app over TCP, UDP, and CAN. This explains the Brunswick data layer without showing any embargoed asset.
- **Step-inside exhibits**: a 3D viewer for your Blender assets from the Immersive Learning Lab, with an "enter in VR" button on headsets, reusing the existing WebXR path.
- **Live repo cards**: stars, languages, and last commit on project pages, using the same pattern as the GitHub manifest in Captain's Log.
- **Evidence charts**: Pelagos downloads over time; an interactive accuracy-versus-latency plot for the Faster R-CNN and YOLOv8 paper.

### To make the theme do work

- ★ **Sonar skill ping**: click a skill icon and a sonar ring goes out; every job, project, and course that used it lights up and is listed. The connections between your skills and your work become something you can see.
- ★ **Course time scrubber**: drag through semesters and watch the bubble column fill as you took each class.
- **Porthole header**: each page is the inside of the sub, with a round porthole showing the live ocean at the depth that item sits at, creatures swimming past.
- **Career dive profile**: a dive-computer-style graph of 2023 to 2028 with jobs, projects, and semesters plotted along it.
- **Gauge landmarks**: real depths marked on the depth gauge, such as your deepest actual scuba dive.
- **Recovered files**: opening a page logs it in a second tab of the dive log; finishing everything unlocks a downloadable certificate.
- **Opt-in sound**: sonar ping and bubble pop, off by default.

## Architecture decisions (veto any of these)

1. **Pages are a layer over the ocean, not a separate site.** A page opens as a full-viewport "expedition file" portaled to `body` at z-75 (above the fabs and toasts, below the terminal so the console works over a page), with its own scroll and URL. The dive stays mounted and paused underneath, so closing a page returns you to the exact depth you left. This avoids remounting the WebGPU/WebGL/worker systems, which CLAUDE.md documents as fragile.
2. **Real URLs, prerendered.** `/projects/pelagos`, `/work/brunswick`, `/hobbies/fly-fishing`. A post-build script writes `dist/<route>/index.html` per page with its own title and Open Graph tags, so GitHub Pages serves them with status 200 and links unfurl properly.
3. **Content lives in data files plus one MDX file per page.** Card metadata stays in JS lists (the style the Owner's Manual teaches); the long-form body is Markdown with components. Fallback if MDX misbehaves on Vite 8: the same components in a per-page `.jsx`.
4. **No router dependency.** Four route patterns and custom View Transition handling fit in about 100 lines.
5. **The case-study modal is retired.** Card click navigates to the page; the card-to-page morph reuses the existing View Transition.
6. **Long video on YouTube, short loops in the repo.** Click-to-load facade for anything over ~20 s; muted loops under 4 MB in `public/media/`.

## Phase 0 — Foundations (no visible change)

- Create the branch.
- **Content registry** in `src/content/`: `work.js`, `projects.js`, `hobbies.js`, `courses.js`, `skills.js` (pure data, so Node scripts can import them) and `index.js` with relation helpers (`related(slug)`, `projectsForCourse(id)`, `pagesForSkill(name)`). Move `ENTRIES` out of [Experience.jsx](../src/components/Experience.jsx), `PROJECTS` out of [Projects.jsx](../src/components/Projects.jsx), and tooltips out of [Skills.jsx](../src/components/Skills.jsx). Entries gain `slug`, `summary`, `cover`, `tags`, `featured`, and relation fields.
- **Router** `src/lib/router.js`: `useSyncExternalStore` over `location`, `navigate(path)`, `<Link>`, `popstate`, View Transition wrapping.
- **Page layer** `src/components/pages/PageLayer.jsx`: portal, scroll lock, focus in and restore, Esc goes back, `data-no-ping` (the patterns already in `ProjectModal`). Unknown slug renders an in-app "Lost at Sea".
- **Ocean pause**: a `paused` flag in [OceanDepthContext.jsx](../src/context/OceanDepthContext.jsx) and a `:root.page-open` class that pauses CSS loops. The self-driven loops (BoidSchool, rays worker, DeepParticles, crab, GyroParallax) honor the same signal. The rays worker gets a posted message only; never terminated or re-transferred.
- **Deep links**: [main.jsx](../src/main.jsx) forces `scrollTo(0, 0)` today. On a direct load of a page URL, scroll the dive to that item's card first.
- **Prerender** `scripts/prerender.mjs` after `vite build`: per-route `index.html` and a generated `sitemap.xml`.
- **MDX spike**: `@mdx-js/rollup` plus build-time highlighting (shiki, zero runtime JS) on Vite 8; pages load as lazy chunks.

**Status:** DONE (4 commits). Pages exist at `/work/<slug>/` and
`/projects/<slug>/` and are reachable by URL; cards still open the old
modal until Phase 1 switches them over. Verified in headless Edge on the
dev server (24 checks) and on the production build (16 checks), lint
clean, zero console errors. Main bundle 444 kB / 144 kB gzip, up from
436 / 141 before the router and page layer.

What differs from the plan above, and what was learned:

- **z-75, not z-90.** The terminal (z-80) has to work over a page, so the
  layer sits under it. `<Terminal />` moved outside the dive wrapper
  because everything inside is `inert` while a page is open.
- **The dive is hidden, not just paused.** `App.jsx` wraps the dive in
  `.dive`; with a page open it gets `.dive--stowed` (`visibility: hidden`,
  CSS animations paused) and `inert`. `lib/oceanPause.js` is the single
  JS-side flag. The only thing still animating under a page is the hero's
  two framer-motion scroll bubbles, left alone as negligible.
- **Deep links scroll on close, not on load.** A direct landing remembers
  its card (`data-entry-anchor`) and scrolls the dive there when the page
  is closed, when layout has long settled. Career cards render twice
  (desktop and mobile layouts), so the anchor lookup takes the one that is
  laid out.
- **Adding a kind of page** is one entry in `KINDS` in
  `src/content/index.js`; routing, prerender, and the sitemap pick it up
  (courses and hobbies were added this way later).
- **Tables needed `remark-gfm`.** Core MDX has no GFM tables.
- **Focus goes to the page's `h1`**, not the back link: a programmatic
  focus on a link draws a focus ring on direct landings.
- **Trailing slashes.** GitHub Pages serves `<path>/index.html` and
  301s the slashless form, so hrefs and canonicals carry the slash and
  the router strips it for matching.
- **`npm i -D <pkg>` prunes `playwright-core`** (it is installed with
  `--no-save`); reinstall it after adding a dependency.
- **`git stash -u` half-fails in this OneDrive folder** (permission
  denied removing empty dirs): it saves the stash but leaves the working
  tree in place. Do not rely on stash here; use a worktree elsewhere.
- **Phone wart for the visual round:** the `>_` console fab floats over
  page text at the bottom-left on narrow screens.

## Phase 1 — Project pages

Build Pelagos completely as the template, then port the other five.

- **Template** (`pages/EntryPage.jsx`): back link showing the depth you came from, title, role, period, stat band, link buttons (reuse `linkIcon`), stack pills, cover, surface summary with deep-dive toggle ★, MDX body, contents rail, related chips, previous/next.
- **MDX components** in `src/components/mdx/`:
  - `Figure`, `Gallery` (lightbox), `Video`, `YouTube` (facade)
  - `Code`, `CodeTour` ★, `Compare` (before/after slider), `Stats`, `Callout`, `Timeline`, `Download`
  - `Embed` (existing Steam/itch iframes), `Chart`, `RepoCard`, `Redacted`
- **Media pipeline**: `public/media/<kind>/<slug>/` plus `scripts/optimize-media.mjs` (sharp) emitting sized WebP with recorded dimensions.

**Status:** PARTLY DONE.

- Done: project cards navigate to their page (`role="link"`, Ctrl/Cmd/
  middle click opens a tab, the store button still goes to the store);
  the modal and its View Transition wiring are deleted. `grid: false` on
  a project gives it a page without a card. `src/content/pages/_TEMPLATE.mdx`
  is a copy-and-fill write-up (underscore files are excluded from the
  build); plain Markdown images, `<video>`, and a YouTube `<iframe>` work
  in a body today, so content does not have to wait for the components.
- Done later: `Chart` (line, bar, scatter), `Stats`, `Callout`, `Figure`,
  `Gallery` with a lightbox, `YouTube` (click-to-load), `Redacted`,
  `RepoCard`. All lazy chunks registered in `MDX_COMPONENTS`; every one
  is shown on `/dev/kitchen-sink` and in the template. The chart palette
  was validated with the dataviz validator against `--viz-surface`
  (#061229): eight slots pass on adjacent pairs, the first three on all
  pairs, which is why scatter caps at three colored groups.
- Not done: `CodeTour`, `Compare`, `Timeline`, `Download`, `Model`,
  `FlowDiagram`; the card-to-page shared-element morph (the router
  cross-fades for now); the media script; the surface-summary toggle,
  contents rail, previous/next; and any actual write-up.
- **Evidence charts need the owner's numbers**: Pelagos downloads over
  time, and the accuracy and latency figures from the vision paper. The
  component is ready; no real chart is on any page yet.
- Pelagos: the owner plans to supply the Steam trailer and screenshots;
  the source may be lost, so that page should lean on design, process,
  and outcome rather than code.

## Phase 2 — Job and hobby pages

- **Jobs**: each Career card becomes a link. Pages cover what I owned, the system, results, media, linked projects. `FlowDiagram` ★ for the Brunswick data layer; `Model` viewer for Immersive Learning Lab assets; the IMMERSE poster as a PDF.
- **Hobbies** ("Shore Leave"): each Captain's Log line in [About.jsx](../src/components/About.jsx) links to its page, plus a strip of real photos.
  - Scuba: your actual PADI dive log as a table with depth profiles
  - Fly fishing: catch log and rivers; the trout count comes from data
  - Cooking: dish gallery. Musical theater: shows seen. Gaming and TTRPG: favorites, characters, campaigns

**Status:** PARTLY DONE. The owner wants a page for every hobby.

- Done: `src/content/hobbies.js` holds the Captain's Log lines; each of
  the six hobby lines links to `/hobbies/<slug>/`, and each career card
  has an "open file" link to `/work/<slug>/`.
- Not done: every write-up. Hobby pages currently show only their log
  line, so they are stubs until `pages/hobbies/<slug>.mdx` files exist.
  Do not ship to `master` with stub pages linked without asking the owner.
- Idea not yet raised with the owner: THEA 110 (Broadway Musicals) and
  the GSD classes pair naturally with the musical theater and gaming pages.

## Phase 3 — Course bubble column

Restore the Education section (between Skills and Captain's Log, in dark water where glow reads well) as a degree card plus a tall glass column of course bubbles. The real-world hook is a cold seep: bubble plumes do rise from the deep seafloor.

- **Motion**: lava-lamp physics in `src/lib/bubbleSim.js`. Bubbles warm at the bottom and rise, cool at the top and sink, with soft repulsion, wall containment, cursor push (`useMouse`), and sonar scatter (`pingImpulse`). Ticks through `subscribe(fn)`, every constant scaled by `dt`, gated by an IntersectionObserver.
- **Look**: a raw WebGL2 metaball shader (same pattern as [Caustics.jsx](../src/components/Caustics.jsx), no `loseContext` in cleanup) so bubbles merge and split like wax, with crisp DOM labels on top. Falls back to CSS circles.
- **Encoding**: size by credit hours, color by category, legend doubles as a filter, in-progress courses translucent.
- **Interaction**: hover shows code, title, term. Courses with projects carry a glow ring and a count and are real buttons: click pops the bubble into a card listing those projects, each linking to its page.
- **Time scrubber** ★: a semester slider that adds bubbles in the order you took them.
- **Accessibility**: list-view toggle (semantic table by semester); static packed layout under reduced motion.

**Status:** DONE. 30 classes from the owner's transcript (Fall 2024
through Spring 2027) in `src/content/courses.js`. Verified in headless
Edge on the dev server and the production build, desktop and phone,
reduced motion, zero console errors.

What differs from the plan above, and what was learned:

- **Buoyancy is a per-bubble sine cycle**, not heat-at-the-bottom. With
  the column a third full, bubbles could not reliably reach a heating
  zone; independent 45–100 s cycles give the same look and never stall.
  Measured: even top-to-bottom spread over five simulated minutes, about
  8 px/s, and the same speed within 2% at 144, 60, 30, and 24 Hz.
- **`PAIR_REACH` (bubbleSim.js) is the one fragile constant.** The shader
  fuses two bubbles when their gap is under ~0.38 r. At 1.16 the column
  freezes into a molecule diagram (13–20 fused pairs), at 1.21 nothing
  ever fuses; 1.19 keeps a handful forming and breaking. Re-measure
  before touching it.
- **Field kernel is (r²/d²)², not r²/d².** The plain metaball kernel has
  a long tail: 30 distant bubbles inflate each other into mush.
- **A class opens its own page, not a pop-up card.** A class becomes
  clickable by getting a `summary` and `description`; projects attach
  with `courses: ['cs-418']` in projects.js. This is simpler to fill in
  than per-project entries, which the owner asked for.
- **Left out of the column on purpose:** grades (never stored), test and
  IB credit, and the two 1-credit orientation classes. PHYS 211/212 are
  in, marked as summer transfer credit.
- **Education card facts changed to match the transcript:** added the
  Game Studies and Design minor; "Dean's List every semester" became the
  three semesters listed (Spring 2026 shows none).
- **CS 415, CS 417, CS 418, INFO 418 have PLACEHOLDER wording** in
  courses.js, marked in comments; the owner will supply details (three
  VR games, WebGL work, an electronics project).
- **The component is a lazy 12 kB chunk** behind a fixed-height
  placeholder, so the page length (and the scroll → depth mapping) does
  not change when it loads. `CURRENT_TERM` in courses.js needs bumping
  once a semester.
- Main bundle after all of the above: 450 kB / 146 kB gzip.

## Phase 4 — Findability

- Ship's Manifest ★ and mission profiles ★.
- Sonar skill ping ★ on the Skills section; stack pills on pages link back; project filter chips and featured-first order.
- Section anchors; [DepthGauge.jsx](../src/components/DepthGauge.jsx) gains clickable waypoints; a small menu fab on mobile.
- Terminal: `ls [work|projects|hobbies|courses]`, `open <slug>`, `courses`; Ctrl+K opens it in open mode.
- Hero: availability line and two calls to action (resume, projects).
- Credentials strip: Research Park award finalist, IMMERSE poster, the computer vision paper.

## Phase 5 — Showpieces and polish

- The Engine Room ★.
- **Porthole header: DONE** (the owner picked it, with evidence charts,
  from the backlog). See the status note below.
- From the backlog, whichever you pick: porthole header, career dive profile, gauge landmarks, recovered files and certificate, captain's tour, message in a bottle, opt-in sound.
- Per-page social images composited by script; JSON-LD per type; print stylesheet.
- Docs: new `docs/PORTFOLIO_PLAN.md`, Owner's Manual sections (add a page, add media, add a course), CLAUDE.md (routes, page layer, pause contract, z-index map).

**Status:** PARTLY DONE (porthole only).

- **The porthole is a real hole, not a picture.** While it is on screen
  the page layer's background is off and the glass casts the same color
  as a 200vmax box-shadow. The hole scrolls with the frame on the
  compositor, with no scroll-linked JS.
- **The page background became a flat color** (`--page-bg`) so the
  hand-off between background and shadow cannot be seen. The old
  bottom glow is gone.
- **Paint order had to be made explicit.** The first version left the
  shadow to paint "under the text" by paint phase; it covered the title
  and opening paragraph, and every DOM-based check still passed. All
  page content now sits at `z-index: 1` above the glass, and the smoke
  test screenshots the title, lede, and caption and checks they put
  pixels on screen.
- **Only the water shows.** The ocean layers are grouped in an
  unpositioned `.dive-ocean` wrapper; content, fabs, gauge, ROV
  darkness, and sonar stay hidden.
- **The dive runs while the porthole is in view** and stands down when
  it scrolls away. On short pages it never scrolls away, so the dive
  runs the whole time such a page is open.
- **Direct landings scroll the dive to the card at load** (and again at
  900 ms and on close), so the porthole shows that depth, not the surface.
- Class links added alongside: Party School is under CS 415 (confirmed
  by the owner); CS 417 links `CS417_MP2` and INFO 418 links
  `MetaPuzzleArduinoCode` (both confirmed). The owner's GitHub also has
  `CS417MP0…`, `CS417MP1a…`, and two GSD 390 repos that are not linked.
- Open question for the owner: replace the shipwreck chest's "the real
  treasure" label (they find it big-headed). Options were proposed;
  nothing is to be changed until they pick one.

## Things to settle before they bite

- **Brunswick embargo.** Future Helm is unreleased until CES in January 2027. That page ships text plus diagrams, with `Redacted` placeholders for media until Brunswick confirms what can be shown. Same check for the ESA/ISSI material.
- **Course code.** Course project pages show demos and write-ups, not assignment solutions.
- **Repo weight.** GitHub Pages caps a site at 1 GB; the media rules keep it far below.
- **Bundle.** The main chunk stays near 410 kB; every page, MDX body, and shader is a lazy chunk.

## What I need from you

- ~~Course list~~ received (transcript). Still open: details of the CS 417, CS 418, and INFO 418 projects once they wrap.
- Numbers for the evidence charts: Pelagos downloads over time; accuracy and latency per model from the vision paper.
- Photos and clips per project, job, and hobby (real photos, as always), plus the paper and poster PDFs.
- ~~Backlog picks~~ porthole header and evidence charts. (Hobbies: all six get pages.)

## Verification

Per phase, before each commit (one commit per feature, pushed to the branch):

- `npm run lint` at zero, `npm run build`, bundle sizes compared with the 410 kB / 132 kB gzip baseline.
- `npm run preview` on `dist/` to confirm prerendered routes return 200 with the right title and OG tags.
- Edge smoke script (`playwright-core`, `channel: 'msedge'`), screenshots read by eye:
  - direct load of each route; back/forward; Esc; focus restore
  - depth unchanged after closing a page; ocean actually paused while one is open
  - card-to-page morph; phone width; reduced motion; zero console errors
  - bubble column judged via `page.screenshot`, at 60 Hz and with a throttled frame rate to confirm dt scaling
- `git switch master` then `npm run dev` once, to confirm the current version is untouched.
- Clean up smoke artifacts and `npm prune`.
