import type { MatchPart } from '../../../engine/types';

export default function MatchPartEditor({ part, value, onChange }: { part: MatchPart; value: unknown; onChange: (v: Record<string, string>) => void }) {
  const ans = (value && typeof value === 'object' ? value : {}) as Record<string, string>;
  return (
    <table className="w-full text-sm">
      <tbody>
        {part.rows.map((r) => (
          <tr key={r.id} className="border-b border-ink-300/40">
            <td className="py-2 pr-3">{r.label}</td>
            <td className="w-56 py-2">
              <select className="input" value={ans[r.id] ?? ''} onChange={(e) => onChange({ ...ans, [r.id]: e.target.value })}>
                <option value="">Choose…</option>
                {part.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
