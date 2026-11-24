import type { PageTemplate } from '../../db/types';

export const PAGE_TEMPLATES: Record<PageTemplate, { label: string; defaultTitle: string; body: string }> = {
  prd: {
    label: 'PRD (one-pager)',
    defaultTitle: 'PRD: <feature name>',
    body: `| | |
|---|---|
| **Owner** | You (PO) |
| **Brands / markets** | |
| **Status** | Draft |
| **Epic** | HB-… |

## Problem
_Who has the problem, what is it, and what evidence do we have?_

## Goal
_What changes for the customer and the business if we solve it?_

## Success metric and guardrails
- **Primary metric:**
- **Guardrails (must not get worse):**

## Users
-

## In scope
-

## Out of scope
-

## Requirements
### Functional
1.

### Non-functional
- Performance:
- Accessibility:
- Tracking / analytics:
- Legal / GDPR:

## Risks and dependencies
| Risk | Impact | Mitigation |
|---|---|---|
| | | |

## Rollout
_Brands, markets, feature flag, A/B test, release date, comms._
`,
  },
  'decision-log': {
    label: 'Decision log',
    defaultTitle: 'Decision log: <topic>',
    body: `| Date | Decision | Options considered | Why | Decided by | Revisit when |
|---|---|---|---|---|---|
| | | | | | |
`,
  },
  'release-notes': {
    label: 'Release notes',
    defaultTitle: 'Release notes: <release>',
    body: `**Release date:**
**Brands:**

## New
-

## Improved
-

## Fixed
-

## Known issues
-

## Rollback plan
-
`,
  },
  'meeting-notes': {
    label: 'Meeting notes',
    defaultTitle: 'Meeting notes: <meeting>',
    body: `**Date:**
**Attendees:**

## Agenda
1.

## Notes
-

## Decisions
-

## Action items
- [ ] Owner – action – due date
`,
  },
  blank: { label: 'Blank page', defaultTitle: 'Untitled page', body: '' },
};
