import WordPressService from '@/lib/wordpressService';

// Tope de la API REST de WordPress por petición.
export const PER_PAGE = 100;

// 50 páginas = 5.000 URLs por archivo de sitemap.
export const PAGES_PER_CHUNK = 50;

/**
 * Cuántas páginas de 100 notas incluir en total.
 *
 * Está limitado a propósito. El backend aguanta ~8 peticiones por segundo
 * sostenidas (medido: 8 en paralelo pasan limpias, 16 tumban un 20% con
 * errores 500), y durante el build Next genera todos los sitemaps a la vez.
 * Cubrir las 35.703 notas serían 358 peticiones, que a ese caudal no entran
 * en el límite de tiempo de una función de Vercel.
 *
 * 100 páginas = las 10.000 notas más recientes: cubre con holgura los últimos
 * años, que es donde está prácticamente todo el tráfico de búsqueda.
 *
 * PARA CUBRIR EL 100%: hay que bajar el número de peticiones, no subir la
 * concurrencia. Con un filtro en WordPress que permita per_page=1000
 * (ver docs/wordpress-sitemap-per-page.md), 358 llamadas pasan a 36 y este
 * tope se puede quitar.
 */
export const MAX_PAGES = 100;

/** Cuántos archivos de sitemap hacen falta. */
export async function countSitemapChunks() {
  try {
    const { totalPages } = await WordPressService.getPostSlugs(1, PER_PAGE);
    const pages = Math.min(totalPages, MAX_PAGES);
    return Math.max(1, Math.ceil(pages / PAGES_PER_CHUNK));
  } catch (error) {
    // Si WordPress no responde, un sitemap es mejor que ninguno: se
    // regenerará completo en la siguiente revalidación.
    console.error('No se pudo calcular el número de sitemaps:', error);
    return 1;
  }
}
