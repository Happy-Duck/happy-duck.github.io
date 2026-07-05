# The Owner's Manual — editing this site with zero coding experience

This guide assumes you have **never programmed before**. It explains what
this website is, how to change the words and pictures on it, how to add or
remove things like project cards and Captain's Log entries, and how to
publish your changes so the whole world sees them at
**https://happy-duck.github.io**.

Read sections 1–5 once, in order. After that, jump straight to whatever
you want to change (section 6 or 7), then follow sections 8–11 every time
to preview, save, and publish.

---

## Table of contents

1. [What this site actually is](#1-what-this-site-actually-is)
2. [One-time setup: the tools](#2-one-time-setup-the-tools)
3. [Opening the project and using the terminal](#3-opening-the-project-and-using-the-terminal)
4. [Map of the project folders](#4-map-of-the-project-folders)
5. [How to edit text without breaking anything](#5-how-to-edit-text-without-breaking-anything)
6. [Editing each part of the site](#6-editing-each-part-of-the-site)
   - [6.1 Your name, title, and tagline (Hero)](#61-your-name-title-and-tagline-hero)
   - [6.2 Career cards](#62-career-cards)
   - [6.3 Project cards](#63-project-cards)
   - [6.4 Skills icons](#64-skills-icons)
   - [6.5 Captain's Log entries](#65-captains-log-entries)
   - [6.6 Contact links and email](#66-contact-links-and-email)
   - [6.7 The hidden Education section](#67-the-hidden-education-section)
   - [6.8 Browser-tab title and search-engine text](#68-browser-tab-title-and-search-engine-text)
   - [6.9 Dive-log species names and jokes](#69-dive-log-species-names-and-jokes)
7. [Swapping images and files](#7-swapping-images-and-files)
   - [7.1 The resume PDF](#71-the-resume-pdf)
   - [7.2 Creature photos](#72-creature-photos)
   - [7.3 Favicon and social-preview image](#73-favicon-and-social-preview-image)
8. [Previewing the site on your computer](#8-previewing-the-site-on-your-computer)
9. [Checking your work before publishing](#9-checking-your-work-before-publishing)
10. [Saving your work with Git](#10-saving-your-work-with-git)
11. [Publishing to the live site](#11-publishing-to-the-live-site)
12. [When things go wrong](#12-when-things-go-wrong)
13. [Glossary](#13-glossary)

---

## 1. What this site actually is

A website is just a bundle of files that a browser (Chrome, Edge, Safari)
downloads and displays. This site's files live in two places:

- **The source code** — the folder on your computer (and a copy on
  GitHub.com). This is the *recipe*: human-readable files you edit.
- **The live site** — https://happy-duck.github.io. This is the *baked
  cake*: a compressed, scrambled version of the recipe that browsers
  download. You never edit it directly. You edit the recipe, then run one
  command that re-bakes the cake and uploads it.

**Key idea to hold onto: editing files on your computer changes NOTHING on
the live site.** Not until you run the deploy command in section 11. You
can experiment freely — the worst you can do locally is make your own
preview look broken, and section 12 shows how to undo anything.

The site is built with a tool called **React**. You don't need to
understand React. All you need to know is:

- The words and pictures on the site live inside files ending in `.jsx`
  and `.js` inside the `src` folder.
- Most content is stored in **lists** near the top of each file — a
  career card, a project card, or a log entry is one *block* in a list.
  Editing content means editing text between quote marks; adding a card
  means copy-pasting a block; removing a card means deleting a block.
- Images live in the `public` folder as ordinary files you can replace.

The page itself is a cross-section of the ocean: scrolling down "dives"
from the beach at 0 m to the sea floor at 6,000 m. Fish, jellyfish, the
whale, sonar pings, the terminal, and the dive-log journal are all
decorations driven by code you should **not** touch unless you know what
you're doing — but all the *text and photos* they use are fair game and
covered below.

---

## 2. One-time setup: the tools

If you are working on the computer this site was built on, everything is
already installed — skip to section 3. On a new computer you need three
free programs:

1. **Node.js** — runs the site's build tools.
   Go to https://nodejs.org, download the **LTS** version, run the
   installer, click Next through everything.
2. **Git** — tracks changes and talks to GitHub.
   Go to https://git-scm.com/download/win, download, install with all the
   default options.
3. **Visual Studio Code (VS Code)** — the editor you'll type in.
   Go to https://code.visualstudio.com, download, install.

Then get the project onto the computer. Open VS Code, press
`Ctrl+Shift+P`, type `clone`, choose **Git: Clone**, and paste:

```
https://github.com/Happy-Duck/happy-duck.github.io.git
```

Pick a folder to put it in, and sign in to GitHub when asked (you need to
be signed in to an account that has permission to push to the repository —
for this site, the Happy-Duck account).

Finally, install the project's helper libraries. Open the terminal
(section 3) and run:

```
npm install
```

This downloads everything into a folder called `node_modules`. It can take
a few minutes. You only do this once per computer (or again if the build
complains about missing packages).

---

## 3. Opening the project and using the terminal

1. Open VS Code.
2. **File → Open Folder…** and pick the `happy-duck.github.io` folder.
3. The left sidebar (the **Explorer**) shows every file. Click a file to
   open it. Edit it like a Word document. Save with `Ctrl+S`.
   **An unsaved file shows a ● dot on its tab. Nothing you do counts
   until you save.**

The **terminal** is a box where you type commands instead of clicking
buttons. Open it inside VS Code with **View → Terminal** (or
`` Ctrl+` ``). It opens already "inside" the project folder, which is
where all the commands in this guide must be run.

Terminal survival rules:

- Type a command exactly, press Enter, wait for it to finish (you get the
  blinking prompt back).
- **Run one command at a time.** This computer's PowerShell is an old
  version where chaining commands with `&&` fails with a red error.
- If a command seems stuck but is printing things, it's working. If it
  says something like `Local: http://localhost:5173`, it's a *server* that
  keeps running on purpose — stop it with `Ctrl+C` when you're done.
- Red text = something failed. Read it; the first line usually names the
  file and line number where the problem is.

---

## 4. Map of the project folders

```
happy-duck.github.io/
├── index.html          ← browser-tab title, search-engine description
├── package.json        ← the command shortcuts (dev, build, deploy)
├── public/             ← REAL FILES served as-is: photos, resume, favicon
│   ├── Rishi Garhyan Resume.pdf
│   ├── creatures/      ← every sea-creature photo
│   ├── favicon.svg / favicon-16.png / favicon-32.png
│   └── og-image.png    ← preview image when the link is shared
├── src/                ← the source code
│   ├── App.jsx         ← the page's table of contents (section order)
│   ├── components/     ← one file per section / visual system
│   │   ├── Hero.jsx        ← name, roles, tagline
│   │   ├── Experience.jsx  ← "Career" cards
│   │   ├── Projects.jsx    ← project cards + their pop-up case studies
│   │   ├── Skills.jsx      ← skill icons and tooltips
│   │   ├── About.jsx       ← Captain's Log
│   │   ├── Education.jsx   ← currently hidden (see 6.7)
│   │   ├── ContactSidebar.jsx ← email / LinkedIn / GitHub / resume links
│   │   └── creatures/      ← code for each animated creature
│   ├── constants/
│   │   └── species.js  ← dive-log journal names and one-liners
│   └── ...             ← ocean plumbing: DON'T EDIT (see below)
├── docs/               ← documentation, including this file
├── node_modules/       ← downloaded libraries. NEVER edit, never open.
└── dist/               ← appears after a build. Machine-made. Never edit.
```

**Safe to edit:** the files named in sections 6 and 7 of this guide.

**Do not edit** (these run the ocean simulation, and small mistakes break
the whole page): anything in `src/context/`, `src/hooks/`, `src/lib/`,
`src/workers/`, `src/index.css`, `vite.config.js`, `eslint.config.js`,
and the creature/effect files except for the one photo-swap noted in 7.2.

---

## 5. How to edit text without breaking anything

Almost every text change is editing what's between quote marks in a list.
Here is one career card as it appears in the code:

```js
{
  company:     'Origami Games',
  role:        'Game Development Intern',
  period:      'June – July 2023',
  description: 'Built prototypes for endless runner and maze escape games in Unity/C#; implemented procedural level generation.',
  stack:       ['Unity', 'C#', 'Procedural Gen'],
},
```

Anatomy, in plain words:

- The whole card is wrapped in `{ curly braces },` — one card = one
  brace-block ending with a comma.
- Each line is `label: 'value',` — you edit only the **value**, the text
  inside the quotes. Never change the label word before the colon.
- `['Unity', 'C#']` is a mini-list: items in quotes, separated by commas,
  wrapped in square brackets.

The five rules that prevent 95 % of breakage:

1. **Only change text inside quotes.** Leave the quotes, colons, commas,
   braces, and brackets exactly where they are.
2. **Apostrophe trap.** If your text is wrapped in single quotes `'...'`
   and contains an apostrophe, the apostrophe ends the text early and
   breaks the file. Two fixes — either switch the outer quotes to double
   quotes: `"Rishi's game"`, or put a backslash before the apostrophe:
   `'Rishi\'s game'`. (Same trap in reverse: text in double quotes can't
   contain a bare `"`.)
3. **Copy a whole block to add; delete a whole block to remove.** Count
   the braces: a block starts at `{` and ends at the matching `},`
   including that trailing comma. Highlight from one to the other.
4. **Keep the commas between blocks.** Every block in a list ends with a
   comma. (A comma after the *last* block is also fine — this project uses
   them everywhere, so just always keep them.)
5. **VS Code is your smoke detector.** If text turns weird colors after an
   edit, or red squiggles appear, you broke a quote or bracket. Press
   `Ctrl+Z` repeatedly until it looks normal and try again.

If the preview in your browser ever goes **blank white** after an edit,
you have a broken file: the terminal running the preview will print a red
message naming the file and line. `Ctrl+Z` in that file, save, and the
page comes back.

---

## 6. Editing each part of the site

The page order (top to bottom) is: **Hero → Career → Projects → Skills →
Captain's Log → ocean-floor footer.** That order is set in
`src/App.jsx` (the `<Hero />`, `<Experience />`, … lines near the bottom);
to reorder sections, reorder those lines.

### 6.1 Your name, title, and tagline (Hero)

**File:** `src/components/Hero.jsx`

- **Name:** search for `Rishi Garhyan` (~line 85). Replace the text
  between `>` and `<`.
- **Roles line** (~line 100):
  `CS Student @ UIUC · XR Engineer · Game Developer`.
  It looks strange in code:
  `CS&nbsp;Student&nbsp;@&nbsp;UIUC&ensp;&middot;&ensp;XR&nbsp;Engineer...`
  — `&nbsp;` is a space that refuses to line-break, `&middot;` is the
  little dot, `&ensp;` is a wide space. Keep that pattern; just swap the
  words.
- **Tagline** (~line 109): the "This is your captain speaking…" line.
  Plain text — edit freely.

If you change the name, also update it in `index.html` (section 6.8),
which controls the browser tab and Google results.

### 6.2 Career cards

**File:** `src/components/Experience.jsx` — the list called `ENTRIES`
starting at ~line 5. (The section is titled "Career" on the page; find the
heading near the bottom of the file if you want to rename the section
itself.)

Each card has five parts:

| Label | What it is | Example |
|---|---|---|
| `company` | Employer name (bold line under the role) | `'Brunswick BI Design Lab'` |
| `role` | Job title (the big line) | `'Unity VR Developer'` |
| `period` | Dates, shown in small caps | `'May 2026 – Present'` |
| `description` | The paragraph | any sentence(s) |
| `stack` | The little pills | `['Unity', 'C#', 'VR']` |

- **Edit** — change text inside quotes.
- **Add a job** — copy an existing block from `{` through `},` and paste
  it where you want it in the list. **Order in the list = order on the
  page, top card first.** Newest job goes at the top.
- **Remove a job** — delete its block, `{` through `},`.
- Cards alternate left/right of the kelp strand automatically; nothing to
  configure.

One caveat: each card must have a **different `company` name** (the code
uses it as an internal ID). Two stints at the same company? Make them
differ, e.g. `'Origami Games'` and `'Origami Games (returning)'`.

### 6.3 Project cards

**File:** `src/components/Projects.jsx` — the list called `PROJECTS`
starting at ~line 24. Each card also powers the pop-up **case study**
that opens when a visitor clicks the card.

```js
{
  title:       'SportsBot',
  description: 'Discord bot delivering live scores...',
  stack:       ['Python', 'discord.py', 'REST APIs'],
  link:        'https://github.com/Happy-Duck/DiscordSportsBot',
  details: {
    role: 'Solo developer',
    highlights: [
      'Live scores, player stats, and schedule alerts via slash commands',
      'Backed by REST sports APIs with a SQL persistence layer',
    ],
  },
},
```

- `title`, `description`, `stack` — same drill as career cards.
- `link` — the full web address the corner button opens. The button's
  icon picks itself: a Steam address shows the Steam logo, `itch.io` the
  itch logo, `github.com` the GitHub logo, anything else a generic arrow.
  **No link yet? Use `'#'`** — the button hides itself.
- `details.role` — one line under the title in the pop-up.
- `details.highlights` — bullet points in the pop-up. It's a mini-list:
  each bullet is one quoted string ending with a comma. Add or delete
  whole quoted lines.
- `details.embed` — *optional* playable widget in the pop-up (the Steam
  and itch.io cards have one). To add one for an itch.io game:
  ```js
  embed: { src: 'https://itch.io/embed/YOUR_GAME_ID?dark=true', height: 167, title: 'Game Name on itch.io' },
  ```
  (Get the number from itch.io → your game → Distribute → Embed game.)
  To remove a widget, delete the whole `embed: { ... },` line.
- **Add a project** — copy a whole card block, paste it into the list at
  the position you want (cards fill the grid left-to-right, top-to-bottom,
  first in the list = top-left). Each card needs a **unique `title`**.
- **Remove a project** — delete its block, `{` through `},`.

### 6.4 Skills icons

**File:** `src/components/Skills.jsx` — the list called `GROUPS` at
~line 24. There are two groups, `Languages` and `Tools & Frameworks`;
each item is one icon with a hover tooltip.

- **Change a tooltip or label** — edit the `name:` or `tooltip:` text.
  Watch the apostrophe rule (rule 2 in section 5) — several tooltips use
  `\'` already.
- **Remove a skill** — delete its `{ name: ..., render: ..., tooltip: ... },`
  line, and also delete the matching `import ... from 'devicons-react...'`
  line at the top of the file (a leftover import makes the pre-publish
  check in section 9 fail with an "unused variable" warning — that's
  intentional; the check is telling you to finish the job).
- **Add a skill** — this is the one content edit that needs two steps,
  because each icon ships as its own tiny file:
  1. Find the icon's name. Icons come from a library called *Devicon* —
     browse https://devicon.dev to see what exists. The import name is the
     technology name with a capital first letter plus a style suffix like
     `Plain` or `Original` (e.g. `RustPlain`, `GodotOriginal`). You can
     confirm the exact spelling by looking in the
     `node_modules/devicons-react/lib/icons` folder.
  2. Add an import at the top, next to the existing ones:
     ```js
     import GodotOriginal from 'devicons-react/lib/icons/GodotOriginal'
     ```
     then add an item to a group:
     ```js
     { name: 'Godot', render: (s) => <GodotOriginal size={s} color="currentColor" />, tooltip: 'My next engine' },
     ```
     If the icon comes out the wrong color (some icons ignore the color
     setting), copy the `ForcedColorIcon` pattern used by the Unreal
     Engine and Blender entries instead.
  - **Never** import from `'devicons-react'` directly (without
    `/lib/icons/...`) — it silently pulls ~3,000 icons into the site and
    bloats it.

### 6.5 Captain's Log entries

**File:** `src/components/About.jsx`

- **The rotating "> …" lines** — the list `LOG_ENTRIES` at ~line 8. Each
  entry is one quoted string ending with a comma. Edit, add, or delete
  whole lines. They type themselves out in a loop, top entry retyping at
  the bottom — the order in the list is the starting order, and any number
  of entries works. Apostrophe rule applies (note the existing entries mix
  `"double quotes"` and `'single quotes'` for exactly that reason).
- **Location** — `LOCATION` at ~line 17.
- **The header lines** (`UIUC — CS '27 — 4.0 GPA` and the coordinates) —
  search for `log-meta-line` (~line 299) and edit the text between
  `>` and `<`.
- The **live transmission** (Discord status) and **engine room** (recent
  GitHub commits) boxes fill themselves from the internet — no editing
  needed, and they hide themselves when there's nothing to show.

### 6.6 Contact links and email

**File:** `src/components/ContactSidebar.jsx`

- **Email** — `const EMAIL = 'garhyan2@illinois.edu'` at ~line 46.
  (Clicking the email icon copies this to the visitor's clipboard.)
- **LinkedIn / GitHub / Resume links** — the `SIGNALS` list right below
  it; edit the `href:` values.
- If you change the email or LinkedIn/GitHub addresses, change them in
  `index.html` too (they appear again in the search-engine data block —
  see 6.8).

### 6.7 The hidden Education section

`src/components/Education.jsx` exists and is fully built (degree, GPA,
coursework pills) but is currently switched off. To show it, open
`src/App.jsx` and remove the comment marks from two lines:

- Near the top: change
  `// import { Education     } from './components/Education'`
  to
  `import { Education     } from './components/Education'`
- In the middle of the `<main>` block: change
  `{/* <Education /> — shelved for now, uncomment with its import */}`
  to
  `<Education />`

Then edit the degree text, dates, and the `COURSEWORK` list inside
`Education.jsx` the same way as any other card. To hide it again, reverse
the process (put `//` back in front of the import, wrap the tag back in
`{/* ... */}`).

### 6.8 Browser-tab title and search-engine text

**File:** `index.html` (in the project's top folder — not inside `src`).

- `<title>...</title>` (~line 6) — the browser-tab text.
- `<meta name="description" ...>` (~line 9) — the blurb under the link in
  Google results.
- The **Open Graph** and **Twitter** blocks (~lines 13–27) — title,
  description, and preview image used when the link is pasted into
  Discord, iMessage, LinkedIn, etc.
- The `application/ld+json` block (~lines 39–57) — a machine-readable
  business card for search engines: name, job title, university, email,
  and the LinkedIn/GitHub addresses. Keep it consistent with the visible
  site.

Edit only the text between quotes; leave every tag and bracket alone.

### 6.9 Dive-log species names and jokes

**File:** `src/constants/species.js`

Visitors who hover over creatures (or click near them) "discover" them in
the dive-log journal (the book button at bottom-right). Each journal entry
is one line in the `SPECIES` list — `name`, `zone`, `depth`, and the
one-liner `note` are all editable text. **Do not change the `id` values**
— they're how the code matches a swimming creature to its journal page.
Don't add or remove lines here either; a journal entry without a matching
animated creature can never be discovered, which makes the journal
impossible to complete. (Adding a whole new creature is a programming
project — see `CLAUDE.md` — not a content edit.)

---

## 7. Swapping images and files

Everything in the `public` folder is served on the live site at the same
name: `public/creatures/blue-whale.webp` becomes
`https://happy-duck.github.io/creatures/blue-whale.webp`.

**The golden trick for every swap: give the new file the EXACT same name
as the old one** (including the ending — `.webp`, `.pdf`, `.png`), and no
code has to change at all.

One quirk of this machine: the project lives inside OneDrive, and the
preview server deliberately doesn't watch the `public` folder (OneDrive
locks files mid-sync and crashes it). So after dropping in a new image,
the preview won't refresh itself — reload the browser tab manually, and
give OneDrive a few seconds to finish syncing before you judge the result.

### 7.1 The resume PDF

Replace `public/Rishi Garhyan Resume.pdf` with your new PDF **renamed to
exactly that** (capital letters and spaces included). Delete the old one,
drop the new one in via the VS Code Explorer (drag-and-drop works).
If you insist on a different filename, you must also update the
`href: '/Rishi Garhyan Resume.pdf'` line in
`src/components/ContactSidebar.jsx`.

### 7.2 Creature photos

The owner's standing rule: **real photographs, not drawings or
AI-generated art.** Creature images are photo *cutouts* — the animal
scissored out of its background so the water shows through. That means:

- Use images with a **transparent background** (PNG or WebP format;
  `.webp` preferred — it's smaller). A photo with a visible rectangle of
  background around the animal will look like a sticker slapped on the
  screen. Free tools like remove.bg can cut a subject out of a photo.
- Match the **orientation** of the old image. Some code flips or rotates
  the picture to face the swimming direction (that's the
  `scaleX(-1)`/`rotate(...)` you'll see near the filename if you peek at
  the code). If your new fish faces the opposite way from the old one, it
  will swim backwards. Easiest fix: mirror the image in any photo editor
  before saving it.
- Match the old image's **proportions** roughly. The display size is set
  in the code, so a much taller/wider photo will look squashed. (These
  images were deliberately resized to their display size for speed — keep
  new ones modest, a few hundred pixels on the long side.)

Which file is which animal (all in `public/creatures/`):

| File | What it is on the page |
|---|---|
| `clownfish-sm.webp` | the trio of clownfish near the surface |
| `GreenTurtle.webp` | the sea turtle |
| `anchovy.png` | the huge background fish school (keep as `.png`; this photo is CC BY-SA licensed — replacing it removes the attribution obligation, keeping it means keep the credit comment in `BoidSchool.jsx`) |
| `Jellyfish.webp` | moon jellyfish, twilight zone |
| `squid.jpg` | firefly squid, twilight zone |
| `Anglerfish.webp` | the anglerfish |
| `deepSeaFish-sm.webp` | the fangtooth |
| `deepJellyfish.webp` | glowing abyssal jellyfish |
| `jumboSquid-sm.webp` | the giant squid |
| `Lizardfish-sm.webp` | the hadal snailfish |
| `blue-whale.webp` | the rare whale fly-by (photo faces LEFT — a new one must too) |
| `shipwreck.webp` | the shipwreck on the floor |
| `crab-sm.gif` | the walking crab in the footer (animated GIF) |

One extra folder: `public/creatures/xr/` holds **full-resolution copies**
of five of these animals (clownfish, Jellyfish, deepSeaFish, jumboSquid,
Lizardfish) used only by the VR headset mode — the main files above were
shrunk for speed, too small to look good in VR. If you replace one of
those five animals, put the big version of the new photo in `xr/` under
the same name there, and the small version in `creatures/` as usual.

After swapping, scroll the whole page in the preview and look at the
animal in place — judging images in a file viewer lies; the site applies
color grading so photos sit in the scene.

### 7.3 Favicon and social-preview image

- **Favicon** (the tiny browser-tab icon): replace `public/favicon.svg`,
  `public/favicon-16.png` (16×16 pixels), and `public/favicon-32.png`
  (32×32 pixels), keeping the names.
- **Social preview** (the picture shown when the link is shared):
  replace `public/og-image.png`, sized 1200×630 pixels.
- Don't delete `googleb28b642a426b9703.html`, `robots.txt`,
  `sitemap.xml`, `manifest.json`, or `404.html` — they're plumbing for
  Google and GitHub Pages.

---

## 8. Previewing the site on your computer

Every time you edit, look at the result **before** publishing:

1. Open the terminal (`` Ctrl+` ``).
2. Run:
   ```
   npm run dev
   ```
3. Wait for `Local: http://localhost:5173/` and Ctrl+click that address
   (or type it into a browser). This is a private preview only your
   computer can see.
4. Leave that terminal running. Every time you **save** a code file, the
   preview updates itself within a second. (Images in `public` are the
   exception — reload the tab manually, see section 7.)
5. When finished, click into the terminal and press `Ctrl+C` to stop it.

Handy inspection trick: the site has a hidden console — press the
backtick key `` ` `` on the page (or click the `>_` button, bottom right)
and type `depth 4000` to jump straight to 4,000 m, or `debug reset` to
clear your dive-log progress while testing. Type `help` to see the rest.

Check your change at both desktop width and phone width (in the browser
press `F12`, then `Ctrl+Shift+M` for phone view). Career cards, in
particular, lay out completely differently on phones.

---

## 9. Checking your work before publishing

Two commands act as spell-checkers for code. Run them from the terminal
(stop the preview with `Ctrl+C` first, or open a second terminal with the
`+` button):

```
npm run lint
```

This scans every file for mistakes and style problems. **The project's
rule is zero errors AND zero warnings.** Silence (or "0 problems") means
you're clear. Any output names the file and line — usually a quote/comma
slip from section 5, or a leftover unused `import` from a deleted skill.

```
npm run build
```

This does a full practice run of the "baking" step. It should end with a
list of file sizes and no red. If it fails, the error names the file.

Fix anything reported, re-run, repeat until both are clean. Never publish
with either one failing.

---

## 10. Saving your work with Git

Git is a save-point system. A **commit** is a named snapshot of the
project; **pushing** uploads your snapshots to GitHub.com, where they're
safe even if this computer dies. This does **not** change the live site —
it's purely the recipe archive — but it's mandatory housekeeping before
every deploy.

After previewing and checking, run these three commands one at a time:

```
git add -A
```
(Stages every changed file for the snapshot. No output means it worked.)

```
git commit -m "update project cards and swap resume"
```
(Takes the snapshot. Write a short plain-English note of what you changed.
**Keep the note free of apostrophes and quote marks** — this computer's
PowerShell mangles them. `update captains log` beats `update captain's
log`.)

```
git push
```
(Uploads to GitHub. If it asks you to sign in, use the GitHub account.)

Useful extras:

- `git status` — shows what you've changed since the last snapshot.
  Note: `.claude/settings.local.json` may show up as modified; **never
  commit that file on purpose** — if it's the *only* change, skip
  committing, and don't worry if `git add -A` swept it in with real work.
- `git log --oneline -10` — the last ten snapshots.

---

## 11. Publishing to the live site

**Merging or pushing code to GitHub does NOT update the live site.** The
one and only thing that updates https://happy-duck.github.io is the deploy
command below. (Under the hood: the live site is served from a separate
branch called `gh-pages` that only ever contains baked output; the deploy
command builds the site and pushes the result there for you.)

The complete publishing checklist, start to finish:

1. **Preview** your changes locally and like what you see (section 8).
2. **Check**: `npm run lint` and `npm run build` both clean (section 9).
3. **Save**: `git add -A`, `git commit -m "..."`, `git push`
   (section 10) — so the source code on GitHub matches what you're about
   to publish.
4. **Deploy**:
   ```
   npm run deploy
   ```
   This re-runs the build and then uploads the result. Success looks like
   the build output followed by the word `Published`.
5. **Wait 1–2 minutes**, then visit https://happy-duck.github.io.
6. **Hard-refresh** so your browser doesn't show you its cached old copy:
   `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac). On a phone, use a private
   tab to check.
7. Click around: open a project pop-up, download the resume, scroll to
   the floor. If something's wrong, fix it locally and repeat from
   step 1 — deploying again simply replaces the live site.

That's it. There are no servers to restart and nothing else to configure;
GitHub Pages notices the upload and serves it automatically.

---

## 12. When things go wrong

**The preview page is blank white.**
A file has a syntax error (usually a quote or comma — section 5). Look at
the terminal running `npm run dev`; the red error names the file and
line. Press `Ctrl+Z` in that file until the colors look normal, save.

**"I edited and saved but the preview didn't change."**
Is `npm run dev` still running in the terminal? Is it the right browser
tab (`localhost:5173`)? If you changed an image in `public`, reload the
tab manually.

**`npm run dev` crashes with an EBUSY error.**
OneDrive is mid-sync on a file you just dropped in. Wait ~30 seconds and
run it again.

**`npm` says it can't find a command or module.**
Run `npm install` once and retry.

**Undo edits to one file (not saved as a commit yet):**
`Ctrl+Z` in the editor, or to fully reset one file to the last snapshot:
```
git checkout -- src/components/Projects.jsx
```
(swap in the file's actual path — this **permanently discards** your
uncommitted edits to that file).

**Undo everything since the last commit:** in VS Code's Source Control
panel (the branching icon, left bar), right-click **Changes → Discard All
Changes**. Also permanent — be sure.

**The live site is broken but my local copy is fine.**
Run `npm run deploy` again — every deploy fully replaces the live site
with your current local build.

**The live site is broken AND so is my local copy, and I'm lost.**
Find the last good snapshot with `git log --oneline -15`, then
```
git checkout -- .
```
discards uncommitted changes; if the bad change was already committed,
`git revert <the-bad-snapshot-id>` creates a new snapshot that undoes it.
Then lint, build, push, deploy as usual. If genuinely stuck, GitHub still
has every snapshot ever pushed — nothing is truly lost.

**Deploy succeeded but the site looks old.**
It's your browser's cache — hard-refresh (`Ctrl+F5`), try a private
window, and give GitHub the full 2 minutes.

---

## 13. Glossary

| Term | Meaning |
|---|---|
| **Repository (repo)** | The project folder plus its entire snapshot history. Lives on your computer and on GitHub. |
| **GitHub** | The website that stores the repo online and serves the live site (via its "Pages" feature). |
| **Branch** | A named line of history. `master` holds the source code; `gh-pages` holds the baked site. You only ever work on `master`; the deploy command handles `gh-pages`. |
| **Commit** | One named save-point. |
| **Push** | Upload your commits to GitHub. |
| **npm** | The tool that runs the project's command shortcuts (`dev`, `lint`, `build`, `deploy`) and installs libraries. |
| **Build** | Converting the human-readable source into the compressed files browsers get (`npm run build`, output in `dist/`). |
| **Deploy** | Build + upload to the live site (`npm run deploy`). |
| **Lint** | Automatic proofreader for code (`npm run lint`). |
| **JSX / React component** | The `.jsx` files — each describes one piece of the page in a mix of code and HTML-like tags. |
| **String** | Text in quotes inside code. What you edit. |
| **Terminal** | The type-commands box (`` Ctrl+` `` in VS Code). |
| **localhost:5173** | The private preview address on your own computer. |
| **Hard refresh** | `Ctrl+F5` — reload a page ignoring the browser's saved copy. |
| **Cache** | The browser's saved copy of a site, which is why you hard-refresh after deploying. |
