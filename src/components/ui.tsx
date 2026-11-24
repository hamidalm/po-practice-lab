import type { ReactNode } from 'react';
import { ISSUE_TYPES, PRIORITIES, STATUSES } from '../db/constants';
import type { IssueType, Priority, Status } from '../db/types';

export function TypeIcon({ type }: { type: IssueType }) {
  const t = ISSUE_TYPES[type];
  return (
    <span title={t.label} className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded-sm text-[10px] font-bold text-white ${t.color}`}>
      {t.letter}
    </span>
  );
}

export function PriorityIcon({ priority }: { priority: Priority }) {
  const p = PRIORITIES.find((x) => x.id === priority)!;
  return <span title={`Priority: ${p.label}`} className={`w-4 text-center text-sm font-bold ${p.color}`}>{p.arrow}</span>;
}

const STATUS_STYLE: Record<Status, string> = {
  todo: 'bg-ink-100 text-ink-700',
  inprogress: 'bg-brand-50 text-brand-700',
  inreview: 'bg-amber-100 text-amber-800',
  done: 'bg-green-100 text-green-800',
};
export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${STATUS_STYLE[status]}`}>
      {STATUSES.find((s) => s.id === status)!.label}
    </span>
  );
}

export function Points({ value }: { value: number | null }) {
  return (
    <span title="Story points" className="min-w-[1.5rem] rounded-full bg-ink-100 px-1.5 text-center text-xs text-ink-700">
      {value ?? '–'}
    </span>
  );
}

export function EpicChip({ title }: { title: string }) {
  return <span className="block max-w-full truncate sm:max-w-[12rem] rounded bg-purple-100 px-1.5 py-0.5 text-[11px] font-medium text-purple-800">{title}</span>;
}

export function Modal({ title, onClose, children, width = 'max-w-lg' }: { title: string; onClose: () => void; children: ReactNode; width?: string }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink-900/40 p-4" onMouseDown={onClose}>
      <div className={`card w-full ${width} p-5`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn-subtle" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function formatDate(t: number | string) {
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
export function formatDateTime(t: number) {
  return new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
