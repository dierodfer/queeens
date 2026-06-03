import { useCallback, useEffect, useMemo, useState } from 'react';
import { I18N, type BlindLevel, type GameMode, type Lang } from '../i18n';
import {
  EMPTY,
  MARK,
  QUEEN,
  getAttacked,
  getAttackedByOneQueen,
  getConflicts,
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
import { useTimer } from './hooks/useTimer';
import { useBlindPreview } from './hooks/useBlindPreview';
import { useTwisterRotation } from './hooks/useTwisterRotation';
import { Board } from './components/Board';
import { ExitConfirm } from './components/ExitConfirm';
import { Menu } from './components/Menu';
import { Ranking } from './components/Ranking';
import { TopBar } from './components/TopBar';
import { WinPopup } from './components/WinPopup';

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
  const [marksSinceRotation, setMarksSinceRotation] = useState(0);
  const [lastAddTimestamp, setLastAddTimestamp] = useState<number>(Date.now());

  const { elapsed, setElapsed, start: startTimer, stop: stopTimer, since } = useTimer();

  const clearQueens = useCallback(() => {
    setCells((prev) => prev.map((cell) => (cell === QUEEN ? EMPTY : cell)) as CellState[]);
    setLastPlacedQueen(null);
    setLastAddTimestamp(Date.now());
  }, []);
  const blind = useBlindPreview(clearQueens);

  const handleRotate = useCallback(
    (direction: RotationDirection) => {
      if (!size) return;
      setBoard((prev) => rotateFlat(prev, size, direction));
      setCells((prev) => rotateFlat(prev, size, direction));
      setLastPlacedQueen(null);
      setMarksSinceRotation(0);
      setLastAddTimestamp(Date.now());
    },
    [size],
  );
  const rotation = useTwisterRotation({
    enabled: mode === 'twister' && size != null,
    paused: won || showMenu || showWin,
    lastAddTimestamp,
    marksSinceRotation,
    onRotate: handleRotate,
  });

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.yml`, { cache: 'no-store' })
      .then((r) => r.text())
      .then((text) => setVersion(parseVersionFromYaml(text)))
      .catch(() => {});
  }, []);

  const beginRound = useCallback(
    (n: number) => {
      setCells(new Array(n * n).fill(EMPTY));
      setWon(false);
      setShowWin(false);
      setLastPlacedQueen(null);
      setMarksSinceRotation(0);
      setLastAddTimestamp(Date.now());
      rotation.reset();
      if (mode === 'blind' && blindLevel) blind.begin(getBlindPreviewMs(blindLevel, n));
      startTimer();
    },
    [mode, blindLevel, blind, rotation, startTimer],
  );

  const startGame = useCallback(
    (n: number) => {
      const flat = pickBoard(n);
      const sig = flat.join(',');
      setSize(n);
      setBoard(flat);
      setShowMenu(false);
      setShowExitConfirm(false);
      setBoardKey(`${n}|${sig}`);
      setBoardLabel(`${n}x${n} - ${shortHash(sig)}`);
      beginRound(n);
    },
    [beginRound],
  );

  const startRound = useCallback(() => {
    if (size && board.length) beginRound(size);
  }, [size, board, beginRound]);

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
        result.set(ci, Math.max(Math.abs(cx - qx), Math.abs(cy - qy)));
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
      const closed = indices.every((index) => cells[index] === MARK || attacked.has(index));
      if (!hasQueen && closed) sealed.add(region);
    });
    return sealed;
  }, [size, board, cells, attacked]);

  const rankingEntries = boardKey ? getRankingEntries(loadRankingStore(), boardKey) : [];
  const queenCount = cells.reduce<number>((count, cell) => count + (cell === QUEEN ? 1 : 0), 0);

  const resetToMenu = useCallback(() => {
    stopTimer();
    blind.stop();
    rotation.reset();
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
  }, [stopTimer, blind, rotation]);

  const goToMenu = useCallback(() => {
    if (size) setShowExitConfirm(true);
    else resetToMenu();
  }, [size, resetToMenu]);

  const replayBlindPreview = useCallback(() => {
    if (mode === 'blind' && blindLevel && size) blind.begin(getBlindReplayMs(blindLevel), true);
  }, [mode, blindLevel, size, blind]);

  const setCellAt = useCallback((i: number, value: CellState) => {
    setCells((prev) => {
      const next = [...prev];
      next[i] = next[i] === value ? EMPTY : value;
      return next;
    });
  }, []);

  const placeQueen = useCallback(
    (i: number) => {
      if (won || blind.active) return;
      if (cells[i] !== QUEEN && attacked.has(i)) return;
      const placing = cells[i] !== QUEEN;
      setCellAt(i, QUEEN);
      if (placing) {
        setLastAddTimestamp(Date.now());
        if (mode === 'twister') rotation.trigger();
      }
      setLastPlacedQueen(placing ? i : null);
    },
    [won, blind, cells, attacked, mode, rotation, setCellAt],
  );

  const toggleMark = useCallback(
    (i: number) => {
      if (blind.active || won || cells[i] === QUEEN) return;
      const adding = cells[i] !== MARK;
      setCellAt(i, MARK);
      if (adding) {
        setLastAddTimestamp(Date.now());
        setMarksSinceRotation((prev) => prev + 1);
      }
      setLastPlacedQueen(null);
    },
    [blind, won, cells, setCellAt],
  );

  const overlay = showMenu || showWin || showExitConfirm;
  const showBlindColors = mode !== 'blind' || blind.active;
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
        blindPreviewActive={blind.active}
        blindPreviewRemainingMs={blind.remainingMs}
        onMenu={goToMenu}
        onNewBoard={() => size && startGame(size)}
        onSkipBlind={blind.stop}
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
          rotationFx={rotation.rotationFx}
          onCellClick={placeQueen}
          onCellMark={toggleMark}
          tr={tr}
        />
      )}

      {mode === 'blind' && size && !blind.active && (
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
