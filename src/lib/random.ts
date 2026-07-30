/**
 * Randomness helpers backed by the Web Crypto API.
 *
 * The game only needs "unpredictable enough to feel fair", but `Math.random` is
 * flagged as an unsafe generator by static analysis, so everything that shuffles
 * gameplay state goes through these helpers instead. Procedural board
 * generation deliberately does *not* use them: it seeds `mulberry32` so the
 * shipped board catalogue stays identical between builds.
 */

/** Returns a random float in the `[0, 1)` range. */
export function randomUnit(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 4294967296;
}

/** Returns a random integer in the `[0, max)` range. Returns 0 when `max <= 0`. */
export function randomInt(max: number): number {
  if (max <= 0) return 0;
  return Math.trunc(randomUnit() * max);
}
