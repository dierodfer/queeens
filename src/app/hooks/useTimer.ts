import { useCallback, useEffect, useRef, useState } from 'react';

export type Timer = {
  elapsed: number;
  setElapsed: (ms: number) => void;
  start: () => void;
  stop: () => void;
  /** Milliseconds elapsed since the last `start()`, computed on demand. */
  since: () => number;
};

/** A simple stopwatch that ticks every 250ms while running. */
export function useTimer(): Timer {
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    startedAt.current = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 250);
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
  }, []);

  const since = useCallback(() => Date.now() - startedAt.current, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    },
    [],
  );

  return { elapsed, setElapsed, start, stop, since };
}
