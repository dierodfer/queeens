import { tableros } from '../data/boards';

let lastBoard: number[][] | null = null;

/** Picks a random flattened board for size `n`, avoiding the previous pick when possible. */
export function pickBoard(n: number): number[] {
  const opts = tableros[n];
  let b: number[][];
  do {
    b = opts[(Math.random() * opts.length) | 0];
  } while (opts.length > 1 && b === lastBoard);
  lastBoard = b;
  return b.flat();
}
