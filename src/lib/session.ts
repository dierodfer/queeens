import type { BlindLevel, GameMode } from '../i18n';
import type { CellState } from './game';

export type SavedSession = {
  size: number;
  board: number[];
  cells: CellState[];
  mode: GameMode;
  blindLevel: BlindLevel | null;
  boardKey: string;
  boardLabel: string;
  boardOrdinal: { index: number; total: number };
  elapsedMs: number;
};

export const SESSION_KEY = 'queeens-session-v1';

const MODES: GameMode[] = ['classic', 'twister', 'blind'];

function isValidSession(value: unknown): value is SavedSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  if (typeof s.size !== 'number' || s.size <= 0) return false;

  const cellCount = s.size * s.size;
  if (!Array.isArray(s.board) || s.board.length !== cellCount) return false;
  if (!Array.isArray(s.cells) || s.cells.length !== cellCount) return false;
  if (!MODES.includes(s.mode as GameMode)) return false;
  if (typeof s.boardKey !== 'string' || !s.boardKey) return false;
  if (typeof s.boardLabel !== 'string') return false;
  if (typeof s.elapsedMs !== 'number' || s.elapsedMs < 0) return false;

  const ordinal = s.boardOrdinal as Record<string, unknown> | null;
  return !!ordinal && typeof ordinal.index === 'number' && typeof ordinal.total === 'number';
}

/** Loads the in-progress round saved by `saveSession`, or null if there is none (or it's invalid). */
export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Persists the in-progress round so it can be offered for resume after a reload. */
export function saveSession(session: SavedSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage write failures
  }
}

/** Clears any saved in-progress round (called on win, or when the player leaves the round). */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage write failures
  }
}
