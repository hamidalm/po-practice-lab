import { describe, expect, it } from 'vitest';
import { parseBackup } from './backupFormat';

describe('parseBackup', () => {
  it('accepts a valid export and fills missing tables', () => {
    const b = parseBackup({ app: 'po-practice-lab', schemaVersion: 1, exportedAt: 'x', data: { issues: [{ id: 'a' }] } });
    expect(b.data.issues).toHaveLength(1);
    expect(b.data.pages).toEqual([]);
  });
  it('rejects other files and newer versions', () => {
    expect(() => parseBackup({ app: 'other' })).toThrow(/not a PO Practice Lab/);
    expect(() => parseBackup({ app: 'po-practice-lab', schemaVersion: 99, data: {} })).toThrow(/Unsupported/);
    expect(() => parseBackup({ app: 'po-practice-lab', schemaVersion: 1, data: { issues: 'x' } })).toThrow(/must be a list/);
  });
});
