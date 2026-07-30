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

/** Strips one layer of matching leading/trailing quotes, if present. */
function unquote(raw: string): string {
  const first = raw[0];
  const last = raw[raw.length - 1];
  if (raw.length >= 2 && (first === "'" || first === '"') && first === last) {
    return raw.slice(1, -1);
  }
  return raw;
}

/**
 * Extracts the `version` field from a small YAML document.
 *
 * Parsed line-by-line instead of with a single regex: a pattern combining
 * several unbounded quantifiers (leading whitespace, trailing whitespace,
 * value) is flagged by static analysis as a potential ReDoS even when the
 * quantifiers can't actually overlap, so this avoids the pattern entirely.
 */
export function parseVersionFromYaml(content: string): string {
  for (const line of content.split(/\r\n|\r|\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('version')) continue;
    const rest = trimmed.slice('version'.length).trimStart();
    if (!rest.startsWith(':')) continue;
    const raw = unquote(rest.slice(1).trim());
    return raw || '--';
  }
  return '--';
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
