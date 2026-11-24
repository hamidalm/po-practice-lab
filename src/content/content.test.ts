import { describe, expect, it } from 'vitest';
import { LESSONS, SCENARIOS, getLesson } from './index';

describe('lessons', () => {
  it('all lessons load with a title and a concept card', () => {
    expect(LESSONS).toHaveLength(11);
    for (const l of LESSONS) {
      expect(l.body.length, l.id).toBeGreaterThan(500);
      expect(l.conceptCard.length, `${l.id} concept card`).toBeGreaterThan(150);
      expect(l.title, l.id).not.toBe(l.id);
    }
  });
});

describe('scenario bank', () => {
  it('has 10 scenarios, 5 per track, unique ids', () => {
    expect(SCENARIOS).toHaveLength(10);
    expect(SCENARIOS.filter((s) => s.track === 'A')).toHaveLength(5);
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(10);
  });

  for (const s of SCENARIOS) {
    describe(s.id, () => {
      it('has the required content', () => {
        expect([1, 2, 3]).toContain(s.difficulty);
        expect(getLesson(s.lessonId), 'lesson exists').toBeTruthy();
        expect(s.hints).toHaveLength(3);
        expect(s.rubric.length).toBeGreaterThanOrEqual(3);
        expect(s.rubric.length).toBeLessThanOrEqual(6);
        expect(s.rubric.reduce((a, c) => a + c.weight, 0), 'rubric weights sum to 100').toBe(100);
        expect(s.modelAnswer.length).toBeGreaterThan(200);
        expect(s.commonMistakes.length).toBeGreaterThanOrEqual(3);
        expect(s.parts.length).toBeGreaterThanOrEqual(1);
      });

      it('has consistent part definitions', () => {
        const partIds = s.parts.map((p) => p.id);
        expect(new Set(partIds).size).toBe(partIds.length);
        for (const k of s.keypoints) expect(partIds, `keypoint ${k.id}`).toContain(k.part);
        for (const p of s.parts) {
          if (p.kind === 'choice') {
            const ids = p.options.map((o) => o.id);
            expect(p.correct.length).toBeGreaterThan(0);
            for (const c of p.correct) expect(ids).toContain(c);
            if (!p.multi) expect(p.correct).toHaveLength(1);
          }
          if (p.kind === 'rank') {
            expect([...p.expectedOrder].sort()).toEqual(p.items.map((i) => i.id).sort());
            for (const t of p.mustTop ?? []) expect(p.expectedOrder.indexOf(t)).toBeLessThan((p.mustTop ?? []).length);
          }
          if (p.kind === 'select') {
            const ids = p.items.map((i) => i.id);
            for (const m of [...p.mustInclude, ...p.mustExclude]) expect(ids).toContain(m.id);
            const must = p.items.filter((i) => p.mustInclude.some((m) => m.id === i.id)).reduce((a, i) => a + i.points, 0);
            expect(must, 'must-dos fit capacity').toBeLessThanOrEqual(p.capacity);
          }
          if (p.kind === 'match') {
            const opts = p.options.map((o) => o.id);
            for (const r of p.rows) {
              expect(opts, `answer for ${r.id}`).toContain(p.answers[r.id]);
              expect(p.explanations[r.id], `explanation for ${r.id}`).toBeTruthy();
            }
          }
        }
      });
    });
  }
});
