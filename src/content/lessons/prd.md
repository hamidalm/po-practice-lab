# Writing a one-page PRD

## In one minute
A **PRD** (product requirements document) aligns everyone on *why* and *what* before the team builds. Keep it to **one page**: problem, goal, success metric and guardrails, users, in scope, **out of scope**, requirements (functional and non-functional), risks and dependencies, and rollout. It's a living document in your wiki: link the epic, update it when decisions change, and log decisions in the decision log.

## Sections and what good looks like
| Section | Good looks like |
|---|---|
| **Problem** | Who, what, evidence, impact (numbers) |
| **Goal** | The change you want, in one sentence |
| **Metric + guardrails** | Baseline → target → timeframe; 2–3 guardrails |
| **Users** | Specific segments (brand, device, logged-in/guest) |
| **In scope** | What this release includes |
| **Out of scope** | What it deliberately doesn't. This prevents scope creep |
| **Functional requirements** | Numbered, testable behaviours |
| **Non-functional** | Performance, accessibility, tracking, security/GDPR, localisation |
| **Risks** | Risk, impact, mitigation |
| **Rollout** | Brands/markets order, feature flag, A/B test, dates, comms |

## Retail-specific non-functional requirements to remember
- **Performance:** no extra page weight on mobile; LCP stays under 2.5s
- **Localisation:** currency (€/£), language (EN/NL/FR), thresholds per brand
- **Accessibility:** WCAG 2.1 AA (contrast, screen readers)
- **Tracking:** events for the success metric
- **Multi-brand:** configurable per brand, not hard-coded

## Worked mini-example: free-delivery progress message
- **Problem:** 41% of Drogisterij Prijs baskets are within €5 of the free-delivery threshold, and shoppers don't know.
- **Goal:** more shoppers reach free delivery by adding an item.
- **Metric:** share of orders above the threshold from 46% to 52% in 6 weeks. **Guardrails:** conversion, margin per order.
- **Out of scope:** product recommendations in the message; app.

## Common mistakes
- Ten pages nobody reads
- No out-of-scope section
- Requirements that describe UI pixels instead of behaviour
- Forgetting multi-brand configuration and currencies
