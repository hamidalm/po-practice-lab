import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { downloadJson, exportAll, importAll } from '../../db/backup';
import { resetWorkspace } from '../../db/seed';
import { getSettings } from '../../db/actions';

export default function SettingsView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const settings = useLiveQuery(() => getSettings(), []);

  async function onExport() {
    const backup = await exportAll();
    downloadJson(backup, `po-practice-lab-${new Date().toISOString().slice(0, 10)}.json`);
    setMsg({ ok: true, text: 'Export downloaded.' });
  }

  async function onImport(file: File) {
    try {
      const json = JSON.parse(await file.text());
      if (!confirm('Importing replaces everything in this browser. Continue?')) return;
      await importAll(json);
      setMsg({ ok: true, text: 'Import complete.' });
    } catch (e) {
      setMsg({ ok: false, text: `Import failed: ${(e as Error).message}` });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function onReset() {
    if (!confirm('Reset the workspace to the demo data? Your issues, pages and progress in this browser are deleted. Export first if you want to keep them.')) return;
    await resetWorkspace();
    setMsg({ ok: true, text: 'Workspace reset to demo data.' });
  }

  return (
    <div className="max-w-2xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      {msg && <p className={`rounded p-2 text-sm ${msg.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{msg.text}</p>}

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-ink-700">Everything is stored in this browser (IndexedDB). Export regularly to keep a copy.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={onExport}>Export JSON</button>
          <button className="btn-subtle border border-ink-300" onClick={() => fileRef.current?.click()}>Import JSON…</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          <button className="btn-danger ml-auto border border-red-200" onClick={onReset}>Reset workspace</button>
        </div>
      </section>

      <section className="card space-y-2 p-4">
        <h2 className="font-semibold">AI and budget</h2>
        <p className="text-sm text-ink-500">Becomes editable in Phase 3, when the local AI proxy is added.</p>
        {settings && (
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-ink-500">Mode</dt><dd>{settings.offlineMode ? 'Offline (no AI calls)' : 'AI enabled'}</dd>
            <dt className="text-ink-500">Daily budget</dt><dd>€{settings.dailyBudget.toFixed(2)}</dd>
          </dl>
        )}
      </section>
    </div>
  );
}
