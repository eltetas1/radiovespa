// src/lib/data.ts
export type Tamano = "pequeña" | "mediana" | "grande";
export type Horario = "mañana" | "tarde" | "noche" | "flexible";

export interface Vespa {
  id: string;
  nombre: string;
  telefono: string;
  servicios: string[];
  tamano: Tamano;
  zonas: string[];                 // aunque ya no se filtra por zona, lo mantenemos
  horario: Horario;
  notas?: string;
  visible: boolean;
  prioridad: number;
  trabajosVerificados: number;
  etiquetas?: string[];
  destacado?: boolean;

  // ★ valoraciones
  rating?: number;                 // 0–5 (p.ej. 4.5)
  reviews?: number;                // nº de opiniones
}

function getQueryParam(name: string) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function detectDataUrl(): string | null {
  // 1) ?data=... en la URL
  // 2) VITE_VESPAS_URL desde .env / Netlify
  return (
    getQueryParam("data") ||
    (import.meta.env.VITE_VESPAS_URL as string | undefined) ||
    null
  );
}

/** Convierte "a;b;c" -> ["a","b","c"] */
const toList = (s: string) =>
  (s || "")
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);

function parseCSV(csv: string): Vespa[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const get = (row: string[], key: string) => {
    const i = headers.indexOf(key);
    return i >= 0 ? (row[i] ?? "").trim() : "";
  };

  return lines.slice(1).map((line) => {
    const r = line.split(",").map((c) => c.trim());

    const id = get(r, "id") || crypto.randomUUID();
    const nombre = get(r, "nombre");
    const telefono = get(r, "telefono").replace(/\D/g, "");
    const servicios = toList(get(r, "servicios"));
    const tamano = ((get(r, "tamano").toLowerCase() || "mediana") as Tamano);
    const zonas = toList(get(r, "zonas"));
    const horario = ((get(r, "horario") || "flexible") as Horario) || "flexible";
    const notas = get(r, "notas") || undefined;
    const visible = (get(r, "visible") || "true").toLowerCase() !== "false";
    const prioridad = Number(get(r, "prioridad") || "0");
    const trabajosVerificados = Number(get(r, "trabajosVerificados") || "0");
    const etiquetas = toList(get(r, "etiquetas"));
    const destacado = (get(r, "destacado") || "false").toLowerCase() === "true";

    // valoraciones
    const rating = Number(get(r, "rating") || "0");
    const reviews = Number(get(r, "reviews") || "0");

    return {
      id,
      nombre,
      telefono,
      servicios,
      tamano,
      zonas,
      horario,
      notas,
      visible,
      prioridad,
      trabajosVerificados,
      etiquetas,
      destacado,
      rating,
      reviews,
    } as Vespa;
  });
}

export async function loadVespas(): Promise<Vespa[]> {
  const url = detectDataUrl();

  // Si no hay URL externa, usamos el JSON local de ejemplo
  if (!url) {
    const local = await import("../data/vespas.json");
    return local.default as Vespa[];
  }

  const res = await fetch(url);
  const text = await res.text();

  // Admitimos JSON o CSV publicado desde Google Sheets
  try {
    return JSON.parse(text) as Vespa[];
  } catch {
    return parseCSV(text);
  }
}
