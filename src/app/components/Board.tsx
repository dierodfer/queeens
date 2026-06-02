import type { KeyboardEvent, MouseEvent } from 'react';
import type { CellState, RotationDirection } from '../../lib/game';
import { MARK, QUEEN } from '../../lib/game';
import type { GameMode } from '../../i18n';
import { COLORS, ROTATION_ANIM_MS } from '../constants';
import type { Tr } from './types';

type RotationFx = { direction: RotationDirection; runId: number } | null;

type BoardProps = {
  size: number;
  cells: CellState[];
  board: number[];
  conflicts: Set<number>;
  attacked: Set<number>;
  newlyAttacked: Map<number, number>;
  sealedRegions: Set<number>;
  lastPlacedQueen: number | null;
  mode: GameMode | null;
  showBlindColors: boolean;
  won: boolean;
  rotationFx: RotationFx;
  onCellClick: (i: number) => void;
  onCellMark: (i: number) => void;
  tr: Tr;
};

function boardClassName(size: number, won: boolean): string {
  if (won) return 'disabled' + (size >= 10 ? ' small-cells' : '');
  if (size >= 14) return 'smallest-cells';
  if (size >= 10) return 'small-cells';
  return '';
}

function cellPixels(size: number): number {
  if (size >= 14) return 28;
  if (size >= 10) return 36;
  return 50;
}

export function Board({
  size,
  cells,
  board,
  conflicts,
  attacked,
  newlyAttacked,
  sealedRegions,
  lastPlacedQueen,
  mode,
  showBlindColors,
  won,
  rotationFx,
  onCellClick,
  onCellMark,
  tr,
}: BoardProps) {
  const animation = rotationFx
    ? rotationFx.direction === 'right'
      ? `boardSpinRight ${ROTATION_ANIM_MS}ms cubic-bezier(.22,.86,.24,1)`
      : `boardSpinLeft ${ROTATION_ANIM_MS}ms cubic-bezier(.22,.86,.24,1)`
    : undefined;

  return (
    <div
      id="board"
      role="grid"
      aria-label={tr('boardAria')}
      className={boardClassName(size, won)}
      style={{
        gridTemplateColumns: `repeat(${size}, ${cellPixels(size)}px)`,
        animation,
      }}
    >
      {cells.map((cell, i) => {
        let cls = 'cell';
        let content = '';
        const x = i % size;
        const y = (i / size) | 0;
        const isNew = newlyAttacked.has(i);
        const delay = isNew ? (newlyAttacked.get(i) || 0) * 0.045 : 0;
        const isSealedRegion = mode !== 'blind' && sealedRegions.has(board[i]);
        const isAttacked = attacked.has(i) && mode !== 'blind';

        if (isSealedRegion) cls += ' sealed-region';

        let stateLabel = tr('cellEmpty');
        if (cell === QUEEN) {
          cls += ' queen';
          stateLabel = tr('cellQueen');
          if (conflicts.has(i)) cls += ' conflict';
          if (i === lastPlacedQueen) cls += ' just-placed';
        } else if (cell === MARK) {
          cls += ' marked';
          content = '✕';
          stateLabel = tr('cellMarked');
        } else if (isAttacked) {
          cls += ' attacked';
          content = '✕';
          stateLabel = tr('cellBlocked');
        }

        const ariaLabel = `${tr('cellRow')} ${y + 1}, ${tr('cellCol')} ${x + 1}: ${stateLabel}`;
        const interactive = !won;

        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCellClick(i);
          } else if (e.key === 'x' || e.key === 'X') {
            e.preventDefault();
            onCellMark(i);
          }
        };

        return (
          <div
            key={i}
            className={cls}
            role="gridcell"
            aria-label={ariaLabel}
            aria-pressed={cell === QUEEN}
            tabIndex={interactive ? 0 : -1}
            style={{ backgroundColor: showBlindColors ? COLORS[board[i]] : '#d8dee9' }}
            onClick={() => onCellClick(i)}
            onContextMenu={(e: MouseEvent<HTMLDivElement>) => {
              e.preventDefault();
              onCellMark(i);
            }}
            onKeyDown={handleKeyDown}
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
  );
}
