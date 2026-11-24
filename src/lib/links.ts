import type { Issue, IssueLink, LinkType } from '../db/types';

export type Direction = 'out' | 'in';

export const LINK_LABELS: Record<LinkType, { out: string; in: string }> = {
  parent: { out: 'is parent of', in: 'is child of' },
  tests: { out: 'tests', in: 'is tested by' },
  blocks: { out: 'blocks', in: 'is blocked by' },
  relates: { out: 'relates to', in: 'relates to' },
};

/** Relation options shown in the "add link" picker, from the point of view of the current issue. */
export const RELATION_OPTIONS: { value: string; type: LinkType; dir: Direction; label: string }[] = [
  { value: 'parent:in', type: 'parent', dir: 'in', label: 'is child of (epic)' },
  { value: 'parent:out', type: 'parent', dir: 'out', label: 'is parent of' },
  { value: 'tests:out', type: 'tests', dir: 'out', label: 'tests' },
  { value: 'tests:in', type: 'tests', dir: 'in', label: 'is tested by' },
  { value: 'blocks:out', type: 'blocks', dir: 'out', label: 'blocks' },
  { value: 'blocks:in', type: 'blocks', dir: 'in', label: 'is blocked by' },
  { value: 'relates:out', type: 'relates', dir: 'out', label: 'relates to' },
];

const CHILD_TYPES = new Set(['story', 'task', 'bug']);
const TESTABLE_TYPES = new Set(['story', 'bug']);

/** Returns an error message, or null when the link is allowed. */
export function validateLink(from: Issue, to: Issue, type: LinkType, existing: readonly IssueLink[]): string | null {
  if (from.id === to.id) return 'An issue cannot link to itself.';
  const dup = existing.some(
    (l) =>
      l.type === type &&
      ((l.fromId === from.id && l.toId === to.id) || (l.fromId === to.id && l.toId === from.id)),
  );
  if (dup) return `${from.key} and ${to.key} are already linked this way.`;

  if (type === 'parent') {
    if (from.type !== 'epic') return 'Only an epic can be a parent.';
    if (!CHILD_TYPES.has(to.type)) return 'An epic can only contain stories, tasks and bugs.';
    const hasParent = existing.some((l) => l.type === 'parent' && l.toId === to.id);
    if (hasParent) return `${to.key} already belongs to an epic. Remove that link first.`;
  }
  if (type === 'tests') {
    if (from.type !== 'test') return 'Only a test case can test another issue.';
    if (!TESTABLE_TYPES.has(to.type)) return 'Test cases link to stories or bugs.';
  }
  return null;
}

/** Turn a relation picked in the UI into a directional link. */
export function resolveRelation(current: Issue, other: Issue, dir: Direction): { from: Issue; to: Issue } {
  return dir === 'out' ? { from: current, to: other } : { from: other, to: current };
}

export function parentEpicId(issueId: string, links: readonly IssueLink[]): string | undefined {
  return links.find((l) => l.type === 'parent' && l.toId === issueId)?.fromId;
}

export interface TraceNode {
  issue: Issue;
  tests: Issue[];
}

/** Epic -> children -> test cases, for the traceability view. */
export function buildTrace(epicId: string, issues: readonly Issue[], links: readonly IssueLink[]): TraceNode[] {
  const byId = new Map(issues.map((i) => [i.id, i]));
  return links
    .filter((l) => l.type === 'parent' && l.fromId === epicId)
    .map((l) => byId.get(l.toId))
    .filter((i): i is Issue => !!i)
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))
    .map((issue) => ({
      issue,
      tests: links
        .filter((l) => l.type === 'tests' && l.toId === issue.id)
        .map((l) => byId.get(l.fromId))
        .filter((i): i is Issue => !!i),
    }));
}
