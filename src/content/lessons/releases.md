# Releases: regression, go/no-go and rollback

## In one minute
Before a release, QA runs a **regression test**: checking that existing features still work. As PO you join the **go/no-go** decision. Classify every open defect by **impact** (money, legal, customer trust, number of shoppers) and **workaround**. Typical outcomes: **Go**, **No-go**, or **Go with conditions** (fix the blocker first, switch off a feature with a feature flag, accept cosmetic issues). Always have a **rollback plan**: how to return to the last good version, who decides, and when.

## Classifying defects
| Class | Examples | Decision |
|---|---|---|
| **Blocker** | Wrong prices, discounts that leak money, checkout broken, legal breach | Fix before release or no-go |
| **Mitigate** | A new feature broken for a small segment, and it can be switched off | Release with the feature flag off for that segment |
| **Accept** | Typo, minor layout issue | Release, fix in the next sprint |

## Code freeze
Large retailers stop releases before peak periods (e.g. a **Black Friday freeze**). Anything not released before the freeze waits weeks. This raises the pressure, but it also raises the risk of a bad release, so be stricter, not looser.

## Rollback decision
- **Trigger:** e.g. conversion drops >10% for 30 minutes, error rate above threshold, payment failures
- **Who decides:** PO + tech lead (+ on-call)
- **How:** redeploy the previous version or switch off feature flags
- **Communicate:** BU, customer service, stores if affected

## Go/no-go note (structure)
1. Decision and conditions
2. Defects and how each is handled
3. Risks that remain
4. Rollback plan and monitoring
5. Who was involved

## Common mistakes
- Treating all defects the same
- Shipping a money-losing bug "because the freeze is coming"
- Forgetting that feature flags can switch off new features without a rollback
- No monitoring or rollback trigger defined
