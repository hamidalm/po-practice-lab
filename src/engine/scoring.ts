import { lintStories, lintStory, lintText } from './checks';
import type {
  Answers, ChoicePart, Finding, Keypoint, MatchPart, NumberPart, Part, RankPart, RubricCriterion, Scenario, SelectPart,
  StoriesPart, StoryDraft, TextPart,
} from './types';

export interface PartResult {
  partId: string;
  score: number; // 0..1
  findings: Finding[];
  covered: Keypoint[];
  missed: Keypoint[];
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Score from format findings: no answer 0, any error 0.3, warnings 0.7, clean 1. */
export function lintScore(findings: Finding[], empty: boolean): number {
  if (empty) return 0;
  if (findings.some((f) => f.level === 'error')) return 0.3;
  if (findings.some((f) => f.level === 'warn')) return 0.7;
  return 1;
}

export function keypointCoverage(text: string, keypoints: Keypoint[]) {
  const t = text.toLowerCase();
  const covered = keypoints.filter((k) => k.anyOf.some((p) => t.includes(p.toLowerCase())));
  const missed = keypoints.filter((k) => !covered.includes(k));
  return { covered, missed, ratio: keypoints.length ? covered.length / keypoints.length : 1 };
}

export const storyText = (s: StoryDraft) =>
  [s.title, s.asA, s.iWant, s.soThat, ...s.acs.map((a) => `${a.given} ${a.when} ${a.then}`)].join(' \n');

export function scoreNumber(part: NumberPart, raw: unknown): { score: number; findings: Finding[] } {
  const v = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  if (Number.isNaN(v)) return { score: 0, findings: [{ level: 'error', text: 'No number entered.' }] };
  const diff = Math.abs(v - part.answer);
  const unit = part.unit ? ` ${part.unit}` : '';
  if (diff <= part.tolerance) return { score: 1, findings: [{ level: 'ok', text: `${v}${unit} is right. ${part.explanation}` }] };
  if (diff <= part.tolerance * 3 + 1)
    return { score: 0.5, findings: [{ level: 'warn', text: `${v}${unit} is close; the expected value is ${part.answer}${unit}. ${part.explanation}` }] };
  return { score: 0, findings: [{ level: 'error', text: `${v}${unit} is off; the expected value is ${part.answer}${unit}. ${part.explanation}` }] };
}

export function scoreChoice(part: ChoicePart, raw: unknown): { score: number; findings: Finding[] } {
  const sel = Array.isArray(raw) ? (raw as string[]) : [];
  if (!sel.length) return { score: 0, findings: [{ level: 'error', text: 'Nothing selected.' }] };
  const correct = new Set(part.correct);
  const findings: Finding[] = part.options
    .filter((o) => sel.includes(o.id) || (part.multi && correct.has(o.id)))
    .map((o) => {
      const picked = sel.includes(o.id);
      const right = correct.has(o.id);
      const level = picked === right ? 'ok' : 'error';
      const prefix = picked ? (right ? '✓ Chosen, correct' : '✗ Chosen, but not right') : '✗ Missed';
      return { level, text: `${prefix}: "${o.label}". ${o.feedback}` };
    });
  if (!part.multi) return { score: correct.has(sel[0]) ? 1 : 0, findings };
  const inter = sel.filter((s) => correct.has(s)).length;
  const union = new Set([...sel, ...part.correct]).size;
  return { score: inter / union, findings };
}

/** Spearman footrule distance, normalised to 0..1 similarity; must-top items not at the top halve the score. */
export function scoreRank(part: RankPart, raw: unknown): { score: number; findings: Finding[] } {
  const order = Array.isArray(raw) && raw.length ? (raw as string[]) : part.items.map((i) => i.id);
  const n = part.expectedOrder.length;
  const label = (id: string) => part.items.find((i) => i.id === id)?.label ?? id;
  let dist = 0;
  const findings: Finding[] = [];
  part.expectedOrder.forEach((id, expIdx) => {
    const idx = order.indexOf(id);
    const d = Math.abs(idx - expIdx);
    dist += d;
    if (d >= 2) findings.push({ level: 'warn', text: `"${label(id)}" is #${idx + 1}; expected around #${expIdx + 1}.` });
  });
  const max = Math.floor((n * n) / 2) || 1;
  let score = 1 - dist / max;
  const top = part.mustTop ?? [];
  const topOk = top.every((id) => order.indexOf(id) < top.length);
  if (top.length) {
    if (topOk) findings.unshift({ level: 'ok', text: `Must-dos first: ${top.map(label).join(', ')}.` });
    else {
      score *= 0.5;
      findings.unshift({ level: 'error', text: `Must-do not at the top: ${top.map(label).join(', ')}. Legal deadlines, money-losing bugs and commitments come before scoring models.` });
    }
  }
  if (dist === 0) findings.push({ level: 'ok', text: 'Exactly the expected order.' });
  findings.push({ level: 'ok', text: part.explanation });
  return { score: clamp(score), findings };
}

export function scoreSelect(part: SelectPart, raw: unknown): { score: number; findings: Finding[]; total: number } {
  const sel = Array.isArray(raw) ? (raw as string[]) : [];
  const total = part.items.filter((i) => sel.includes(i.id)).reduce((s, i) => s + i.points, 0);
  const findings: Finding[] = [];
  const label = (id: string) => part.items.find((i) => i.id === id)?.label ?? id;
  const inc = part.mustInclude.filter((m) => sel.includes(m.id));
  for (const m of part.mustInclude)
    findings.push(sel.includes(m.id) ? { level: 'ok', text: `Included "${label(m.id)}". ${m.reason}` } : { level: 'error', text: `Missing "${label(m.id)}". ${m.reason}` });
  const exc = part.mustExclude.filter((m) => sel.includes(m.id));
  for (const m of exc) findings.push({ level: 'error', text: `"${label(m.id)}" should not be in the sprint. ${m.reason}` });
  const withinCap = total <= part.capacity + 1;
  if (!withinCap) findings.push({ level: 'error', text: `${total} points selected against a capacity of ${part.capacity}. Over-committing puts the sprint goal at risk.` });
  else if (total < part.capacity - 5) findings.push({ level: 'warn', text: `${total} of ${part.capacity} points. There is room for more work.` });
  else findings.push({ level: 'ok', text: `${total} of ${part.capacity} points. Good use of capacity.` });
  const incFrac = part.mustInclude.length ? inc.length / part.mustInclude.length : 1;
  const score = 0.4 * incFrac + 0.3 * (exc.length ? 0 : 1) + 0.3 * (withinCap && total >= part.capacity - 5 ? 1 : withinCap ? 0.5 : 0);
  return { score: sel.length ? clamp(score) : 0, findings, total };
}

export function scoreMatch(part: MatchPart, raw: unknown): { score: number; findings: Finding[] } {
  const ans = (raw && typeof raw === 'object' ? raw : {}) as Record<string, string>;
  const opt = (id: string) => part.options.find((o) => o.id === id)?.label ?? '—';
  let right = 0;
  const findings = part.rows.map<Finding>((r) => {
    const ok = ans[r.id] === part.answers[r.id];
    if (ok) right++;
    return {
      level: ok ? 'ok' : 'error',
      text: `${ok ? '✓' : '✗'} ${r.label} → ${ok ? opt(ans[r.id]) : `you chose ${ans[r.id] ? opt(ans[r.id]) : 'nothing'}, best fit: ${opt(part.answers[r.id])}`}. ${part.explanations[r.id] ?? ''}`,
    };
  });
  return { score: part.rows.length ? right / part.rows.length : 0, findings };
}

/** Full evaluation of one part, used on the Check step. */
export function evaluatePart(part: Part, answers: Answers, keypoints: Keypoint[]): PartResult {
  const kps = keypoints.filter((k) => k.part === part.id);
  const raw = answers[part.id];
  const base = { partId: part.id, covered: [] as Keypoint[], missed: [] as Keypoint[] };
  switch (part.kind) {
    case 'text': {
      const text = typeof raw === 'string' ? raw : '';
      const findings = lintText(part as TextPart, text);
      const cov = keypointCoverage(text, kps);
      const ls = lintScore(findings, !text.trim());
      const score = kps.length ? (text.trim() ? 0.6 * cov.ratio + 0.4 * ls : 0) : ls;
      return { ...base, score, findings, covered: cov.covered, missed: cov.missed };
    }
    case 'stories': {
      const stories = Array.isArray(raw) ? (raw as StoryDraft[]) : [];
      const p = part as StoriesPart;
      const findings = [...lintStories(p, stories)];
      const perStory = stories.map((s) => {
        const f = lintStory(s, p);
        findings.push(...f.filter((x) => x.level !== 'ok').map((x) => ({ ...x, text: `${s.title || 'Untitled story'}: ${x.text}` })));
        return lintScore(f, false);
      });
      const countOk = stories.length >= p.minStories ? 1 : stories.length / p.minStories;
      const ls = stories.length ? (perStory.reduce((a, b) => a + b, 0) / perStory.length) * countOk : 0;
      const cov = keypointCoverage(stories.map(storyText).join('\n'), kps);
      if (!findings.some((f) => f.level !== 'ok') && stories.length) findings.push({ level: 'ok', text: 'All stories pass the format checks.' });
      const score = kps.length ? (stories.length ? 0.6 * cov.ratio + 0.4 * ls : 0) : ls;
      return { ...base, score, findings, covered: cov.covered, missed: cov.missed };
    }
    case 'number': return { ...base, ...scoreNumber(part, raw) };
    case 'choice': return { ...base, ...scoreChoice(part, raw) };
    case 'rank': return { ...base, ...scoreRank(part, raw) };
    case 'select': { const r = scoreSelect(part, raw); return { ...base, score: r.score, findings: r.findings }; }
    case 'match': return { ...base, ...scoreMatch(part, raw) };
  }
}

export function evaluateScenario(s: Scenario, answers: Answers) {
  const parts = s.parts.map((p) => evaluatePart(p, answers, s.keypoints));
  const autoScore = Math.round((parts.reduce((a, r) => a + r.score, 0) / (parts.length || 1)) * 100);
  return { parts, autoScore };
}

/** Self-assessed rubric: level 0 (not met), 1 (partly), 2 (fully) per criterion, weighted to 0..100. */
export function rubricScore(rubric: RubricCriterion[], levels: Record<string, number>): number {
  const total = rubric.reduce((s, c) => s + c.weight, 0);
  if (!total) return 0;
  const got = rubric.reduce((s, c) => s + c.weight * (Math.max(0, Math.min(2, levels[c.id] ?? 0)) / 2), 0);
  return Math.round((got / total) * 100);
}

export const rubricComplete = (rubric: RubricCriterion[], levels: Record<string, number>) => rubric.every((c) => levels[c.id] !== undefined);
