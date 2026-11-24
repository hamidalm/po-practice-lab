import { db } from './db';
import { newId } from '../lib/id';
import { assignRanks, nextRank } from '../lib/rank';
import { DEFAULT_SETTINGS, ME } from './constants';
import type { AppSettings, Issue, IssueLink, LinkType, Page, PageTemplate, Sprint } from './types';
import { PAGE_TEMPLATES } from '../features/pages/templates';

async function nextIssueKey(): Promise<string> {
  return db.transaction('rw', db.meta, async () => {
    const row = await db.meta.get('issueCounter');
    const n = (typeof row?.value === 'number' ? row.value : 100) + 1;
    await db.meta.put({ key: 'issueCounter', value: n });
    return `HB-${n}`;
  });
}

export async function createIssue(input: Partial<Issue> & Pick<Issue, 'type' | 'title'>, parentId?: string) {
  const sprintId = input.sprintId ?? null;
  const siblings = (await db.issues.toArray()).filter((i) => i.sprintId === sprintId);
  const now = Date.now();
  const issue: Issue = {
    id: newId(),
    key: await nextIssueKey(),
    description: '',
    acceptanceCriteria: [],
    priority: 'medium',
    storyPoints: null,
    status: 'todo',
    brand: 'group',
    labels: [],
    ...input,
    sprintId: input.type === 'epic' ? null : sprintId,
    rank: nextRank(siblings.map((s) => s.rank)),
    createdAt: now,
    updatedAt: now,
  };
  await db.issues.add(issue);
  if (parentId) await addLink(parentId, issue.id, 'parent');
  return issue;
}

export const updateIssue = (id: string, patch: Partial<Issue>) =>
  db.issues.update(id, { ...patch, updatedAt: Date.now() });

export async function deleteIssue(id: string) {
  await db.transaction('rw', db.issues, db.links, db.comments, async () => {
    await db.issues.delete(id);
    await db.links.where('fromId').equals(id).delete();
    await db.links.where('toId').equals(id).delete();
    await db.comments.where('issueId').equals(id).delete();
  });
}

/** Persist a new order for a container (sprint id or null for backlog). */
export async function saveOrder(containerSprintId: string | null, orderedIds: string[]) {
  const ranks = assignRanks(orderedIds);
  await db.transaction('rw', db.issues, async () => {
    for (const [id, rank] of ranks) await db.issues.update(id, { rank, sprintId: containerSprintId });
  });
}

export const addLink = (fromId: string, toId: string, type: LinkType) => {
  const link: IssueLink = { id: newId(), fromId, toId, type, createdAt: Date.now() };
  return db.links.add(link);
};
export const removeLink = (id: string) => db.links.delete(id);

export const addComment = (issueId: string, body: string) =>
  db.comments.add({ id: newId(), issueId, author: ME, body, createdAt: Date.now() });

export async function createSprint() {
  const all = await db.sprints.toArray();
  const last = all.sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
  const start = last ? addDays(last.endDate, 3) : new Date().toISOString().slice(0, 10);
  const num = all.length ? Math.max(...all.map((s) => Number(s.name.match(/\d+/)?.[0] ?? 0))) + 1 : 1;
  const sprint: Sprint = {
    id: newId(),
    name: `Sprint ${num}`,
    goal: '',
    startDate: start,
    endDate: addDays(start, 11),
    capacityPoints: last?.capacityPoints ?? 30,
    state: 'planned',
  };
  await db.sprints.add(sprint);
}
export const updateSprint = (id: string, patch: Partial<Sprint>) => db.sprints.update(id, patch);

export async function createPage(template: PageTemplate): Promise<string> {
  const now = Date.now();
  const t = PAGE_TEMPLATES[template];
  const page: Page = { id: newId(), title: t.defaultTitle, template, body: t.body, createdAt: now, updatedAt: now };
  await db.pages.add(page);
  return page.id;
}
export const updatePage = (id: string, patch: Partial<Page>) => db.pages.update(id, { ...patch, updatedAt: Date.now() });
export const deletePage = (id: string) => db.pages.delete(id);

export const setMessageRead = (id: string, read: boolean) => db.inbox.update(id, { read });

export async function getSettings(): Promise<AppSettings> {
  const row = await db.meta.get('settings');
  return { ...DEFAULT_SETTINGS, ...((row?.value as Partial<AppSettings>) ?? {}) };
}

function addDays(iso: string, days: number) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
