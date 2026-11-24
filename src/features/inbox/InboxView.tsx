import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { setMessageRead } from '../../db/actions';
import { formatDateTime } from '../../components/ui';
import { Link } from 'react-router-dom';
import { getScenario } from '../../content';

export default function InboxView() {
  const { messageId } = useParams();
  const navigate = useNavigate();
  const messages = useLiveQuery(() => db.inbox.orderBy('receivedAt').reverse().toArray(), []);
  const current = messages?.find((m) => m.id === messageId);

  useEffect(() => {
    if (current && !current.read) setMessageRead(current.id, true);
  }, [current]);

  if (!messages) return null;
  return (
    <div className="flex h-full">
      <aside className="w-80 shrink-0 overflow-auto border-r border-ink-300/60">
        <h1 className="border-b border-ink-300/60 px-4 py-3 text-lg font-semibold">Inbox</h1>
        <ul>
          {messages.map((m) => (
            <li key={m.id}>
              <button onClick={() => navigate(`/inbox/${m.id}`)}
                className={`block w-full border-b border-ink-300/40 px-4 py-3 text-left ${m.id === messageId ? 'bg-brand-50' : 'hover:bg-ink-100'}`}>
                <div className="flex items-center gap-2 text-sm">
                  {!m.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                  <span className={m.read ? '' : 'font-semibold'}>{m.fromName}</span>
                  <span className="ml-auto text-xs text-ink-500">{formatDateTime(m.receivedAt)}</span>
                </div>
                <div className={`truncate text-sm ${m.read ? 'text-ink-700' : 'font-semibold'}`}>{m.subject}</div>
                <div className="truncate text-xs text-ink-500">{m.fromRole}</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="min-w-0 flex-1 overflow-auto p-8">
        {current ? (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold">{current.subject}</h2>
            <div className="mb-4 mt-1 flex items-center gap-2 text-sm text-ink-500">
              <span className="font-medium text-ink-700">{current.fromName}</span> · {current.fromRole} · {formatDateTime(current.receivedAt)}
              <button className="btn-subtle ml-auto text-xs" onClick={() => setMessageRead(current.id, false)}>Mark unread</button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{current.body}</p>
            {current.linkedScenarioId && getScenario(current.linkedScenarioId) ? (
              <div className="mt-6 flex items-center gap-3 rounded border border-brand-100 bg-brand-50/60 p-3 text-sm">
                <span>This message starts a practice task: <b>{getScenario(current.linkedScenarioId)!.title}</b></span>
                <Link className="btn-primary ml-auto" to={`/practice/${current.linkedScenarioId}`}>Start task →</Link>
              </div>
            ) : (
              <div className="mt-6 rounded border border-dashed border-ink-300 p-3 text-sm text-ink-500">No practice task linked to this message.</div>
            )}
          </div>
        ) : (
          <p className="text-ink-500">Select a message.</p>
        )}
      </section>
    </div>
  );
}
