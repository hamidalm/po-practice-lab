import type { NumberPart } from '../../../engine/types';

export default function NumberPartEditor({ part, value, onChange }: { part: NumberPart; value: unknown; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="number" className="input w-32" value={typeof value === 'string' || typeof value === 'number' ? value : ''} onChange={(e) => onChange(e.target.value)} />
      {part.unit && <span className="text-ink-500">{part.unit}</span>}
    </label>
  );
}
