import { describe, expect, it } from 'vitest';
import { assignRanks, moveBetween, moveItem, nextRank, sumPoints } from './rank';

describe('moveItem', () => {
  it('moves down and up', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
  });
  it('ignores invalid source index and clamps target', () => {
    expect(moveItem(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b', 'c'], 0, 99)).toEqual(['b', 'c', 'a']);
  });
});

describe('moveBetween', () => {
  it('reorders within the same list', () => {
    const r = moveBetween(['a', 'b', 'c'], ['a', 'b', 'c'], 'c', 0, true);
    expect(r.target).toEqual(['c', 'a', 'b']);
  });
  it('moves from backlog into a sprint at a position', () => {
    const r = moveBetween(['x', 'y'], ['a', 'b'], 'y', 1, false);
    expect(r.source).toEqual(['x']);
    expect(r.target).toEqual(['a', 'y', 'b']);
  });
  it('appends to the end of an empty or unknown position', () => {
    expect(moveBetween(['x'], [], 'x', -1, false).target).toEqual(['x']);
    expect(moveBetween(['x'], ['a'], 'x', 10, false).target).toEqual(['a', 'x']);
  });
});

describe('ranks and points', () => {
  it('assigns increasing ranks in order', () => {
    expect([...assignRanks(['a', 'b', 'c']).values()]).toEqual([1000, 2000, 3000]);
  });
  it('next rank goes after the last', () => {
    expect(nextRank([])).toBe(1000);
    expect(nextRank([1000, 5000, 3000])).toBe(6000);
  });
  it('sums points and treats unestimated as 0', () => {
    expect(sumPoints([{ storyPoints: 5 }, { storyPoints: null }, { storyPoints: 3 }])).toBe(8);
  });
});
