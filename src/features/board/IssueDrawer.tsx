import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useUi } from '../../app/uiStore';
import { useBoardData } from './useBoardData';
import { addComment, addLink, deleteIssue, removeLink, updateIssue } from '../../db/actions';
import { BRANDS, ISSUE_TYPES, PRIORITIES, STATUSES, STORY_POINTS } from '../../db/constants';
import { LINK_LABELS, RELATION_OPTIONS, buildTrace, resolveRelation, validateLink } from '../../lib/links';
import { newId } from '../../lib/id';
import { StatusPill, TypeIcon, formatDateTime } from '../../components/ui';
import type { AcceptanceCriterion, BrandId, Issue, IssueLink, IssueType, Priority, Status } from '../../db/types';

export default function IssueDrawer() {
  const { openIssueId, closeIssue } = useUi();
  const data = useBoardData();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeIssue();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeIssue]);
  if (!openIssueId || !data) return null;
  const issue = data.byId.get(openIssueId);
  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-ink-900/20" onMouseDown={closeIssue}>
      <aside className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <IssueDetail key={issue.id} issue={issue} data={data} />
      </aside>
    </div>
  );
}

type Data = NonNullable<ReturnType<typeof useBoardData>>;

function IssueDetail({ issue, data }: { issue: Issue; data: Data }) {
  const { closeIssue, openIssue } = useUi();
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [labels, setLabels] = useState(issue.labels.join(', '));
  const save = (patch: Partial<Issue>) => updateIssue(issue.id, patch);

  async function onDelete() {
    if (!confirm(`Delete ${issue.key}? Links and comments are deleted too.`)) return;
    closeIssue();
    await deleteIssue(issue.id);
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-ink-300/60 px-5 py-3 text-sm">
        <TypeIcon type={issue.type} />
        <span className="text-ink-500">{issue.key}</span>
        {data.epicOf.get(issue.id) && (
          <button className="text-ink-500 hover:text-brand-600" onClick={() => openIssue(data.epicOf.get(issue.id)!.id)}>
            / {data.epicOf.get(issue.id)!.key}
          </button>
        )}
        <button className="btn-danger ml-auto" onClick={onDelete}>Delete</button>
        <button className="btn-subtle" onClick={closeIssue} aria-label="Close">✕</button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_15rem] overflow-hidden">
        <div className="space-y-6 overflow-auto p-5">
          <input className="input border-transparent px-1 text-xl font-semibold hover:border-ink-300" value={title}
            onChange={(e) => setTitle(e.target.value)} onBlur={() => title.trim() && title !== issue.title && save({ title: title.trim() })} />
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[7rem]" value={description} placeholder="As a… I want… so that…"
              onChange={(e) => setDescription(e.target.value)} onBlur={() => description !== issue.description && save({ description })} />
          </div>
          {issue.type !== 'epic' && issue.type !== 'test' && <AcceptanceCriteria issue={issue} />}
          <Links issue={issue} data={data} />
          {(issue.type === 'epic' || issue.type === 'story' || issue.type === 'bug') && <Traceability issue={issue} data={data} />}
          <Comments issueId={issue.id} />
        </div>
        <div className="space-y-4 overflow-auto border-l border-ink-300/60 bg-ink-100/40 p-4">
          <Field label="Status">
            <select className="input" value={issue.status} onChange={(e) => save({ status: e.target.value as Status })}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select className="input" value={issue.type} onChange={(e) => {
              const type = e.target.value as IssueType;
              save(type === 'epic' ? { type, sprintId: null } : { type });
            }}>
              {Object.entries(ISSUE_TYPES).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className="input" value={issue.priority} onChange={(e) => save({ priority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.arrow} {p.label}</option>)}
            </select>
          </Field>
          {issue.type !== 'epic' && (
            <Field label="Story points">
              <select className="input" value={issue.storyPoints ?? ''} onChange={(e) => save({ storyPoints: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Not estimated</option>
                {STORY_POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          )}
          <Field label="Brand">
            <select className="input" value={issue.brand} onChange={(e) => save({ brand: e.target.value as BrandId })}>
              {Object.entries(BRANDS).map(([id, b]) => <option key={id} value={id}>{b.name}</option>)}
            </select>
          </Field>
          {issue.type !== 'epic' && (
            <Field label="Sprint">
              <select className="input" value={issue.sprintId ?? ''} onChange={(e) => save({ sprintId: e.target.value || null, rank: Date.now() })}>
                <option value="">Backlog</option>
                {data.sprints.filter((s) => s.state !== 'closed').map((s) => <option key={s.id} value={s.id}>{s.name}{s.state === 'active' ? ' (active)' : ''}</option>)}
              </select>
            </Field>
          )}
          <Field label="Labels">
            <input className="input" value={labels} placeholder="comma separated" onChange={(e) => setLabels(e.target.value)}
              onBlur={() => save({ labels: labels.split(',').map((l) => l.trim()).filter(Boolean) })} />
          </Field>
          <p className="text-xs text-ink-500">Created {formatDateTime(issue.createdAt)}<br />Updated {formatDateTime(issue.updatedAt)}</p>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function AcceptanceCriteria({ issue }: { issue: Issue }) {
  const [rows, setRows] = useState<AcceptanceCriterion[]>(issue.acceptanceCriteria);
  const persist = (next: AcceptanceCriterion[]) => { setRows(next); updateIssue(issue.id, { acceptanceCriteria: next }); };
  const edit = (id: string, k: 'given' | 'when' | 'then', v: string) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const commit = () => updateIssue(issue.id, { acceptanceCriteria: rows });

  return (
    <div>
      <label className="label">Acceptance criteria</label>
      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={r.id} className="card space-y-1 p-2">
            <div className="flex items-center text-xs font-semibold text-ink-500">
              AC {idx + 1}
              <button className="btn-danger ml-auto px-1 py-0 text-xs" onClick={() => persist(rows.filter((x) => x.id !== r.id))}>Remove</button>
            </div>
            {(['given', 'when', 'then'] as const).map((k) => (
              <div key={k} className="flex items-start gap-2">
                <span className="w-12 pt-1.5 text-xs font-bold uppercase text-ink-500">{k}</span>
                <textarea rows={1} className="input resize-y" value={r[k]} onChange={(e) => edit(r.id, k, e.target.value)} onBlur={commit} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="btn-subtle mt-1 text-xs" onClick={() => persist([...rows, { id: newId(), given: '', when: '', then: '' }])}>
        + Add Given / When / Then
      </button>
    </div>
  );
}

function Links({ issue, data }: { issue: Issue; data: Data }) {
  const { openIssue } = useUi();
  const [relation, setRelation] = useState(issue.type === 'test' ? 'tests:out' : issue.type === 'epic' ? 'parent:out' : 'parent:in');
  const [targetId, setTargetId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mine = data.links.filter((l) => l.fromId === issue.id || l.toId === issue.id);
  const rel = RELATION_OPTIONS.find((r) => r.value === relation)!;

  async function onAdd() {
    const other = data.byId.get(targetId);
    if (!other) return setError('Pick an issue to link to.');
    const { from, to } = resolveRelation(issue, other, rel.dir);
    const err = validateLink(from, to, rel.type, data.links);
    if (err) return setError(err);
    await addLink(from.id, to.id, rel.type);
    setTargetId('');
    setError(null);
  }

  const describe = (l: IssueLink) => {
    const out = l.fromId === issue.id;
    return { label: LINK_LABELS[l.type][out ? 'out' : 'in'], other: data.byId.get(out ? l.toId : l.fromId) };
  };

  return (
    <div>
      <label className="label">Linked issues</label>
      <ul className="mb-2 space-y-1">
        {mine.map((l) => {
          const { label, other } = describe(l);
          if (!other) return null;
          return (
            <li key={l.id} className="flex items-center gap-2 text-sm">
              <span className="w-28 shrink-0 text-ink-500">{label}</span>
              <TypeIcon type={other.type} />
              <button className="min-w-0 flex-1 truncate text-left hover:text-brand-600" onClick={() => openIssue(other.id)}>
                <span className="mr-1 text-ink-500">{other.key}</span>{other.title}
              </button>
              <StatusPill status={other.status} />
              <button className="btn-danger px-1 py-0 text-xs" onClick={() => removeLink(l.id)} aria-label="Remove link">✕</button>
            </li>
          );
        })}
        {mine.length === 0 && <li className="text-sm text-ink-500">No links yet.</li>}
      </ul>
      <div className="flex gap-2">
        <select className="input w-44" value={relation} onChange={(e) => { setRelation(e.target.value); setError(null); }}>
          {RELATION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select className="input flex-1" value={targetId} onChange={(e) => { setTargetId(e.target.value); setError(null); }}>
          <option value="">Select issue…</option>
          {data.issues.filter((i) => i.id !== issue.id)
            .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))
            .map((i) => <option key={i.id} value={i.id}>{i.key} [{ISSUE_TYPES[i.type].label}] {i.title}</option>)}
        </select>
        <button className="btn-primary" onClick={onAdd}>Link</button>
      </div>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function Traceability({ issue, data }: { issue: Issue; data: Data }) {
  const { openIssue } = useUi();
  const epic = issue.type === 'epic' ? issue : data.epicOf.get(issue.id);
  if (!epic) return null;
  const trace = buildTrace(epic.id, data.issues, data.links);
  const Item = ({ i, depth }: { i: Issue; depth: number }) => (
    <button onClick={() => openIssue(i.id)} style={{ paddingLeft: depth * 20 }}
      className={`flex w-full items-center gap-2 py-0.5 text-left text-sm hover:text-brand-600 ${i.id === issue.id ? 'font-semibold' : ''}`}>
      <TypeIcon type={i.type} /><span className="text-ink-500">{i.key}</span><span className="truncate">{i.title}</span>
    </button>
  );
  return (
    <div>
      <label className="label">Traceability: epic → stories → test cases</label>
      <div className="card p-2">
        <Item i={epic} depth={0} />
        {trace.map((n) => (
          <div key={n.issue.id}>
            <Item i={n.issue} depth={1} />
            {n.tests.map((t) => <Item key={t.id} i={t} depth={2} />)}
            {n.tests.length === 0 && n.issue.type !== 'task' && <p className="py-0.5 text-xs text-amber-700" style={{ paddingLeft: 40 }}>No test case linked</p>}
          </div>
        ))}
        {trace.length === 0 && <p className="text-sm text-ink-500">No child issues.</p>}
      </div>
    </div>
  );
}

function Comments({ issueId }: { issueId: string }) {
  const comments = useLiveQuery(() => db.comments.where('issueId').equals(issueId).sortBy('createdAt'), [issueId], []);
  const [body, setBody] = useState('');
  return (
    <div>
      <label className="label">Comments</label>
      <ul className="mb-2 space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="text-sm">
            <div className="text-xs text-ink-500"><span className="font-semibold text-ink-700">{c.author}</span> · {formatDateTime(c.createdAt)}</div>
            <p className="whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
      </ul>
      <textarea className="input" rows={2} placeholder="Add a comment…" value={body} onChange={(e) => setBody(e.target.value)} />
      <button className="btn-primary mt-1" disabled={!body.trim()} onClick={async () => { await addComment(issueId, body.trim()); setBody(''); }}>Save</button>
    </div>
  );
}
