import type { CellState } from '../../lib/game';
import type { GameMode } from '../../i18n';
import type { RotationFx } from '../hooks/useTwisterRotation';
import type { Skin } from '../skins';
import { COLORS, ROTATION_ANIM_MS } from '../constants';
import { Cell } from './Cell';
import type { Tr } from './types';

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
  colors?: string[];
  skin?: Skin;
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
  colors = COLORS,
  skin,
  tr,
}: BoardProps) {
  const animation = rotationFx
    ? `boardSpin${rotationFx.direction === 'right' ? 'Right' : 'Left'} ${ROTATION_ANIM_MS}ms cubic-bezier(.22,.86,.24,1)`
    : undefined;
  const patterned = skin?.patterned && skin.regions;

  return (
    <div
      id="board"
      role="grid"
      aria-label={tr('boardAria')}
      className={boardClassName(size, won)}
      style={{ gridTemplateColumns: `repeat(${size}, ${cellPixels(size)}px)`, animation }}
    >
      {cells.map((cell, i) => {
        const region = patterned ? skin!.regions![board[i]] : undefined;
        return (
          <Cell
            key={i}
            index={i}
            size={size}
            cell={cell}
            color={showBlindColors ? colors[board[i]] : '#d8dee9'}
            conflict={conflicts.has(i)}
            justPlaced={i === lastPlacedQueen}
            attacked={attacked.has(i) && mode !== 'blind'}
            sealed={mode !== 'blind' && sealedRegions.has(board[i])}
            highlightDelay={newlyAttacked.has(i) ? (newlyAttacked.get(i) || 0) * 0.045 : null}
            interactive={!won}
            regionClass={showBlindColors ? region?.className : undefined}
            animal={showBlindColors ? region?.animal : undefined}
            onClick={onCellClick}
            onMark={onCellMark}
            tr={tr}
          />
        );
      })}
    </div>
  );
}
