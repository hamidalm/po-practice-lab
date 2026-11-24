import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../../db/db';
import { createPage, deletePage, updatePage } from '../../db/actions';
import { PAGE_TEMPLATES } from './templates';
import { formatDateTime } from '../../components/ui';
import type { Page, PageTemplate } from '../../db/types';

export default function PagesView() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const pages = useLiveQuery(() => db.pages.orderBy('updatedAt').reverse().toArray(), []);
  const [menu, setMenu] = useState(false);
  if (!pages) return null;
  const current = pages.find((p) => p.id === pageId);

  async function onNew(t: PageTemplate) {
    setMenu(false);
    const id = await createPage(t);
    navigate(`/pages/${id}`);
  }

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 overflow-auto border-r border-ink-300/60 p-3">
        <div className="relative mb-3">
          <button className="btn-primary w-full justify-center" onClick={() => setMenu((m) => !m)}>+ New page</button>
          {menu && (
            <div className="card absolute z-10 mt-1 w-full py-1">
              {(Object.keys(PAGE_TEMPLATES) as PageTemplate[]).map((t) => (
                <button key={t} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-ink-100" onClick={() => onNew(t)}>
                  {PAGE_TEMPLATES[t].label}
                </button>
              ))}
            </div>
          )}
        </div>
        <ul className="space-y-0.5">
          {pages.map((p) => (
            <li key={p.id}>
              <button onClick={() => navigate(`/pages/${p.id}`)}
                className={`w-full rounded px-2 py-1.5 text-left text-sm ${p.id === pageId ? 'bg-brand-50 text-brand-700' : 'hover:bg-ink-100'}`}>
                <div className="truncate">{p.title}</div>
                <div className="text-[11px] text-ink-500">{PAGE_TEMPLATES[p.template].label}</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="min-w-0 flex-1 overflow-auto">
        {current ? <Editor key={current.id} page={current} onDeleted={() => navigate('/pages')} /> : (
          <div className="p-8 text-ink-500">Select a page or create one from a template.</div>
        )}
      </section>
    </div>
  );
}

function Editor({ page, onDeleted }: { page: Page; onDeleted: () => void }) {
  const [title, setTitle] = useState(page.title);
  const [body, setBody] = useState(page.body);
  const [mode, setMode] = useState<'edit' | 'preview'>(page.body && page.updatedAt !== page.createdAt ? 'preview' : 'edit');
  const [saved, setSaved] = useState(true);
  const timer = useRef<number>();

  useEffect(() => {
    if (title === page.title && body === page.body) return;
    setSaved(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      await updatePage(page.id, { title, body });
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  async function onDelete() {
    if (!confirm(`Delete "${page.title}"?`)) return;
    await deletePage(page.id);
    onDeleted();
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-2 flex items-center gap-2 text-xs text-ink-500">
        <span className="rounded bg-ink-100 px-1.5 py-0.5">{PAGE_TEMPLATES[page.template].label}</span>
        <span>{saved ? `Saved · ${formatDateTime(page.updatedAt)}` : 'Saving…'}</span>
        <div className="ml-auto flex rounded border border-ink-300">
          {(['edit', 'preview'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 capitalize ${mode === m ? 'bg-brand-500 text-white' : 'hover:bg-ink-100'}`}>{m}</button>
          ))}
        </div>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
      <input className="mb-4 w-full border-0 px-0 text-3xl font-semibold focus:outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
      {mode === 'edit' ? (
        <>
          <textarea className="input min-h-[60vh] font-mono text-[13px] leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
          <p className="mt-1 text-xs text-ink-500">Markdown: ## heading, - list, | table |, **bold**, - [ ] checkbox</p>
        </>
      ) : (
        <article className="prose prose-sm max-w-none prose-table:text-sm prose-th:bg-ink-100 prose-th:px-2 prose-td:px-2 prose-td:border prose-th:border prose-td:border-ink-300 prose-th:border-ink-300"
          onDoubleClick={() => setMode('edit')}>
          {body.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown> : <p className="text-ink-500">Empty page. Double-click to edit.</p>}
        </article>
      )}
    </div>
  );
}
