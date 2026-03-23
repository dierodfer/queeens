import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { tableros } from '../data/boards';
import { I18N, type BlindLevel, type GameMode, type Lang } from '../i18n';
import queeensImage from '../assets/queeens-image.png';

type CellState = 0 | 1 | 2;
type RankingEntry = { timeMs: number; at: number };
type RankingStore = Record<string, RankingEntry[]>;
type RotationDirection = 'left' | 'right';
type PendingRotation = { direction: RotationDirection; runId: number } | null;
type BlindConfig = { baseSeconds: number; stepSeconds: number; replaySeconds: number };

const COLORS = [
  '#77DD77', '#AEC6CF', '#F6D7A7', '#FFB7B2', '#B39EB5',
  '#FF6961', '#FFD1DC', '#CFCFC4', '#C1E1C1', '#F7CAC9',
  '#F4A259', '#7BC8A4', '#89A7FF', '#D7A9E3', '#F0E68C',
  '#9AD1D4',
];
const EMPTY: CellState = 0;
const QUEEN: CellState = 1;
const MARK: CellState = 2;
const RANKING_KEY = 'queeens-local-ranking-v1';
const MAX_RANKING_ITEMS = 5;
const TORNADO_BIAS = 0.65;
const ROTATION_ANIM_MS = 900;
const ROTATION_SWAP_MS = 16;

const MODE_LABEL_KEYS: Record<GameMode, string> = {
  classic: 'mode.classic.label',
  twister: 'mode.twister.label',
  blind: 'mode.blind.label',
};

const MODE_RULE_KEYS: Record<GameMode, string[]> = {
  classic: ['mode.classic.rule.1', 'mode.classic.rule.2', 'mode.classic.rule.3'],
  twister: ['mode.twister.rule.1', 'mode.twister.rule.2', 'mode.twister.rule.3', 'mode.twister.rule.4'],
  blind: ['mode.blind.rule.1', 'mode.blind.rule.2'],
};

const BLIND_LEVEL_LABEL_KEYS: Record<BlindLevel, string> = {
  easy: 'blind.level.easy',
  medium: 'blind.level.medium',
  hard: 'blind.level.hard',
};

const BLIND_META: Record<BlindLevel, BlindConfig> = {
  easy: { baseSeconds: 20, stepSeconds: 10, replaySeconds: 15 },
  medium: { baseSeconds: 15, stepSeconds: 7, replaySeconds: 10 },
  hard: { baseSeconds: 5, stepSeconds: 5, replaySeconds: 5 },
};

function oppositeDirection(direction: RotationDirection): RotationDirection {
  return direction === 'right' ? 'left' : 'right';
}

function getBlindPreviewMs(level: BlindLevel, boardSize: number): number {
  const cfg = BLIND_META[level];
  const stepCount = Math.max(0, boardSize - 4);
  return (cfg.baseSeconds + stepCount * cfg.stepSeconds) * 1000;
}

function getBlindReplayMs(level: BlindLevel): number {
  return BLIND_META[level].replaySeconds * 1000;
}

const fmt = (ms: number): string => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  const milli = String(Math.max(0, ms % 1000)).padStart(3, '0');
  return `${m}:${s}.${milli}`;
};

const fmtClock = (ms: number): string => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return `${m}:${s}`;
};

function parseVersionFromYaml(content: string): string {
  const match = content.match(/^\s*version\s*:\s*(.+)\s*$/m);
  if (!match) return '--';
  const raw = match[1].trim();
  const unquoted = raw.replace(/^['"]|['"]$/g, '');
  return unquoted || '--';
}

function shortHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}

function loadRankingStore(): RankingStore {
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as RankingStore) : {};
  } catch {
    return {};
  }
}

function saveRankingStore(store: RankingStore): void {
  try {
    localStorage.setItem(RANKING_KEY, JSON.stringify(store));
  } catch {
    // ignore storage write failures
  }
}

function getConflicts(cells: CellState[], board: number[], size: number): Set<number> {
  const qs: number[] = [];
  cells.forEach((s, i) => {
    if (s === QUEEN) qs.push(i);
  });

  const conflicts = new Set<number>();
  for (let a = 0; a < qs.length; a++) {
    const ax = qs[a] % size;
    const ay = (qs[a] / size) | 0;
    for (let b = a + 1; b < qs.length; b++) {
      const bx = qs[b] % size;
      const by = (qs[b] / size) | 0;
      if (
        ax === bx ||
        ay === by ||
        (Math.abs(ax - bx) === 1 && Math.abs(ay - by) === 1) ||
        board[qs[a]] === board[qs[b]]
      ) {
        conflicts.add(qs[a]);
        conflicts.add(qs[b]);
      }
    }
  }
  return conflicts;
}

function getAttacked(cells: CellState[], board: number[], size: number): Set<number> {
  const set = new Set<number>();
  cells.forEach((s, i) => {
    if (s !== QUEEN) return;
    const x = i % size;
    const y = (i / size) | 0;
    const region = board[i];
    for (let k = 0; k < size; k++) {
      set.add(y * size + k);
      set.add(k * size + x);
    }
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ].forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) set.add(ny * size + nx);
    });

    // Also block every cell in the same color region.
    board.forEach((cellRegion, ci) => {
      if (cellRegion === region) set.add(ci);
    });
  });
  return set;
}

function getAttackedByOneQueen(qi: number, board: number[], size: number): Set<number> {
  const set = new Set<number>();
  const qx = qi % size;
  const qy = (qi / size) | 0;
  const region = board[qi];
  for (let k = 0; k < size; k++) {
    set.add(qy * size + k);
    set.add(k * size + qx);
  }
  [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ].forEach(([dx, dy]) => {
    const nx = qx + dx;
    const ny = qy + dy;
    if (nx >= 0 && nx < size && ny >= 0 && ny < size) set.add(ny * size + nx);
  });
  board.forEach((cellRegion, ci) => {
    if (cellRegion === region) set.add(ci);
  });
  set.delete(qi);
  return set;
}

function rotateFlat<T>(flat: T[], size: number, direction: RotationDirection): T[] {
  const out = new Array<T>(flat.length);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const source = y * size + x;
      let nx = 0;
      let ny = 0;
      if (direction === 'right') {
        nx = size - 1 - y;
        ny = x;
      } else {
        nx = y;
        ny = size - 1 - x;
      }
      out[ny * size + nx] = flat[source];
    }
  }
  return out;
}

let lastBoard: number[][] | null = null;
function pickBoard(n: number): number[] {
  const opts = tableros[n];
  let b: number[][];
  do {
    b = opts[(Math.random() * opts.length) | 0];
  } while (opts.length > 1 && b === lastBoard);
  lastBoard = b;
  return b.flat();
}

export default function Queeens() {
  const LEVEL_OPTIONS = [4, 5, 6, 7, 8, 10, 12, 14];
  const [lang, setLang] = useState<Lang>('en');
  const [size, setSize] = useState<number | null>(null);
  const [board, setBoard] = useState<number[]>([]);
  const [cells, setCells] = useState<CellState[]>([]);
  const [won, setWon] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [showWin, setShowWin] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [boardKey, setBoardKey] = useState('');
  const [boardLabel, setBoardLabel] = useState('');
  const [version, setVersion] = useState('--');
  const [lastPlacedQueen, setLastPlacedQueen] = useState<number | null>(null);
  const [mode, setMode] = useState<GameMode | null>('classic');
  const [blindLevel, setBlindLevel] = useState<BlindLevel | null>(null);
  const [blindPreviewUntil, setBlindPreviewUntil] = useState<number | null>(null);
  const [blindPreviewActive, setBlindPreviewActive] = useState(false);
  const [favoredRotation, setFavoredRotation] = useState<RotationDirection>('right');
  const [marksSinceRotation, setMarksSinceRotation] = useState(0);
  const [lastAddTimestamp, setLastAddTimestamp] = useState<number>(Date.now());
  const [rotationFx, setRotationFx] = useState<PendingRotation>(null);
  const [blindTick, setBlindTick] = useState(0);

  const rotationRunRef = useRef(0);
  const rotationSwapTimerRef = useRef<number | null>(null);
  const rotationEndTimerRef = useRef<number | null>(null);
  const blindPreviewTimerRef = useRef<number | null>(null);
  const blindTickRef = useRef<number | null>(null);
  const clearQueensOnBlindPreviewEndRef = useRef(false);

  const startedAt = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.yml`, { cache: 'no-store' })
      .then((r) => r.text())
      .then((text) => setVersion(parseVersionFromYaml(text)))
      .catch(() => {});
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    startedAt.current = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 250);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (rotationSwapTimerRef.current !== null) window.clearTimeout(rotationSwapTimerRef.current);
      if (rotationEndTimerRef.current !== null) window.clearTimeout(rotationEndTimerRef.current);
      if (blindPreviewTimerRef.current !== null) window.clearTimeout(blindPreviewTimerRef.current);
      if (blindTickRef.current !== null) window.clearInterval(blindTickRef.current);
    },
    [],
  );

  const stopBlindPreview = useCallback(() => {
    const shouldClearQueens = blindPreviewActive && clearQueensOnBlindPreviewEndRef.current;
    clearQueensOnBlindPreviewEndRef.current = false;
    if (blindPreviewTimerRef.current !== null) window.clearTimeout(blindPreviewTimerRef.current);
    if (blindTickRef.current !== null) window.clearInterval(blindTickRef.current);
    setBlindPreviewActive(false);
    setBlindPreviewUntil(null);
    if (shouldClearQueens) {
      setCells((prev) => prev.map((cell) => (cell === QUEEN ? EMPTY : cell)) as CellState[]);
      setLastPlacedQueen(null);
      setLastAddTimestamp(Date.now());
    }
  }, [blindPreviewActive]);

  const beginBlindPreview = useCallback((ms: number) => {
    stopBlindPreview();
    setBlindPreviewActive(true);
    setBlindPreviewUntil(Date.now() + ms);
    blindTickRef.current = window.setInterval(() => setBlindTick((v) => v + 1), 250);
    blindPreviewTimerRef.current = window.setTimeout(() => {
      stopBlindPreview();
    }, ms);
  }, [stopBlindPreview]);

  const startGame = useCallback(
    (n: number) => {
      clearQueensOnBlindPreviewEndRef.current = false;
      const b = pickBoard(n);
      const sig = b.join(',');
      setSize(n);
      setBoard(b);
      setCells(new Array(n * n).fill(EMPTY));
      setWon(false);
      setShowMenu(false);
      setShowWin(false);
      setShowExitConfirm(false);
      setLastPlacedQueen(null);
      setMarksSinceRotation(0);
      setLastAddTimestamp(Date.now());
      setRotationFx(null);
      stopBlindPreview();
      if (rotationSwapTimerRef.current !== null) window.clearTimeout(rotationSwapTimerRef.current);
      if (rotationEndTimerRef.current !== null) window.clearTimeout(rotationEndTimerRef.current);
      setFavoredRotation(Math.random() < 0.5 ? 'right' : 'left');
      setBoardKey(`${n}|${sig}`);
      setBoardLabel(`${n}x${n} - ${shortHash(sig)}`);

      if (mode === 'blind' && blindLevel) {
        beginBlindPreview(getBlindPreviewMs(blindLevel, n));
      }

      startTimer();
    },
    [startTimer, mode, blindLevel, beginBlindPreview, stopBlindPreview],
  );

  const startRound = useCallback(() => {
    if (!size || !board.length) return;
    clearQueensOnBlindPreviewEndRef.current = false;
    setCells(new Array(size * size).fill(EMPTY));
    setWon(false);
    setShowWin(false);
    setLastPlacedQueen(null);
    setMarksSinceRotation(0);
    setLastAddTimestamp(Date.now());
    setRotationFx(null);
    stopBlindPreview();
    if (rotationSwapTimerRef.current !== null) window.clearTimeout(rotationSwapTimerRef.current);
    if (rotationEndTimerRef.current !== null) window.clearTimeout(rotationEndTimerRef.current);
    setFavoredRotation(Math.random() < 0.5 ? 'right' : 'left');

    if (mode === 'blind' && blindLevel) {
      beginBlindPreview(getBlindPreviewMs(blindLevel, size));
    }

    startTimer();
  }, [size, board, startTimer, mode, blindLevel, beginBlindPreview, stopBlindPreview]);

  const triggerRotation = useCallback(() => {
    if (mode !== 'twister' || !size || rotationFx) return;
    const direction: RotationDirection =
      Math.random() < TORNADO_BIAS ? favoredRotation : oppositeDirection(favoredRotation);
    const runId = rotationRunRef.current + 1;
    rotationRunRef.current = runId;

    if (rotationSwapTimerRef.current !== null) window.clearTimeout(rotationSwapTimerRef.current);
    if (rotationEndTimerRef.current !== null) window.clearTimeout(rotationEndTimerRef.current);

    setRotationFx({ direction, runId });
    rotationSwapTimerRef.current = window.setTimeout(() => {
      setBoard((prev) => rotateFlat(prev, size, direction));
      setCells((prev) => rotateFlat(prev, size, direction));
      setLastPlacedQueen(null);
      setMarksSinceRotation(0);
      setLastAddTimestamp(Date.now());
    }, ROTATION_SWAP_MS);

    rotationEndTimerRef.current = window.setTimeout(() => {
      setRotationFx((current) => (current && current.runId === runId ? null : current));
    }, ROTATION_ANIM_MS);
  }, [mode, size, rotationFx, favoredRotation]);

  useEffect(() => {
    if (mode !== 'twister' || !size || won || showMenu || showWin) return;
    const timer = window.setInterval(() => {
      if (Date.now() - lastAddTimestamp >= 30000) triggerRotation();
    }, 500);
    return () => window.clearInterval(timer);
  }, [mode, size, won, showMenu, showWin, lastAddTimestamp, triggerRotation]);

  useEffect(() => {
    if (mode !== 'twister' || !size || marksSinceRotation < 5) return;
    triggerRotation();
  }, [mode, size, marksSinceRotation, triggerRotation]);

  useEffect(() => {
    if (!size || won) return;
    const conflicts = getConflicts(cells, board, size);
    const qCount = cells.filter((s) => s === QUEEN).length;
    if (qCount === size && conflicts.size === 0) {
      setWon(true);
      stopTimer();
      const el = Date.now() - startedAt.current;
      setElapsed(el);

      const store = loadRankingStore();
      const entries = Array.isArray(store[boardKey]) ? store[boardKey] : [];
      entries.push({ timeMs: el, at: Date.now() });
      entries.sort((a, b) => a.timeMs - b.timeMs);
      store[boardKey] = entries.slice(0, MAX_RANKING_ITEMS);
      saveRankingStore(store);
      setShowWin(true);
    }
  }, [cells, size, board, won, boardKey, stopTimer]);

  const conflicts = size ? getConflicts(cells, board, size) : new Set<number>();
  const attacked = size ? getAttacked(cells, board, size) : new Set<number>();

  const newlyAttacked = useMemo(() => {
    if (lastPlacedQueen == null || !size || cells[lastPlacedQueen] !== QUEEN) return new Map<number, number>();
    const byNew = getAttackedByOneQueen(lastPlacedQueen, board, size);
    const otherCells = cells.map((v, i) => (i === lastPlacedQueen ? EMPTY : v)) as CellState[];
    const alreadyAttacked = getAttacked(otherCells, board, size);
    const result = new Map<number, number>();
    const qx = lastPlacedQueen % size;
    const qy = (lastPlacedQueen / size) | 0;
    byNew.forEach((ci) => {
      if (!alreadyAttacked.has(ci) && cells[ci] !== QUEEN) {
        const cx = ci % size;
        const cy = (ci / size) | 0;
        const d = Math.max(Math.abs(cx - qx), Math.abs(cy - qy));
        result.set(ci, d);
      }
    });
    return result;
  }, [cells, board, size, lastPlacedQueen]);

  const sealedRegions = useMemo(() => {
    if (!size) return new Set<number>();
    const regions = new Map<number, number[]>();

    board.forEach((region, index) => {
      const bucket = regions.get(region);
      if (bucket) bucket.push(index);
      else regions.set(region, [index]);
    });

    const sealed = new Set<number>();
    regions.forEach((indices, region) => {
      const hasQueen = indices.some((index) => cells[index] === QUEEN);
      if (hasQueen) return;

      const fullyClosedByCrosses = indices.every((index) => cells[index] === MARK || attacked.has(index));
      if (fullyClosedByCrosses) sealed.add(region);
    });

    return sealed;
  }, [size, board, cells, attacked]);

  const rankingEntries = (() => {
    if (!boardKey) return [] as RankingEntry[];
    const store = loadRankingStore();
    return Array.isArray(store[boardKey]) ? store[boardKey] : [];
  })();

  const queenCount = cells.reduce<number>((count, cell) => count + (cell === QUEEN ? 1 : 0), 0);

  const resetToMenu = useCallback(() => {
    clearQueensOnBlindPreviewEndRef.current = false;
    stopTimer();
    stopBlindPreview();
    setShowWin(false);
    setShowExitConfirm(false);
    setWon(false);
    setSize(null);
    setBoard([]);
    setCells([]);
    setBoardKey('');
    setBoardLabel('');
    setLastPlacedQueen(null);
    setShowMenu(true);
  }, [stopTimer, stopBlindPreview]);

  const goToMenu = useCallback(() => {
    if (size) {
      setShowExitConfirm(true);
      return;
    }
    resetToMenu();
  }, [size, resetToMenu]);

  const replayBlindPreview = useCallback(() => {
    if (mode !== 'blind' || !blindLevel || !size) return;
    clearQueensOnBlindPreviewEndRef.current = true;
    beginBlindPreview(getBlindReplayMs(blindLevel));
  }, [mode, blindLevel, size, beginBlindPreview]);

  const handleCellClick = (i: number): void => {
    if (won) return;
    if (blindPreviewActive) return;
    if (cells[i] !== QUEEN && attacked.has(i)) return;
    const placing = cells[i] !== QUEEN;
    setCells((prev) => {
      const next = [...prev];
      next[i] = next[i] === QUEEN ? EMPTY : QUEEN;
      return next;
    });
    if (placing) {
      setLastAddTimestamp(Date.now());
      if (mode === 'twister') triggerRotation();
    }
    setLastPlacedQueen(placing ? i : null);
  };

  const handleCellContext = (e: React.MouseEvent<HTMLDivElement>, i: number): void => {
    e.preventDefault();
    if (blindPreviewActive) return;
    if (won || cells[i] === QUEEN) return;
    const addingMark = cells[i] !== MARK;
    setCells((prev) => {
      const next = [...prev];
      next[i] = next[i] === MARK ? EMPTY : MARK;
      return next;
    });
    if (addingMark) {
      setLastAddTimestamp(Date.now());
      setMarksSinceRotation((prev) => prev + 1);
    }
    setLastPlacedQueen(null);
  };

  const overlay = showMenu || showWin || showExitConfirm;
  const blindPreviewRemainingMs = blindPreviewUntil ? Math.max(0, blindPreviewUntil - Date.now()) : 0;
  void blindTick;
  const showBlindColors = mode !== 'blind' || blindPreviewActive;
  const locale = I18N[lang];
  const tr = useCallback((key: string): string => locale[key] ?? key, [locale]);

  return (
    <>
      <header id="brand-header">
        <img id="brand-image" src={queeensImage} alt="Queeens" />
      </header>

      <div id="top-controls">
        <button id="menu-btn" onClick={goToMenu}>
          {tr('menu')}
        </button>
        <button id="shuffle-btn" disabled={!size} onClick={() => size && startGame(size)}>
          {tr('newBoard')}
        </button>
      </div>

      <p id="timer">{tr('time')}: {fmtClock(elapsed)}</p>
      <p id="mode-label">{tr('mode')}: {mode ? tr(MODE_LABEL_KEYS[mode]) : tr('noMode')}</p>
      {mode === 'blind' && blindPreviewActive && (
        <div id="blind-preview-wrap">
          <p id="blind-preview">{tr('memorizeBoard')}: {fmtClock(blindPreviewRemainingMs)}</p>
          <button id="blind-skip" onClick={stopBlindPreview}>{tr('startNow')}</button>
        </div>
      )}
      <p id="queen-counter">{tr('queens')}: {queenCount}/{size ?? 0}</p>
      <p id="app-version">{tr('version')}: {version}</p>

      {size && size > 0 && (
        <div
          id="board"
          className={won ? 'disabled' : ''}
          style={{
            gridTemplateColumns: `repeat(${size}, 50px)`,
            animation: rotationFx
              ? rotationFx.direction === 'right'
                ? `boardSpinRight ${ROTATION_ANIM_MS}ms cubic-bezier(.22,.86,.24,1)`
                : `boardSpinLeft ${ROTATION_ANIM_MS}ms cubic-bezier(.22,.86,.24,1)`
              : undefined,
          }}
        >
          {cells.map((cell, i) => {
            let cls = 'cell';
            let content = '';
            const isNew = newlyAttacked.has(i);
            const delay = isNew ? (newlyAttacked.get(i) || 0) * 0.045 : 0;
            const isSealedRegion = mode !== 'blind' && sealedRegions.has(board[i]);

            if (isSealedRegion) cls += ' sealed-region';

            if (cell === QUEEN) {
              cls += ' queen';
              if (conflicts.has(i)) cls += ' conflict';
              if (i === lastPlacedQueen) cls += ' just-placed';
            } else if (cell === MARK) {
              cls += ' marked';
              content = '✕';
            } else if (attacked.has(i) && mode !== 'blind') {
              cls += ' attacked';
              content = '✕';
            }

            return (
              <div
                key={i}
                className={cls}
                style={{ backgroundColor: showBlindColors ? COLORS[board[i]] : '#d8dee9' }}
                onClick={() => handleCellClick(i)}
                onContextMenu={(e) => handleCellContext(e, i)}
              >
                {content && (
                  <span
                    className={`x-mark${isNew ? ' x-new' : ''}`}
                    key={`x-${i}`}
                    style={isNew ? { animationDelay: `${delay}s` } : undefined}
                  >
                    {content}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mode === 'blind' && size && !blindPreviewActive && (
        <div id="blind-actions">
          <button id="blind-reveal-btn" onClick={replayBlindPreview}>
            {tr('showAgain')}
          </button>
        </div>
      )}

      {rankingEntries.length > 0 && (
        <section id="ranking" aria-label={tr('rankingAria')}>
          <h3>{tr('localRanking')}</h3>
          <p id="ranking-board">{tr('board')} {boardLabel}</p>
          <ol id="ranking-list">
            {rankingEntries.map((entry, idx) => (
              <li key={idx} className={`rank-item${idx === 0 ? ' is-top' : ''}`}>
                {fmt(entry.timeMs)}
              </li>
            ))}
          </ol>
        </section>
      )}

      {overlay && (
        <div
          className="overlay show"
          onClick={() => {
            // Do not close popups when clicking outside.
          }}
        />
      )}

      {showMenu && (
        <div id="menu" className="popup show">
          <div id="lang-switch" aria-label={tr('languageAria')}>
            <button
              className="mode-btn active lang-toggle-btn"
              onClick={() => setLang((prev) => (prev === 'en' ? 'es' : 'en'))}
            >
              {lang === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
          </div>

          <div id="mode-switch" role="tablist" aria-label={tr('modeAria')}>
            <button
              className={mode === 'classic' ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setMode('classic')}
            >
              {tr(MODE_LABEL_KEYS.classic)}
            </button>
            <button
              className={mode === 'twister' ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setMode('twister')}
            >
              {tr(MODE_LABEL_KEYS.twister)}
            </button>
            <button
              className={mode === 'blind' ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setMode('blind')}
            >
              {tr(MODE_LABEL_KEYS.blind)}
            </button>
          </div>

          {mode ? (
            <>
              <section id="mode-rules" aria-live="polite">
                <h4>{tr('rules')}: {tr(MODE_LABEL_KEYS[mode])}</h4>
                <ul>
                  {MODE_RULE_KEYS[mode].map((ruleKey: string) => (
                    <li key={ruleKey}>{tr(ruleKey)}</li>
                  ))}
                </ul>
              </section>

              {mode === 'blind' && (
                <section id="blind-levels" aria-live="polite">
                  <h4>{tr('difficulty')}</h4>
                  <div id="blind-level-switch" role="tablist" aria-label={tr('blindDifficultyAria')}>
                    {(['easy', 'medium', 'hard'] as BlindLevel[]).map((level) => (
                      <button
                        key={level}
                        className={blindLevel === level ? 'mode-btn active' : 'mode-btn'}
                        onClick={() => setBlindLevel(level)}
                      >
                        {tr(BLIND_LEVEL_LABEL_KEYS[level])}
                      </button>
                    ))}
                  </div>
                  {!blindLevel && <p id="blind-hint">{tr('pickDifficulty')}</p>}
                </section>
              )}

              {(mode !== 'blind' || blindLevel) &&
                LEVEL_OPTIONS.map((n) => (
                  <button key={n} className="size-btn" onClick={() => startGame(n)}>
                    {n}×{n}
                  </button>
                ))}
            </>
          ) : null}
        </div>
      )}

      {showWin && (
        <div id="win" className="popup show">
          <div>
            <h2>{tr('congrats')}</h2>
            <p>{tr('allQueensPlaced')}</p>
            <p id="win-time">{tr('tookTime')} {fmt(elapsed)}.</p>
            <button
              id="retry-board"
              onClick={(e) => {
                e.stopPropagation();
                startRound();
              }}
            >
              {tr('retryBoard')}
            </button>
            <button
              id="next-board"
              onClick={(e) => {
                e.stopPropagation();
                if (size) startGame(size);
              }}
            >
              {tr('nextBoard')}
            </button>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div id="exit-confirm" className="popup show" role="dialog" aria-modal="true" aria-labelledby="exit-confirm-title">
          <div>
            <h2 id="exit-confirm-title">{tr('confirmExitTitle')}</h2>
            <p>{tr('confirmExit')}</p>
            <div id="exit-confirm-actions">
              <button
                id="exit-cancel"
                onClick={() => setShowExitConfirm(false)}
              >
                {tr('cancel')}
              </button>
              <button
                id="exit-confirm-btn"
                onClick={resetToMenu}
              >
                {tr('continue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}