// src/lib/utils.ts
// Utilidades compartidas y puras para la aplicación

export const uniq = <T,>(arr: T[]): T[] => [...new Set(arr)];

export const norm = (s: string): string => s.toLowerCase().trim();

// Genera enlace de WhatsApp con texto, normalizando el teléfono al prefijo 34 si falta
export function waLinkWithText(tel: string, message: string): string {
  const digits = tel.replace(/\D/g, "");
  const n = digits.startsWith("34") ? digits : `34${digits}`;
  const text = encodeURIComponent(message);
  return `https://wa.me/${n}?text=${text}`;
}

// Obtiene las etiquetas más frecuentes desde un objeto con conteos
export function topTags(
  stats?: { tagsCount?: Record<string, number> },
  limit = 3
): string[] {
  if (!stats || !stats.tagsCount) return [];
  return Object.entries(stats.tagsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

// Hash simple (FNV-1a 32-bit) para derivar una semilla numérica a partir de una cadena
function hashStringToSeed(str: string): number {
  let h = 0x811c9dc5 >>> 0; // offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
    h >>>= 0;
  }
  return h >>> 0;
}

// PRNG mulberry32 basado en una semilla de 32 bits
export function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Semilla diaria determinista (UTC) a partir de la fecha
export function dailySeed(date = new Date()): number {
  const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
  return hashStringToSeed(key);
}

// Barajado determinista con Fisher–Yates usando PRNG sembrado o Math.random si no se da semilla
export function seededShuffle<T>(array: T[], seed?: number): T[] {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
