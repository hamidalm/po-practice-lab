import { describe, expect, it } from 'vitest';
import { findWords, lintStory, lintText, overlap } from './checks';
import type { StoryDraft, TextPart } from './types';

const ac = (given: string, when: string, then: string) => ({ id: given, given, when, then });
const story = (p: Partial<StoryDraft> = {}): StoryDraft => ({
  id: 's', title: 'Alert sign-up', asA: 'shopper viewing an out-of-stock shade', iWant: 'to be told when it is back',
  soThat: 'I can buy it before it sells out again', points: 3,
  acs: [ac('the shade is out of stock', 'I enter my email', 'I see a confirmation'), ac('I already signed up', 'I sign up again', 'I am not subscribed twice')],
  ...p,
});
const rules = { minAcPerStory: 2, requireEstimate: true };
const levels = (f: { level: string }[]) => f.map((x) => x.level);

describe('findWords', () => {
  it('matches whole words only', () => {
    expect(findWords('make it easy', ['easy'])).toEqual(['easy']);
    expect(findWords('uneasy feeling', ['easy'])).toEqual([]);
    expect(findWords('user-friendly page', ['user-friendly'])).toEqual(['user-friendly']);
  });
});

describe('lintStory', () => {
  it('passes a well-formed story with an unhappy path', () => {
    const f = lintStory(story(), rules);
    expect(levels(f)).not.toContain('error');
    expect(levels(f)).not.toContain('warn');
  });
  it('flags empty parts, generic role and UI in the need', () => {
    const f = lintStory(story({ asA: 'user', iWant: 'a pop-up button', soThat: '' }), rules);
    const t = f.map((x) => x.text).join(' ');
    expect(t).toMatch(/generic/);
    expect(t).toMatch(/names UI/);
    expect(t).toMatch(/"So that…" is empty/);
  });
  it('flags "so that" restating "I want"', () => {
    const f = lintStory(story({ iWant: 'to receive back in stock alerts', soThat: 'I receive back in stock alerts' }), rules);
    expect(f.some((x) => /repeats/.test(x.text))).toBe(true);
  });
  it('flags missing G/W/T, compound When, vague Then, happy-path only and big stories', () => {
    const f = lintStory(story({
      points: 13,
      acs: [ac('', 'I click and confirm', 'it works properly'), ac('the item is in stock', 'I sign up', 'I see a message')],
    }), rules);
    const t = f.map((x) => x.text).join(' | ');
    expect(t).toMatch(/AC 1: fill in Given/);
    expect(t).toMatch(/contains "and"/);
    expect(t).toMatch(/not testable/);
    expect(t).toMatch(/Only happy paths/);
    expect(t).toMatch(/13 points/);
  });
  it('requires a minimum number of criteria', () => {
    expect(lintStory(story({ acs: [] }), rules).some((x) => x.level === 'error' && /Add at least 2/.test(x.text))).toBe(true);
  });
});

describe('lintText', () => {
  const metric: TextPart = { id: 'm', kind: 'text', label: 'Metric', prompt: '', checks: ['metric'] };
  it('requires numbers and a timeframe for metrics', () => {
    expect(levels(lintText(metric, 'More newsletter sign-ups'))).toContain('error');
    expect(lintText(metric, 'Sign-up rate from 1.2% to 1.8%').some((f) => /timeframe/.test(f.text))).toBe(true);
    expect(levels(lintText(metric, 'Sign-up rate from 1.2% to 1.8% within 8 weeks'))).toEqual(['ok']);
  });
  it('counts questions and flags empty answers', () => {
    const q: TextPart = { id: 'q', kind: 'text', label: 'Q', prompt: '', checks: ['questions'] };
    expect(levels(lintText(q, 'Why? Who? When?'))).toEqual(['ok']);
    expect(levels(lintText(q, ''))).toEqual(['error']);
  });
});

describe('overlap', () => {
  it('measures shared meaningful words', () => {
    expect(overlap('receive stock alerts', 'receive stock alerts now')).toBe(1);
    expect(overlap('find stores nearby', 'collect today')).toBe(0);
  });
});
