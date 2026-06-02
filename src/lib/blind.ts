import type { BlindLevel } from '../i18n';

export type BlindConfig = { baseSeconds: number; stepSeconds: number; replaySeconds: number };

export const BLIND_META: Record<BlindLevel, BlindConfig> = {
  easy: { baseSeconds: 20, stepSeconds: 10, replaySeconds: 15 },
  medium: { baseSeconds: 15, stepSeconds: 7, replaySeconds: 10 },
  hard: { baseSeconds: 5, stepSeconds: 5, replaySeconds: 5 },
};

/** Preview duration (ms) before a blind run starts, scaled by board size. */
export function getBlindPreviewMs(level: BlindLevel, boardSize: number): number {
  const cfg = BLIND_META[level];
  const stepCount = Math.max(0, boardSize - 4);
  return (cfg.baseSeconds + stepCount * cfg.stepSeconds) * 1000;
}

/** Duration (ms) of an on-demand "show again" blind replay. */
export function getBlindReplayMs(level: BlindLevel): number {
  return BLIND_META[level].replaySeconds * 1000;
}
