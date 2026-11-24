import type { ChoicePart } from '../../../engine/types';

export default function ChoicePartEditor({ part, value, onChange }: { part: ChoicePart; value: unknown; onChange: (v: string[]) => void }) {
  const sel = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (id: string) => onChange(part.multi ? (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]) : [id]);
  return (
    <div className="space-y-1.5">
      {part.multi && <p className="text-xs text-ink-500">Select all that apply.</p>}
      {part.options.map((o) => (
        <label key={o.id} className={`flex cursor-pointer items-start gap-2 rounded border p-2 text-sm ${sel.includes(o.id) ? 'border-brand-500 bg-brand-50' : 'border-ink-300/60 hover:bg-ink-100/50'}`}>
          <input type={part.multi ? 'checkbox' : 'radio'} className="mt-0.5" checked={sel.includes(o.id)} onChange={() => toggle(o.id)} name={part.id} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
