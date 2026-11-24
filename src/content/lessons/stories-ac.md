# User stories and acceptance criteria

## In one minute
A **user story** describes a need from the user's point of view: **As a** [specific user], **I want** [need], **so that** [benefit]. It's a promise of a conversation, not a full specification. **Acceptance criteria (ACs)** make it testable. Write them in **Given / When / Then**: *Given* a starting situation, *When* one action happens, *Then* an observable result. Cover the **happy path** and the **unhappy paths and edge cases**: out of stock, logged out, invalid input, duplicates, expiry.

## A good story
- **Specific user:** "a guest shopper on mobile", not "a user"
- **Need, not UI:** "to know when it's back in stock", not "a notify-me button"
- **Real benefit:** "so that I can buy it before it sells out again", not a repeat of the need

## Good acceptance criteria
- One **When** per criterion (one action)
- **Then** is observable: what the shopper or system shows/does
- No vague words: *fast, easy, user-friendly, properly*
- Include numbers and rules: *within 15 minutes*, *max 1 alert per product*

## Edge-case prompts for eCommerce
- Logged in vs **guest**
- Product **out of stock / discontinued / low stock**
- **Variants** (shade, size)
- **Duplicates** (signing up twice)
- **Expiry and time limits**
- **Multi-brand / currency / language**
- **Consent** (marketing vs service emails)
- **Errors** (email invalid, service down)

## Worked example
**Story:** As a shopper looking at an out-of-stock shade, I want to be told when it's back, so that I can buy it before it sells out again.

- **AC1:** Given the selected shade is out of stock, when I submit a valid email, then I see "We'll email you when it's back" and an alert is stored for that shade.
- **AC2:** Given I already have an alert for this shade, when I sign up again, then no duplicate is created and I see "You're already on the list".
- **AC3:** Given the product is discontinued, when I view it, then no sign-up is offered.
- **AC4:** Given I enter an invalid email, when I submit, then I see an inline error and no alert is stored.

## Common mistakes
- "As a user…" with no real persona
- Designing the UI inside the story
- Only happy paths
- Compound "When … and …" criteria
- Untestable "Then it works properly"
