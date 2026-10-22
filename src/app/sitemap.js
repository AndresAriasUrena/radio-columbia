import WordPressService from '@/lib/wordpressService';
import { PER_PAGE, PAGES_PER_CHUNK, MAX_PAGES, countSitemapChunks } from '@/lib/sitemapChunks';

// Una vez al día. Con más de 35.000 notas, reconstruirlo cada pocos minutos
// devolvería a WordPress justo la carga que acabamos de quitarle.
export const revalidate = 86400;

/**
 * Next.js genera un archivo por cada id devuelto acá: /sitemap/0.xml,
 * /sitemap/1.xml, etc. robots.js los declara todos.
 */
export async function generateSitemaps() {
  const chunks = await countSitemapChunks();
  return Array.from({ length: chunks }, (_, id) => ({ id }));
}

function staticPages(baseUrl) {
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sports`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/podcasts`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}

/**
 * Pide las páginas de a una.
 *
 * Medido contra el backend: 8 peticiones sostenidas en paralelo pasan sin un
 * solo fallo, 16 sostenidas tumban ~20% con errores 500. Durante el build Next
 * genera los 8 sitemaps a la vez, así que la concurrencia real es
 * (nº de sitemaps x batchSize) y solo batchSize = 1 nos deja dentro del margen.
 *
 * Subirlo rompe el build con 500 de WordPress. Si algún día hace falta que sea
 * más rápido, el camino no es subir esto sino reducir el número de peticiones:
 * permitir per_page > 100 en WordPress bajaría de 358 llamadas a ~72.
 */
async function fetchSlugPages(pages, batchSize = 1) {
  const collected = [];
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(page =>
        WordPressService.getPostSlugs(page, PER_PAGE)
          .then(result => result.slugs)
          .catch(() => [])
      )
    );
    results.forEach(slugs => collected.push(...slugs));
  }
  return collected;
}

export default async function sitemap({ id }) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://columbia.co.cr').replace(/\/+$/, '');
  const chunk = Number(id) || 0;
  const firstPage = chunk * PAGES_PER_CHUNK + 1;

  // La primera petición además nos dice cuántas páginas hay en total, así no
  // pedimos páginas inexistentes al final del último archivo.
  const first = await WordPressService.getPostSlugs(firstPage, PER_PAGE);

  const lastPage = Math.min(firstPage + PAGES_PER_CHUNK - 1, first.totalPages, MAX_PAGES);
  const remaining = Array.from(
    { length: Math.max(lastPage - firstPage, 0) },
    (_, i) => firstPage + 1 + i
  );

  const posts = [...first.slugs, ...(await fetchSlugPages(remaining))];

  const newsPages = posts.map(post => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Las páginas fijas solo en el primer archivo, para no repetirlas.
  return chunk === 0 ? [...staticPages(baseUrl), ...newsPages] : newsPages;
}
