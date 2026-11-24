import { db } from './db';
import type { Attempt } from './types';

export function newAttempt(scenarioId: string, history: Attempt['history'] = []): Attempt {
  const now = Date.now();
  return {
    id: scenarioId, scenarioId, step: 'brief', answers: {}, hintsUsed: 0, selfRubric: {}, checkedAt: null,
    startedAt: now, updatedAt: now, history,
  };
}

export async function getOrCreateAttempt(scenarioId: string): Promise<Attempt> {
  const existing = await db.attempts.get(scenarioId);
  if (existing) return existing;
  const a = newAttempt(scenarioId);
  await db.attempts.put(a);
  return a;
}

export const updateAttempt = (id: string, patch: Partial<Attempt>) => db.attempts.update(id, { ...patch, updatedAt: Date.now() });

export async function setAnswer(id: string, partId: string, value: unknown) {
  const a = await db.attempts.get(id);
  if (!a) return;
  await db.attempts.update(id, { answers: { ...a.answers, [partId]: value }, updatedAt: Date.now() });
}

export async function completeAttempt(id: string, autoScore: number, selfScore: number) {
  const a = await db.attempts.get(id);
  if (!a) return;
  const fresh = a.claudeReview && a.checkedAt && a.claudeReview.at >= a.checkedAt ? a.claudeReview.score : undefined;
  const history = [...a.history, { at: Date.now(), autoScore, selfScore, hintsUsed: a.hintsUsed, ...(fresh !== undefined ? { claudeScore: fresh } : {}) }];
  await db.attempts.update(id, { history, updatedAt: Date.now() });
}

/** Start over: clear answers and self-check but keep the history of completed runs. */
export async function restartAttempt(id: string) {
  const a = await db.attempts.get(id);
  await db.attempts.put(newAttempt(id, a?.history ?? []));
}

/** Read-modify-write inside a transaction so quick successive clicks never overwrite each other. */
export function setRubricLevel(id: string, criterionId: string, level: number) {
  return db.transaction('rw', db.attempts, async () => {
    const a = await db.attempts.get(id);
    if (!a) return;
    await db.attempts.update(id, { selfRubric: { ...a.selfRubric, [criterionId]: level }, updatedAt: Date.now() });
  });
}
