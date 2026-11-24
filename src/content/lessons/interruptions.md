# Handling interruptions mid-sprint

## In one minute
Mid-sprint requests are normal in retail: a promo banner, an urgent BU ask, a production bug. Your job is to **protect the sprint goal** while staying helpful. Clarify the request (what, why, by when, what happens if we don't), **check the size with the tech lead** (it's rarely "1 hour"), look for an alternative that needs no developers (CMS, content team, config), and if it really must come in, **swap something of equal size out**, agreed openly with stakeholders. Production bugs losing money are the exception: they come in.

## A simple decision path
1. **Clarify:** What exactly? Why now? Deadline? Cost of not doing it?
2. **Size it:** Ask the tech lead. Include QA, translations, regression and release.
3. **Alternatives:** Can the content/CMS team do it? Is there a config switch? A simpler version?
4. **Trade-off:** If it's urgent and needs the team, what comes out of the sprint? Tell the affected stakeholders.
5. **Decide and communicate:** Reply with the decision, the reason and the timing.
6. **Learn:** If this happens often, plan a buffer or a "fast lane" in the process.

## Tech debt negotiations
Tech debt is like maintenance on a store: skip it and things break at the worst moment (Black Friday). Agree a steady share (e.g. 15–20% of each sprint) with the tech lead, and prioritise debt that blocks features or creates risk before peak periods.

## A good reply to a BU (example)
> Hi Sophie, thanks. I understand the banner supports the Black Friday campaign. I checked with Priya: if it's a CMS content slot, your content team can publish it today without us. If it needs a new component for three brands, it's about 3 days including translations and QA, and the code freeze starts Thursday. Can you confirm which one you need? If it's the component, I'll swap out the PayPal express story (same size) and let the Maison Parfum team know.

## Common mistakes
- Saying yes immediately ("it's only an hour")
- Saying a flat no without exploring alternatives
- Silently squeezing work in and missing the sprint goal
- Not informing the stakeholders whose work is pushed out
