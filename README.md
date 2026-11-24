# PO Practice Lab

A hands-on simulator for practising eCommerce Product Owner work at **HB Retail Group** (fictional). It has a
Jira-like board, Confluence-like pages, an inbox of colleague messages, and a Coach panel.

Brands in the demo workspace: **Chemist & Co** (UK drugstore), **Drogisterij Prijs** (Benelux discount drugstore),
**Maison Parfum** (prestige perfumery). All names are fictional. The app uses no third-party branding.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Workspace: board, backlog, issues, links, pages, inbox, local storage | ✅ done |
| 2 | Scenario engine, 10 scenarios, concept cards, hints, rubric, model answers | next |
| 3 | AI grading via local proxy, token budget, caching, settings | |
| 4 | Stakeholder role-plays, day simulation | |
| 5 | Progress tracking, review queue, interview mode | |

## Setup

You need Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # typecheck + production build
```

No API key is needed until Phase 3. Copy `.env.example` to `.env` then. The key is only ever read by the local
proxy in `/server`, never by the browser.

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
  db/           Dexie schema, types, actions, demo seed, backup
  lib/          pure logic with unit tests (ranking, link rules, backup format)
  features/
    board/      backlog, sprint board, issue drawer, create dialog
    pages/      page list, Markdown editor, templates
    inbox/      messages
    assistant/  Coach panel
    settings/   export / import / reset
server/         local AI proxy (Phase 3)
```

## How to add scenarios / change models and budget

Added in Phase 2 (scenarios) and Phase 3 (models, budget).
