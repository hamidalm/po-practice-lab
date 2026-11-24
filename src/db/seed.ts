import { db, TABLES } from './db';
import { newId } from '../lib/id';
import { DEFAULT_SETTINGS } from './constants';
import type { AcceptanceCriterion, Comment, InboxMessage, Issue, IssueLink, Page, Sprint } from './types';

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const ac = (given: string, when: string, then: string): AcceptanceCriterion => ({ id: newId(), given, when, then });

/** Builds a fresh demo workspace for HB Retail Group. Dates are relative to "now". */
export function buildSeed(now = Date.now()) {
  const s24: Sprint = {
    id: newId(),
    name: 'Sprint 24',
    goal: 'Shoppers on Chemist & Co can see store stock and reserve an item; Apple Pay ready for review.',
    startDate: iso(now - 8 * DAY),
    endDate: iso(now + 3 * DAY),
    capacityPoints: 32,
    state: 'active',
  };
  const s25: Sprint = {
    id: newId(),
    name: 'Sprint 25',
    goal: '',
    startDate: iso(now + 6 * DAY),
    endDate: iso(now + 17 * DAY),
    capacityPoints: 28,
    state: 'planned',
  };

  let n = 100;
  let rankCounter = 0;
  const mk = (p: Partial<Issue> & Pick<Issue, 'type' | 'title'>): Issue => ({
    id: newId(),
    key: `HB-${++n}`,
    description: '',
    acceptanceCriteria: [],
    priority: 'medium',
    storyPoints: null,
    status: 'todo',
    brand: 'group',
    sprintId: null,
    rank: ++rankCounter * 1000,
    labels: [],
    createdAt: now - (30 - n + 100) * DAY,
    updatedAt: now - DAY,
    ...p,
  });

  const e1 = mk({ type: 'epic', title: 'Reserve & Collect for Chemist & Co', brand: 'cc', priority: 'high',
    description: 'Let shoppers reserve in-stock products online and pick them up in a store, as part of the O+O strategy. Pilot on Chemist & Co (UK).' });
  const e2 = mk({ type: 'epic', title: 'Wallets at checkout: Apple Pay and PayPal', brand: 'group', priority: 'high',
    description: 'Add express wallets to checkout on all brands to reduce checkout drop-off on mobile.' });
  const e3 = mk({ type: 'epic', title: 'Zero-result search recovery', brand: 'dp',
    description: 'Reduce searches that return no results on Drogisterij Prijs.' });

  const s104 = mk({ type: 'story', title: 'See which nearby stores have the product in stock', brand: 'cc', priority: 'high',
    storyPoints: 5, status: 'inprogress', sprintId: s24.id, labels: ['reserve-collect'],
    description: 'As a shopper, I want to see which stores near me have the product in stock, so that I can decide where to pick it up.',
    acceptanceCriteria: [
      ac('I am on a product page and have shared my postcode', 'I open "Check store stock"', 'I see up to 5 stores sorted by distance with In stock / Low stock / Out of stock'),
      ac('no store within 25 miles has stock', 'I open "Check store stock"', 'I see a message and the option to order for home delivery'),
    ] });
  const s105 = mk({ type: 'story', title: 'Reserve an item for pickup (24h hold)', brand: 'cc', priority: 'high',
    storyPoints: 8, status: 'todo', sprintId: s24.id, labels: ['reserve-collect'],
    description: 'As a shopper, I want to reserve an in-stock item at a store, so that it is kept for me until I pick it up.',
    acceptanceCriteria: [
      ac('a store shows In stock', 'I tap Reserve and confirm my details', 'the item is held for 24 hours and I see a reservation number'),
    ] });
  const s106 = mk({ type: 'story', title: 'Reservation confirmation email', brand: 'cc', storyPoints: 3, labels: ['reserve-collect'],
    description: 'As a shopper, I want an email with my reservation details, so that I know where and when to collect.' });
  const t107 = mk({ type: 'test', title: 'TC: reservation expires when the hold period ends', brand: 'cc',
    description: 'Steps: create a reservation, move the clock past the hold period. Expected: status "Expired", stock released, email sent.' });
  const s108 = mk({ type: 'story', title: 'Pay with Apple Pay on mobile Safari', brand: 'group', priority: 'high',
    storyPoints: 5, status: 'inreview', sprintId: s24.id,
    description: 'As a mobile shopper, I want to pay with Apple Pay, so that I can check out without typing card details.' });
  const s109 = mk({ type: 'story', title: 'PayPal express from the basket', brand: 'group', storyPoints: 8,
    description: 'As a shopper, I want to pay with PayPal directly from the basket, so that I skip the address and payment steps.' });
  const b110 = mk({ type: 'bug', title: 'PayPal button missing on Maison Parfum checkout for guest users', brand: 'mp',
    priority: 'high', storyPoints: 3, status: 'todo', sprintId: s24.id,
    description: 'Guest checkout on Maison Parfum (all browsers) does not render the PayPal button. Logged-in users are fine. About 18% of MP orders are guest orders.' });
  const s111 = mk({ type: 'story', title: 'Show popular alternatives when search returns no results', brand: 'dp', storyPoints: 5,
    description: 'As a shopper, I want suggestions when my search finds nothing, so that I can still find a product.' });
  const t112 = mk({ type: 'task', title: 'Add analytics event for zero-result searches', brand: 'dp', storyPoints: 2 });
  const b113 = mk({ type: 'bug', title: 'Free-delivery message shows £ instead of € on Drogisterij Prijs basket', brand: 'dp',
    priority: 'highest', storyPoints: 2, status: 'done', sprintId: s24.id });
  const t114 = mk({ type: 'task', title: 'Apply SAP Commerce quarterly patch (tech debt)', brand: 'group', storyPoints: 3,
    status: 'todo', sprintId: s24.id, labels: ['tech-debt'],
    description: 'Security and performance fixes. Tech lead wants it done before the Black Friday code freeze.' });
  const s115 = mk({ type: 'story', title: 'Back-in-stock alert sign-up on product page', brand: 'group',
    description: 'BU wants customers to sign up for an email when an out-of-stock product is back.' });
  const t116 = mk({ type: 'test', title: 'TC: store list is sorted by distance', brand: 'cc',
    description: 'Steps: enter postcode, open store stock. Expected: nearest store first, max 5 results.' });

  const issues = [e1, e2, e3, s104, s105, s106, t107, s108, s109, b110, s111, t112, b113, t114, s115, t116];
  // re-rank per container so the seed starts in a sensible order
  for (const container of [s24.id, null]) {
    issues.filter((i) => i.sprintId === container && i.type !== 'epic').forEach((i, idx) => (i.rank = (idx + 1) * 1000));
  }

  const L = (from: Issue, to: Issue, type: IssueLink['type']): IssueLink => ({ id: newId(), fromId: from.id, toId: to.id, type, createdAt: now });
  const links: IssueLink[] = [
    L(e1, s104, 'parent'), L(e1, s105, 'parent'), L(e1, s106, 'parent'),
    L(e2, s108, 'parent'), L(e2, s109, 'parent'), L(e2, b110, 'parent'),
    L(e3, s111, 'parent'), L(e3, t112, 'parent'),
    L(t107, s105, 'tests'), L(t116, s104, 'tests'),
    L(s104, s105, 'blocks'),
  ];

  const comments: Comment[] = [
    { id: newId(), issueId: s104.id, author: 'Priya Shah (Tech lead)', createdAt: now - 2 * DAY,
      body: 'Store stock feed refreshes every 15 minutes, so "In stock" can be wrong for fast sellers. Should we show "Low stock" below 3 units?' },
    { id: newId(), issueId: b110.id, author: 'Tom Becker (QA)', createdAt: now - DAY,
      body: 'Reproduced on Chrome and Safari. Looks like the guest checkout template on MP was not updated in the last release.' },
  ];

  const pages: Page[] = [
    { id: newId(), template: 'prd', title: 'PRD: Reserve & Collect (Chemist & Co pilot)', createdAt: now - 10 * DAY, updatedAt: now - 3 * DAY,
      body: `| | |
|---|---|
| **Owner** | You (PO) |
| **Brands / markets** | Chemist & Co, UK |
| **Status** | Draft |
| **Epic** | HB-101 |

## Problem
Shoppers who want a product today leave the site to check store stock by phone or go to a store that has none. Store visits from online are not measured.

## Goal
Let shoppers reserve an in-stock item online and collect it in store the same day.

## Success metric and guardrails
- **Primary metric:** _to be defined_
- **Guardrails:** _to be defined_

## In scope
- Store stock check on the product page
- Reservation with a 24h hold

## Out of scope
- Payment online (pay in store)
`},
    { id: newId(), template: 'decision-log', title: 'Decision log: Digital team', createdAt: now - 20 * DAY, updatedAt: now - 5 * DAY,
      body: `| Date | Decision | Options considered | Why | Decided by | Revisit when |
|---|---|---|---|---|---|
| ${iso(now - 20 * DAY)} | Pilot Reserve & Collect on Chemist & Co only | All brands at once; CC only | CC has the best store stock data | PO + BU CC | After 6 weeks of pilot data |
| ${iso(now - 5 * DAY)} | Apple Pay before PayPal express | PayPal first; Apple Pay first | 64% of mobile traffic is iOS | PO + Tech lead | If PayPal usage > 30% |
`},
    { id: newId(), template: 'meeting-notes', title: 'Meeting notes: Sprint 24 planning', createdAt: now - 8 * DAY, updatedAt: now - 8 * DAY,
      body: `**Date:** ${iso(now - 8 * DAY)}
**Attendees:** PO, Priya (Tech lead), Tom (QA), 4 developers

## Notes
- Capacity 32 points (one developer on holiday for 3 days)
- HB-113 currency bug pulled in as top priority: wrong currency on checkout is a legal and trust issue

## Decisions
- Sprint goal agreed (see sprint)

## Action items
- [ ] PO – define success metric for Reserve & Collect – end of sprint
`},
  ];

  const msg = (fromName: string, fromRole: string, subject: string, body: string, hoursAgo: number, read = false): InboxMessage => ({
    id: newId(), fromName, fromRole, subject, body, receivedAt: now - hoursAgo * 3_600_000, read, linkedScenarioId: null,
  });
  const inbox: InboxMessage[] = [
    msg('Sophie Martens', 'BU eCommerce Manager, Drogisterij Prijs', 'We need a pop-up!',
      `Hi,\n\nOur competitor shows a pop-up with a discount code when people want to leave the site. We need the same before the December campaign. Can you add it to the next sprint? Should be easy.\n\nThanks,\nSophie`, 2),
    msg('Tom Becker', 'QA Analyst', 'Regression: PayPal button missing for guests (MP)',
      `Hi,\n\nI logged HB-110. Guest checkout on Maison Parfum has no PayPal button since Tuesday's release. Guest orders are roughly 18% of MP orders. Do you want this in the current sprint?\n\nTom`, 5),
    msg('Lena Vos', 'Data Analyst', 'Zero-result search numbers (DP)',
      `Hi,\n\nLast 30 days on Drogisterij Prijs: 412,000 searches, 9.8% returned zero results. Top zero-result terms: "zonnebrand spf 50 kind", "retinol serum", "tandpasta zonder fluoride". Searchers who get zero results convert at 0.9% vs 4.1% overall.\n\nLena`, 26, true),
    msg('Marc Dubois', 'Legal Counsel', 'Consent banner update required',
      `Hello,\n\nFollowing new regulator guidance, the "Reject all" button on the cookie consent banner must be as visible as "Accept all" on all EU brand sites. We need this live within 6 weeks.\n\nMarc`, 30),
  ];

  return {
    issues,
    links,
    comments,
    sprints: [s24, s25],
    pages,
    inbox,
    meta: [
      { key: 'issueCounter', value: n },
      { key: 'settings', value: DEFAULT_SETTINGS },
      { key: 'seeded', value: true },
    ],
  };
}

export async function resetWorkspace() {
  const seed = buildSeed();
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear();
      await db.table(t).bulkAdd(seed[t]);
    }
  });
}

export async function ensureSeeded() {
  const seeded = await db.meta.get('seeded');
  if (!seeded) await resetWorkspace();
}
