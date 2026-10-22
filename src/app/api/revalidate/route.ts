import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { WP_TAGS } from '@/lib/wordpressService';

/**
 * WordPress avisa aquí cada vez que cambia un post, y purgamos el caché.
 *
 * Esto es lo que permite tener las dos cosas a la vez: el caché puede durar
 * mucho (WordPress recibe muy pocas peticiones) y una publicación se ve en
 * 1-2 segundos, porque no esperamos a que el caché expire: lo tiramos.
 *
 * Instalar en WordPress: wp-content/mu-plugins/columbia-revalidate.php
 * (ver docs/wordpress-revalidate.md)
 */

function authorized(given: string | null): boolean {
  const expected = process.env.WP_REVALIDATE_SECRET;
  if (!expected || !given) return false;

  const a = Buffer.from(given);
  const b = Buffer.from(expected);

  // Longitudes distintas: timingSafeEqual lanzaría, y comparar antes ya
  // filtra ese caso sin dar información de tiempo sobre el contenido.
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorized(req.headers.get('x-columbia-secret'))) {
    // Sin detalles: no conviene decir si falta el secreto o si no coincide.
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({} as Record<string, unknown>));
  const slug = typeof payload.slug === 'string' && payload.slug.length > 0 ? payload.slug : null;

  // Un post nuevo o editado puede aparecer en cualquier listado (home,
  // noticias, deportes, relacionados), así que se purgan todos los listados.
  revalidateTag(WP_TAGS.posts);
  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath('/sports');

  if (slug) {
    revalidateTag(WP_TAGS.post(slug));
    revalidatePath(`/${slug}`);
  }

  // El sitemap NO se purga acá, a propósito.
  //
  // Vive en /sitemap/0.xml y /sitemap/1.xml, y regenerar cada uno cuesta 50
  // llamadas a WordPress. Purgarlo en cada publicación serían miles de
  // llamadas diarias para algo que Google lee una o dos veces al día.
  // El ciclo diario de sitemap.js (revalidate = 86400) es la frecuencia
  // correcta; una nota nueva entra al sitemap dentro de las 24 horas y
  // mientras tanto se descubre por la portada y los enlaces internos.

  return Response.json({
    ok: true,
    revalidated: slug ?? 'listings',
    at: new Date().toISOString(),
  });
}

/** Sonda para comprobar desde WordPress que la ruta existe y está desplegada. */
export async function GET() {
  return Response.json({
    ok: true,
    method: 'POST',
    secretConfigured: Boolean(process.env.WP_REVALIDATE_SECRET),
  });
}
