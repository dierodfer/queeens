import { describe, expect, it } from 'vitest';
import {
  EMPTY,
  MARK,
  QUEEN,
  getAttacked,
  getAttackedByOneQueen,
  getAttackingQueens,
  getConflicts,
  oppositeDirection,
  rotateFlat,
  type CellState,
} from './game';

const SIZE = 4;
// Distinct region per cell so region rules don't interfere unless we set them.
const distinctBoard = Array.from({ length: SIZE * SIZE }, (_, i) => i);

function emptyCells(): CellState[] {
  return new Array(SIZE * SIZE).fill(EMPTY);
}

function withQueens(...indices: number[]): CellState[] {
  const cells = emptyCells();
  indices.forEach((i) => (cells[i] = QUEEN));
  return cells;
}

describe('oppositeDirection', () => {
  it('flips direction', () => {
    expect(oppositeDirection('right')).toBe('left');
    expect(oppositeDirection('left')).toBe('right');
  });
});

describe('getConflicts', () => {
  it('flags queens sharing a row', () => {
    const conflicts = getConflicts(withQueens(0, 1), distinctBoard, SIZE);
    expect(conflicts).toEqual(new Set([0, 1]));
  });

  it('flags queens sharing a column', () => {
    const conflicts = getConflicts(withQueens(0, 4), distinctBoard, SIZE);
    expect(conflicts).toEqual(new Set([0, 4]));
  });

  it('flags queens on an adjacent diagonal', () => {
    const conflicts = getConflicts(withQueens(0, 5), distinctBoard, SIZE);
    expect(conflicts).toEqual(new Set([0, 5]));
  });

  it('flags queens sharing a region even when far apart', () => {
    const board = [...distinctBoard];
    board[0] = 99;
    board[10] = 99;
    const conflicts = getConflicts(withQueens(0, 10), board, SIZE);
    expect(conflicts).toEqual(new Set([0, 10]));
  });

  it('returns no conflicts for a valid placement', () => {
    // (0,0) and (2,1): different row/col, not adjacent diagonal, distinct regions.
    const conflicts = getConflicts(withQueens(0, 6), distinctBoard, SIZE);
    expect(conflicts.size).toBe(0);
  });
});

describe('getAttacked', () => {
  it('covers row, column, adjacent diagonals and region of a queen', () => {
    const board = [...distinctBoard];
    board[5] = 7; // (1,1)
    board[15] = 7; // mark a far cell as same region
    const attacked = getAttacked(withQueens(5), board, SIZE);
    // Whole row y=1: 4,5,6,7
    [4, 5, 6, 7].forEach((i) => expect(attacked.has(i)).toBe(true));
    // Whole column x=1: 1,5,9,13
    [1, 5, 9, 13].forEach((i) => expect(attacked.has(i)).toBe(true));
    // Adjacent diagonals of (1,1): (0,0)=0,(2,0)=2,(0,2)=8,(2,2)=10
    [0, 2, 8, 10].forEach((i) => expect(attacked.has(i)).toBe(true));
    // Same region cell
    expect(attacked.has(15)).toBe(true);
    // A non-attacked cell, e.g. (3,3)=15 is region, but (3,0)=3 should not be attacked
    expect(attacked.has(3)).toBe(false);
  });

  it('returns an empty set when there are no queens', () => {
    const cells = emptyCells();
    cells[0] = MARK;
    expect(getAttacked(cells, distinctBoard, SIZE).size).toBe(0);
  });
});

describe('getAttackedByOneQueen', () => {
  it('excludes the queen cell itself', () => {
    const attacked = getAttackedByOneQueen(5, distinctBoard, SIZE);
    expect(attacked.has(5)).toBe(false);
    expect(attacked.has(4)).toBe(true);
  });
});

describe('getAttackingQueens', () => {
  it('finds queens sharing the row or column of the cell', () => {
    // Queens at (0,0)=0 (same column as target) and (3,1)=7 (same row as target).
    const attackers = getAttackingQueens(4, withQueens(0, 7), distinctBoard, SIZE);
    expect(attackers).toEqual(new Set([0, 7]));
  });

  it('finds a queen on an adjacent diagonal but not a distant one', () => {
    // Target (1,1)=5. Queen at (0,0)=0 is adjacent diagonal; (3,3)=15 is not.
    const attackers = getAttackingQueens(5, withQueens(0, 15), distinctBoard, SIZE);
    expect(attackers).toEqual(new Set([0]));
  });

  it('finds a queen sharing the cell region even when far away', () => {
    const board = [...distinctBoard];
    board[3] = 42; // target cell region
    board[12] = 42; // queen shares region
    const attackers = getAttackingQueens(3, withQueens(12), board, SIZE);
    expect(attackers).toEqual(new Set([12]));
  });

  it('returns an empty set when no queen attacks the cell', () => {
    // Target (3,3)=15, queen at (0,0)=0: different row/col, not adjacent, distinct region.
    expect(getAttackingQueens(15, withQueens(0), distinctBoard, SIZE).size).toBe(0);
  });
});

describe('rotateFlat', () => {
  it('rotates a 2x2 grid clockwise', () => {
    expect(rotateFlat(['a', 'b', 'c', 'd'], 2, 'right')).toEqual(['c', 'a', 'd', 'b']);
  });

  it('rotating right then left restores the original', () => {
    const original = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const round = rotateFlat(rotateFlat(original, 3, 'right'), 3, 'left');
    expect(round).toEqual(original);
  });

  it('four right rotations return to start', () => {
    let grid = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let k = 0; k < 4; k++) grid = rotateFlat(grid, 3, 'right');
    expect(grid).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
