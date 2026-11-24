import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUi } from '../../app/uiStore';
import { db } from '../../db/db';
import { updateAttempt } from '../../db/attempts';
import { getLesson, getScenario } from '../../content';
import type { AttemptStep } from '../../db/types';
import CopyPrompt from '../../components/CopyPrompt';
import { buildHintPrompt, buildLessonPrompt } from '../../engine/prompts';

const STEP_TIPS: Record<AttemptStep, string> = {
  brief: 'Read the situation and the data slowly. The numbers usually contain the key insight. Unsure about the concept? Open the full lesson.',
  answer: 'Write your own answer first. Instant checks appear under each part. Stuck for more than a few minutes? Take a hint.',
  check: 'The automatic check is a coach, not a judge. Rate yourself honestly against the rubric: it builds the habit of reviewing your own work.',
  compare: 'Compare structure, not wording. Pick one thing you would do differently next time, then save your scores.',
};

export default function AssistantPanel() {
  const { toggleAssistant, activeScenarioId } = useUi();
  const scenario = activeScenarioId ? getScenario(activeScenarioId) : undefined;
  const attempt = useLiveQuery(() => (activeScenarioId ? db.attempts.get(activeScenarioId) : undefined), [activeScenarioId]);

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-ink-300/60 bg-gradient-to-b from-brand-50/60 to-white">
      <div className="flex items-center border-b border-ink-300/60 px-4 py-3">
        <span className="mr-2 text-brand-600">✦</span>
        <h2 className="font-semibold">Coach</h2>
        <button className="btn-subtle ml-auto px-2 py-0.5" onClick={toggleAssistant} aria-label="Close coach">✕</button>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4 text-sm text-ink-700">
        {scenario && attempt ? (
          <>
            <div className="card p-3">
              <p className="text-xs uppercase text-ink-500">Current task</p>
              <p className="font-medium">{scenario.title}</p>
              <p className="mt-2 text-ink-700">{STEP_TIPS[attempt.step]}</p>
            </div>
            <div className="card p-3">
              <p className="mb-2 font-medium">Hints <span className="text-xs font-normal text-ink-500">({attempt.hintsUsed}/3 used)</span></p>
              <ol className="space-y-2">
                {scenario.hints.slice(0, attempt.hintsUsed).map((h, i) => (
                  <li key={i} className="rounded bg-amber-50 p-2 text-[13px]"><span className="font-semibold">Hint {i + 1}:</span> {h}</li>
                ))}
              </ol>
              {attempt.hintsUsed < 3 ? (
                <button className="btn-subtle mt-2 w-full justify-center border border-ink-300" onClick={() => updateAttempt(attempt.id, { hintsUsed: attempt.hintsUsed + 1 })}>
                  {attempt.hintsUsed === 0 ? 'Show a hint' : attempt.hintsUsed === 1 ? 'Show a stronger hint' : 'Show the last hint (nearly the answer)'}
                </button>
              ) : <p className="mt-2 text-xs text-ink-500">All hints shown.</p>}
            </div>
            <div className="card space-y-3 p-3">
              <p className="font-medium">Ask Claude</p>
              <CopyPrompt label="Help me get unstuck" build={() => buildHintPrompt(scenario, attempt.answers)} hint="Guiding questions, no answer." />
              {getLesson(scenario.lessonId) && (
                <CopyPrompt label="Teach me the concept" build={() => buildLessonPrompt(getLesson(scenario.lessonId)!.title, getLesson(scenario.lessonId)!.conceptCard)} hint="New example plus a 3-question quiz." />
              )}
              <p className="text-xs text-ink-500">Full review with scores: step 3 · Check.</p>
            </div>
            <div className="card p-3">
              <p className="text-xs uppercase text-ink-500">Lesson</p>
              <Link className="text-brand-700 hover:underline" to={`/learn/${scenario.lessonId}`}>{getLesson(scenario.lessonId)?.title}</Link>
            </div>
          </>
        ) : (
          <div className="card p-3">
            <p className="font-medium">No active task</p>
            <p className="mt-1 text-ink-500">Open a task in <Link className="text-brand-700 underline" to="/practice">Practice</Link> or from the Inbox. Its tips and hints appear here.</p>
          </div>
        )}
        <p className="text-xs text-ink-500">Free · works offline · Claude only when you paste a prompt</p>
      </div>
    </aside>
  );
}
