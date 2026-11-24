# Change management and traceability

## In one minute
Business rules change: a reservation hold goes from 24h to 48h, a free-delivery threshold moves, a legal text changes. Before acting, find **everything affected** using **traceability**: epic → stories → acceptance criteria → test cases, plus pages (PRD, FAQs) and other channels (emails, store app). Then choose the right vehicle: **don't rewrite stories that are already done**. Use a **config ticket** if the value is configurable, a **new story** for behaviour or copy changes, and **update test cases**. Log the decision.

## Edit, new story or config?
| Situation | Do this |
|---|---|
| Story not started yet | Edit the story and its ACs; tell the team |
| Story done / released | **New story** referencing the old one; keep history intact |
| Value is a setting (backoffice/config) | **Config ticket** (often no development; still test it) |
| Text in emails, apps, FAQs | Story or content task per channel |
| Test cases | **Update** the affected test cases; add new ones if needed |

## Finding what's affected
1. Search the epic's stories and ACs for the rule ("24h", "24 hours", "hold")
2. Follow **"is tested by"** links to test cases
3. Check pages: PRD, FAQ, customer service scripts, release notes
4. Check other channels: confirmation emails, store app, push notifications
5. Ask: data and reporting (dashboards counting "expired" reservations)

## Communicate the change
- What changes, from when, and why
- What the team will do (tickets)
- Who else must act (store operations, customer service, legal)
- Update the decision log and the PRD

## Common mistakes
- Editing a done story, which breaks history and test evidence
- Changing the config but forgetting hard-coded copy ("24 hours" in emails)
- Forgetting test cases and store/customer-service material
- No decision log entry
