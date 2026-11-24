# Backlog refinement and splitting stories

## In one minute
**Refinement** turns big, vague ideas (epics) into small, clear stories the team can finish in a sprint. A good story follows **INVEST**: Independent, Negotiable, Valuable, Estimable, Small, Testable. Split **vertically**: each slice delivers something a shopper can use end to end, not "front end" and "back end" separately. Before a story enters a sprint, check it against the **Definition of Ready**: clear story, acceptance criteria, estimate, dependencies known.

## Why it matters
Big stories hide risk. A 21-point "back-in-stock alerts" story will slip; four 3–5 point stories can be released, tested and learned from one by one.

## Splitting patterns that work in eCommerce
| Pattern | Example |
|---|---|
| **Workflow steps** | Sign up for an alert → receive the alert → manage/unsubscribe |
| **Happy path first, then edge cases** | Alert for in-stock-again products → then discontinued, low stock |
| **Simple → complex rules** | One alert per product → per shade/variant |
| **Channel / brand** | Web first → app → other brands |
| **Data first** | Collect sign-ups (manual email) → automate sending |
| **Spike** | Time-boxed research when the team can't estimate |

**Avoid** splitting by technical layer ("API story", "UI story"). None of those deliver value alone.

## Estimation in short
Teams use **story points** (1, 2, 3, 5, 8, 13…) to express relative size: effort, complexity and uncertainty together. As PO you don't estimate; you **answer questions** so the team can. If a story is 13 or more, it usually needs splitting.

## Worked example
Epic: *Back-in-stock alerts (all brands)*
1. Sign up for an alert on an out-of-stock product (logged in), 3 pts
2. Sign up as a guest with email, 3 pts
3. Send the alert when stock returns, 5 pts
4. Alert per shade/variant, 3 pts
5. Unsubscribe / manage alerts, 2 pts
6. Report on sign-ups and conversions, 2 pts

## Checklist
- [ ] Each story delivers value on its own
- [ ] Each story ≤ 8 points
- [ ] Edge cases are separate stories or ACs, not forgotten
- [ ] DoR checked: story, ACs, estimate, dependencies, designs

## Common mistakes
- Splitting by layer (front end / back end)
- Writing all edge cases into one huge story
- Bringing stories without acceptance criteria into planning
- Estimating on the team's behalf
