import { describe, it, expect } from 'vitest';

// Copy minimal logic of toList and parseCSV for unit testing in isolation.

type Tamano = 'pequeña' | 'mediana' | 'grande';

type Vespa = {
  id: string;
  nombre: string;
  telefono: string;
  servicios: string[];
  tamano: Tamano;
  zonas: string[];
  horario: string;
  notas?: string;
  visible: boolean;
  prioridad: number;
  trabajosVerificados: number;
  etiquetas?: string[];
  destacado?: boolean;
  rating?: number;
  reviews?: number;
};

const toList = (s: string) => (s || '').split(';').map(x => x.trim()).filter(Boolean);

function parseCSV(csv: string): Vespa[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length <= 1) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const get = (row: string[], key: string) => {
    const i = headers.indexOf(key);
    return i >= 0 ? (row[i] ?? '').trim() : '';
  };
  return lines.slice(1).map((line) => {
    const r = line.split(',').map((c) => c.trim());
    const id = get(r, 'id') || 'gen';
    const nombre = get(r, 'nombre');
    const telefono = get(r, 'telefono').replace(/\D/g, '');
    const servicios = toList(get(r, 'servicios'));
    const tamano = ((get(r, 'tamano').toLowerCase() || 'mediana') as Tamano);
    const zonas = toList(get(r, 'zonas'));
    const horario = ((get(r, 'horario') || 'flexible')) || 'flexible';
    const notas = get(r, 'notas') || undefined;
    const visible = (get(r, 'visible') || 'true').toLowerCase() !== 'false';
    const prioridad = Number(get(r, 'prioridad') || '0');
    const trabajosVerificados = Number(get(r, 'trabajosVerificados') || '0');
    const etiquetas = toList(get(r, 'etiquetas'));
    const destacado = (get(r, 'destacado') || 'false').toLowerCase() === 'true';
    const rating = Number(get(r, 'rating') || '0');
    const reviews = Number(get(r, 'reviews') || '0');
    return { id, nombre, telefono, servicios, tamano, zonas, horario, notas, visible, prioridad, trabajosVerificados, etiquetas, destacado, rating, reviews } as Vespa;
  });
}

describe('data utils', () => {
  it('toList splits and trims and filters blanks', () => {
    expect(toList('a; b ; ;c')).toEqual(['a','b','c']);
  });
  it('parseCSV handles empty or header-only', () => {
    expect(parseCSV('id,nombre\n')).toEqual([]);
  });
  it('parseCSV parses a row with defaults', () => {
    const csv = 'id,nombre,telefono,servicios,tamano,zonas,horario,visible,prioridad,trabajosVerificados,etiquetas,destacado,rating,reviews\n' +
                ',Juan, +34 666 111 222 ,a;b, , , , , , ,x;y ,true,4.5,10';
    const [v] = parseCSV(csv);
    expect(v.nombre).toBe('Juan');
    expect(v.telefono).toBe('34666111222');
    expect(v.servicios).toEqual(['a','b']);
    expect(v.tamano).toBe('mediana');
    expect(v.zonas).toEqual([]);
    expect(v.horario).toBe('flexible');
    expect(v.visible).toBe(true);
    expect(v.etiquetas).toEqual(['x','y']);
    expect(v.destacado).toBe(true);
    expect(v.rating).toBe(4.5);
    expect(v.reviews).toBe(10);
  });
});
