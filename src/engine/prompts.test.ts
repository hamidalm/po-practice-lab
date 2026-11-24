import { describe, expect, it } from 'vitest';
import { SCENARIOS, getScenario } from '../content';
import { buildHintPrompt, buildLessonPrompt, buildPartPrompt, buildReviewPrompt, parseClaudeScores, scoreTemplate } from './prompts';

const s = getScenario('A2-plan-sprint-25')!;
const answers = { capacity: '26', items: ['carry', 'bug'], goal: 'Shoppers can reserve an item.' };

describe('prompts', () => {
  it('review prompt contains the exercise, my answer, rubric ids, reference and score template', () => {
    const p = buildReviewPrompt(s, answers);
    expect(p).toContain(s.title);
    expect(p).toContain('Team availability');
    expect(p).toContain('| Ana | NL |');
    expect(p).toContain('Shoppers can reserve an item.');
    for (const c of s.rubric) expect(p).toContain(`[${c.id}]`);
    expect(p).toContain('Reference answer');
    expect(p).toContain(scoreTemplate(s));
  });
  it('part prompt only includes that part', () => {
    const p = buildPartPrompt(s, s.parts[2], answers);
    expect(p).toContain('Sprint goal');
    expect(p).not.toContain('Capacity in story points');
    expect(p).not.toContain('Reference answer');
  });
  it('hint prompt asks not to give the answer and never includes the model answer', () => {
    const p = buildHintPrompt(s, answers);
    expect(p).toContain('Do NOT give me the answer');
    expect(p).not.toContain(s.modelAnswer.slice(0, 40));
  });
  it('lesson prompt includes the concept card', () => {
    expect(buildLessonPrompt('Topic', 'Card text')).toContain('Card text');
  });
  it('every scenario builds a review prompt', () => {
    for (const sc of SCENARIOS) expect(buildReviewPrompt(sc, {}).length).toBeGreaterThan(500);
  });
});

describe('parseClaudeScores', () => {
  const ids = s.rubric.map((c) => c.id);
  const block = (scores: Record<string, unknown>, scenario = s.id) =>
    'Great work...\n\n```po-lab-score\n' + JSON.stringify({ scenario, scores }) + '\n```\n';

  it('reads a tagged block from a full reply', () => {
    const r = parseClaudeScores(block(Object.fromEntries(ids.map((id) => [id, 2]))), s);
    expect(Object.values(r.scores)).toEqual(ids.map(() => 2));
    expect(r.missing).toEqual([]);
  });
  it('reads bare JSON without the fence and clamps values', () => {
    const r = parseClaudeScores(`{"scenario":"${s.id}","scores":{"cap":5,"must":-1,"ready":1.4}}`, s);
    expect(r.scores).toEqual({ cap: 2, must: 0, ready: 1 });
    expect(r.missing.length).toBe(ids.length - 3);
  });
  it('rejects other tasks, broken JSON and missing blocks', () => {
    expect(() => parseClaudeScores(block({ cap: 1 }, 'B1-we-need-a-popup'), s)).toThrow(/another task/);
    expect(() => parseClaudeScores('```po-lab-score\n{"scores": {cap:1}}\n```', s)).toThrow(/not valid JSON/);
    expect(() => parseClaudeScores('Nice answer!', s)).toThrow(/No score block/);
    expect(() => parseClaudeScores(block({ unknown: 2 }), s)).toThrow(/None of the rubric/);
  });
});
