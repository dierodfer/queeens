import { describe, expect, it } from 'vitest';
import { fmt, fmtClock, parseVersionFromYaml, shortHash } from './format';

describe('fmt', () => {
  it('formats milliseconds as mm:ss.mmm', () => {
    expect(fmt(0)).toBe('00:00.000');
    expect(fmt(1234)).toBe('00:01.234');
    expect(fmt(65000)).toBe('01:05.000');
  });

  it('clamps negative values to zero', () => {
    expect(fmt(-5)).toBe('00:00.000');
  });
});

describe('fmtClock', () => {
  it('formats milliseconds as mm:ss', () => {
    expect(fmtClock(0)).toBe('00:00');
    expect(fmtClock(65000)).toBe('01:05');
    expect(fmtClock(599000)).toBe('09:59');
  });
});

describe('parseVersionFromYaml', () => {
  it('reads an unquoted version', () => {
    expect(parseVersionFromYaml('version: 1.2.3')).toBe('1.2.3');
  });

  it('strips surrounding quotes', () => {
    expect(parseVersionFromYaml("version: '1.0.0'")).toBe('1.0.0');
    expect(parseVersionFromYaml('version: "2.0.0"')).toBe('2.0.0');
  });

  it('falls back to -- when missing', () => {
    expect(parseVersionFromYaml('name: queeens')).toBe('--');
  });
});

describe('shortHash', () => {
  it('is deterministic and 6 hex chars', () => {
    const h = shortHash('4|0,1,2,3');
    expect(h).toMatch(/^[0-9a-f]{6}$/);
    expect(shortHash('4|0,1,2,3')).toBe(h);
  });

  it('differs for different inputs', () => {
    expect(shortHash('a')).not.toBe(shortHash('b'));
  });
});
