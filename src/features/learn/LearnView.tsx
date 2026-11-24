import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { LESSONS, TRACKS, getLesson, scenariosForLesson, type Lesson } from '../../content';
import Markdown from '../../components/Markdown';
import { Difficulty } from '../practice/PracticeList';

const GROUPS: { id: Lesson['group']; name: string }[] = [
  { id: 'Foundations', name: 'Foundations' },
  { id: 'A', name: TRACKS.A.name },
  { id: 'B', name: TRACKS.B.name },
];

async function setRead(id: string, read: boolean) {
  const row = await db.meta.get('lessonsRead');
  const list = new Set((row?.value as string[] | undefined) ?? []);
  if (read) list.add(id);
  else list.delete(id);
  await db.meta.put({ key: 'lessonsRead', value: [...list] });
}

export default function LearnView() {
  const { lessonId } = useParams();
  const read = useLiveQuery(async () => new Set(((await db.meta.get('lessonsRead'))?.value as string[] | undefined) ?? []), [], new Set<string>());
  const lesson = lessonId ? getLesson(lessonId) : undefined;

  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 overflow-auto border-r border-ink-300/60 p-3">
        <Link to="/learn" className="mb-3 block px-2 text-lg font-semibold">Learn</Link>
        <p className="mb-3 px-2 text-xs text-ink-500">{read.size}/{LESSONS.length} lessons read</p>
        {GROUPS.map((g) => (
          <div key={g.id} className="mb-4">
            <p className="px-2 pb-1 text-xs font-semibold uppercase text-ink-500">{g.id === 'Foundations' ? g.name : `Track ${g.id}`}</p>
            {LESSONS.filter((l) => l.group === g.id).map((l) => (
              <Link key={l.id} to={`/learn/${l.id}`}
                className={`flex items-start gap-2 rounded px-2 py-1.5 text-sm ${l.id === lessonId ? 'bg-brand-50 text-brand-700' : 'hover:bg-ink-100'}`}>
                <span className={`mt-0.5 ${read.has(l.id) ? 'text-green-600' : 'text-ink-300'}`}>{read.has(l.id) ? '✓' : '○'}</span>
                <span>{l.title}</span>
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <section className="min-w-0 flex-1 overflow-auto">
        {lesson ? <LessonPage lesson={lesson} isRead={read.has(lesson.id)} /> : <Overview read={read} />}
      </section>
    </div>
  );
}

function Overview({ read }: { read: Set<string> }) {
  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Learning library</h1>
      <p className="mb-6 text-sm text-ink-700">
        Short, practical lessons for an eCommerce Product Owner. Each has a <b>1-minute concept card</b>, a how-to, a worked retail example, a checklist and common mistakes, and links to tasks where you practise it.
        <br />Suggested route: start with Foundations, then alternate one lesson and its practice task.
      </p>
      {GROUPS.map((g) => (
        <div key={g.id} className="mb-6">
          <h2 className="mb-2 font-semibold">{g.name}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {LESSONS.filter((l) => l.group === g.id).map((l) => (
              <Link key={l.id} to={`/learn/${l.id}`} className="card p-3 hover:border-brand-500">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{l.title}</span>
                  {read.has(l.id) && <span className="ml-auto text-xs text-green-700">✓ read</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink-500">{l.conceptCard.replace(/\*\*/g, '')}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LessonPage({ lesson, isRead }: { lesson: Lesson; isRead: boolean }) {
  const tasks = scenariosForLesson(lesson.id);
  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-4 text-3xl font-semibold">{lesson.title}</h1>
      <Markdown className="prose-h2:mt-8 prose-h2:border-b prose-h2:border-ink-300/60 prose-h2:pb-1">{lesson.body}</Markdown>
      <div className="mt-8 rounded-lg border border-brand-100 bg-brand-50/60 p-4">
        <h2 className="mb-2 font-semibold">Practise this</h2>
        {tasks.length ? (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <Link className="font-medium text-brand-700 hover:underline" to={`/practice/${t.id}`}>{t.title}</Link>
                <Difficulty level={t.difficulty} />
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-ink-700">This lesson underpins all tasks. Try any task in the Practice section.</p>}
      </div>
      <button className={`mt-4 ${isRead ? 'btn-subtle border border-ink-300' : 'btn-primary'}`} onClick={() => setRead(lesson.id, !isRead)}>
        {isRead ? '✓ Marked as read (undo)' : 'Mark as read'}
      </button>
    </div>
  );
}
