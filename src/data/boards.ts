type Board2D = number[][];
type Coord = [number, number];

const seedBoards: Record<number, Board2D[]> = {
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  12: [],
  14: [],
};

const rotate90 = (b: Board2D): Board2D => {
  const n = b.length;
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => b[n - 1 - x][y]),
  );
};

const mirrorX = (b: Board2D): Board2D => b.map((r) => [...r].reverse());
const boardKey = (b: Board2D): string => b.map((r) => r.join(',')).join(';');

function variants(base: Board2D): Board2D[] {
  const out: Board2D[] = [];
  let cur = base;
  for (let i = 0; i < 4; i++) {
    out.push(cur, mirrorX(cur));
    cur = rotate90(cur);
  }
  const uniq = new Map<string, Board2D>();
  out.forEach((b) => uniq.set(boardKey(b), b));
  return [...uniq.values()];
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function findQueenPermutation(n: number): number[] {
  const cols = Array(n).fill(false);
  const d1 = Array(2 * n).fill(false);
  const d2 = Array(2 * n).fill(false);
  const perm = Array(n).fill(-1);

  function bt(row: number): boolean {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      const a = row + col;
      const b = row - col + n;
      if (cols[col] || d1[a] || d2[b]) continue;
      cols[col] = d1[a] = d2[b] = true;
      perm[row] = col;
      if (bt(row + 1)) return true;
      cols[col] = d1[a] = d2[b] = false;
    }
    return false;
  }

  bt(0);
  return perm;
}

const queenCache = new Map<number, number[]>();
const getQueenPermutation = (n: number): number[] => {
  if (!queenCache.has(n)) queenCache.set(n, findQueenPermutation(n));
  return queenCache.get(n)!;
};

function neighbors4(x: number, y: number, n: number): Coord[] {
  const out: Coord[] = [];
  if (x > 0) out.push([x - 1, y]);
  if (x < n - 1) out.push([x + 1, y]);
  if (y > 0) out.push([x, y - 1]);
  if (y < n - 1) out.push([x, y + 1]);
  return out;
}

function generateContiguousBoard(n: number, seed: number): Board2D {
  const rand = mulberry32(seed);
  const queens = getQueenPermutation(n);
  const board = Array.from({ length: n }, () => Array(n).fill(-1));
  const frontier: Array<[number, number, number]> = [];

  for (let r = 0; r < n; r++) {
    const qx = queens[r];
    board[r][qx] = r;
    frontier.push([qx, r, r]);
  }

  let filled = n;
  while (filled < n * n) {
    if (!frontier.length) break;
    const i = Math.floor(rand() * frontier.length);
    const [x, y, region] = frontier[i];
    const free = neighbors4(x, y, n).filter(([nx, ny]) => board[ny][nx] === -1);

    if (!free.length) {
      frontier.splice(i, 1);
      continue;
    }

    const [nx, ny] = free[Math.floor(rand() * free.length)];
    board[ny][nx] = region;
    frontier.push([nx, ny, region]);
    filled++;
  }

  if (filled < n * n) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (board[y][x] !== -1) continue;
        const neigh = neighbors4(x, y, n)
          .map(([nx, ny]) => board[ny][nx])
          .filter((v) => v !== -1);
        board[y][x] = neigh.length ? neigh[Math.floor(rand() * neigh.length)] : 0;
      }
    }
  }

  return board;
}

function generateRealBoards(n: number, count: number): Board2D[] {
  const out: Board2D[] = [];
  const uniq = new Set<string>();

  for (let i = 0; out.length < count && i < 200; i++) {
    const b = generateContiguousBoard(n, n * 10007 + i * 7919);
    const k = boardKey(b);
    if (!uniq.has(k)) {
      uniq.add(k);
      out.push(b);
    }
  }

  return out;
}

const proceduralPerSize: Record<number, number> = {
  4: 6,
  5: 6,
  6: 6,
  7: 6,
  8: 6,
  9: 6,
  10: 6,
  12: 6,
  14: 6,
};

const generatedBoards = Object.fromEntries(
  Object.keys(seedBoards).map((sizeKey) => {
    const size = Number(sizeKey);
    const fromSeeds = seedBoards[size].flatMap(variants);
    const generated = generateRealBoards(size, proceduralPerSize[size]);

    const uniq = new Map<string, Board2D>();
    [...fromSeeds, ...generated].forEach((b) => uniq.set(boardKey(b), b));
    return [size, [...uniq.values()]];
  }),
) as Record<number, Board2D[]>;

export const tableros = generatedBoards;