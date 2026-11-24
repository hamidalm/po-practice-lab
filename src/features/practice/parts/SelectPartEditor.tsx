import type { SelectPart } from '../../../engine/types';

export default function SelectPartEditor({ part, value, onChange, yourCapacity }: { part: SelectPart; value: unknown; onChange: (v: string[]) => void; yourCapacity?: number }) {
  const sel = Array.isArray(value) ? (value as string[]) : [];
  const total = part.items.filter((i) => sel.includes(i.id)).reduce((s, i) => s + i.points, 0);
  const toggle = (id: string) => onChange(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  const over = yourCapacity !== undefined && total > yourCapacity;
  return (
    <div>
      <table className="w-full text-sm">
        <tbody>
          {part.items.map((i) => (
            <tr key={i.id} className={`cursor-pointer border-b border-ink-300/40 ${sel.includes(i.id) ? 'bg-brand-50' : 'hover:bg-ink-100/50'}`} onClick={() => toggle(i.id)}>
              <td className="w-8 py-1.5 pl-2"><input type="checkbox" checked={sel.includes(i.id)} onChange={() => toggle(i.id)} onClick={(e) => e.stopPropagation()} /></td>
              <td className="py-1.5">{i.label}{i.detail && <span className="ml-2 text-xs text-ink-500">{i.detail}</span>}</td>
              <td className="w-16 py-1.5 pr-2 text-right font-medium">{i.points} pts</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`mt-2 text-sm font-semibold ${over ? 'text-red-700' : 'text-ink-700'}`}>
        Selected: {total} pts{yourCapacity !== undefined && ` / your capacity ${yourCapacity} pts${over ? ': over capacity' : ''}`}
      </p>
    </div>
  );
}
