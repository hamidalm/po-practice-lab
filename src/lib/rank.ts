export const RANK_STEP = 1000;

/** Move an element within one array (returns a new array). */
export function moveItem<T>(arr: readonly T[], from: number, to: number): T[] {
  const copy = arr.slice();
  if (from < 0 || from >= copy.length) return copy;
  const [item] = copy.splice(from, 1);
  const target = Math.max(0, Math.min(to, copy.length));
  copy.splice(target, 0, item);
  return copy;
}

/**
 * Move an id from one ordered list into another (or within the same list).
 * overIndex = position in the target list where it should land; -1 or out of range = end.
 */
export function moveBetween(
  source: readonly string[],
  target: readonly string[],
  activeId: string,
  overIndex: number,
  sameList: boolean,
): { source: string[]; target: string[] } {
  if (sameList) {
    const from = source.indexOf(activeId);
    const to = overIndex < 0 ? source.length - 1 : overIndex;
    const moved = moveItem(source, from, to);
    return { source: moved, target: moved };
  }
  const nextSource = source.filter((id) => id !== activeId);
  const nextTarget = target.filter((id) => id !== activeId);
  const at = overIndex < 0 || overIndex > nextTarget.length ? nextTarget.length : overIndex;
  nextTarget.splice(at, 0, activeId);
  return { source: nextSource, target: nextTarget };
}

/** Ranks for an ordered list of ids: first gets RANK_STEP, then 2*RANK_STEP, ... */
export function assignRanks(ids: readonly string[]): Map<string, number> {
  return new Map(ids.map((id, i) => [id, (i + 1) * RANK_STEP]));
}

export function nextRank(existing: readonly number[]): number {
  return (existing.length ? Math.max(...existing) : 0) + RANK_STEP;
}

export function sumPoints(items: readonly { storyPoints: number | null }[]): number {
  return items.reduce((s, i) => s + (i.storyPoints ?? 0), 0);
}
