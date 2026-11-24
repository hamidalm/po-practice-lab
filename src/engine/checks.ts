import type { Finding, StoriesPart, StoryDraft, TextPart } from './types';

/** Words that cannot be tested. Flagged in stories, acceptance criteria and checked text. */
export const VAGUE_WORDS = [
  'easy', 'easily', 'fast', 'quick', 'quickly', 'user-friendly', 'user friendly', 'intuitive', 'seamless',
  'seamlessly', 'simple', 'simply', 'appropriate', 'appropriately', 'properly', 'nice', 'optimal', 'efficient', 'etc',
];
const UI_WORDS = ['button', 'dropdown', 'drop-down', 'pop-up', 'popup', 'modal', 'checkbox', 'click', 'tab', 'banner'];
const GENERIC_ROLES = ['user', 'a user', 'the user', 'customer', 'a customer', 'the customer', 'someone', 'people'];
/** Signals that an acceptance criterion covers an unhappy path or edge case. */
export const UNHAPPY_SIGNALS = [
  ' not ', "n't", ' no ', 'none', 'error', 'fail', 'invalid', 'out of stock', 'expired', 'expire', 'already',
  'without', 'logged out', 'empty', 'zero', 'cancel', 'unavailable', 'discontinued', 'more than', 'less than',
  'exceed', 'twice', 'duplicate', 'over ', 'under ', 'missing', 'declin', 'reject', 'timeout', 'offline',
];

const wordRe = (w: string) => new RegExp(`(^|[^a-z])${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}([^a-z]|$)`, 'i');

export function findWords(text: string, words: readonly string[]): string[] {
  return words.filter((w) => wordRe(w).test(text));
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

function tokens(t: string): Set<string> {
  return new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
}
/** Share of meaningful words two texts have in common (0..1). */
export function overlap(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let same = 0;
  for (const w of ta) if (tb.has(w)) same++;
  return same / Math.min(ta.size, tb.size);
}

export function lintText(part: TextPart, text: string): Finding[] {
  const out: Finding[] = [];
  if (!text.trim()) return [{ level: 'error', text: 'Not answered yet.' }];
  const words = countWords(text);
  if (part.minWords && words < part.minWords)
    out.push({ level: 'warn', text: `Only ${plural(words, 'word', 'words')}. Aim for at least ${part.minWords} to cover the essentials.` });
  const checks = part.checks ?? [];
  if (checks.includes('metric')) {
    if (!/\d/.test(text)) out.push({ level: 'error', text: 'No number found. A metric needs a baseline and a target (e.g. "from 1.2% to 1.8%").' });
    else out.push({ level: 'ok', text: 'Contains numbers (baseline / target).' });
    if (!/(day|week|month|quarter|year|by |within|after|sprint|q[1-4])/i.test(text))
      out.push({ level: 'warn', text: 'No timeframe. When will you measure it? (e.g. "8 weeks after launch")' });
  }
  if (checks.includes('questions')) {
    const q = (text.match(/\?/g) ?? []).length;
    out.push(q >= 3 ? { level: 'ok', text: `${plural(q, 'question', 'questions')} asked.` } : { level: 'warn', text: `${plural(q, 'question', 'questions')}. Ask at least 3 open questions.` });
  }
  if (checks.includes('vague')) {
    const v = findWords(text, VAGUE_WORDS);
    if (v.length) out.push({ level: 'warn', text: `Vague words: ${v.map((x) => `"${x}"`).join(', ')}. How would anyone measure them?` });
  }
  if (!out.some((f) => f.level !== 'ok') && !out.length) out.push({ level: 'ok', text: 'Looks complete. Check the content against the brief.' });
  return out;
}

/** Format checks for one user story. Prefix with the story title in multi-story lists. */
export function lintStory(s: StoryDraft, part: Pick<StoriesPart, 'minAcPerStory' | 'requireEstimate'>): Finding[] {
  const out: Finding[] = [];
  const role = s.asA.trim().toLowerCase();
  if (!s.title.trim()) out.push({ level: 'error', text: 'Add a short title.' });
  if (!role) out.push({ level: 'error', text: '"As a…" is empty.' });
  else if (GENERIC_ROLES.includes(role))
    out.push({ level: 'warn', text: `"${s.asA}" is generic. Which shopper or colleague? (e.g. "a mobile shopper on Drogisterij Prijs")` });
  if (!s.iWant.trim()) out.push({ level: 'error', text: '"I want…" is empty.' });
  else {
    const ui = findWords(s.iWant, UI_WORDS);
    if (ui.length) out.push({ level: 'warn', text: `"I want" names UI (${ui.join(', ')}). Describe the need, leave the design open.` });
  }
  if (!s.soThat.trim()) out.push({ level: 'error', text: '"So that…" is empty. Why does this matter to them?' });
  else if (s.iWant.trim() && overlap(s.iWant, s.soThat) >= 0.6)
    out.push({ level: 'warn', text: '"So that" repeats "I want". State the benefit or outcome, not the feature again.' });

  const vague = findWords([s.iWant, s.soThat].join(' '), VAGUE_WORDS);
  if (vague.length) out.push({ level: 'warn', text: `Vague words in the story: ${vague.map((x) => `"${x}"`).join(', ')}.` });

  if (part.requireEstimate && s.points == null) out.push({ level: 'warn', text: 'Not estimated yet.' });
  if (s.points != null && s.points > 8) out.push({ level: 'warn', text: `${s.points} points is big for one sprint. Can you split it?` });

  if (s.acs.length < part.minAcPerStory)
    out.push({ level: 'error', text: `${plural(s.acs.length, 'acceptance criterion', 'acceptance criteria')}. Add at least ${part.minAcPerStory}.` });
  s.acs.forEach((ac, i) => {
    const n = `AC ${i + 1}`;
    const missing = (['given', 'when', 'then'] as const).filter((k) => !ac[k].trim());
    if (missing.length) out.push({ level: 'error', text: `${n}: fill in ${missing.map((m) => m[0].toUpperCase() + m.slice(1)).join(', ')}.` });
    if (/\band\b/i.test(ac.when)) out.push({ level: 'warn', text: `${n}: "When" contains "and". One action per criterion; split it.` });
    const v = findWords(ac.then, VAGUE_WORDS);
    if (v.length) out.push({ level: 'warn', text: `${n}: "Then" is not testable (${v.join(', ')}). Describe what the tester sees.` });
  });
  if (s.acs.length >= 2) {
    const text = ' ' + s.acs.map((a) => `${a.given} ${a.when} ${a.then}`).join(' ').toLowerCase() + ' ';
    if (!UNHAPPY_SIGNALS.some((w) => text.includes(w)))
      out.push({ level: 'warn', text: 'Only happy paths. What if something is missing, invalid, expired or out of stock?' });
    else out.push({ level: 'ok', text: 'Includes an unhappy path or edge case.' });
  }
  if (!out.some((f) => f.level !== 'ok')) out.unshift({ level: 'ok', text: 'Story format and acceptance criteria look solid.' });
  return out;
}

export function lintStories(part: StoriesPart, stories: StoryDraft[]): Finding[] {
  const out: Finding[] = [];
  if (stories.length < part.minStories) out.push({ level: 'error', text: `${plural(stories.length, 'story', 'stories')}. Write at least ${part.minStories}.` });
  if (stories.length > part.maxStories) out.push({ level: 'warn', text: `${stories.length} stories. More than ${part.maxStories} suggests you're slicing too thin or beyond scope.` });
  return out;
}
