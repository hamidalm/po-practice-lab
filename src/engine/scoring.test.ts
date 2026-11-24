import { describe, expect, it } from 'vitest';
import { evaluatePart, keypointCoverage, rubricScore, scoreChoice, scoreMatch, scoreNumber, scoreRank, scoreSelect } from './scoring';
import type { ChoicePart, Keypoint, MatchPart, NumberPart, RankPart, SelectPart, TextPart } from './types';

describe('scoreNumber', () => {
  const p: NumberPart = { id: 'n', kind: 'number', label: '', prompt: '', answer: 26, tolerance: 1, explanation: '' };
  it('accepts within tolerance, half credit when close, zero when off or empty', () => {
    expect(scoreNumber(p, '25').score).toBe(1);
    expect(scoreNumber(p, 22).score).toBe(0.5);
    expect(scoreNumber(p, 40).score).toBe(0);
    expect(scoreNumber(p, '').score).toBe(0);
  });
});

describe('scoreChoice', () => {
  const opts = ['a', 'b', 'c', 'd'].map((id) => ({ id, label: id, feedback: '' }));
  it('single choice is right or wrong', () => {
    const p: ChoicePart = { id: 'c', kind: 'choice', label: '', prompt: '', multi: false, options: opts, correct: ['c'] };
    expect(scoreChoice(p, ['c']).score).toBe(1);
    expect(scoreChoice(p, ['a']).score).toBe(0);
  });
  it('multi choice uses overlap (Jaccard)', () => {
    const p: ChoicePart = { id: 'c', kind: 'choice', label: '', prompt: '', multi: true, options: opts, correct: ['a', 'b'] };
    expect(scoreChoice(p, ['a', 'b']).score).toBe(1);
    expect(scoreChoice(p, ['a', 'c']).score).toBeCloseTo(1 / 3);
  });
});

describe('scoreRank (prioritisation)', () => {
  const p: RankPart = {
    id: 'r', kind: 'rank', label: '', prompt: '', explanation: 'x',
    items: ['legal', 'a', 'b', 'c'].map((id) => ({ id, label: id })),
    expectedOrder: ['legal', 'a', 'b', 'c'], mustTop: ['legal'],
  };
  it('full score for the expected order', () => {
    expect(scoreRank(p, ['legal', 'a', 'b', 'c']).score).toBe(1);
  });
  it('penalises distance from the expected order', () => {
    const s = scoreRank(p, ['legal', 'c', 'b', 'a']).score;
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
  it('halves the score when a must-do is not on top', () => {
    const r = scoreRank(p, ['a', 'legal', 'b', 'c']);
    expect(r.score).toBeLessThanOrEqual(0.5);
    expect(r.findings[0].level).toBe('error');
  });
});

describe('scoreSelect (sprint planning)', () => {
  const p: SelectPart = {
    id: 's', kind: 'select', label: '', prompt: '', capacity: 20,
    items: [
      { id: 'bug', label: 'bug', points: 3 }, { id: 'legal', label: 'legal', points: 5 },
      { id: 'big', label: 'big', points: 8 }, { id: 'small', label: 'small', points: 3 }, { id: 'unready', label: 'unready', points: 5 },
    ],
    mustInclude: [{ id: 'bug', reason: '' }, { id: 'legal', reason: '' }],
    mustExclude: [{ id: 'unready', reason: '' }],
  };
  it('full score: must-dos in, unready out, capacity well used', () => {
    expect(scoreSelect(p, ['bug', 'legal', 'big', 'small']).score).toBe(1);
  });
  it('penalises missing must-dos, unready items and over-commitment', () => {
    expect(scoreSelect(p, ['legal', 'big', 'small']).score).toBeLessThan(1);
    expect(scoreSelect(p, ['bug', 'legal', 'big', 'unready']).score).toBeLessThan(1);
    const over = scoreSelect(p, ['bug', 'legal', 'big', 'small', 'unready']);
    expect(over.total).toBe(24);
    expect(over.findings.some((f) => /capacity of 20/.test(f.text))).toBe(true);
  });
  it('zero when nothing is selected', () => {
    expect(scoreSelect(p, []).score).toBe(0);
  });
});

describe('scoreMatch', () => {
  const p: MatchPart = {
    id: 'm', kind: 'match', label: '', prompt: '', explanations: {},
    rows: [{ id: 'q1', label: 'q1' }, { id: 'q2', label: 'q2' }],
    options: [{ id: 'x', label: 'x' }, { id: 'y', label: 'y' }],
    answers: { q1: 'x', q2: 'y' },
  };
  it('scores the share of correct rows', () => {
    expect(scoreMatch(p, { q1: 'x', q2: 'y' }).score).toBe(1);
    expect(scoreMatch(p, { q1: 'x', q2: 'x' }).score).toBe(0.5);
    expect(scoreMatch(p, undefined).score).toBe(0);
  });
});

describe('keypoints and text parts', () => {
  const kps: Keypoint[] = [
    { id: 'k1', label: 'margin', part: 't', anyOf: ['margin', 'discount cost'] },
    { id: 'k2', label: 'speed', part: 't', anyOf: ['page speed', 'load time'] },
  ];
  it('detects coverage case-insensitively', () => {
    const c = keypointCoverage('Guardrail: MARGIN must not drop', kps);
    expect(c.covered.map((k) => k.id)).toEqual(['k1']);
    expect(c.ratio).toBe(0.5);
  });
  it('combines coverage and format into a part score', () => {
    const part: TextPart = { id: 't', kind: 'text', label: '', prompt: '' };
    expect(evaluatePart(part, { t: '' }, kps).score).toBe(0);
    expect(evaluatePart(part, { t: 'margin and page speed' }, kps).score).toBe(1);
    expect(evaluatePart(part, { t: 'margin only' }, kps).score).toBeCloseTo(0.7);
  });
});

describe('rubricScore', () => {
  const rubric = [
    { id: 'a', criterion: '', weight: 60, full: '', partial: '' },
    { id: 'b', criterion: '', weight: 40, full: '', partial: '' },
  ];
  it('weights levels 0/1/2', () => {
    expect(rubricScore(rubric, { a: 2, b: 2 })).toBe(100);
    expect(rubricScore(rubric, { a: 2, b: 0 })).toBe(60);
    expect(rubricScore(rubric, { a: 1, b: 1 })).toBe(50);
    expect(rubricScore(rubric, {})).toBe(0);
  });
});
