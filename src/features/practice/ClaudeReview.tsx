import { useState } from 'react';
import CopyPrompt from '../../components/CopyPrompt';
import { buildReviewPrompt, parseClaudeScores } from '../../engine/prompts';
import { rubricScore } from '../../engine/scoring';
import type { Answers, Scenario } from '../../engine/types';
import type { Attempt } from '../../db/types';
import { updateAttempt } from '../../db/attempts';
import { ScoreBadge } from './PracticeList';

const LEVEL = ['not yet', 'partly', 'fully'];

/** Step 3 card: copy the review prompt, paste Claude's score block back, store the scores. */
export default function ClaudeReview({ scenario, attempt, answers }: { scenario: Scenario; attempt: Attempt; answers: Answers }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const review = attempt.claudeReview && attempt.checkedAt && attempt.claudeReview.at >= attempt.checkedAt ? attempt.claudeReview : null;

  async function onSave() {
    try {
      const { scores, missing } = parseClaudeScores(text, scenario);
      await updateAttempt(attempt.id, { claudeReview: { at: Date.now(), scores, score: rubricScore(scenario.rubric, scores) } });
      setWarning(missing.length ? `Not scored by Claude: ${missing.join(', ')} (counted as 0).` : null);
      setError(null);
      setText('');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="card border-purple-200 bg-purple-50/40 p-4">
      <h2 className="font-semibold">Get a second opinion from Claude <span className="text-xs font-normal text-ink-500">(free with your Claude account)</span></h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-700">
        <li>Copy the review prompt. It contains the task, your answer, the rubric and the reference answer.</li>
        <li>Paste it into Claude and send. You get scores, strengths, fixes and an improved version of your weakest part.</li>
        <li>Copy Claude's whole reply (or just the score block at the end) and paste it below.</li>
      </ol>
      <div className="mt-3"><CopyPrompt label="Copy review prompt" variant="primary" build={() => buildReviewPrompt(scenario, answers)} /></div>

      <div className="mt-4">
        <label className="label">Paste Claude's reply</label>
        <textarea className="input h-24 font-mono text-xs" placeholder={'…\n```po-lab-score\n{"scenario":"…","scores":{…}}\n```'} value={text} onChange={(e) => { setText(e.target.value); setError(null); }} />
        <button className="btn-primary mt-2" disabled={!text.trim()} onClick={onSave}>Save Claude's scores</button>
        {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
        {warning && <p className="mt-1 text-sm text-amber-700">{warning}</p>}
      </div>

      {review && (
        <div className="mt-4 rounded border border-purple-200 bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">Claude's score <ScoreBadge value={review.score} /></div>
          <ul className="space-y-0.5 text-sm">
            {scenario.rubric.map((c) => (
              <li key={c.id} className="flex gap-2">
                <span className="flex-1">{c.criterion}</span>
                <span className={review.scores[c.id] === 2 ? 'text-green-700' : review.scores[c.id] === 1 ? 'text-amber-700' : 'text-red-700'}>
                  {LEVEL[review.scores[c.id] ?? 0]}
                </span>
                <span className="w-16 text-right text-ink-500">you: {attempt.selfRubric[c.id] !== undefined ? LEVEL[attempt.selfRubric[c.id]] : '–'}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-500">Where you and Claude disagree is where the learning is. Look at those criteria in the model answer.</p>
        </div>
      )}
    </section>
  );
}
