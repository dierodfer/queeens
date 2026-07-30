import { beforeEach, describe, expect, it } from 'vitest';
import { SESSION_KEY, clearSession, loadSession, saveSession, type SavedSession } from './session';

beforeEach(() => {
  localStorage.clear();
});

const sample: SavedSession = {
  size: 2,
  board: [0, 0, 1, 1],
  cells: [1, 0, 0, 1],
  mode: 'classic',
  blindLevel: null,
  boardKey: '2|0,0,1,1',
  boardLabel: '2x2 - abc123',
  boardOrdinal: { index: 0, total: 1 },
  elapsedMs: 4200,
};

describe('load/save round trip', () => {
  it('persists and reloads a session', () => {
    saveSession(sample);
    expect(loadSession()).toEqual(sample);
  });

  it('returns null when nothing is saved', () => {
    expect(loadSession()).toBeNull();
  });

  it('recovers from corrupt storage', () => {
    localStorage.setItem(SESSION_KEY, 'not json');
    expect(loadSession()).toBeNull();
  });
});

describe('clearSession', () => {
  it('removes a saved session', () => {
    saveSession(sample);
    clearSession();
    expect(loadSession()).toBeNull();
  });
});

describe('validation', () => {
  it('rejects a session whose board/cells length does not match size', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...sample, board: [0, 0] }));
    expect(loadSession()).toBeNull();
  });

  it('rejects an unknown mode', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...sample, mode: 'nightmare' }));
    expect(loadSession()).toBeNull();
  });

  it('rejects a missing boardOrdinal', () => {
    const rest: Partial<SavedSession> = { ...sample };
    delete rest.boardOrdinal;
    localStorage.setItem(SESSION_KEY, JSON.stringify(rest));
    expect(loadSession()).toBeNull();
  });

  it('rejects a non-object value', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify('just a string'));
    expect(loadSession()).toBeNull();
  });
});
