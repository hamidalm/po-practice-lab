import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { completeAttempt, getOrCreateAttempt, restartAttempt, setRubricLevel, updateAttempt } from '../../db/attempts';
import { createPage, updatePage } from '../../db/actions';
import { getLesson, getScenario, TRACKS } from '../../content';
import { evaluateScenario, rubricComplete, rubricScore } from '../../engine/scoring';
import { answerToMarkdown } from '../../engine/answerText';
import type { Answers, Scenario } from '../../engine/types';
import type { Attempt, AttemptStep } from '../../db/types';
import { useUi } from '../../app/uiStore';
import Markdown from '../../components/Markdown';
import Findings from '../../components/Findings';
import PartEditor from './parts/PartEditor';
import { Difficulty, ScoreBadge } from './PracticeList';

const STEPS: { id: AttemptStep; label: string }[] = [
  { id: 'brief', label: '1 · Brief' },
  { id: 'answer', label: '2 · Your answer' },
  { id: 'check', label: '3 · Check' },
  { id: 'compare', label: '4 · Compare' },
];

export default function PracticeTask() {
  const { scenarioId = '' } = useParams();
  const scenario = getScenario(scenarioId);
  const attempt = useLiveQuery(() => db.attempts.get(scenarioId), [scenarioId]);
  const setActive = useUi((s) => s.setActiveScenario);

  useEffect(() => {
    if (!scenario) return;
    getOrCreateAttempt(scenario.id);
    setActive(scenario.id);
    return () => setActive(null);
  }, [scenario, setActive]);

  if (!scenario) return <div className="p-8">Task not found. <Link className="text-brand-600 underline" to="/practice">Back to practice</Link></div>;
  if (!attempt) return null;
  return <Task key={attempt.startedAt} scenario={scenario} attempt={attempt} />;
}

function Task({ scenario, attempt }: { scenario: Scenario; attempt: Attempt }) {
  const [answers, setAnswers] = useState<Answers>(attempt.answers);
  const timer = useRef<number>();
  const latest = useRef(answers);

  // Debounced autosave of answers; flush on unmount.
  useEffect(() => {
    latest.current = answers;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => updateAttempt(attempt.id, { answers }), 400);
  }, [answers, attempt.id]);
  useEffect(() => () => { window.clearTimeout(timer.current); updateAttempt(attempt.id, { answers: latest.current }); }, [attempt.id]);

  const go = (step: AttemptStep) => {
    updateAttempt(attempt.id, { step, answers, ...(step === 'check' ? { checkedAt: Date.now() } : {}) });
    document.querySelector('main')?.scrollTo({ top: 0 });
  };
  const reachable = (s: AttemptStep) => s === 'brief' || s === 'answer' || ((s === 'check' || s === 'compare') && attempt.checkedAt !== null);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-1 flex items-center gap-2 text-xs text-ink-500">
        <Link to="/practice" className="hover:text-brand-600">Practice</Link><span>/</span><span>{TRACKS[scenario.track].short}</span>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{scenario.title}</h1>
        <Difficulty level={scenario.difficulty} />
      </div>
      <nav className="mb-6 flex gap-1 border-b border-ink-300/60">
        {STEPS.map((s) => (
          <button key={s.id} disabled={!reachable(s.id)} onClick={() => go(s.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${attempt.step === s.id ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-900'}`}>
            {s.label}
          </button>
        ))}
      </nav>
      {attempt.step === 'brief' && <BriefStep scenario={scenario} onNext={() => go('answer')} />}
      {attempt.step === 'answer' && <AnswerStep scenario={scenario} answers={answers} setAnswers={setAnswers} onNext={() => go('check')} />}
      {attempt.step === 'check' && <CheckStep scenario={scenario} attempt={attempt} answers={answers} onBack={() => go('answer')} onNext={() => go('compare')} />}
      {attempt.step === 'compare' && <CompareStep scenario={scenario} attempt={attempt} answers={answers} />}
    </div>
  );
}

function BriefStep({ scenario, onNext }: { scenario: Scenario; onNext: () => void }) {
  const lesson = getLesson(scenario.lessonId);
  return (
    <div className="space-y-6">
      {lesson && (
        <section className="rounded-lg border border-brand-100 bg-brand-50/60 p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-brand-700">
            <span>Concept card · 1 minute</span>
            <Link to={`/learn/${lesson.id}`} className="ml-auto normal-case text-brand-600 underline">Read the full lesson</Link>
          </div>
          <h2 className="mb-1 font-semibold">{lesson.title}</h2>
          <Markdown>{lesson.conceptCard}</Markdown>
        </section>
      )}
      <section>
        <h2 className="label">Situation</h2>
        {scenario.from && <p className="mb-2 text-sm text-ink-500">From <span className="font-medium text-ink-700">{scenario.from.name}</span> · {scenario.from.role}</p>}
        <Markdown>{scenario.context}</Markdown>
      </section>
      {scenario.data.map((t) => (
        <section key={t.title}>
          <h3 className="label">{t.title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr>{t.columns.map((c) => <th key={c} className="border border-ink-300 bg-ink-100 px-2 py-1 text-left">{c}</th>)}</tr></thead>
              <tbody>{t.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border border-ink-300 px-2 py-1">{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
          {t.note && <p className="mt-1 text-xs text-ink-500">{t.note}</p>}
        </section>
      ))}
      <section className="card border-l-4 border-l-brand-500 p-4">
        <h2 className="label">Your task</h2>
        <p className="text-sm">{scenario.task}</p>
        {scenario.constraints.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">{scenario.constraints.map((c) => <li key={c}>{c}</li>)}</ul>
        )}
      </section>
      <button className="btn-primary" onClick={onNext}>Start answering →</button>
    </div>
  );
}

function AnswerStep({ scenario, answers, setAnswers, onNext }: { scenario: Scenario; answers: Answers; setAnswers: (fn: (a: Answers) => Answers) => void; onNext: () => void }) {
  const capPart = scenario.parts.find((p) => p.kind === 'number' && /capacity/i.test(p.label));
  const yourCapacity = capPart ? parseFloat(String(answers[capPart.id] ?? '')) : NaN;
  return (
    <div className="space-y-6">
      <p className="rounded bg-ink-100 px-3 py-2 text-sm text-ink-700">
        <span className="font-semibold">Task:</span> {scenario.task} <span className="text-ink-500">Instant checks appear as you type. Hints are in the Coach panel.</span>
      </p>
      {scenario.parts.map((p, i) => (
        <section key={p.id} className="card p-4">
          <h2 className="font-semibold">{i + 1}. {p.label}</h2>
          <p className="mb-3 text-sm text-ink-700">{p.prompt}</p>
          <PartEditor part={p} value={answers[p.id]} onChange={(v) => setAnswers((a) => ({ ...a, [p.id]: v }))}
            yourCapacity={Number.isNaN(yourCapacity) ? undefined : yourCapacity} />
        </section>
      ))}
      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={onNext}>Check my answer →</button>
        <span className="text-xs text-ink-500">Your answer is saved automatically. You can come back and change it.</span>
      </div>
    </div>
  );
}

function scoreColor(n: number) {
  return n >= 75 ? 'bg-green-500' : n >= 50 ? 'bg-amber-500' : 'bg-red-500';
}

function CheckStep({ scenario, attempt, answers, onBack, onNext }: { scenario: Scenario; attempt: Attempt; answers: Answers; onBack: () => void; onNext: () => void }) {
  const result = useMemo(() => evaluateScenario(scenario, answers), [scenario, answers]);
  const levels = attempt.selfRubric;
  const self = rubricScore(scenario.rubric, levels);
  const complete = rubricComplete(scenario.rubric, levels);
  const setLevel = (id: string, v: number) => setRubricLevel(attempt.id, id, v);

  return (
    <div className="space-y-6">
      <section className="card flex items-center gap-4 p-4">
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-bold text-white ${scoreColor(result.autoScore)}`}>{result.autoScore}</div>
        <div>
          <h2 className="font-semibold">Automatic check</h2>
          <p className="text-sm text-ink-700">Format rules, numbers and the scenario's key points. It can't judge everything: use it as a coach, then rate yourself below.</p>
        </div>
      </section>

      {scenario.parts.map((p, i) => {
        const r = result.parts.find((x) => x.partId === p.id)!;
        const pct = Math.round(r.score * 100);
        return (
          <section key={p.id} className="card p-4">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-semibold">{i + 1}. {p.label}</h3>
              <div className="ml-auto h-2 w-32 rounded bg-ink-100"><div className={`h-2 rounded ${scoreColor(pct)}`} style={{ width: `${pct}%` }} /></div>
              <span className="w-10 text-right text-sm font-semibold">{pct}%</span>
            </div>
            <Findings items={r.findings} />
            {(r.covered.length > 0 || r.missed.length > 0) && (
              <div className="mt-3 border-t border-ink-300/60 pt-2">
                <p className="label">Key points from the brief</p>
                <Findings items={[
                  ...r.covered.map((k) => ({ level: 'ok' as const, text: k.label })),
                  ...r.missed.map((k) => ({ level: 'warn' as const, text: `Not found: ${k.label}` })),
                ]} />
                {r.missed.length > 0 && <p className="mt-1 text-xs text-ink-500">"Not found" means the checker didn't spot it in your words. If you covered it differently, count it in your self-check.</p>}
              </div>
            )}
          </section>
        );
      })}

      <section className="card p-4">
        <div className="mb-3 flex items-center">
          <h2 className="font-semibold">Self-check against the rubric</h2>
          <span className="ml-auto text-sm">Your score: <span className="font-bold">{complete ? self : '–'}</span></span>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-ink-500"><th className="pb-2">Criterion</th><th className="pb-2 text-center">Weight</th><th className="pb-2 text-center">Not yet</th><th className="pb-2 text-center">Partly</th><th className="pb-2 text-center">Fully</th></tr></thead>
          <tbody>
            {scenario.rubric.map((c) => (
              <tr key={c.id} className="border-t border-ink-300/50 align-top">
                <td className="py-2 pr-2">
                  <div className="font-medium">{c.criterion}</div>
                  <div className="text-xs text-ink-500"><span className="font-semibold">Fully:</span> {c.full}{c.partial && <> · <span className="font-semibold">Partly:</span> {c.partial}</>}</div>
                </td>
                <td className="py-2 text-center text-ink-500">{c.weight}%</td>
                {[0, 1, 2].map((v) => (
                  <td key={v} className="py-2 text-center">
                    <input type="radio" name={`rubric-${c.id}`} checked={levels[c.id] === v} onChange={() => setLevel(c.id, v)} aria-label={`${c.criterion}: ${['not yet', 'partly', 'fully'][v]}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex items-center gap-3">
        <button className="btn-subtle border border-ink-300" onClick={onBack}>← Improve my answer</button>
        <button className="btn-primary" disabled={!complete} onClick={onNext}>Compare with the model answer →</button>
        {!complete && <span className="text-xs text-ink-500">Rate every criterion first.</span>}
      </div>
    </div>
  );
}

function CompareStep({ scenario, attempt, answers }: { scenario: Scenario; attempt: Attempt; answers: Answers }) {
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>(null);
  const auto = evaluateScenario(scenario, answers).autoScore;
  const self = rubricScore(scenario.rubric, attempt.selfRubric);
  const last = attempt.history[attempt.history.length - 1];
  const savedThisRun = last && last.at >= (attempt.checkedAt ?? 0);

  async function onSavePage() {
    const id = await createPage('blank');
    await updatePage(id, { title: `My answer: ${scenario.title}`, body: `**Task:** ${scenario.task}\n\n${answerToMarkdown(scenario, answers)}\n\n---\n\n## Model answer\n\n${scenario.modelAnswer}` });
    navigate(`/pages/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="label">Your answer</h2>
          <Markdown>{answerToMarkdown(scenario, answers)}</Markdown>
        </section>
        <section className="card border-green-200 bg-green-50/40 p-4">
          <h2 className="label text-green-800">Model answer</h2>
          <Markdown>{scenario.modelAnswer}</Markdown>
        </section>
      </div>
      <section className="card border-amber-200 bg-amber-50/50 p-4">
        <h2 className="label text-amber-800">Common mistakes: did you make any?</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">{scenario.commonMistakes.map((m) => <li key={m}>{m}</li>)}</ul>
      </section>

      <section className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-sm">Automatic check <ScoreBadge value={auto} /></div>
          <div className="text-sm">Self-check <ScoreBadge value={self} /></div>
          <div className="text-sm text-ink-500">Hints used: {attempt.hintsUsed}/3</div>
          <div className="ml-auto flex flex-wrap gap-2">
            {savedThisRun ? <span className="btn bg-green-100 text-green-800">✓ Saved to your progress</span>
              : <button className="btn-primary" onClick={async () => { await completeAttempt(attempt.id, auto, self); setMsg('Saved. Try another task, or retry this one later.'); }}>Mark as done and save scores</button>}
            <button className="btn-subtle border border-ink-300" onClick={onSavePage}>Save as a page</button>
            <button className="btn-subtle border border-ink-300" onClick={() => restartAttempt(attempt.id)}>Try again from scratch</button>
          </div>
        </div>
        {msg && <p className="mt-2 text-sm text-green-700">{msg}</p>}
        {attempt.history.length > 0 && (
          <div className="mt-3 border-t border-ink-300/60 pt-2 text-xs text-ink-500">
            History: {attempt.history.map((h, i) => <span key={i} className="mr-3">{new Date(h.at).toLocaleDateString('en-GB')} · auto {h.autoScore} · self {h.selfScore}</span>)}
          </div>
        )}
      </section>
      <Link to="/practice" className="btn-subtle inline-flex">← All practice tasks</Link>
    </div>
  );
}
