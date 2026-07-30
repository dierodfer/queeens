/** Formats milliseconds as `mm:ss.mmm`. */
export const fmt = (ms: number): string => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  const milli = String(Math.max(0, ms % 1000)).padStart(3, '0');
  return `${m}:${s}.${milli}`;
};

/** Formats milliseconds as `mm:ss`. */
export const fmtClock = (ms: number): string => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(t / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * Matches the `version` key of a small YAML document. Horizontal whitespace is
 * spelled out as `[ \t]` (rather than `\s`) so the pattern cannot overlap the
 * `.*` capture, which would make it backtrack super-linearly.
 */
const VERSION_LINE = /^[ \t]*version[ \t]*:[ \t]*(.*)$/m;

/** Extracts the `version` field from a small YAML document. */
export function parseVersionFromYaml(content: string): string {
  const match = VERSION_LINE.exec(content);
  if (!match) return '--';
  const raw = match[1].trim();
  const unquoted = raw.replace(/^['"]|['"]$/g, '');
  return unquoted || '--';
}

/** Deterministic short (6 hex char) FNV-1a hash, used to label boards. */
export function shortHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.codePointAt(i) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}
