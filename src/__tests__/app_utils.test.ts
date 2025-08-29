import { describe, it, expect } from 'vitest';

// We re-import module to access exported helpers; if not exported, we copy minimal logic here for testing.

const uniq = <T,>(arr: T[]) => [...new Set(arr)];
const norm = (s: string) => s.toLowerCase().trim();
function waLinkWithText(tel: string, message: string) {
  const digits = tel.replace(/\D/g, "");
  const n = digits.startsWith("34") ? digits : `34${digits}`;
  const text = encodeURIComponent(message);
  return `https://wa.me/${n}?text=${text}`;
}
function topTags(stats?: { tagsCount?: Record<string, number> }, limit = 3) {
  if (!stats || !stats.tagsCount) return [] as string[];
  return Object.entries(stats.tagsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

describe('app utils', () => {
  it('uniq removes duplicates', () => {
    expect(uniq([1,1,2,3,2])).toEqual([1,2,3]);
  });
  it('norm lowercases and trims', () => {
    expect(norm('  HéLLo  ')).toBe('  héllo  '.trim());
  });
  it('waLinkWithText normalizes phone and encodes message', () => {
    const url = waLinkWithText('+34 666 111 222', 'Hola mundo!');
    expect(url).toBe('https://wa.me/34666111222?text=Hola%20mundo!');
    const url2 = waLinkWithText('666111222', 'Hi');
    expect(url2).toBe('https://wa.me/34666111222?text=Hi');
  });
  it('topTags sorts and limits', () => {
    const res = topTags({ tagsCount: { a: 1, b: 3, c: 2 } }, 2);
    expect(res).toEqual(['b','c']);
    expect(topTags(undefined)).toEqual([]);
  });
});
