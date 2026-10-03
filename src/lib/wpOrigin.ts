/**
 * Origen de la API REST de WordPress.
 *
 * Deliberadamente SIN el prefijo NEXT_PUBLIC_: Next.js solo inyecta en el
 * bundle del navegador las variables con ese prefijo, así que aquí el host de
 * WordPress no viaja al cliente. Importa porque si el navegador conoce el
 * origen, cualquiera puede pegarle directo y saltarse todo el caché que
 * acabamos de montar.
 *
 * El navegador no necesita este valor: sus peticiones van a /api/wp.
 */
export function wordpressOrigin(): string {
  const origin = process.env.WORDPRESS_API_URL;

  if (!origin) {
    throw new Error(
      'Falta la variable de entorno WORDPRESS_API_URL ' +
      '(por ejemplo https://ejemplo.com/wp-json/wp/v2). ' +
      'Configurarla en .env.local para desarrollo y en Vercel para producción.'
    );
  }

  return origin.replace(/\/+$/, '');
}
