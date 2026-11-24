import type { BrandId, IssueType, Priority, Status, AppSettings } from './types';

export const BRANDS: Record<BrandId, { name: string; market: string }> = {
  group: { name: 'HB Retail Group', market: 'All markets' },
  cc: { name: 'Chemist & Co', market: 'UK drugstore' },
  dp: { name: 'Drogisterij Prijs', market: 'Benelux discount drugstore' },
  mp: { name: 'Maison Parfum', market: 'Prestige perfumery' },
};

export const STATUSES: { id: Status; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'inprogress', label: 'In progress' },
  { id: 'inreview', label: 'In review' },
  { id: 'done', label: 'Done' },
];

export const ISSUE_TYPES: Record<IssueType, { label: string; letter: string; color: string }> = {
  epic: { label: 'Epic', letter: 'E', color: 'bg-purple-600' },
  story: { label: 'Story', letter: 'S', color: 'bg-green-600' },
  bug: { label: 'Bug', letter: 'B', color: 'bg-red-600' },
  task: { label: 'Task', letter: 'T', color: 'bg-sky-600' },
  test: { label: 'Test case', letter: 'Q', color: 'bg-teal-600' },
};

export const PRIORITIES: { id: Priority; label: string; color: string; arrow: string }[] = [
  { id: 'highest', label: 'Highest', color: 'text-red-700', arrow: '⇈' },
  { id: 'high', label: 'High', color: 'text-red-500', arrow: '↑' },
  { id: 'medium', label: 'Medium', color: 'text-amber-500', arrow: '=' },
  { id: 'low', label: 'Low', color: 'text-sky-600', arrow: '↓' },
  { id: 'lowest', label: 'Lowest', color: 'text-sky-800', arrow: '⇊' },
];

export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];

export const DEFAULT_SETTINGS: AppSettings = { currency: 'EUR', dailyBudget: 0.5, offlineMode: true };

export const ME = 'You (PO)';
