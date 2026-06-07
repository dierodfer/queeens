import { tableros } from '../data/boards';

export type PickedBoard = { board: number[]; index: number; total: number };

let lastIndex = -1;

/** Picks a random flattened board for size `n`, avoiding the previous pick when possible. */
export function pickBoard(n: number): PickedBoard {
  const opts = tableros[n];
  let index: number;
  do {
    index = (Math.random() * opts.length) | 0;
  } while (opts.length > 1 && index === lastIndex);
  lastIndex = index;
  return { board: opts[index].flat(), index, total: opts.length };
}
