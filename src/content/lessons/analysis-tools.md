# Choosing the right analysis tool

## In one minute
Different questions need different tools. Use a **journey map** for the customer's experience across steps and channels, a **process map** for internal steps and roles (e.g. what store staff do), a **use case** for a user–system interaction with alternative flows, a **state model** for something that changes status over time (an order, a reservation), a **decision table** for combinations of rules (promotions), a **field list** for data on forms and interfaces, and a **wireframe** for layout and placement on screen.

## Quick guide
| Question sounds like… | Tool |
|---|---|
| "Where do shoppers get frustrated, from ad to delivery?" | **Journey map** |
| "What does each team or person do, in which order?" | **Process map** (swimlanes) |
| "How does the shopper interact with the system, including alternatives?" | **Use case** |
| "What statuses can it have, and what moves it between them?" | **State model** |
| "Which rule wins when several conditions combine?" | **Decision table** |
| "Which data, mandatory or not, validated how?" | **Field list** |
| "Where does it go on the page, and how does it look on mobile?" | **Wireframe** |

## Mini examples
**State model:** reservation: *Requested → Reserved → Ready for pickup → Collected*; also *Reserved → Expired* (after the hold time) and *→ Cancelled*.

**Decision table:** promotions

| Loyalty voucher | 3-for-2 | Staff discount | Applied |
|---|---|---|---|
| Yes | No | No | Voucher |
| Yes | Yes | No | 3-for-2, then voucher on remaining |
| Any | Any | Yes | Staff discount only |

**Field list:** seller onboarding

| Field | Mandatory | Validation |
|---|---|---|
| Company name | Yes | 2–100 chars |
| VAT number | Yes | Country format check |
| IBAN | Yes | IBAN checksum |

## Common mistakes
- Using a process map for status changes (use a state model)
- Writing complex promo rules as prose instead of a decision table
- Jumping to wireframes before the problem and flow are clear
