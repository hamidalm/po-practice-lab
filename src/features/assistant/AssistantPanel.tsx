import { useUi } from '../../app/uiStore';

export default function AssistantPanel() {
  const { toggleAssistant } = useUi();
  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-ink-300/60 bg-gradient-to-b from-brand-50/60 to-white">
      <div className="flex items-center border-b border-ink-300/60 px-4 py-3">
        <span className="mr-2 text-brand-600">✦</span>
        <h2 className="font-semibold">Coach</h2>
        <button className="btn-subtle ml-auto px-2 py-0.5" onClick={toggleAssistant} aria-label="Close coach">✕</button>
      </div>
      <div className="space-y-3 p-4 text-sm text-ink-700">
        <div className="card p-3">
          <p className="font-medium">No active task</p>
          <p className="mt-1 text-ink-500">When you start a practice task, its concept card, hints and rubric appear here.</p>
        </div>
        <p className="text-xs text-ink-500">Offline mode · no AI calls</p>
      </div>
    </aside>
  );
}
