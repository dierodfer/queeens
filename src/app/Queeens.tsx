import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { I18N, type BlindLevel, type GameMode, type Lang } from '../i18n';
import {
  EMPTY,
  MARK,
  QUEEN,
  getAttacked,
  getAttackedByOneQueen,
  getConflicts,
  oppositeDirection,
  rotateFlat,
  type CellState,
  type RotationDirection,
} from '../lib/game';
import { parseVersionFromYaml, shortHash } from '../lib/format';
import {
  addRankingEntry,
  getRankingEntries,
  loadRankingStore,
  saveRankingStore,
} from '../lib/ranking';
import { getBlindPreviewMs, getBlindReplayMs } from '../lib/blind';
import { pickBoard } from '../lib/boardPicker';
import { ROTATION_ANIM_MS, ROTATION_SWAP_MS, TORNADO_BIAS } from './constants';
import { useTimer } from './hooks/useTimer';
import { Board } from './components/Board';
import { ExitConfirm } from './components/ExitConfirm';
import { Menu } from './components/Menu';
import { Ranking } from './components/Ranking';
import { TopBar } from './components/TopBar';
import { WinPopup } from './components/WinPopup';

type PendingRotation = { direction: RotationDirection; runId: number } | null;

export default function Queeens() {
  const [lang, setLang] = useState<Lang>('en');
  const [size, setSize] = useState<number | null>(null);
  const [board, setBoard] = useState<number[]>([]);
  const [cells, setCells] = useState<CellState[]>([]);
  const [won, setWon] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [showWin, setShowWin] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
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

  const { elapsed, setElapsed, start: startTimer, stop: stopTimer, since } = useTimer();

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.yml`, { cache: 'no-store' })
      .then((r) => r.text())
      .then((text) => setVersion(parseVersionFromYaml(text)))
      .catch(() => {});
  }, []);

  useEffect(
    () => () => {
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

  const beginBlindPreview = useCallback(
    (ms: number) => {
      stopBlindPreview();
      setBlindPreviewActive(true);
      setBlindPreviewUntil(Date.now() + ms);
      blindTickRef.current = window.setInterval(() => setBlindTick((v) => v + 1), 250);
      blindPreviewTimerRef.current = window.setTimeout(() => {
        stopBlindPreview();
      }, ms);
    },
    [stopBlindPreview],
  );

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
      const el = since();
      setElapsed(el);
      saveRankingStore(addRankingEntry(loadRankingStore(), boardKey, el, Date.now()));
      setShowWin(true);
    }
  }, [cells, size, board, won, boardKey, stopTimer, since, setElapsed]);

  const conflicts = useMemo(
    () => (size ? getConflicts(cells, board, size) : new Set<number>()),
    [cells, board, size],
  );
  const attacked = useMemo(
    () => (size ? getAttacked(cells, board, size) : new Set<number>()),
    [cells, board, size],
  );

  const newlyAttacked = useMemo(() => {
    if (lastPlacedQueen == null || !size || cells[lastPlacedQueen] !== QUEEN)
      return new Map<number, number>();
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

      const fullyClosedByCrosses = indices.every(
        (index) => cells[index] === MARK || attacked.has(index),
      );
      if (fullyClosedByCrosses) sealed.add(region);
    });

    return sealed;
  }, [size, board, cells, attacked]);

  const rankingEntries = boardKey ? getRankingEntries(loadRankingStore(), boardKey) : [];

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

  const placeQueen = useCallback(
    (i: number): void => {
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
    },
    [won, blindPreviewActive, cells, attacked, mode, triggerRotation],
  );

  const toggleMark = useCallback(
    (i: number): void => {
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
    },
    [blindPreviewActive, won, cells],
  );

  const overlay = showMenu || showWin || showExitConfirm;
  const blindPreviewRemainingMs = blindPreviewUntil
    ? Math.max(0, blindPreviewUntil - Date.now())
    : 0;
  void blindTick;
  const showBlindColors = mode !== 'blind' || blindPreviewActive;
  const locale = I18N[lang];
  const tr = useCallback((key: string): string => locale[key] ?? key, [locale]);

  return (
    <>
      <TopBar
        size={size}
        mode={mode}
        elapsed={elapsed}
        queenCount={queenCount}
        version={version}
        blindPreviewActive={blindPreviewActive}
        blindPreviewRemainingMs={blindPreviewRemainingMs}
        onMenu={goToMenu}
        onNewBoard={() => size && startGame(size)}
        onSkipBlind={stopBlindPreview}
        tr={tr}
      />

      {size && size > 0 && (
        <Board
          size={size}
          cells={cells}
          board={board}
          conflicts={conflicts}
          attacked={attacked}
          newlyAttacked={newlyAttacked}
          sealedRegions={sealedRegions}
          lastPlacedQueen={lastPlacedQueen}
          mode={mode}
          showBlindColors={showBlindColors}
          won={won}
          rotationFx={rotationFx}
          onCellClick={placeQueen}
          onCellMark={toggleMark}
          tr={tr}
        />
      )}

      {mode === 'blind' && size && !blindPreviewActive && (
        <div id="blind-actions">
          <button id="blind-reveal-btn" onClick={replayBlindPreview}>
            {tr('showAgain')}
          </button>
        </div>
      )}

      <Ranking entries={rankingEntries} boardLabel={boardLabel} tr={tr} />

      {overlay && (
        <div
          className="overlay show"
          onClick={() => {
            // Do not close popups when clicking outside.
          }}
        />
      )}

      {showMenu && (
        <Menu
          lang={lang}
          onToggleLang={() => setLang((prev) => (prev === 'en' ? 'es' : 'en'))}
          mode={mode}
          onSelectMode={setMode}
          blindLevel={blindLevel}
          onSelectBlindLevel={setBlindLevel}
          onStartGame={startGame}
          tr={tr}
        />
      )}

      {showWin && (
        <WinPopup
          elapsed={elapsed}
          onRetry={startRound}
          onNext={() => size && startGame(size)}
          tr={tr}
        />
      )}

      {showExitConfirm && (
        <ExitConfirm onCancel={() => setShowExitConfirm(false)} onConfirm={resetToMenu} tr={tr} />
      )}
    </>
  );
}
