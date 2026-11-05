// Resultados de los sorteos de la JPS (Lotería Nacional y Chances).
//
// La API oficial (integration.jps.go.cr) quedó detrás de un WAF que responde 403 a
// clientes servidor-a-servidor: no es cuestión de cabeceras, filtra por fingerprint
// TLS / reputación de IP, así que el `fetch` de Vercel no pasa. Mientras eso siga así
// la fuente primaria es nacionalloteria.com — ver SOURCE_ORDER al final del archivo,
// que es el único lugar donde se revierte.
//
// El chequeo de frescura no es decorativo: el Data Cache de Next conserva la última
// respuesta buena cuando la revalidación falla, así que sin él un sorteo de hace
// semanas se sigue sirviendo indefinidamente — que es exactamente cómo el widget
// quedó clavado en octubre.

export type Game = 'loteria' | 'chances';

export interface Prize {
  rank: number;
  numero: string;
  serie: string;
  premio: number | null;
}

export interface Draw {
  fecha: string;
  premios: Prize[];
  sorteo: number | null;
  source: 'jps' | 'nacionalloteria' | null;
  stale: boolean;
}

export const DRAW_REVALIDATE = 1800; // 30 min

// Ningún sorteo vigente puede ser más viejo: Lotería Nacional es semanal (domingos) y
// Chances se juega martes y viernes. Pasado este margen la fuente quedó atrás.
const MAX_DRAW_AGE_DAYS = 10;

const OFFICIAL_CODE: Record<Game, string> = {
  loteria: 'loterianacional',
  chances: 'chances',
};

const AGGREGATOR_SLUG: Record<Game, string> = {
  loteria: 'loteria-nacional',
  chances: 'chances',
};

const AGGREGATOR_BASE = 'https://www.nacionalloteria.com/costarica';

const AGGREGATOR_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; RadioColumbia/1.0; +https://columbia.co.cr)',
  Accept: 'text/html,application/xhtml+xml',
};

const EMPTY: Draw = { fecha: '', premios: [], sorteo: null, source: null, stale: true };

/** Primer grupo de dígitos, descartando negativos y separadores. */
function firstNumber(value: unknown): string {
  if (typeof value === 'number') return value >= 0 ? String(value) : '';
  return String(value ?? '').match(/\d+/)?.[0] ?? '';
}

/** Todos los dígitos juntos: convierte "₡ 175.000.000" en 175000000. */
function allDigits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

// La JPS presenta el número con 2 dígitos y la serie con 3 ("08", "047"). La API
// oficial los manda como enteros, así que se normaliza para que el formato no cambie
// según la fuente que respondió.
function makePrize(rank: number, numero: unknown, serie: unknown, premio: unknown): Prize | null {
  const n = firstNumber(numero);
  if (!n) return null;
  const s = firstNumber(serie);
  const monto = typeof premio === 'number' ? premio : Number(allDigits(premio));
  return {
    rank,
    numero: n.padStart(2, '0'),
    serie: s ? s.padStart(3, '0') : '',
    premio: Number.isFinite(monto) && monto > 0 ? monto : null,
  };
}

/** Medianoche local, igual que la API oficial, para que el navegador no reste un día. */
function normalizeFecha(raw: unknown): string {
  const m = String(raw ?? '').match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? `${m[1]}T00:00:00` : '';
}

function drawAgeDays(draw: Draw): number {
  const t = Date.parse(draw.fecha);
  if (!Number.isFinite(t)) return Number.POSITIVE_INFINITY;
  return (Date.now() - t) / 86_400_000;
}

function isCurrent(draw: Draw): boolean {
  return drawAgeDays(draw) < MAX_DRAW_AGE_DAYS;
}

async function safe<T>(fn: () => Promise<T | null>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

// --- Fuente autoritativa: API de la JPS -------------------------------------

async function fetchOfficial(game: Game): Promise<Draw | null> {
  const url = `https://integration.jps.go.cr/api/App/${OFFICIAL_CODE[game]}/last`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: DRAW_REVALIDATE },
  });
  if (!res.ok) return null;

  const data: any = await res.json();
  const items: any[] = Array.isArray(data?.premios) ? data.premios : [];

  // `tipo` 1/2/3 son los tres premios mayores. `orden` no sirve para esto: en
  // Lotería Nacional el orden 1 es un premio menor de ₡400.000.
  const byTipo = new Map<number, any>();
  for (const it of items) {
    const tipo = Number(it?.tipo);
    if (tipo >= 1 && tipo <= 3 && !byTipo.has(tipo)) byTipo.set(tipo, it);
  }

  const premios = [1, 2, 3]
    .map((rank) => {
      const it = byTipo.get(rank);
      return it ? makePrize(rank, it.numero, it.serie, it.monto) : null;
    })
    .filter((p): p is Prize => p !== null);

  if (premios.length === 0) return null;

  return {
    fecha: normalizeFecha(data?.fecha),
    premios,
    sorteo: Number(data?.numeroSorteo) || null,
    source: 'jps',
    stale: false,
  };
}

// --- Respaldo: nacionalloteria.com ------------------------------------------

const RANK_LABELS: Array<[RegExp, number]> = [
  [/^primer\s+premio\b/i, 1],
  [/^segundo\s+premio\b/i, 2],
  [/^tercer\s+premio\b/i, 3],
];

/**
 * Lee la tabla de premios de una página de sorteo. Las filas relevantes vienen como
 * ["Primer Premio ₡ 175.000.000", "27", "130, ... -"]; las variantes sin serie
 * ("Primero sin serie") no hacen match y se descartan solas.
 */
function parsePrizeTable(html: string): Prize[] {
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
  const found = new Map<number, Prize>();

  for (const row of body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = Array.from(row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)).map((c) =>
      c[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
    if (cells.length < 3) continue;

    const label = cells[0];
    for (const [re, rank] of RANK_LABELS) {
      if (found.has(rank) || !re.test(label)) continue;
      const prize = makePrize(rank, cells[1], cells[2], label.match(/₡\s*([\d.,]+)/)?.[1]);
      if (prize) found.set(rank, prize);
    }
  }

  return [1, 2, 3].map((r) => found.get(r)).filter((p): p is Prize => p !== undefined);
}

async function fetchAggregator(game: Game): Promise<Draw | null> {
  const slug = AGGREGATOR_SLUG[game];

  const indexRes = await fetch(`${AGGREGATOR_BASE}/${slug}.php`, {
    headers: AGGREGATOR_HEADERS,
    next: { revalidate: DRAW_REVALIDATE },
  });
  if (!indexRes.ok) return null;
  const index = await indexRes.text();

  // Los enlaces `?del-dia=` salen en orden descendente y el primero es el sorteo
  // destacado. No se puede tomar el máximo: la lista incluye un enlace de calendario
  // a la fecha de hoy, que puede no tener sorteo. Se validan en orden contra su
  // propia tabla de premios.
  const candidates: string[] = [];
  const seen = new Set<string>();
  for (const m of index.matchAll(/del-dia=(\d{4}-\d{2}-\d{2})/g)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    candidates.push(m[1]);
    if (candidates.length >= 3) break;
  }

  for (const date of candidates) {
    const res = await fetch(`${AGGREGATOR_BASE}/${slug}.php?del-dia=${date}`, {
      headers: AGGREGATOR_HEADERS,
      next: { revalidate: DRAW_REVALIDATE },
    });
    if (!res.ok) continue;

    const html = await res.text();
    const premios = parsePrizeTable(html);
    if (premios.length === 0) continue;

    return {
      fecha: `${date}T00:00:00`,
      premios,
      sorteo: Number(html.match(/(?:Loteria Nacional|Chances)\s+(\d{3,5})/i)?.[1]) || null,
      source: 'nacionalloteria',
      stale: false,
    };
  }

  return null;
}

// --- Orquestación -----------------------------------------------------------

type Source = Exclude<Draw['source'], null>;

const FETCHERS: Record<Source, (game: Game) => Promise<Draw | null>> = {
  jps: fetchOfficial,
  nacionalloteria: fetchAggregator,
};

// ⚠️ ARREGLO TEMPORAL (noviembre 2026) — revertir a ['jps', 'nacionalloteria'].
//
// nacionalloteria.com va de primera porque `integration.jps.go.cr` responde 403 a todo
// cliente servidor-a-servidor desde mediados de octubre de 2026. Dejar la API oficial
// de primera costaba un round-trip fallido en cada revalidación, sin ganar nada.
//
// La API de la JPS es la fuente correcta y debe volver al primer lugar en cuanto
// habiliten las IPs de egreso de Vercel (trámite abierto con la institución). El
// respaldo raspa el HTML de un sitio de terceros con publicidad: sirve de puente, no
// de fuente definitiva, y se rompe en silencio si le cambian el markup. Invertir este
// arreglo es cambiar solo esta línea.
const SOURCE_ORDER: Source[] = ['nacionalloteria', 'jps'];

export async function getLastDraw(game: Game): Promise<Draw> {
  const vencidos: Draw[] = [];

  for (const source of SOURCE_ORDER) {
    const draw = await safe(() => FETCHERS[source](game));
    if (!draw) continue;
    if (isCurrent(draw)) return draw;
    vencidos.push(draw);
  }

  // Ninguna fuente trae un sorteo vigente. Se devuelve el más reciente que haya,
  // marcado como vencido para que la UI no lo presente como el sorteo de hoy.
  const best = vencidos.sort((a, b) => drawAgeDays(a) - drawAgeDays(b))[0];
  return best ? { ...best, stale: true } : EMPTY;
}
