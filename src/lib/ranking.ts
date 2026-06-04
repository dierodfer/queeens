export type RankingEntry = { timeMs: number; at: number };
export type RankingStore = Record<string, RankingEntry[]>;

export const RANKING_KEY = 'queeens-local-ranking-v1';
export const MAX_RANKING_ITEMS = 5;

export function loadRankingStore(): RankingStore {
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as RankingStore) : {};
  } catch {
    return {};
  }
}

export function saveRankingStore(store: RankingStore): void {
  try {
    localStorage.setItem(RANKING_KEY, JSON.stringify(store));
  } catch {
    // ignore storage write failures
  }
}

/** Returns the stored ranking entries for a board key (empty array if none). */
export function getRankingEntries(store: RankingStore, boardKey: string): RankingEntry[] {
  return Array.isArray(store[boardKey]) ? store[boardKey] : [];
}

/** Inserts a new time into the ranking for a board key, keeping the best N entries. */
export function addRankingEntry(
  store: RankingStore,
  boardKey: string,
  timeMs: number,
  at: number,
): RankingStore {
  const entries = getRankingEntries(store, boardKey).slice();
  entries.push({ timeMs, at });
  entries.sort((a, b) => a.timeMs - b.timeMs);
  return { ...store, [boardKey]: entries.slice(0, MAX_RANKING_ITEMS) };
}
