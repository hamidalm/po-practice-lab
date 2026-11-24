import { db, TABLES } from './db';
import { BACKUP_APP, BACKUP_SCHEMA, parseBackup, type Backup } from '../lib/backupFormat';

export async function exportAll(): Promise<Backup> {
  const entries = await Promise.all(TABLES.map(async (t) => [t, await db.table(t).toArray()] as const));
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(entries) as Backup['data'],
  };
}

export function downloadJson(obj: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Replaces everything in the local database with the backup's contents. */
export async function importAll(raw: unknown) {
  const backup = parseBackup(raw);
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear();
      await db.table(t).bulkAdd(backup.data[t]);
    }
  });
}
