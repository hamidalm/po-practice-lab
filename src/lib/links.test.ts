import { describe, expect, it } from 'vitest';
import { buildTrace, parentEpicId, resolveRelation, validateLink } from './links';
import type { Issue, IssueLink, IssueType } from '../db/types';

let n = 0;
const issue = (type: IssueType, id = `i${++n}`): Issue => ({
  id, key: `HB-${n}`, type, title: id, description: '', acceptanceCriteria: [], priority: 'medium', storyPoints: null,
  status: 'todo', brand: 'group', sprintId: null, rank: 0, labels: [], createdAt: 0, updatedAt: 0,
});
const link = (from: Issue, to: Issue, type: IssueLink['type']): IssueLink => ({ id: `${from.id}-${to.id}-${type}`, fromId: from.id, toId: to.id, type, createdAt: 0 });

describe('validateLink', () => {
  const epic = issue('epic');
  const epic2 = issue('epic');
  const story = issue('story');
  const test = issue('test');
  const task = issue('task');

  it('allows epic > story and test > story', () => {
    expect(validateLink(epic, story, 'parent', [])).toBeNull();
    expect(validateLink(test, story, 'tests', [])).toBeNull();
  });
  it('rejects self links and duplicates in either direction', () => {
    expect(validateLink(story, story, 'relates', [])).toMatch(/itself/);
    expect(validateLink(task, story, 'relates', [link(story, task, 'relates')])).toMatch(/already linked/);
  });
  it('only epics can be parents, and only of stories/tasks/bugs', () => {
    expect(validateLink(story, task, 'parent', [])).toMatch(/Only an epic/);
    expect(validateLink(epic, epic2, 'parent', [])).toMatch(/only contain/);
    expect(validateLink(epic, test, 'parent', [])).toMatch(/only contain/);
  });
  it('an issue can belong to only one epic', () => {
    expect(validateLink(epic2, story, 'parent', [link(epic, story, 'parent')])).toMatch(/already belongs/);
  });
  it('only test cases test, and only stories or bugs', () => {
    expect(validateLink(story, task, 'tests', [])).toMatch(/Only a test case/);
    expect(validateLink(test, task, 'tests', [])).toMatch(/stories or bugs/);
  });
});

describe('resolveRelation', () => {
  it('maps "is child of" to epic -> current', () => {
    const s = issue('story');
    const e = issue('epic');
    const { from, to } = resolveRelation(s, e, 'in');
    expect(from).toBe(e);
    expect(to).toBe(s);
  });
});

describe('traceability', () => {
  it('builds epic -> stories -> tests and finds the parent', () => {
    const e = issue('epic', 'E');
    const s1 = issue('story', 'S1');
    const s2 = issue('story', 'S2');
    const t1 = issue('test', 'T1');
    const links = [link(e, s1, 'parent'), link(e, s2, 'parent'), link(t1, s1, 'tests')];
    const trace = buildTrace('E', [e, s1, s2, t1], links);
    expect(trace.map((x) => x.issue.id)).toEqual(['S1', 'S2']);
    expect(trace[0].tests.map((t) => t.id)).toEqual(['T1']);
    expect(trace[1].tests).toEqual([]);
    expect(parentEpicId('S2', links)).toBe('E');
    expect(parentEpicId('E', links)).toBeUndefined();
  });
});
