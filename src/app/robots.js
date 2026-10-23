import { countSitemapChunks } from '@/lib/sitemapChunks';

// Bots que no aportan tráfico y sí consumen rastreo del backend.
const BLOCKED_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'anthropic-ai',
  'Claude-Web',
  'PetalBot',
  'Bytespider',
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
];

export default async function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://columbia.co.cr').replace(/\/+$/, '');

  const chunks = await countSitemapChunks();
  const sitemaps = Array.from({ length: chunks }, (_, i) => `${baseUrl}/sitemap/${i}.xml`);

  return {
    rules: [
      {
        userAgent: '*',
        // /api/wp/ TIENE que estar permitido aunque /api/ esté bloqueado.
        // La portada, /news y /sports se arman en el navegador pidiendo datos
        // a /api/wp, y Googlebot respeta el robots.txt también para esas
        // peticiones al renderizar. Con /api/ bloqueado sin esta excepción,
        // Google renderiza las páginas vacías: "No se encontraron noticias".
        // Gana por ser la regla más específica (/api/wp/ es más larga que /api/).
        allow: ['/', '/api/wp/'],
        // Ojo con lo que se agrega acá. Esta lista tenía '*.xml$', que bloqueaba
        // el propio sitemap declarado abajo, y '/_next/', que impedía a Google
        // descargar el JavaScript. Como la portada, /news y /sports se arman en
        // el navegador, sin ese JS el robot no ve ninguna noticia.
        // Tampoco estaban '/admin/' ni '/private/', que nunca existieron en
        // este proyecto: venían de una plantilla copiada.
        disallow: [
          '/api/',
          '*.json',
        ],
      },
      ...BLOCKED_BOTS.map(userAgent => ({ userAgent, disallow: '/' })),
    ],
    sitemap: sitemaps,
    host: baseUrl,
  };
}
