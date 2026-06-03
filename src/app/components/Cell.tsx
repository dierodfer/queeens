import type { KeyboardEvent, MouseEvent } from 'react';
import { MARK, QUEEN, type CellState } from '../../lib/game';
import type { Tr } from './types';

export type CellProps = {
  index: number;
  size: number;
  cell: CellState;
  color: string;
  conflict: boolean;
  justPlaced: boolean;
  attacked: boolean;
  sealed: boolean;
  /** Animation delay (s) when the cell was just attacked, or null. */
  highlightDelay: number | null;
  interactive: boolean;
  onClick: (i: number) => void;
  onMark: (i: number) => void;
  tr: Tr;
};

export function Cell({
  index,
  size,
  cell,
  color,
  conflict,
  justPlaced,
  attacked,
  sealed,
  highlightDelay,
  interactive,
  onClick,
  onMark,
  tr,
}: CellProps) {
  const classes = ['cell'];
  if (sealed) classes.push('sealed-region');
  let content = '';
  let state = tr('cellEmpty');

  if (cell === QUEEN) {
    classes.push('queen');
    state = tr('cellQueen');
    if (conflict) classes.push('conflict');
    if (justPlaced) classes.push('just-placed');
  } else if (cell === MARK) {
    classes.push('marked');
    content = '✕';
    state = tr('cellMarked');
  } else if (attacked) {
    classes.push('attacked');
    content = '✕';
    state = tr('cellBlocked');
  }

  const row = ((index / size) | 0) + 1;
  const col = (index % size) + 1;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(index);
    } else if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      onMark(index);
    }
  };

  return (
    <div
      className={classes.join(' ')}
      role="gridcell"
      aria-label={`${tr('cellRow')} ${row}, ${tr('cellCol')} ${col}: ${state}`}
      aria-pressed={cell === QUEEN}
      tabIndex={interactive ? 0 : -1}
      style={{ backgroundColor: color }}
      onClick={() => onClick(index)}
      onContextMenu={(e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        onMark(index);
      }}
      onKeyDown={handleKeyDown}
    >
      {content && (
        <span
          className={`x-mark${highlightDelay !== null ? ' x-new' : ''}`}
          style={highlightDelay !== null ? { animationDelay: `${highlightDelay}s` } : undefined}
        >
          {content}
        </span>
      )}
    </div>
  );
}
