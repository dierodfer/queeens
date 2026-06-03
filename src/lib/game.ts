export type CellState = 0 | 1 | 2;
export type RotationDirection = 'left' | 'right';

export const EMPTY: CellState = 0;
export const QUEEN: CellState = 1;
export const MARK: CellState = 2;

export function oppositeDirection(direction: RotationDirection): RotationDirection {
  return direction === 'right' ? 'left' : 'right';
}

/** Returns the indices of every queen that conflicts with another queen. */
export function getConflicts(cells: CellState[], board: number[], size: number): Set<number> {
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

const DIAGONALS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

/** Returns every cell attacked (row, column, adjacent diagonal, same region) by any queen. */
export function getAttacked(cells: CellState[], board: number[], size: number): Set<number> {
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
    DIAGONALS.forEach(([dx, dy]) => {
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

/** Returns every cell attacked by a single queen, excluding its own cell. */
export function getAttackedByOneQueen(qi: number, board: number[], size: number): Set<number> {
  const set = new Set<number>();
  const qx = qi % size;
  const qy = (qi / size) | 0;
  const region = board[qi];
  for (let k = 0; k < size; k++) {
    set.add(qy * size + k);
    set.add(k * size + qx);
  }
  DIAGONALS.forEach(([dx, dy]) => {
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

/** Rotates a flattened square grid 90deg in the given direction. */
export function rotateFlat<T>(flat: T[], size: number, direction: RotationDirection): T[] {
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
