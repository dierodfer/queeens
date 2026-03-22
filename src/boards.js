const seedBoards = {
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: []
};

const rotate90 = b => {
  const n = b.length;
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => b[n - 1 - x][y])
  );
};

const mirrorX = b => b.map(r => [...r].reverse());
const boardKey = b => b.map(r => r.join(',')).join(';');

function variants(base) {
  const out = [];
  let cur = base;
  for (let i = 0; i < 4; i++) {
    out.push(cur, mirrorX(cur));
    cur = rotate90(cur);
  }
  const uniq = new Map();
  out.forEach(b => uniq.set(boardKey(b), b));
  return [...uniq.values()];
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function findQueenPermutation(n) {
  const cols = Array(n).fill(false);
  const d1 = Array(2 * n).fill(false);
  const d2 = Array(2 * n).fill(false);
  const perm = Array(n).fill(-1);

  function bt(row) {
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

const queenCache = new Map();
const getQueenPermutation = n => {
  if (!queenCache.has(n)) queenCache.set(n, findQueenPermutation(n));
  return queenCache.get(n);
};

function neighbors4(x, y, n) {
  const out = [];
  if (x > 0) out.push([x - 1, y]);
  if (x < n - 1) out.push([x + 1, y]);
  if (y > 0) out.push([x, y - 1]);
  if (y < n - 1) out.push([x, y + 1]);
  return out;
}

function generateContiguousBoard(n, seed) {
  const rand = mulberry32(seed);
  const queens = getQueenPermutation(n);
  const board = Array.from({ length: n }, () => Array(n).fill(-1));
  const frontier = [];

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
          .filter(v => v !== -1);
        board[y][x] = neigh.length ? neigh[Math.floor(rand() * neigh.length)] : 0;
      }
    }
  }

  return board;
}

function generateRealBoards(n, count) {
  const out = [];
  const uniq = new Set();

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

const proceduralPerSize = {
  4: 6,
  5: 6,
  6: 6,
  7: 6,
  8: 6,
  9: 6,
  10: 6
};

export const tableros = Object.fromEntries(
  Object.keys(seedBoards).map(sizeKey => {
    const size = Number(sizeKey);
    const fromSeeds = seedBoards[size].flatMap(variants);
    const generated = generateRealBoards(size, proceduralPerSize[size]);

    const uniq = new Map();
    [...fromSeeds, ...generated].forEach(b => uniq.set(boardKey(b), b));
    return [size, [...uniq.values()]];
  })
);
