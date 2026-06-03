import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

export type BlindPreview = {
  active: boolean;
  remainingMs: number;
  begin: (ms: number, clearQueensOnEnd?: boolean) => void;
  stop: () => void;
};

/**
 * Drives the "memorize the board" countdown used by blind mode. `onClearQueens`
 * is invoked when a preview that was started with `clearQueensOnEnd` finishes.
 */
export function useBlindPreview(onClearQueens: () => void): BlindPreview {
  const [active, setActive] = useState(false);
  const [until, setUntil] = useState<number | null>(null);
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const clearOnEndRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
  }, []);

  const stop = useCallback(() => {
    const shouldClearQueens = active && clearOnEndRef.current;
    clearOnEndRef.current = false;
    clear();
    setActive(false);
    setUntil(null);
    if (shouldClearQueens) onClearQueens();
  }, [active, clear, onClearQueens]);

  const begin = useCallback(
    (ms: number, clearQueensOnEnd = false) => {
      clearOnEndRef.current = clearQueensOnEnd;
      clear();
      setActive(true);
      setUntil(Date.now() + ms);
      tickRef.current = window.setInterval(tick, 250);
      timerRef.current = window.setTimeout(stop, ms);
    },
    [clear, stop],
  );

  useEffect(() => clear, [clear]);

  return { active, remainingMs: until ? Math.max(0, until - Date.now()) : 0, begin, stop };
}
