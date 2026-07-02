# Deep-Sea Expansion — Feature Plan

Branch: `feature/deep-sea-expansion`. Implement coolest-first so partial
completion still ships the best stuff. Each feature gets its own commit
(+ push). Update the checkbox + Status line as features land — this doc is
the handoff artifact if a session ends mid-build.

**Conventions for every feature:**
- Respect `prefers-reduced-motion` (creature ticks are already gated in
  `OceanDepthContext`; pure-CSS loops are stilled via the media query in
  `index.css`; Framer via `MotionConfig reducedMotion="user"` in `main.jsx`).
- Disable cursor-dependent features on touch devices (`pointer: coarse`).
- `npm run lint` must stay at zero. Build + browser-verify before commit
  (headless: `npm i --no-save playwright-core`, launch Edge via
  `channel: 'msedge'`).
- Persistence in `localStorage` under the `ocean.*` key namespace.
- Edit this doc with the Write/Edit tools only (a PowerShell -replace
  mangled UTF-8 once — don't repeat that).

---

## 1. ROV Headlight — [x] DONE

**Pitch:** In the midnight/abyssal zones the water gets truly dark and the
cursor becomes a submersible light cone. Creatures are only clearly visible
in the beam. The showstopper.

**Spec:**
- Fixed full-screen darkness overlay, `z-index: 5` — above creatures (3) and
  particles (4), **below content (10)** so text/cards stay readable.
- Overlay opacity ramps in over depth 0.55 → 0.75 (0 above, ~0.88 max).
- Light cone = radial gradient hole in the overlay centered at the cursor,
  ~260px radius with soft falloff + faint outer halo.
- Canvas-free: `background: radial-gradient(circle at var(--rov-x)
  var(--rov-y), transparent ...)` — position vars updated from `mousemove`
  directly (not only rAF, so it works under reduced motion); overlay
  opacity from the depth tick in `OceanDepthContext` (new CSS var
  `--rov-dark`).
- Touch devices: fixed light at 50%/38% of viewport (no cursor) — still dark
  + moody but never hides content.
- Terminal `lights` command (feature 3) toggles the overlay off/on via a
  body class.

**Files:** `src/components/RovLight.jsx` (new), `index.css`, `App.jsx`,
`OceanDepthContext.jsx` (one CSS var).

**Status:** DONE. Went pure-CSS for opacity (clamp() on existing
--ocean-depth-progress var — no new JS); beam is a 260vmax div moved by
transform (compositor-only). Verified: opacity 0 at surface, 0.9 at depth,
light cone follows cursor, content stays readable.

## 2. Dive Log — creature discovery collection — [x] DONE

**Pitch:** Creatures get "discovered" as you encounter them; a field journal
tracks 10 species. Persisted across visits. Completion = certificate stamp.

**Spec:**
- Registry `src/constants/species.js`: id, name, latin-ish flavor name,
  zone label, typical depth string, one flavor line each, for: reefFish,
  seaTurtle, jellyfish, squid, anglerfish, deepSeaFish, giantSquid,
  abyssalJellyfish, snailfish, crab.
- Discovery rule: creature visible (opacity >= 0.5) accumulating ~1.5s on
  screen -> discovered. Implement `src/lib/diveLog.js`: `tickSeen(id, dtMs)`
  called from each creature's tick (they all already compute opacity); module
  accumulates time, persists `ocean.diveLog`, dispatches `window` CustomEvent
  `ocean:discovery` once per species.
- Crab discovery: clicking it (feature 8) or lingering at footer.
- UI: journal toggle button fixed bottom-right (book icon + `n/10` count),
  opens panel: grid of entries — discovered show name/depth/flavor,
  undiscovered show "???". Share Tech Mono styling to match Captain's Log.
  Closes on Esc/outside click.
- Toast bottom-center on discovery: "NEW LOG ENTRY — Giant Squid".
- 10/10 -> journal header gets "EXPEDITION COMPLETE" stamp.
- localStorage failures (private mode) must no-op gracefully.

**Files:** `src/constants/species.js`, `src/lib/diveLog.js`,
`src/components/DiveLog.jsx` (journal + toast), hooks into creature files +
`useCreatureAI.js`, `App.jsx`, `index.css`.

**Status:** DONE. tickSeen is frame-count based (90 frames ≈ 1.5s). Crab
uses an IntersectionObserver dwell in Footer. Verified all 10 discoverable +
EXPEDITION COMPLETE stamp + persistence + zero console errors.

## 3. Submarine Terminal — [x] DONE

**Pitch:** Hidden interactive terminal. Type `dive` anywhere (or press `` ` ``)
to open a submarine console over the page.

**Spec:**
- Global keystroke buffer listens for the word `dive` (ignores keystrokes in
  form fields) and `` ` ``/`~` as direct toggle.
- Modal console, Share Tech Mono, scanline/glow styling, boot banner
  `R.O.V. CONSOLE v2.6 — R/V HAPPY DUCK`.
- Commands: `help`, `log` (dive-log summary), `creatures` (alias),
  `surface` (smooth-scroll to top + close), `bottom` (scroll to floor),
  `lights` (toggle ROV headlight), `whale` (summon whale, feature 5),
  `ping` (sonar ping at center, feature 4), `resume` (open PDF), `contact`,
  `pelagos` (Steam link), `time` (ship's clock, feature 10), `clear`,
  `exit`, plus jokes: `sudo`, `rm -rf /`, `42`, `blub`.
- History with up/down arrows. Esc closes. Focus moves to input on open and
  back to body on close.
- Discoverability: tiny hint in the footer: "psst — type 'dive'".

**Files:** `src/components/Terminal.jsx`, `App.jsx`, `index.css`,
`Footer.jsx` (hint).

**Status:** DONE. Gotcha fixed: the final "e" of typed "dive" needed
preventDefault or it landed in the freshly-focused input. All commands
verified headless.

## 4. Sonar Ping — [x] DONE

**Pitch:** Click open water -> expanding sonar ring from the click point;
nearby creatures scatter (they already have `speedBoost`/dodge state).
Terminal `ping` triggers one at screen center.

**Spec:**
- Click listener on the ocean area; ignore clicks on interactive elements
  (`closest('a,button,input,[data-no-ping]')`) and ignore while terminal or
  journal open.
- Ring: fixed-position div, CSS scale+fade animation ~1.6s, themed color.
  Two concentric rings offset 150ms.
- Creature reaction: tiny module `src/lib/sonar.js` exporting
  `ping(x, y)` + `getPing()` (pos + timestamp). Creature ticks check
  distance < 320px and age < 600ms -> apply speedBoost + dodge away.
- Reduced motion: single opacity-only fade circle; no creature impulse.

**Files:** `src/lib/sonar.js`, `src/components/SonarPing.jsx`, creature tick
hooks (`useCreatureAI.js` + bespoke creatures), `index.css`, `App.jsx`.

**Status:** DONE. sonar.js exposes pingImpulse(x, y) so each creature adds
one small block. SnailFish intentionally doesn't react (deepest fish ever
recorded; unbothered). Rings render z-6, above the ROV darkness.

## 5. Rare Ambient Events — whale crossing — [x] DONE

**Pitch:** ~1-in-6 visits, while you're in the twilight band, a huge whale
silhouette crosses far in the background over ~35s. Rarity = shareability.

**Spec:**
- Roll once per session (`sessionStorage ocean.whaleRoll`); if it hits,
  arm a watcher: first time depth enters 0.2-0.5 band, wait ~4s, run the
  crossing once.
- Whale: inline SVG silhouette (sperm whale profile), ~55vw wide, very low
  contrast (slightly darker than water, soft blur), z-index 2 (behind
  creatures), slow translateX across + gentle sine bob. No audio.
- Terminal `whale` command force-summons (ignores roll).
- Dive-log bonus: seeing the whale logs a secret 11th entry ("Leviathan") —
  journal shows a hidden bonus slot once seen (10/10 stamp unaffected).
- Reduced motion: no auto-spawn; terminal summon = static fade-in/out.

**Files:** `src/components/creatures/Whale.jsx`, `App.jsx`,
`species.js` (bonus entry), `index.css`.

**Status:** DONE. Inline SVG silhouette, 35s crossing at z-2 with blur,
session-rolled 1-in-6, terminal summon verified, Leviathan logs ~6s in.

## 6. Shipwreck & Treasure — [x] DONE

**Pitch:** A wrecked hull rests on the ocean floor by the footer. Its
treasure chest glints; clicking it opens the "treasure" — the resume.
Plus: reaching the floor the first time shows an "ABYSSAL FLOOR REACHED —
6,000 m" rubber stamp + dive counter.

**Spec:**
- Inline SVG wreck (broken hull, mast, porthole glow) sitting on
  `footer-floor`, left side (crab walks past it), theme-aware via CSS vars.
- Chest: small glowing element with idle glint animation; click -> bubble
  burst + opens `/Rishi Garhyan Resume.pdf` in a new tab; tooltip "the real
  treasure".
- Floor stamp: first time depth >= 0.98, fixed stamp animates in
  (rubber-stamp rotate+scale), persists `ocean.divesCompleted`; later visits
  skip the animation; terminal `log` reports the count.

**Files:** `src/components/Shipwreck.jsx`, `src/components/FloorStamp.jsx`,
`Footer.jsx`, `index.css`.

**Status:** DONE. Stamp subscribes to the depth rAF store (not
setState-in-effect). Stamp centers via the standalone CSS `translate`
property since framer owns `transform`. Chest verified opening the PDF.

## 7. Bioluminescent Cursor Trail — [x] DONE

**Pitch:** Below depth 0.5, moving the cursor stirs up glowing plankton —
small cyan motes that drift and fade behind the pointer.

**Spec:**
- `mousemove` throttled (~1 mote / 40ms, only if moved > 24px), spawn dot at
  cursor + small random offset, CSS animation (drift up, fade, ~1.4s),
  removed on `animationend`. Cap ~40 live motes.
- Intensity scales with depth (more/brighter motes deeper).
- Disabled: touch devices, reduced motion, depth < 0.5.

**Files:** `src/components/BioTrail.jsx`, `index.css`, `App.jsx`.

**Status:** DONE. Imperative DOM (no state churn); motes verified spawning
at depth 0.7 and not at surface.

## 8. Crab Poke — [x] DONE

**Pitch:** Click the crab -> it startles (hop + fast scuttle away) with a
little "!" bubble. Logs the crab in the dive log.

**Spec:**
- Crab img gets `pointer-events: auto`, `cursor: pointer`; click sets a
  startle timer in its loop state: ~0.9s of 4x speed away from click, CSS
  hop animation class, transient "!" element above it.
- `markSeen('crab')` on first poke.

**Files:** `Footer.jsx`, `index.css`.

**Status:** DONE. Startle state lives in a ref read by the walk loop; hop
animation on the img (wrapper transforms are owned by the loop).

## 9. Project Case-Study Modals — [ ] TODO

**Pitch:** Project cards open into a full case study: role, highlights, and
*playable embeds* — Steam widget for Pelagos, itch.io widgets for Flarp and
Tide Toss. Real media, zero fabricated screenshots.

**Spec:**
- Extend `PROJECTS` entries with `details: { role, highlights[], embed }`.
  Embeds: Steam `https://store.steampowered.com/widget/2645390/` (iframe
  646x190); itch needs the numeric game id (`https://itch.io/embed/<id>`) —
  if not derivable, leave `TODO(user)` and fall back to a link button.
- Content for role/highlights drawn ONLY from existing card descriptions +
  README — conservative wording, ask user to review afterward.
- Modal: framer-motion scale/fade, backdrop blur, Esc/outside/X close,
  `data-no-ping` so sonar doesn't fire inside. Cards get an expand
  affordance + whole-card click (keep external link button working via
  stopPropagation).
- Accessibility: `role="dialog"`, `aria-modal`, focus into modal on open,
  return focus to card on close.

**Files:** `Projects.jsx` (data + modal), `index.css`.

**Status:** not started.

## 10. Time-of-Day Surface — [ ] TODO

**Pitch:** The sunlit zone matches the visitor's clock: dawn glow early,
bright turquoise midday, golden at dusk, dark moonlit surface at night.

**Spec:**
- Bucket on load: dawn 5-8, day 8-17, dusk 17-20, night 20-5.
- `data-tod` attribute on root; CSS swaps the `overlay-reef` gradient tint +
  water-surface glow. Patch the first two `BG_STOPS` colors in
  `OceanDepthContext` from a lookup in `src/constants/timeOfDay.js` so the
  actual water color shifts; interpolation logic unchanged.
- Subtle — must not break text contrast in shallow-reef theme. Night = deep
  blue-teal, never black (hero text is dark). Check hero screenshot in both
  day + night before committing (override Date in the smoke script).
- Terminal `time` reports ship's clock + bucket.

**Files:** `src/constants/timeOfDay.js`, `OceanDepthContext.jsx`,
`index.css`, `index.html` (pre-paint script sets data-tod + initial bg to
avoid flash).

**Status:** not started.

## 11. GitHub Shipping Manifest — [ ] TODO

**Pitch:** "Recent transmissions from the engine room" — live list of recent
public GitHub activity, styled like a cargo manifest inside the Captain's
Log card, mirroring the Discord presence pattern.

**Spec:**
- Fetch `https://api.github.com/users/Happy-Duck/events/public` (no auth),
  take ~4 most recent PushEvent/CreateEvent/ReleaseEvent -> repo name,
  first line of commit message, relative time.
- Cache in `sessionStorage` (10 min). Silent hide on error/rate-limit
  (exactly like the Lanyard presence block).
- Render under the LivePresence block in `About.jsx`.

**Files:** `src/hooks/useGithubActivity.js`, `About.jsx`, `index.css`.

**Status:** not started.

## 12. WebGL Caustics (stretch) — [ ] TODO

**Pitch:** Real shader caustics dancing across the sunlit zone — a graphics
flex appropriate for a CG intern. Raw WebGL2, no dependencies.

**Spec:**
- Fixed canvas, top band of viewport (~45vh), z-index 1, opacity tied to
  `--beach-op` (fades out by depth ~0.25) — rAF pauses entirely when
  invisible or `document.hidden`.
- Fragment shader: 2-octave voronoi/sine caustics, theme-tinted, ~0.5 alpha
  over the gradient backdrop. Half-res canvas upscaled for perf.
- Fallbacks: no WebGL2 -> render nothing (CSS look stands). Reduced motion
  -> draw one static frame, no time advance.

**Files:** `src/components/Caustics.jsx`, `App.jsx`, `index.css`.

**Status:** not started.

---

## Completion log

Fill in as features land:

| # | Feature | Commit | Verified |
|---|---------|--------|----------|
| 0 | Plan doc | fd02826 | — |
| 1 | ROV Headlight | with #2 | headless Edge OK |
| 2 | Dive Log | feat: ROV headlight + dive log | headless Edge OK |
| 3 | Terminal | feat: terminal + sonar + whale | headless Edge OK |
| 4 | Sonar Ping | with #3 | headless Edge OK |
| 5 | Whale | with #3 | headless Edge OK |
| 6 | Shipwreck | feat: shipwreck, floor stamp, bio trail, crab poke | headless Edge OK |
| 7 | Bio Trail | with #6 | headless Edge OK |
| 8 | Crab Poke | with #6 | headless Edge OK |
| 9 | Case Studies | — | — |
| 10 | Time of Day | — | — |
| 11 | GH Manifest | — | — |
| 12 | Caustics | — | — |

## Notes / decisions made along the way

- Features 1+2 committed together (shared App.jsx/index.css edits).
- Fixed a pre-existing CLS bug found while testing: TypewriterLog rendered
  empty until scrolled into view, growing the document 179px on first
  scroll (jump-to-bottom landed short). Entries now render from first
  paint; only the retype cycle waits for visibility.
- At depth exactly 0, surface creatures are opacity 0 by design (fade-in
  starts once you begin scrolling) — discovery requires slight descent.
