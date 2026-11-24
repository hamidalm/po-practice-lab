import type { Finding } from '../engine/types';

const STYLE = {
  ok: { icon: '✓', cls: 'text-green-700' },
  warn: { icon: '!', cls: 'text-amber-700' },
  error: { icon: '✗', cls: 'text-red-700' },
};

export default function Findings({ items, compact = false }: { items: Finding[]; compact?: boolean }) {
  if (!items.length) return null;
  return (
    <ul className={`space-y-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      {items.map((f, i) => (
        <li key={i} className={`flex gap-2 ${STYLE[f.level].cls}`}>
          <span className="w-3 shrink-0 text-center font-bold">{STYLE[f.level].icon}</span>
          <span className="text-ink-700">{f.text}</span>
        </li>
      ))}
    </ul>
  );
}
