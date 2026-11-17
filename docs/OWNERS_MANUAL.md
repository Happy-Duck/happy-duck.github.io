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
   - [6.7 Education and the class bubbles](#67-education-and-the-class-bubbles)
   - [6.8 Browser-tab title and search-engine text](#68-browser-tab-title-and-search-engine-text)
   - [6.9 Dive-log species names and jokes](#69-dive-log-species-names-and-jokes)
   - [6.10 Pages: jobs, projects, classes, hobbies](#610-pages-jobs-projects-classes-hobbies)
   - [6.11 Things that take care of themselves](#611-things-that-take-care-of-themselves)
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
│   │   ├── Skills.jsx      ← the icon for each skill (see 6.4)
│   │   ├── About.jsx       ← Captain's Log
│   │   ├── Education.jsx   ← degree card above the class bubbles (see 6.7)
│   │   ├── ContactSidebar.jsx ← email / LinkedIn / GitHub / resume links
│   │   └── creatures/      ← code for each animated creature
│   ├── content/        ← YOUR CONTENT: the words on the cards and pages
│   │   ├── work.js         ← "Career" cards and job pages
│   │   ├── projects.js     ← project cards and project pages
│   │   ├── skills.js       ← skill names and tooltips
│   │   ├── courses.js      ← your classes (the bubble column)
│   │   ├── hobbies.js      ← Captain's Log lines and hobby pages
│   │   └── pages/          ← the long write-up for each page (see 6.10)
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
`src/workers/`, `src/index.css`, `src/content/index.js`,
`src/content/bodies.js`, `scripts/`, `vite.config.js`, `eslint.config.js`,
and the creature/effect files except for the one photo-swap noted in 7.2.

---

## 5. How to edit text without breaking anything

Almost every text change is editing what's between quote marks in a list.
Here is one career card as it appears in the code:

```js
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
Education → Captain's Log → ocean-floor footer.** That order is set in
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

**File:** `src/content/work.js` — the list called `WORK`. (The section is
titled "Career" on the page; the heading itself is near the bottom of
`src/components/Experience.jsx` if you want to rename the section.)

Each job is one block. The same block feeds the card on the main page
**and** that job's own page (see 6.10):

| Label | What it is | Example |
|---|---|---|
| `slug` | The job's web address: `/work/<slug>/`. Lowercase, no spaces, hyphens between words. **Don't change it once the link is on your resume** — old links would break. | `'brunswick'` |
| `company` | Employer name (bold line under the role) | `'Brunswick BI Design Lab'` |
| `role` | Job title (the big line) | `'Unity VR Developer'` |
| `period` | Dates, shown in small caps | `'May 2026 – Present'` |
| `summary` | ONE sentence. Shown under the link in Google and when the page is shared in Discord, LinkedIn, etc. | any sentence |
| `blurb` | What the **card** says. Keep it to three lines: the card opens the page, and the detail belongs there. Leave it out and the card shows the `description`. | two or three short sentences |
| `description` | The full paragraph. It opens the job's page. | any sentence(s) |
| `stack` | The tools line at the bottom of the card | `['Unity', 'C#', 'VR']` |
| `tags` | Broad categories: `games`, `xr`, `graphics`, `tools`, `research`. On projects they drive tailored links (see 6.11). | `['xr']` |
| `skills` | Which of your Skills icons this job used, by their `id` in `src/content/skills.js`. When a visitor presses a skill icon, the cards that list it light up. | `['unity', 'csharp']` |

- **Edit** — change text inside quotes.
- **Add a job** — copy an existing block from `{` through `},` and paste
  it where you want it in the list. **Order in the list = order on the
  page, top card first.** Newest job goes at the top.
- **Remove a job** — delete its block, `{` through `},`.
- Cards alternate left/right of the timeline automatically; nothing to
  configure.

One caveat: each job must have a **different `slug`** (it is the page
address and the code's internal ID). Two stints at the same company? Give
them different slugs, e.g. `'origami-games'` and `'origami-games-2025'`.

### 6.3 Project cards

**File:** `src/content/projects.js` — the list called `PROJECTS`. Each
block feeds the card and the project's own page, which opens when a
visitor clicks the card (see 6.10).

```js
{
  slug:        'sportsbot',
  title:       'SportsBot',
  summary:     'A Discord bot delivering live scores, player stats, and schedule alerts through slash commands.',
  description: 'Discord bot delivering live scores...',
  stack:       ['Python', 'discord.py', 'REST APIs'],
  link:        'https://github.com/Happy-Duck/DiscordSportsBot',
  tags:        ['tools'],
  skills:      ['python', 'sql'],
  details: {
    role: 'Solo developer',
    highlights: [
      'Live scores, player stats, and schedule alerts via slash commands',
      'Backed by REST sports APIs with a SQL persistence layer',
    ],
  },
},
```

- `slug`, `summary`, `tags`, `skills` — same meaning as on career cards
  (6.2). The project's page lives at `/projects/<slug>/`.
- `title`, `description`, `stack` — same drill as career cards.
- `blurb` — optional, same as on career cards: a shorter text for the
  card when the `description` runs past three lines.
- `link` — the full web address the corner button opens. The button's
  icon picks itself: a Steam address shows the Steam logo, `itch.io` the
  itch logo, `github.com` the GitHub logo, anything else a generic arrow.
  **No link yet? Use `'#'`** — the button hides itself.
- `details.role` — one line under the title on the project's page.
- `details.highlights` — bullet points on the project's page. It's a mini-list:
  each bullet is one quoted string ending with a comma. Add or delete
  whole quoted lines.
- `details.embed` — *optional* playable widget on the project's page (the Steam
  and itch.io cards have one). To add one for an itch.io game:
  ```js
  embed: { src: 'https://itch.io/embed/YOUR_GAME_ID?dark=true', height: 167, title: 'Game Name on itch.io' },
  ```
  (Get the number from itch.io → your game → Distribute → Embed game.)
  To remove a widget, delete the whole `embed: { ... },` line.
- `courses` — *optional*. If the project came out of a class, name the
  class by its `slug` from `courses.js`: `courses: ['cs-418'],`. The
  project then appears on that class's page, and the class on the
  project's page.
- `grid: false` — *optional*. Gives the project a page without a card
  in the Projects section. Use it for small class projects that should
  be reachable from their class but would crowd the main grid.
- **Add a project** — copy a whole card block, paste it into the list at
  the position you want (cards fill the grid left-to-right, top-to-bottom,
  first in the list = top-left). Each card needs a **unique `slug`**.
- **Remove a project** — delete its block, `{` through `},`.

### 6.4 Skills icons

**Files:** `src/content/skills.js` holds the words (the list called
`SKILL_GROUPS`: two groups, `Languages` and `Tools & Frameworks`, each
item a name and a hover tooltip). `src/components/Skills.jsx` holds the
picture for each one (the list called `ICONS`). The two are matched by
the item's `id`.

- **Change a tooltip or label** — in `skills.js`, edit the `name:` or
  `tooltip:` text. Watch the apostrophe rule (rule 2 in section 5).
  **Don't change an `id`** — jobs and projects refer to skills by it.
- **Remove a skill** — delete its `{ id: ..., name: ..., tooltip: ... },`
  line in `skills.js`. Then in `Skills.jsx` delete its line in `ICONS`
  and the matching `import ... from 'devicons-react...'` line at the top
  (a leftover import makes the pre-publish check in section 9 fail with
  an "unused variable" warning — that's intentional; the check is telling
  you to finish the job). Also remove that `id` from any `skills: [...]`
  lists in `work.js` and `projects.js`.
- **Add a skill** — this is the one content edit that needs three steps,
  because each icon ships as its own tiny file:
  1. Find the icon's name. Icons come from a library called *Devicon* —
     browse https://devicon.dev to see what exists. The import name is the
     technology name with a capital first letter plus a style suffix like
     `Plain` or `Original` (e.g. `RustPlain`, `GodotOriginal`). You can
     confirm the exact spelling by looking in the
     `node_modules/devicons-react/lib/icons` folder.
  2. In `Skills.jsx`, add an import at the top, next to the existing ones:
     ```js
     import GodotOriginal from 'devicons-react/lib/icons/GodotOriginal'
     ```
     then add a line to the `ICONS` list. The word before the colon is
     the `id` you are about to use in step 3:
     ```js
     godot:   (s) => <GodotOriginal size={s} color="currentColor" />,
     ```
     If the icon comes out the wrong color (some icons ignore the color
     setting), copy the `ForcedColorIcon` pattern used by the `unreal`
     and `blender` lines instead.
  3. In `skills.js`, add an item to a group with that same `id`:
     ```js
     { id: 'godot', name: 'Godot', tooltip: 'My next engine' },
     ```
  - **Never** import from `'devicons-react'` directly (without
    `/lib/icons/...`) — it silently pulls ~3,000 icons into the site and
    bloats it.

### 6.5 Captain's Log entries

**Files:** `src/content/hobbies.js` for the lines, `src/components/About.jsx`
for the rest.

- **The sentence under "Captain's Log"** — `LOG_INTRO` in `hobbies.js`.
  It is kept on one line by shrinking its text to fit (phones excepted,
  where it would be too small to read). If you make it much longer, it
  will get smaller; ask for the size rule in `index.css` (`.log-subtitle`)
  to be re-measured.
- **The rotating "> …" lines** — also in `hobbies.js`. Every block in the `HOBBIES` list is one more line, and
  also a page of its own. The whole line is the way in: it carries a
  small arrowhead at its end and lights up when pointed at. The lines
  stop reshuffling while the pointer is on them:
  ```js
  {
    slug:  'fly-fishing',
    title: 'Fly fishing',
    log:   'Avid fly fisherman: fished the Wisconsin Driftless...',
  },
  ```
  `log` is the line as typed in the Captain's Log, `title` is the
  heading on the hobby's page, and `slug` is the page address
  (`/hobbies/fly-fishing/`). Edit, add, or delete whole blocks. The lines
  type themselves out in a loop, top entry retyping at the bottom — the
  order in the list is the starting order. Apostrophe rule applies (note
  the existing lines mix `"double quotes"` and `'single quotes'` for
  exactly that reason). To put photos and stories on a hobby's page,
  see 6.10.
- **Location** — `LOCATION` near the top of `About.jsx`.
- **The header lines** (`UIUC — CS '27 — 4.0 GPA` and the coordinates) —
  search for `log-meta-line` in `About.jsx` and edit the text between
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

### 6.7 Education and the class bubbles

The Education section is a degree card with the classes under it. It
opens small: a short tank holding only the classes that have a page,
beside a list of them. Above the tank, top right, is a button, "Show
all 30 classes". It grows the tank into the full column, one bubble per
class, with the color filter, the list view, and the semester slider.
The same button, in the same spot, then says "Show fewer" and puts it
back, so you can click back and forth without moving the mouse. The
numbers in the sentence and on the button count themselves.

**Bubble colors follow one rule: the department in the class code.**
Every CS class is blue, every GSD class purple, MATH and PHYS green,
and every other department (INFO, THEA, and so on) orange. You never
pick a color; a new class colors itself from its code.

**The degree card** (degree, GPA, minor, the paragraph) —
`src/components/Education.jsx`. Edit the text between `>` and `<`.

**The classes** — `src/content/courses.js`, the list called `COURSES`.
One line per class:

```js
{ slug: 'cs-225', code: 'CS 225', title: 'Data Structures', term: 'FA25', credits: 4 },
```

| Label | What it is |
|---|---|
| `slug` | Unique id: the code in lowercase with a hyphen. |
| `code`, `title` | What the bubble and the hover card show. The part of the code before the space (`CS`, `MATH`) sets the bubble's color. |
| `term` | When you took it. One of the ids in the `TERMS` list at the top of the file (`FA24`, `SP25`, …). |
| `credits` | Credit hours. Bigger number, bigger bubble. |
| `note` | *Optional* extra line in the hover card. |

- **Add a class** — copy a line, change the values, put it under the right
  semester comment.
- **A new semester** — add it to the `TERMS` list (`{ id: 'FA27', label:
  'Fall 2027' },`), then add its classes.
- **When a semester starts** — change `CURRENT_TERM` near the top to the
  new term's id. Classes before it show as completed, classes in it as in
  progress (slightly see-through), and classes after it as planned
  (faint). Nothing else needs touching.
- **Change a color, or give a department its own** — edit
  `COURSE_CATEGORIES`. Each group lists its departments (`depts: ['MATH',
  'PHYS']`); a department in no list goes in the last group.
- **Grades are deliberately not in this file.** Don't add them.

**Making a class clickable** — give it a `summary` and a `description`:

```js
{
  slug: 'cs-418', code: 'CS 418', title: 'Interactive Computer Graphics', term: 'FA26', credits: 3,
  summary:     'One sentence for Google and link previews.',
  description: 'The opening paragraph on the class page.',
},
```

That is all it takes: the bubble gets a glowing ring and opens the
class's own page at `/courses/cs-418/`. Four classes are set up this
way now, with placeholder wording marked `PLACEHOLDER` in the file —
replace it with what you actually built. To put photos, video, and a
write-up on the class page, see 6.10. To list one of your projects on
it, add `courses: ['cs-418'],` to that project in `projects.js` (6.3).

To hide the whole Education section, open `src/App.jsx` and put
`{/* ` before and ` */}` after the `<Education />` line.

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

### 6.10 Pages: jobs, projects, classes, hobbies

Every job, project, and hobby — and every class you made clickable —
has its own page with its own web address, for example
`https://happy-duck.github.io/projects/pelagos/`, that you can put on a
resume or send to someone. Visitors reach them from the site: clicking a
project or career card, a class bubble with a ring around it, or a hobby
line in the Captain's Log.

Out of the box a page shows only what its block in the data file says.
**Hobby pages in particular are one line long until you write them.**

To give a page a real write-up, create one text file named after the
block's `slug`, in the folder for its kind:

```
src/content/pages/projects/pelagos.mdx       ← a project
src/content/pages/work/brunswick.mdx         ← a job
src/content/pages/courses/cs-418.mdx         ← a class
src/content/pages/hobbies/fly-fishing.mdx    ← a hobby
```

**The fast way:** copy `src/content/pages/_TEMPLATE.mdx`, paste it into
the right folder, rename it, and replace its contents. It already has a
working example of everything below, plus notes on where files go.

**Blocks you can drop into a write-up.** Each is one tag; copy it from
the template and change the text between the quotes:

| Block | What it makes |
|---|---|
| `<Stats items={[…]} />` | A row of headline numbers ("30,000+ downloads"). |
| `<Figure src="…" alt="…" caption="…" />` | One picture with a caption. Click enlarges it. |
| `<Gallery images={[…]} />` | A grid of pictures; click any to page through them full-size. |
| `<YouTube id="…" title="…" />` | A video. The `id` is the part after `v=` in the video's address. |
| `<Callout title="…">…</Callout>` | A boxed aside for the point a skimmer must not miss. |
| `<Chart type="line" … />` | A line, bar, or scatter chart from numbers you type in. |
| `<Redacted until="…">…</Redacted>` | A placeholder for something you can't show yet. |
| `<RepoCard repo="Happy-Duck/Name" />` | A GitHub repository with its live stats. |
| `<Clip src="…" poster="…" caption="…" />` | A short video file that plays in place. |
| `<Diagram nodes={[…]} links={[…]} />` | Boxes joined by arrows. Each box has a `col` and `row` (counting from 0) saying where it sits. |
| `<Note title="…">…</Note>` | A short aside in the right-hand margin. Put it just before the paragraph it belongs beside. |
| `<CodeTour steps={[…]}>` … `</CodeTour>` | Wrapped around a code block: walks the reader through it a few lines at a time. Each step is `{ lines: 2, text: '…' }` or `{ lines: [3, 5], text: '…' }`, counting lines from 1. |
| `<Compare before="…" after="…" alt="…" />` | Two pictures of the same thing with a divider the reader drags between them. Both should be the same shape. `beforeLabel="…"` and `afterLabel="…"` change the words in the corners. |
| `<Timeline items={[…]} />` | Dated steps, oldest first. Each is `{ when: 'March 2025', title: '…', text: '…' }`; `text` is optional. |
| `<Download href="…" title="…" note="…" />` | A row that opens a file, such as a paper or a poster. Put the file in the page's media folder. |
| `<Draft />` | The yellow "this page is placeholder" notice. See below. |

`Figure`, `Gallery`, and `Clip` can stand in for media you don't have
yet: leave out `src` and write `label="what will go here"`, and they
draw a crossed-out frame of the right size. `Compare` does the same
when it has no pictures, and `Download` without an `href` shows as
"File to come". Add `wide` to a `Figure`, `Clip`, or `Compare` to let
it run the full width of the page instead of the text column, and
`lead` to a `Gallery` to show its first picture large.

**Every page currently holds placeholder content** so the layout can be
judged: filler text that says what belongs in each spot, crossed-out
frames, sample charts. Each of those pages starts with a `<Draft />`
line. As you replace a page's filler with the real thing, delete that
line. **`npm run deploy` refuses to publish while any page still has
it** and lists which ones; that is deliberate. If you want to go live
before a page is written, delete its `.mdx` file and the page falls
back to just its card content.

Two rules that keep these from breaking: every `alt="…"` should say what
the picture shows (screen readers read it aloud), and inside the curly
braces the usual list rules from section 5 apply — quotes around text,
commas between items, no quotes around numbers. To see all of them
working, run the preview and open `localhost:5173/dev/kitchen-sink`.

**Extra links on a page.** Any block in the data files can carry
`links: [{ label: 'MP2 source', href: 'https://github.com/…' }],` and each
one is listed under "Links" beside the page's title. (`link:` on a
project is still the main store link, and the button on its card.)

**Closing a page.** On a wide screen the ocean stays visible either side
of the page; clicking it, pressing Esc, or "Back to the dive" all return
to where the visitor was.

**Pictures and video** go in the `public` folder, one folder per page:
`public/media/projects/pelagos/menu.jpg` is written in the page as
`/media/projects/pelagos/menu.jpg` (in a `Figure`, a `Gallery`, and so
on).

**After adding pictures, run this once in the terminal:**

```
npm run media
```

It does four things, and is safe to run as often as you like:

1. Shrinks every `.jpg` and `.png` in `public/media` to a `.webp`
   (a much smaller kind of picture file), no wider than 1920 pixels,
   and turns phone photos the right way up.
2. Moves your original out to a folder called `media-originals`, next
   to `public`. Nothing is deleted. That folder is not uploaded to the
   site or to GitHub, so keep your own copy of anything precious.
3. Fixes the file names in your write-ups: if a page says `menu.jpg`,
   it now says `menu.webp`. You never rename anything by hand.
4. Remakes the share pictures (below).

It finishes by listing anything heavy. Keep video clips under about
4 MB; put anything longer on YouTube and embed it (the template shows
how). Videos and PDFs are not changed by the command.

**The picture a shared link shows.** When a page's address is pasted
into a message or a post, it shows a picture. `npm run media` makes one
per page, in `public/social`: the page's title over the site's water.
To use one of your own pictures instead, add a `cover` line to that
page's block in its data file (see Pelagos in `projects.js`):

```
cover: '/media/projects/pelagos/steam-3.webp',
```

then run `npm run media` again. Run it too after renaming a page or
adding a new one; the build reminds you if a page has no picture yet.

**Printing.** A page prints (or saves as a PDF) as a plain document:
dark text on white, no ocean, web addresses written out after links.
Open the page and use the browser's Print. Handy for bringing one
project to an interview.

(Create the `projects`, `work`, `courses`, and `hobbies` folders the
first time — right-click `pages` in the VS Code Explorer → New Folder.) The file is written in
**Markdown**, the same simple format as this manual:

```
## How it works

A paragraph. **Bold**, *italic*, and a [link](https://example.com).

- A bullet
- Another bullet
```

Fenced code blocks (three backticks, then the language name, e.g.
`` ```cs `` for C#) are color-highlighted automatically. To see every
kind of formatting and exactly how it will look, run the preview
(section 8) and visit `localhost:5173/dev/kitchen-sink`.

No list to update and nothing to register: save the file and the page
picks it up. Delete the file and the page goes back to showing just the
card content.

### 6.11 Things that take care of themselves

- **Skill icons** show a tooltip when pointed at. They do nothing when
  clicked.
- **The career line** places itself: one marker per job, and the year
  beside it is read from the job's `period`.
- **Page colors.** A page opened from a beige card near the surface is
  beige; one opened from a navy card in deep water is navy. Nothing to
  set.
- **The class tank** counts its own classes. Give a class a
  `description` and it joins the short list; the numbers update.
- **The depth gauge** on the right edge has a tick for each section;
  clicking one jumps there. On a phone there is no room for it, so the
  depth shows in the top corner instead, and tapping it lists the
  sections. New sections need a programmer.
- **Tailored links.** Add `?for=` and a tag to the site address and the
  projects with that tag come first: `happy-duck.github.io/?for=tools`
  leads with SportsBot, `?for=graphics` with the vision research. Use a
  different link on each kind of application. Tags come from the
  `tags` lists in `projects.js`; a tag no project has changes nothing.
- **The console** (the `>_` button): `ls projects` lists pages and
  `open pelagos` opens one.

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
| `squid.webp` | firefly squid, twilight zone |
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
- **Social preview** (the picture shown when the home page's link is
  shared): replace `public/og-image.png`, sized 1200×630 pixels. It is
  a screenshot of the top of the site. Each page has its own, made by
  `npm run media` (section 6.10).
- Don't delete `googleb28b642a426b9703.html`, `robots.txt`,
  `manifest.json`, or `404.html` — they're plumbing for Google and
  GitHub Pages. (The sitemap is no longer a file you keep: the build
  writes it from your list of jobs and projects.)

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
7. Click around: open a project page, download the resume, scroll to
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
git checkout -- src/content/projects.js
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
