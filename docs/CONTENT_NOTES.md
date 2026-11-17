# Content notes: what each page is built from, and what it still needs

Read this before writing or changing the text on any page. It records
what the owner has supplied, what was used, what was deliberately left
off the site, and what each page is still waiting for. It is the handoff
for whoever continues the content work (the owner expects to do the
hobby pages with a different model).

Last updated 2026-11-17 (second round: the poster, CS 415's MPs, the
redacted name).

The owner's documents are attachments in the chat where they were
shared, not files in the repo. When the owner says they sent
something, look for it there before saying it never arrived.

## Rules for page text

These come from the owner. They are not style suggestions.

1. **Nothing invented.** A page says only what the owner has said or
   what a document of theirs shows. Where the source is silent, leave a
   labelled placeholder (`Placeholder text. ...` or a `Figure`, `Gallery`,
   or `Clip` with a `label` and no `src`). Do not smooth a gap over with a
   plausible detail. On 2026-11-16 a draft of the Origami Games page said
   a prototype was "worked out on paper first"; the slides did not say
   that, and it was cut.
2. **Modest.** State facts and let numbers carry the weight. No
   superlatives about the owner. Dry humor is welcome; it is how the
   owner writes.
3. **House style.** No em dashes, no text arrows, sentence case, no
   uppercase labels. See the header of `src/styles/pages.css`.
4. **Private things stay off.** Grades, point totals, and "I propose a
   grade of" lines; netids; birth date; the names of classmates and
   teammates (say "a team of five", "a teammate's workbench"); anything
   under the Brunswick embargo (no Future Helm pictures or video until
   CES, January 2027) or uncleared ESA/ISSI material.
5. **`<Draft />` stays** at the top of a page until every placeholder on
   it is gone. Give it a `note="..."` saying what is real and what is
   not. `npm run deploy` refuses to publish while any page has one.
6. **The owner's own words can be quoted** (character sheets, log lines).
   Leave out the crude parts.

## How to add to a page

- Text: edit `src/content/pages/<kind>/<slug>.mdx`. Blocks and examples
  are in `src/content/pages/_TEMPLATE.mdx`; every block is shown at
  `/dev/kitchen-sink` on the dev server.
- Pictures: put them in `public/media/<kind>/<slug>/`, reference them by
  that path in the page, then run `npm run media` once. It shrinks them,
  renames them to `.webp`, fixes the names in the page, and records their
  sizes. Originals go to `media-originals/` (not committed).
- The one-line card text and facts beside the title live in the data
  files: `src/content/work.js`, `projects.js`, `courses.js`, `hobbies.js`.
- A file to download (a PDF): put it in the page's media folder and give
  a `<Download href="/media/..." title="..." />` its path.

## Hobby pages

All six keep `<Draft />`. The owner will send photos and more stories.

### Fly fishing (`hobbies/fly-fishing`)

Given by the owner, 2026-11-15: the trout count is 6.

| Water | Trout | Count |
| --- | --- | --- |
| The White River, Arkansas | Rainbow | 1 |
| Virginia (the Appalachians) | Brown | 1 |
| Wisconsin (the Driftless) | Brown | 1 |
| Wisconsin (the Driftless) | Brook | 3 |

- The Wisconsin numbers came with "I think". Confirm before treating
  them as settled.
- The White River is the one in Arkansas (owner, 2026-11-17; their
  first message said "AK").
- The count appears in three places that must agree: the table and the
  Stats on the page, and the log line in `hobbies.js` ("Current trout
  count: 6").
- Still needed: how it started, a paragraph per water, Illini Fly
  Fishing (the club), photos, and dates and flies if the owner has them.

### Musical theater (`hobbies/musical-theater`)

Given by the owner, 2026-11-15. Seven productions:

- Tours: Annie (State Farm Center), Hadestown (State Farm Center), The
  Book of Mormon (Orpheum, San Francisco), Hamilton (Murat, Indianapolis).
- Illini Student Musicals: Heathers, Cabaret (Lincoln Hall, UIUC).
- Lyric Theatre at Illinois: Singin' in the Rain (Krannert Center). This
  is the most recent ("I've also just seen").
- Still needed: how it started, favorites, photos, dates.

### Tabletop RPGs (`hobbies/ttrpg`)

From four character sheets and the owner's account, 2026-11-15.

- The log line jokes that the game cannot be named. Keep the page from
  naming it. Its terms (aarakocra, warforged, plasmoid, artificer) are
  fine.
- **Duckman**: the owner's first character, made in tenth grade for a
  one-shot with friends and unused after it. Aarakocra storm sorcerer, a
  hermit raised in a cave, with a rubber duck as his arcane focus; 2 hit
  points at level 1. Brought back freshman year of college for a
  campaign with Illini Metagamers, where he died in session one. Then, in
  the owner's words: "I joined a campaign with a notoriously challenging
  DM, Duckman died and was revived twice and transformed over time to his
  final cyborg artificer version." The last sheet is Duckman 3.0, a
  level 14 warforged artificer, armor class 31, 157 hit points.
  It is not stated whether the hard campaign and the Illini Metagamers
  one are the same campaign. The page does not say either way.
- **A second character**, played between two of Duckman's lives: a
  bugbear bard (College of Whispers, a percussionist), level 6 on his
  sheet. **His real name is never printed.** The owner asked
  (2026-11-17) for it to appear as `[REDACTED]`, which is how the page's
  timeline titles him. Do not use his backstory, which is crude.
- **Glorb**: a plasmoid bard, level 3, made for a one-shot with friends.
- There is a drawing of Duckman on the level 1 sheet. The page has a
  placeholder for it; the image file has not been supplied.
- Left off: the cruder entries on the sheets, and the party's name.
- Still needed: who the owner plays with now, more stories, photos.

### Gaming, cooking, scuba

Nothing new supplied. Placeholders only.

### A better way in

The log lines are plain rows for now. Three larger ideas are waiting on
the owner's pick (docs/PORTFOLIO_PLAN.md, Fifth pass): objects on the
sea floor, a strip of the owner's photos, or a second chapter in the
dive log. Do not build one until they choose. The first two need six
photos.

## Class and project pages

### CS 417, Intro to Extended Reality (`courses/cs-417`)

Sources: contribution summaries for MP0, MP1a, MP1b, MP2a, MP2b; the
MP1 team check-in and integration summary; the MP2 design document; the
Seven Seats vision document.

- Used: what each project is, team sizes, and the owner's own parts
  (the orbiting comet, the classroom, the chicken farm, procedural
  world generation).
- One picture used: the room in the Unity editor (MP1a).
- **Left off, for the owner to decide:**
  - The YouTube walkthrough videos. They are recordings made for
    grading and may be unlisted.
  - The MP0 and MP1a repositories, and the escape room's repository,
    which belongs to a teammate.
  - The Chey Gaufre flowchart, and the back-room lab's real name. The
    game's joke is that the lab makes "METH (medicinal energy
    therapeutic hodgepodge)". The page calls it "the lab". The chicken
    farm's gun is not mentioned either. This is a portfolio a recruiter
    reads, so it is the owner's call to add them.
- The three itch.io links in `courses.js` come from the summaries. All
  are public (owner, 2026-11-17).
- Seven Seats is in progress; its section describes the plan.

### CS 415 and Party School (`courses/cs-415`, `projects/party-school`)

Sources: the High Level Vision Canvas and the Technical Design Document
(version 1.2, 25 March 2026). The owner's own part comes from the
existing card text. Still needed: gameplay capture, pictures of the map
and the racing minigame, and the two placeholder sections.

- **The class was not one semester-long project** (owner, 2026-11-17):
  it ran as a set of machine problems (MPs), then a final project of
  about a month. Party School is that final project, and both documents
  are about it. The class page now says so; what the MPs were is a
  placeholder.
- The racing minigame was finished (owner, 2026-11-17). The card, the
  highlights, and both pages say so in the past tense.

### Immersive Learning Lab (`work/immersive-learning-lab`)

Source: the owner's IMMERSE 2026 poster, "No Spacesuit Required:
Immersive Applications for Science Communications"
(`IMMERSE_2026_Poster_RishiGarhyan_Final.pdf`). It was in the batch of
2026-11-16 and was missed until the owner pointed it out on 2026-11-17.

- Used: all of its text (the motivation, the ISSI lobby and what can be
  done in it, MANiaC and the time-of-flight plot, how it was built, the
  future work, dated "as of the poster"). 14 of its 16 headset
  screenshots are on the page; the poster itself is a figure, and its
  PDF is the `Download`. The `cover` for the share picture is the gold
  model of the instrument.
- **The ESA/ISSI permission check** (rule 4 above):
  the poster was shown in public at the symposium, with the lab's
  supervisors as co-authors, so its pictures were treated as cleared.
  The "Permission" note on the page was removed. If the lab wants web
  use approved separately, take the pictures and the PDF off.
- The credits note names the supervisors (Prof. Raluca Ilie and Nan
  Kang) and the NSF award, as the poster's acknowledgments do. They are
  co-authors, not classmates, but it is the owner's call.
- Still needed: a headset capture (the `Clip` at the top).

### CS 222 and SportsBot (`courses/cs-222`, `projects/sportsbot`)

Source: the project proposal (rough draft, group of four).

- The owner confirmed on 2026-11-15 that SportsBot was the CS 222
  project. CS 222 has a page because it has a `description`; it has no
  write-up of its own.
- The SportsBot page describes **the plan**, and says so. The proposal
  was for soccer only; the card speaks of sports in general. What
  changed between plan and finished bot is a placeholder section.
- `role` used to say "Solo developer". The proposal shows a team of four
  with the owner in the Discord pair, so it now says that. The owner
  confirmed the team of four (2026-11-17).

### INFO 418 (`courses/info-418`)

Sources: the Keg Safe 2.0 schematic, a Tinkercad breadboard picture,
and five class documents from the 2026-11-16 batch (written up on
2026-11-17, after sitting unused for a round): the learning objectives,
the paper prototype check-in (durability plan, block diagram, parts
list), the 1.0 durability test, the debugging log (21 to 27 October),
and the paper prototype's playtest reflection.

- **One prop, which changed** (owner, 2026-11-17): the keg for the
  final puzzle of the hunt. It was planned as a sticker dispenser (a
  servo arm pushing out a sticker as the prize; that is what the paper
  prototype and its playtest were), then became a solenoid-locked
  drawer that tips out of the keg, the "keg safe" of the schematic. The
  sticker dispenser was dropped. The page and the card say so; the old
  text claiming two props is gone.
- The owner designed the keg safe circuit and wrote its Arduino code
  (confirmed 2026-11-17).
- **Never print the final puzzle's answer.** The playtest names it, and
  Riggs Escape is a real room. The page says only that meeting the keg
  early would show players "what shape the final answer takes".
- Left off: the sticker procurement options and costs (the dispenser
  was dropped), and the name of the person the owner was waiting on
  for the sticker budget.
- Quoted, as the owner's own words: one sentence from the learning
  objectives, and "always test LEDs before using them" from the log.
- **The Tinkercad picture and the schematic are out of date.** The owner
  will send new ones. When they arrive: replace
  `public/media/courses/info-418/keg-safe-breadboard.webp` (or add a new
  file and point the `Figure` at it), check the parts table against the
  new schematic, drop "An earlier layout" from the caption, and put the
  schematic PDF in that folder for the `Download` row.

### Origami Games (`work/origami-games`)

Source: the end-of-internship presentation (seven slides). The slides
hold a screenshot of each prototype; neither image file has been
supplied, so the page has placeholders.

### This website (`projects/this-site`)

The owner asked on 2026-11-15 for this page to be "very transparent
that it was entirely done by Claude", as an exploration they repeat
"when a new advanced model comes out". The page, card, summary, and
role all say so. Keep it that way in any rewrite.

The timeline of models is taken from the `Co-Authored-By` line of each
commit on the source branches:

| When | Model | Commits |
| --- | --- | --- |
| March 2026 | Claude Opus 4.6 | 40 (and 1 by Sonnet 4.6) |
| June to July 2026 | Claude Fable 5 | 60 |
| November 2026 | Claude Fable 5.2 | the wave 3 branch |

46 commits from March carry no such line, so the history does not name
a model for them. When a new model does an overhaul, add a row to the
page's `Timeline`.

Claude Opus 5.5 finished the November round after Fable 5.2 (from
36632d2 on 2026-11-17; its commits carry its own co-author line). The
owner decided on 2026-11-17 that it gets no row: "the purpose was to
explore fable 5.2, its better to keep a crisp narrative." A model that
only finishes another model's round is not added; one that does its own
overhaul is.

## Still waiting on the owner (everything else)

- Real text and media for the remaining placeholder pages: Brunswick
  (under embargo), Pelagos, Flarp, Tide Toss, the vision research,
  CS 418.
- The research paper PDF. (The IMMERSE poster arrived; see above.)
- Numbers for the two evidence charts (Pelagos downloads over time;
  accuracy and latency per model).
