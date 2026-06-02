import { beforeEach, describe, expect, it } from 'vitest';
import {
  RANKING_KEY,
  addRankingEntry,
  getRankingEntries,
  loadRankingStore,
  saveRankingStore,
} from './ranking';

beforeEach(() => {
  localStorage.clear();
});

describe('getRankingEntries', () => {
  it('returns an empty array for an unknown board', () => {
    expect(getRankingEntries({}, 'missing')).toEqual([]);
  });
});

describe('addRankingEntry', () => {
  it('sorts ascending and caps at 5 entries', () => {
    let store = {};
    [500, 100, 400, 200, 600, 300].forEach((t, idx) => {
      store = addRankingEntry(store, 'b', t, idx);
    });
    const entries = getRankingEntries(store, 'b');
    expect(entries).toHaveLength(5);
    expect(entries.map((e) => e.timeMs)).toEqual([100, 200, 300, 400, 500]);
  });

  it('does not mutate the input store', () => {
    const store = {};
    const next = addRankingEntry(store, 'b', 100, 0);
    expect(store).toEqual({});
    expect(getRankingEntries(next, 'b')).toHaveLength(1);
  });
});

describe('load/save round trip', () => {
  it('persists and reloads the store', () => {
    const store = addRankingEntry({}, 'b', 123, 1);
    saveRankingStore(store);
    expect(loadRankingStore()).toEqual(store);
  });

  it('returns an empty store when nothing is saved', () => {
    expect(loadRankingStore()).toEqual({});
  });

  it('recovers from corrupt storage', () => {
    localStorage.setItem(RANKING_KEY, 'not json');
    expect(loadRankingStore()).toEqual({});
  });
});
