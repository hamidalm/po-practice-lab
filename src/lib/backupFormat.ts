import { TABLES, type TableName } from '../db/db';

export const BACKUP_APP = 'po-practice-lab';
export const BACKUP_SCHEMA = 1;

export interface Backup {
  app: typeof BACKUP_APP;
  schemaVersion: number;
  exportedAt: string;
  data: Record<TableName, unknown[]>;
}

/** Validates an imported backup. Throws with a readable message when invalid. */
export function parseBackup(raw: unknown): Backup {
  if (!raw || typeof raw !== 'object') throw new Error('File is not a JSON object.');
  const b = raw as Partial<Backup>;
  if (b.app !== BACKUP_APP) throw new Error('This file is not a PO Practice Lab export.');
  if (typeof b.schemaVersion !== 'number' || b.schemaVersion > BACKUP_SCHEMA)
    throw new Error(`Unsupported export version: ${String(b.schemaVersion)}.`);
  if (!b.data || typeof b.data !== 'object') throw new Error('Export has no data section.');
  for (const t of TABLES) {
    const rows = (b.data as Record<string, unknown>)[t];
    if (rows !== undefined && !Array.isArray(rows)) throw new Error(`"${t}" must be a list.`);
  }
  const data = Object.fromEntries(TABLES.map((t) => [t, ((b.data as Record<string, unknown[]>)[t] ?? [])])) as Record<
    TableName,
    unknown[]
  >;
  return { app: BACKUP_APP, schemaVersion: b.schemaVersion, exportedAt: String(b.exportedAt ?? ''), data };
}
