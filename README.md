![Queeens](src/assets/queeens-image.png)

![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0.1-646CFF?logo=vite&logoColor=white)

## ▶️ Acceso a la aplicación web

[¡Juega ahora en GitHub Pages!](https://dierodfer.github.io/queeens/)

Fast, clean, and a little chaotic.
Queeens is a logic puzzle game built with React, TypeScript and Vite, where you place one queen per region without conflicts, based on the 8 queens problem.

## Game Rules ♟️

- Place exactly one queen in each region.
- Avoid conflicts in the same row.
- Avoid conflicts in the same column.
- Avoid adjacent diagonals.
- Avoid placing queens in the same region/color.

Attacked cells are marked and blocked for queen placement, so the board stays readable while you solve.

## Features ✨

- Queen progress counter shown as `Queeens: X/N`.
- Live timer during the run in `mm:ss` format.
- Local leaderboard per board (top 5), stored in `localStorage`.
- Three game modes: `Classic`, `Twister`, and `Blind`.
- Blind difficulty levels: `Easy`, `Medium`, and `Hard`.
- Bilingual interface: English and Spanish.
- In-game menu and board restart flow.

## Quick Start 🚀

```bash
npm install
npm start
```

Other useful commands:

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run preview      # preview the production build
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run format       # format with Prettier
npm test             # run the unit tests (Vitest)
```

## Project Structure 📁

```text
.
├── .github/workflows/
│   ├── deploy.yml
│   └── release-version.yml
├── index.html
├── public/
│   └── version.yml
├── src/
│   ├── app/
│   │   ├── components/        # presentational components
│   │   │   ├── Board.tsx
│   │   │   ├── Cell.tsx
│   │   │   ├── ExitConfirm.tsx
│   │   │   ├── Menu.tsx
│   │   │   ├── Ranking.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── WinPopup.tsx
│   │   │   └── types.ts
│   │   ├── hooks/             # stateful behavior
│   │   │   ├── useBlindPreview.ts
│   │   │   ├── useTimer.ts
│   │   │   └── useTwisterRotation.ts
│   │   ├── constants.ts       # board sizes, colors, animation timing
│   │   ├── Queeens.css
│   │   └── Queeens.tsx        # game state orchestration
│   ├── assets/
│   │   ├── queeens-image.png
│   │   ├── queen-danger.svg
│   │   └── queen-white.svg
│   ├── data/
│   │   └── boards.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en.ts
│   │       └── es.ts
│   ├── lib/                   # pure game logic + unit tests
│   │   ├── blind.ts
│   │   ├── boardPicker.ts
│   │   ├── format.ts
│   │   ├── game.ts
│   │   └── ranking.ts
│   ├── main.tsx
│   └── types/
│       └── i18n.ts
├── eslint.config.js
├── .prettierrc.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Architecture 🧩

The code is organized in layers so each piece stays small and focused:

- **`src/lib/`** — pure, framework-agnostic game logic (conflict/attack
  detection, board rotation, ranking, time formatting, blind timing). No React,
  fully unit-tested.
- **`src/app/hooks/`** — stateful behavior isolated from rendering: `useTimer`
  (stopwatch), `useBlindPreview` (memorize countdown) and `useTwisterRotation`
  (board rotation triggers and timers).
- **`src/app/components/`** — presentational components that only render props.
- **`src/app/Queeens.tsx`** — orchestrates state and wires the hooks and
  components together.

## Testing 🧪

Unit tests run with [Vitest](https://vitest.dev/) and cover the pure logic in
`src/lib/` (conflict/attack detection, rotation, ranking storage, formatting and
blind timing).

```bash
npm test          # run once
npm run test:watch # watch mode
```
