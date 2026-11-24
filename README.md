# PO Practice Lab

A hands-on simulator for practising eCommerce Product Owner work at **HB Retail Group** (fictional). It has a
Jira-like board, Confluence-like pages, an inbox of colleague messages, and a Coach panel.

Brands in the demo workspace: **Chemist & Co** (UK drugstore), **Drogisterij Prijs** (Benelux discount drugstore),
**Maison Parfum** (prestige perfumery). All names are fictional. The app uses no third-party branding.

## Status

The app is **completely free and works offline**. There are no AI calls and no API keys. When you want AI feedback, the
app gives you a ready-made prompt to paste into your own Claude account (see "Ask Claude" below).

| Phase | Scope | State |
|---|---|---|
| 1 | Workspace: board, backlog, issues, links, pages, inbox, local storage | ✅ done |
| 2 | Learn library (11 lessons), 10 guided practice tasks, instant checks, hints, rubric self-check, model answers | ✅ done |
| 3 | "Ask Claude" copy-prompts with score paste-back | ✅ done |
| 4 | Stakeholder role-plays, day simulation | next |
| 5 | Progress tracking and review queue | |

## Setup

You need Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # typecheck + production build
```

## How to practise

1. **Learn**: read a lesson (or just its 1-minute concept card).
2. **Practice**: open a task. Each task has four steps:
   - **Brief:** concept card, situation, data tables, your task
   - **Your answer:** write stories, rank items, pick a sprint scope, fill in a PRD… Instant checks appear as you type
   - **Check:** automatic check (format rules, numbers, key points from the brief) plus your own rating against the rubric
   - **Compare:** your answer next to the model answer, the common mistakes, and saving your scores
3. Hints are in the **Coach** panel (three levels, each one closer to the answer).
4. **Ask Claude** (optional, free with a Claude account): see below.
5. Some **Inbox** messages start a task directly.

## Ask Claude (copy and paste)

The app never calls an AI itself. Instead, buttons copy a ready-made prompt that you paste into claude.ai:

| Where | Button | What Claude does |
|---|---|---|
| Step 3 · Check | **Copy review prompt** | Scores each rubric criterion, gives 3 strengths, 3 fixes, an improved version of your weakest part, and ends with a score block |
| Step 3 · Check | **Save Claude's scores** | Paste Claude's reply back here: the score block is read and saved with your progress |
| Step 2 · Your answer | **Ask Claude about this part** | Feedback on one written part, without rewriting it for you |
| Coach panel | **Help me get unstuck** | Guiding questions only, never the answer |
| Coach panel / lesson page | **Teach me the concept** | A fresh example, common mistakes and a 3-question quiz |

Each button also has **Preview**, so you can see exactly what will be sent. The review prompt contains only the current
task, your answer, the rubric and the reference answer. The score block looks like this:

```po-lab-score
{"scenario":"A2-plan-sprint-25","scores":{"cap":2,"must":1,"ready":2,"fit":2,"goal":1}}
```

## Using the workspace

- **Backlog:** drag the ⠿ handle to rank issues, or to move them between sprints and the product backlog. Filter by
  epic (dragging is off while a filter is on). Set the sprint capacity and goal inline. Click an epic card to open it.
- **Sprint board:** drag cards between To do, In progress, In review and Done.
- **Issue detail:** edit every field, add Given/When/Then acceptance criteria, link issues (epic → story, test case →
  story, blocks, relates to) and see the traceability tree epic → stories → test cases. Stories without a test case
  are flagged.
- **Pages:** create a page from a template (PRD, decision log, release notes, meeting notes, blank). Pages are
  written in Markdown with an edit/preview toggle and autosave.
- **Inbox:** colleague messages. From Phase 2 they trigger practice tasks.
- **Settings:** export or import all your data as JSON, or reset to the demo workspace.

Data is stored in your browser (IndexedDB). Clearing site data deletes it, so export regularly.

## Project structure

```
src/
  app/          layout, routes, UI state (zustand)
  components/   shared UI bits (type icons, pills, modal)
  content/      lessons (Markdown) and scenarios (JSON)
  engine/       instant checks, scoring, Claude prompts and score parsing, with unit tests
  db/           Dexie schema, types, actions, attempts, demo seed, backup
  lib/          pure logic with unit tests (ranking, link rules, backup format)
  features/
    practice/   practice list, task page (4 steps), answer editors
    learn/      learning library
    board/      backlog, sprint board, issue drawer, create dialog
    pages/      page list, Markdown editor, templates
    inbox/      messages
    assistant/  Coach panel
    settings/   export / import / reset
```

## How to add a practice task (scenario)

Scenarios are JSON files in `src/content/scenarios/`. Copy an existing one, give it a new `id` (also the file name), and edit it.
It appears in the app automatically.

| Field | What it is |
|---|---|
| `id`, `track` (`A`/`B`), `title`, `difficulty` (1–3), `lessonId`, `skills` | Basics. `lessonId` must match a lesson file name |
| `from` | Optional sender (name, role) |
| `context` | The situation (Markdown) |
| `data` | Small tables: `title`, `columns`, `rows`, optional `note` |
| `task`, `constraints` | What to do and the rules |
| `parts` | The answer fields, see below |
| `keypoints` | What a good answer mentions: `label`, the `part` it belongs to, and `anyOf` phrases (case-insensitive) |
| `rubric` | 3–6 criteria with `weight` (must add up to 100), `full` and `partial` descriptions |
| `hints` | Exactly 3, from gentle to nearly the answer |
| `modelAnswer` | Markdown |
| `commonMistakes` | List of strings |

**Part kinds**

| `kind` | Use for | Extra fields |
|---|---|---|
| `text` | Free text | `minWords`, `rows`, `checks`: `metric` (needs numbers + timeframe), `vague`, `questions` |
| `number` | A calculation | `answer`, `tolerance`, `unit`, `explanation` |
| `choice` | Single or multiple choice | `multi`, `options` (`id`, `label`, `feedback`), `correct` |
| `rank` | Prioritisation | `items`, `expectedOrder`, optional `mustTop`, `explanation` |
| `select` | Sprint scope | `items` (with `points`), `capacity`, `mustInclude`, `mustExclude` (with `reason`) |
| `match` | Match rows to options | `rows`, `options`, `answers`, `explanations` |
| `stories` | User stories with Given/When/Then | `minStories`, `maxStories`, `minAcPerStory`, `requireEstimate` |

Run `npm test` after editing: it validates every scenario (weights add up to 100, 3 hints, valid ids, must-dos fit capacity and so on).

## How to add or edit a lesson

Lessons are Markdown files in `src/content/lessons/`. Start with `# Title`, then a `## In one minute` section (used as the
concept card), then any sections you like. Register a new lesson in `LESSON_META` in `src/content/index.ts`.
