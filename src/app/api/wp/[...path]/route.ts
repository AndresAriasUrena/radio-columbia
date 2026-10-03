import { NextRequest } from 'next/server';
import { WP_TAGS } from '@/lib/wordpressService';
import { wordpressOrigin } from '@/lib/wpOrigin';

/**
 * Proxy de lectura hacia la API REST de WordPress.
 *
 * Existe por una razón concreta: los componentes de noticias son client
 * components, así que antes cada navegador pedía ~28 veces a WordPress por
 * visita y `next: { revalidate }` nunca se aplicaba (es una directiva de
 * servidor; en el navegador se ignora). Pasando por aquí, esas peticiones
 * las sirve el Data Cache de Next.js y WordPress recibe una sola por URL.
 *
 * El caché se purga al publicar desde WordPress vía /api/revalidate, así que
 * un artículo nuevo aparece en 1-2 segundos sin consultar a WordPress en cada
 * visita.
 */

// Ventana de respaldo si se pierde un webhook de WordPress.
const FALLBACK_REVALIDATE = 600;

// Colecciones que el sitio consume. Todo lo demás se rechaza: esta ruta es
// pública, y sin lista blanca sería un amplificador hacia WordPress.
const ALLOWED_COLLECTIONS = new Set(['posts', 'categories', 'tags', 'media', 'users']);

// Parámetros que usan los componentes. Los demás se descartan para que nadie
// pueda inventar URLs nuevas y llenar el caché con consultas caras.
const ALLOWED_PARAMS = new Set([
  '_embed', '_fields', 'per_page', 'page', 'offset',
  'categories', 'categories_exclude', 'tags', 'search',
  'orderby', 'order', 'exclude', 'include', 'slug', 'parent',
]);

const MAX_PER_PAGE = 50;

/**
 * Política de caché por colección.
 *
 * - posts: sin caché de navegador/CDN. Así la frescura la decide el Data
 *   Cache, que el webhook sí puede purgar → una publicación se ve enseguida.
 * - categories / tags: cambian muy de vez en cuando, y cuatro componentes
 *   distintos piden la misma lista en cada carga. Cachearlas en el navegador
 *   y en el edge convierte esas cuatro peticiones en una.
 */
const CACHE_POLICY: Record<string, string> = {
  posts: 'private, no-store',
  categories: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
  tags: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
  media: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  users: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
};

function buildQuery(incoming: URLSearchParams): string {
  const safe = new URLSearchParams();

  // Orden alfabético estable: dos peticiones equivalentes deben producir la
  // misma URL, o cada una ocuparía su propia entrada de caché.
  const keys = Array.from(new Set(Array.from(incoming.keys()))).sort();

  for (const key of keys) {
    if (!ALLOWED_PARAMS.has(key)) continue;

    const value = incoming.get(key) ?? '';

    if (key === 'per_page') {
      const n = Number.parseInt(value, 10);
      if (!Number.isFinite(n)) continue;
      safe.set(key, String(Math.min(Math.max(n, 1), MAX_PER_PAGE)));
      continue;
    }

    // _embed es una bandera: WordPress solo mira si está presente.
    if (key === '_embed') {
      safe.set('_embed', '');
      continue;
    }

    safe.set(key, value);
  }

  const query = safe.toString().replace(/_embed=(&|$)/, '_embed$1');
  return query ? `?${query}` : '';
}

function tagsFor(collection: string, params: URLSearchParams): string[] {
  const tags = [WP_TAGS.all, `wp-${collection}`];

  // Una consulta por slug es la de un artículo concreto: la etiquetamos
  // aparte para poder purgar solo ese artículo al editarlo.
  const slug = params.get('slug');
  if (collection === 'posts' && slug) {
    tags.push(WP_TAGS.post(slug));
  }

  return tags;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const segments = params.path ?? [];
  const collection = segments[0];

  if (!collection || !ALLOWED_COLLECTIONS.has(collection) || segments.length > 2) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // Un segundo segmento solo puede ser un id numérico (/posts/123).
  if (segments.length === 2 && !/^\d+$/.test(segments[1])) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const query = buildQuery(req.nextUrl.searchParams);
  const upstream = `${wordpressOrigin()}/${segments.join('/')}${query}`;

  let res: Response;
  try {
    res = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      next: {
        revalidate: FALLBACK_REVALIDATE,
        tags: tagsFor(collection, req.nextUrl.searchParams),
      },
    });
  } catch (error) {
    console.error(`[api/wp] WordPress unreachable: ${upstream}`, error);
    return Response.json({ error: 'upstream_unreachable' }, { status: 502 });
  }

  if (!res.ok) {
    console.error(`[api/wp] ${res.status} ${res.statusText}: ${upstream}`);
    return Response.json({ error: 'upstream_error' }, { status: res.status === 404 ? 404 : 502 });
  }

  const body = await res.text();

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // getPosts() lee la paginación de estas cabeceras; sin reenviarlas se
      // rompe el botón "cargar más".
      'x-wp-total': res.headers.get('x-wp-total') ?? '0',
      'x-wp-totalpages': res.headers.get('x-wp-totalpages') ?? '1',
      'access-control-expose-headers': 'x-wp-total, x-wp-totalpages',
      'cache-control': CACHE_POLICY[collection] ?? 'private, no-store',
    },
  });
}
