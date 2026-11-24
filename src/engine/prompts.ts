import { answerToMarkdown, partToMarkdown } from './answerText';
import type { Answers, DataTable, Part, RubricCriterion, Scenario } from './types';

export const SCORE_TAG = 'po-lab-score';

const ROLE =
  'You are an experienced Product Owner coach for the central digital team of a large health and beauty retailer ' +
  '(multi-brand, several markets, online plus offline, SAP Commerce, Jira and Confluence). ' +
  'I am practising for a Product Owner role. Be direct, specific and use plain English.';

function table(t: DataTable): string {
  const head = `| ${t.columns.join(' | ')} |\n|${t.columns.map(() => '---').join('|')}|`;
  const rows = t.rows.map((r) => `| ${r.map((c) => String(c).replace(/\|/g, '/')).join(' | ')} |`).join('\n');
  return `**${t.title}**\n${head}\n${rows}${t.note ? `\n_${t.note}_` : ''}`;
}

export function exerciseBlock(s: Scenario, parts: Part[] = s.parts): string {
  const from = s.from ? `From: ${s.from.name} (${s.from.role})\n\n` : '';
  const data = s.data.length ? `\n\n### Data\n${s.data.map(table).join('\n\n')}` : '';
  const constraints = s.constraints.length ? `\n\nConstraints:\n${s.constraints.map((c) => `- ${c}`).join('\n')}` : '';
  const questions = parts.map((p, i) => `${i + 1}. **${p.label}**: ${p.prompt}`).join('\n');
  return `## Exercise: ${s.title}\n\n### Situation\n${from}${s.context}${data}\n\n### Task\n${s.task}${constraints}\n\n### What I had to answer\n${questions}`;
}

export function rubricBlock(rubric: RubricCriterion[]): string {
  return rubric
    .map((c) => `- [${c.id}] ${c.criterion} (weight ${c.weight}%). Fully: ${c.full}.${c.partial ? ` Partly: ${c.partial}.` : ''}`)
    .join('\n');
}

export function scoreTemplate(s: Scenario): string {
  const scores = Object.fromEntries(s.rubric.map((c) => [c.id, 0]));
  return '```' + SCORE_TAG + '\n' + JSON.stringify({ scenario: s.id, scores }) + '\n```';
}

/** Full review: rubric scores, strengths, fixes, improved weakest part, and a score block to paste back. */
export function buildReviewPrompt(s: Scenario, answers: Answers): string {
  return `${ROLE}

Please review my answer to this practice exercise.

${exerciseBlock(s)}

## My answer
${answerToMarkdown(s, answers)}

## Rubric
Score each criterion 0 = not met, 1 = partly met, 2 = fully met.
${rubricBlock(s.rubric)}

## Reference answer
One good answer. Other good answers are possible: judge on substance, not on matching words.
${s.modelAnswer}

## How to respond (max about 400 words)
1. Score per criterion, each with a one-line reason.
2. Three strengths.
3. Three fixes, most important first.
4. An improved version of my weakest part only (not the whole answer).
5. One question to think about next time.

End your reply with this block, with the scores filled in (I paste it back into my practice app):
${scoreTemplate(s)}`;
}

/** Feedback on one part only, no scores. */
export function buildPartPrompt(s: Scenario, part: Part, answers: Answers): string {
  return `${ROLE}

Give me feedback on ONE part of my answer to this practice exercise.

${exerciseBlock(s, [part])}

## My answer to "${part.label}"
${partToMarkdown(part, answers[part.id])}

## How to respond (max about 250 words)
- What is good about it
- The two most important improvements, with a short example of each
- Do not rewrite my whole answer; I want to improve it myself`;
}

/** Unstuck: guiding questions without giving the answer away. */
export function buildHintPrompt(s: Scenario, answers: Answers): string {
  const draft = answerToMarkdown(s, answers);
  return `${ROLE}

I'm stuck on this practice exercise. Do NOT give me the answer.

${exerciseBlock(s)}

## My draft so far
${draft}

## How to respond
- Ask me 2–3 guiding questions that point me in the right direction
- Tell me which facts in the situation or data I should look at again
- Keep it under 150 words`;
}

/** Teach a lesson's concept with a fresh example and a short quiz. */
export function buildLessonPrompt(title: string, conceptCard: string): string {
  return `${ROLE}

Teach me this topic: **${title}**.

Here is the short summary I already read:
${conceptCard}

Please:
1. Explain it again in plain English with a NEW example from health and beauty eCommerce (e.g. a drugstore or perfumery website).
2. Tell me the two mistakes new Product Owners make most often with it.
3. Then quiz me: ask 3 questions ONE AT A TIME, wait for my answer, and give short feedback before the next question.`;
}

export interface ParsedScores {
  scores: Record<string, number>;
  missing: string[];
}

/**
 * Reads Claude's pasted reply (or just the score block) and returns rubric levels 0..2.
 * Throws with a readable message when no usable score block is found.
 */
export function parseClaudeScores(text: string, s: Scenario): ParsedScores {
  const tagged = text.match(new RegExp('```\\s*' + SCORE_TAG + '\\s*([\\s\\S]*?)```'));
  let jsonText = tagged?.[1];
  if (!jsonText) {
    const i = text.lastIndexOf('"scores"');
    if (i < 0) throw new Error('No score block found. Paste the whole reply, or the part that starts with ```' + SCORE_TAG + '.');
    const start = text.lastIndexOf('{', i);
    let depth = 0;
    let end = -1;
    for (let j = start; j < text.length; j++) {
      if (text[j] === '{') depth++;
      if (text[j] === '}' && --depth === 0) { end = j; break; }
    }
    if (start < 0 || end < 0) throw new Error('The score block looks incomplete. Copy it again, including the closing }.');
    jsonText = text.slice(start, end + 1);
  }
  let data: unknown;
  try {
    data = JSON.parse(jsonText.trim());
  } catch {
    throw new Error('The score block is not valid JSON. Copy it exactly as Claude wrote it.');
  }
  const obj = data as { scenario?: string; scores?: Record<string, unknown> };
  if (obj.scenario && obj.scenario !== s.id) throw new Error(`These scores are for another task (${obj.scenario}).`);
  if (!obj.scores || typeof obj.scores !== 'object') throw new Error('The block has no "scores".');
  const scores: Record<string, number> = {};
  const missing: string[] = [];
  for (const c of s.rubric) {
    const v = Number(obj.scores[c.id]);
    if (obj.scores[c.id] === undefined || Number.isNaN(v)) missing.push(c.criterion);
    else scores[c.id] = Math.max(0, Math.min(2, Math.round(v)));
  }
  if (!Object.keys(scores).length) throw new Error('None of the rubric criteria were scored. Did you paste the block from this task?');
  return { scores, missing };
}
