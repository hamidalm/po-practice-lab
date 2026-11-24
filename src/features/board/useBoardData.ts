import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../../db/db';
import type { Issue } from '../../db/types';

export function useBoardData() {
  const issues = useLiveQuery(() => db.issues.toArray(), []);
  const links = useLiveQuery(() => db.links.toArray(), []);
  const sprints = useLiveQuery(() => db.sprints.toArray(), []);

  return useMemo(() => {
    if (!issues || !links || !sprints) return null;
    const byId = new Map(issues.map((i) => [i.id, i]));
    const epicOf = new Map<string, Issue>();
    for (const l of links) if (l.type === 'parent' && byId.has(l.fromId)) epicOf.set(l.toId, byId.get(l.fromId)!);
    const epics = issues.filter((i) => i.type === 'epic').sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
    return { issues, links, sprints, byId, epicOf, epics };
  }, [issues, links, sprints]);
}
