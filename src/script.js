import { tableros } from './boards.js';

// --- Constants ---
const COLORS = [
  '#77DD77','#AEC6CF','#F6D7A7','#FFB7B2','#B39EB5',
  '#FF6961','#FFD1DC','#CFCFC4','#C1E1C1','#F7CAC9'
];
const EMPTY = 0, QUEEN = 1, MARK = 2;
const RANKING_KEY = 'queens-local-ranking-v1';
const MAX_RANKING_ITEMS = 5;

// --- State ---
let size, board, cells, won, lastBoard;
let currentBoardKey = '', currentBoardLabel = '';
let startedAt = 0, timerId;

// --- DOM refs ---
const $ = id => document.getElementById(id);
const boardEl = $('board'), menuEl = $('menu'), overlayEl = $('overlay'), winEl = $('win');
const timerEl = $('timer'), winTimeEl = $('win-time');
const shuffleBtn = $('shuffle-btn');
const versionEl = $('app-version');
const rankingEl = $('ranking');
const rankingBoardEl = $('ranking-board');
const rankingListEl = $('ranking-list');

async function loadVersion() {
  try {
    const res = await fetch('version.json', { cache: 'no-store' });
    const data = await res.json();
    versionEl.textContent = `Version: ${data.version || '--'}`;
  } catch {
    versionEl.textContent = 'Version: --';
  }
}

const fmt = ms => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return `${m}:${s}`;
};

function updateTimer() {
  timerEl.textContent = `Tiempo: ${fmt(Date.now() - startedAt)}`;
}

function startTimer() {
  clearInterval(timerId);
  startedAt = Date.now();
  updateTimer();
  timerId = setInterval(updateTimer, 250);
}

function stopTimer() {
  clearInterval(timerId);
}

function shortHash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}

function loadRankingStore() {
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveRankingStore(store) {
  try {
    localStorage.setItem(RANKING_KEY, JSON.stringify(store));
  } catch {
    // Ignore persistence errors to keep the game playable.
  }
}

function renderRanking() {
  if (!size || !currentBoardKey) {
    rankingEl.hidden = true;
    return;
  }

  const store = loadRankingStore();
  const entries = Array.isArray(store[currentBoardKey]) ? store[currentBoardKey] : [];

  if (!entries.length) {
    rankingEl.hidden = true;
    return;
  }

  rankingEl.hidden = false;
  rankingBoardEl.textContent = `Tablero ${currentBoardLabel}`;
  rankingListEl.innerHTML = entries
    .map((entry, idx) => {
      return `<li class="rank-item${idx === 0 ? ' is-top' : ''}">${fmt(entry.timeMs)}</li>`;
    })
    .join('');
}

function saveCurrentTimeInRanking(timeMs) {
  if (!currentBoardKey) return;

  const store = loadRankingStore();
  const entries = Array.isArray(store[currentBoardKey]) ? store[currentBoardKey] : [];
  entries.push({ timeMs, at: Date.now() });
  entries.sort((a, b) => a.timeMs - b.timeMs);
  store[currentBoardKey] = entries.slice(0, MAX_RANKING_ITEMS);
  saveRankingStore(store);
}

// --- Board selection ---
function pickBoard(n) {
  const opts = tableros[n];
  let b;
  do { b = opts[Math.random() * opts.length | 0]; } while (opts.length > 1 && b === lastBoard);
  return (lastBoard = b).flat();
}

// --- Game logic (pure) ---
function getConflicts() {
  const qs = [];
  cells.forEach((s, i) => { if (s === QUEEN) qs.push(i); });
  const conflicts = new Set();
  for (let a = 0; a < qs.length; a++) {
    const ax = qs[a] % size, ay = qs[a] / size | 0;
    for (let b = a + 1; b < qs.length; b++) {
      const bx = qs[b] % size, by = qs[b] / size | 0;
      if (ax === bx || ay === by ||
          (Math.abs(ax - bx) === 1 && Math.abs(ay - by) === 1) ||
          board[qs[a]] === board[qs[b]]) {
        conflicts.add(qs[a]);
        conflicts.add(qs[b]);
      }
    }
  }
  return conflicts;
}

function getAttacked() {
  const set = new Set();
  cells.forEach((s, i) => {
    if (s !== QUEEN) return;
    const x = i % size, y = i / size | 0;
    for (let k = 0; k < size; k++) {
      set.add(y * size + k);
      set.add(k * size + x);
    }
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) set.add(ny * size + nx);
    });
  });
  return set;
}

// --- Rendering ---
function createBoard() {
  boardEl.style.gridTemplateColumns = `repeat(${size}, 50px)`;
  boardEl.innerHTML = '';
  for (let i = 0; i < size * size; i++) {
    const div = document.createElement('div');
    div.className = 'cell';
    div.dataset.i = i;
    div.style.backgroundColor = COLORS[board[i]];
    boardEl.appendChild(div);
  }
}

function update() {
  const conflicts = getConflicts();
  const attacked = getAttacked();
  const divs = boardEl.children;

  for (let i = 0; i < divs.length; i++) {
    const d = divs[i];
    d.className = 'cell';
    d.textContent = '';
    if (cells[i] === QUEEN) {
      d.classList.add('queen');
      if (conflicts.has(i)) d.classList.add('conflict');
    } else if (cells[i] === MARK) {
      d.classList.add('marked');
      d.textContent = '✕';
    } else if (attacked.has(i)) {
      d.classList.add('attacked');
      d.textContent = '✕';
    }
  }

  boardEl.classList.toggle('disabled', won);
  const qCount = cells.filter(s => s === QUEEN).length;
  if (!won && qCount === size && conflicts.size === 0) {
    won = true;
    boardEl.classList.add('disabled');
    stopTimer();
    const elapsed = Date.now() - startedAt;
    saveCurrentTimeInRanking(elapsed);
    renderRanking();
    winTimeEl.textContent = `Has tardado ${fmt(elapsed)}.`;
    togglePopup(winEl, true);
  }
}

// --- Events ---
function togglePopup(el, show) {
  el.classList.toggle('show', show);
  overlayEl.classList.toggle('show', show);
}

function startGame(n) {
  size = n;
  board = pickBoard(n);
  const signature = board.join(',');
  currentBoardKey = `${size}|${signature}`;
  currentBoardLabel = `${size}x${size} - ${shortHash(signature)}`;
  startRound();
}

function startRound() {
  if (!size || !board) return;
  cells = new Array(size * size).fill(EMPTY);
  won = false;
  shuffleBtn.disabled = false;
  menuEl.classList.remove('show');
  winEl.classList.remove('show');
  overlayEl.classList.remove('show');
  createBoard();
  startTimer();
  renderRanking();
  update();
}

boardEl.addEventListener('click', e => {
  const cell = e.target.closest('.cell');
  if (!cell || won) return;
  const i = +cell.dataset.i;
  cells[i] = cells[i] === QUEEN ? EMPTY : QUEEN;
  update();
});

boardEl.addEventListener('contextmenu', e => {
  const cell = e.target.closest('.cell');
  if (!cell || won) return;
  e.preventDefault();
  const i = +cell.dataset.i;
  if (cells[i] === QUEEN) return;
  cells[i] = cells[i] === MARK ? EMPTY : MARK;
  update();
});

$('menu-btn').addEventListener('click', () => togglePopup(menuEl, true));

$('close-menu').addEventListener('click', e => {
  e.stopPropagation();
  togglePopup(menuEl, false);
});

shuffleBtn.addEventListener('click', () => {
  if (size) startGame(size);
});

$('next-board').addEventListener('click', e => {
  e.stopPropagation();
  startGame(size);
});

$('retry-board').addEventListener('click', e => {
  e.stopPropagation();
  startRound();
});

menuEl.addEventListener('click', e => {
  if (e.target.dataset.size) startGame(+e.target.dataset.size);
});

winEl.addEventListener('click', () => togglePopup(winEl, false));

// --- Init ---
loadVersion();
renderRanking();
togglePopup(menuEl, true);