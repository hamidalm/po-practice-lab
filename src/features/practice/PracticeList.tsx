import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { SCENARIOS, TRACKS, getLesson } from '../../content';
import type { Attempt } from '../../db/types';
import type { Track } from '../../engine/types';

export function Difficulty({ level }: { level: 1 | 2 | 3 }) {
  const label = ['', 'Starter', 'Intermediate', 'Advanced'][level];
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-500" title={`Difficulty: ${label}`}>
      {[1, 2, 3].map((i) => <span key={i} className={`h-2 w-2 rounded-full ${i <= level ? 'bg-brand-500' : 'bg-ink-300/60'}`} />)}
      <span className="ml-1">{label}</span>
    </span>
  );
}

export function ScoreBadge({ value }: { value: number }) {
  const cls = value >= 75 ? 'bg-green-100 text-green-800' : value >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';
  return <span className={`ml-1 rounded px-1.5 py-0.5 text-xs font-bold ${cls}`}>{value}</span>;
}

function Status({ a }: { a?: Attempt }) {
  if (!a || (!Object.keys(a.answers).length && !a.history.length && a.step === 'brief')) return <span className="text-xs text-ink-500">Not started</span>;
  if (a.history.length) {
    const best = a.history.reduce((m, h) => Math.max(m, Math.round((h.autoScore + h.selfScore) / 2)), 0);
    return <span className="text-xs text-green-700">✓ Done {a.history.length}× · best <ScoreBadge value={best} /></span>;
  }
  return <span className="text-xs text-brand-700">In progress · {a.step}</span>;
}

export default function PracticeList() {
  const attempts = useLiveQuery(() => db.attempts.toArray(), []);
  if (!attempts) return null;
  const byId = new Map(attempts.map((a) => [a.id, a]));
  const done = attempts.filter((a) => a.history.length).length;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Practice</h1>
        <p className="text-sm text-ink-700">Realistic tasks from a day in the central digital team. Each one runs in four steps: <b>Brief → Your answer → Check → Compare</b>. {done}/{SCENARIOS.length} done.</p>
      </div>
      {(['A', 'B'] as Track[]).map((t) => (
        <section key={t} className="mb-8">
          <h2 className="mb-3 font-semibold">{TRACKS[t].name}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {SCENARIOS.filter((s) => s.track === t).map((s) => (
              <Link key={s.id} to={`/practice/${s.id}`} className="card block p-4 transition hover:border-brand-500 hover:shadow">
                <div className="mb-1 flex items-center gap-2">
                  <Difficulty level={s.difficulty} />
                  <span className="ml-auto"><Status a={byId.get(s.id)} /></span>
                </div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-1 text-xs text-ink-500">Lesson: {getLesson(s.lessonId)?.title}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.skills.map((k) => <span key={k} className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-700">{k}</span>)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
