import { WordPressPost, WordPressCategory, WordPressTag, PostsResponse, CategoriesResponse, TagsResponse, GetPostsOptions } from '@/types/wordpress';

import { wordpressOrigin } from './wpOrigin';

const PROXY_BASE = '/api/wp';

const isServer = typeof window === 'undefined';

// Campos que realmente consumen los componentes. Recortar la respuesta baja el
// payload ~38% y, sobre todo, mantiene cada entrada por debajo del límite de
// 2 MB del Data Cache de Next.js (sin esto las consultas grandes no se cachean).
const LIST_FIELDS = 'id,slug,date,modified,title,excerpt,author,categories,tags,link,_links,_embedded';
const SINGLE_FIELDS = `${LIST_FIELDS},content`;

// Ventana de respaldo. En operación normal el webhook de WordPress purga el
// caché al publicar (/api/revalidate), así que esto solo actúa si se pierde
// un webhook: en el peor caso el contenido queda 10 minutos desactualizado,
// nunca roto.
const FALLBACK_REVALIDATE = 600;

export const WP_TAGS = {
  all: 'wp',
  posts: 'wp-posts',
  categories: 'wp-categories',
  tags: 'wp-tags',
  post: (slug: string) => `wp-post-${slug}`,
};

/**
 * Una sola petición, sin reintentos: reintentar contra un backend saturado
 * multiplica la carga justo cuando no hay capacidad para absorberla.
 *
 * En el servidor vamos directo a WordPress usando el Data Cache de Next.js
 * (etiquetado, para poder purgarlo al publicar). En el navegador vamos por
 * /api/wp, que es quien cachea esa respuesta.
 */
async function wpFetch(path: string, tags: string[]): Promise<Response> {
  if (isServer) {
    return fetch(`${wordpressOrigin()}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: FALLBACK_REVALIDATE, tags },
    });
  }

  return fetch(`${PROXY_BASE}${path}`, { headers: { Accept: 'application/json' } });
}

/** Error de transporte: WordPress no respondió. Distinto de "no existe". */
export class WordPressUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('WordPress no está disponible');
    this.name = 'WordPressUnavailableError';
    this.cause = cause;
  }
}

class WordPressService {
  static async getPosts(options: GetPostsOptions = {}): Promise<PostsResponse> {
    const {
      page = 1,
      perPage = 9,
      categories = [],
      tags = [],
      search = '',
      orderBy = 'date',
      order = 'desc',
      exclude = [],
      include = []
    } = options;

    let url = `/posts?_embed&_fields=${LIST_FIELDS}&per_page=${perPage}&page=${page}`;

    if (orderBy === 'date') {
      url += '&orderby=date&order=desc';
    } else if (orderBy === 'title-asc') {
      url += '&orderby=title&order=asc';
    } else if (orderBy === 'title-desc') {
      url += '&orderby=title&order=desc';
    }

    if (categories.length > 0) {
      url += `&categories=${categories.join(',')}`;
    }

    if (tags.length > 0) {
      url += `&tags=${tags.join(',')}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (exclude.length > 0) {
      url += `&exclude=${exclude.join(',')}`;
    }

    if (include.length > 0) {
      url += `&include=${include.join(',')}`;
    }

    try {
      const response = await wpFetch(url, [WP_TAGS.all, WP_TAGS.posts]);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');

      return {
        posts: data,
        totalPages,
        totalItems,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  /**
   * Devuelve el post o null si WordPress confirma que no existe.
   * Lanza WordPressUnavailableError si la petición falló, para que quien
   * llame pueda distinguir "no existe" (404 legítimo) de "backend caído"
   * (no debe convertirse en 404).
   */
  static async getPostBySlug(slug: string): Promise<WordPressPost | null> {
    const url = `/posts?slug=${encodeURIComponent(slug)}&_embed&_fields=${SINGLE_FIELDS}`;

    let response: Response;
    try {
      response = await wpFetch(url, [WP_TAGS.all, WP_TAGS.posts, WP_TAGS.post(slug)]);
    } catch (error) {
      console.error(`WordPress unreachable fetching post "${slug}":`, error);
      throw new WordPressUnavailableError(error);
    }

    if (!response.ok) {
      console.error(`Error fetching post by slug "${slug}": ${response.status} ${response.statusText}`);
      throw new WordPressUnavailableError(`${response.status} ${response.statusText}`);
    }

    try {
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error(`Malformed response fetching post "${slug}":`, error);
      throw new WordPressUnavailableError(error);
    }
  }

  static async getRelatedPosts(categoryId: number, excludeId: number, limit = 3): Promise<WordPressPost[]> {
    try {
      const response = await wpFetch(
        `/posts?categories=${categoryId}&exclude=${excludeId}&per_page=${limit}&orderby=date&order=desc&_embed&_fields=${LIST_FIELDS}`,
        [WP_TAGS.all, WP_TAGS.posts]
      );

      if (!response.ok) {
        console.error(`Error fetching related posts: ${response.status} ${response.statusText}`);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }

  /** Solo slug y modified: es todo lo que necesita el sitemap. 11 KB en vez de 1.66 MB. */
  static async getPostSlugs(page = 1, perPage = 100): Promise<{ slugs: Array<{ slug: string; modified: string }>; totalPages: number }> {
    try {
      const response = await wpFetch(
        `/posts?per_page=${perPage}&page=${page}&orderby=date&order=desc&_fields=slug,modified`,
        [WP_TAGS.all, WP_TAGS.posts]
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return {
        slugs: await response.json(),
        totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '1'),
      };
    } catch (error) {
      console.error('Error fetching post slugs:', error);
      return { slugs: [], totalPages: 1 };
    }
  }

  static async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await wpFetch(
        '/categories?per_page=100&_fields=id,name,slug,parent,count,description',
        [WP_TAGS.all, WP_TAGS.categories]
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const categories: WordPressCategory[] = await response.json();

      const categoriesMap: { [slug: string]: number } = {};
      categories.forEach(cat => {
        categoriesMap[cat.slug] = cat.id;
      });

      return {
        categories,
        categoriesMap
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getTags(): Promise<TagsResponse> {
    try {
      const response = await wpFetch(
        '/tags?per_page=100&_fields=id,name,slug,count',
        [WP_TAGS.all, WP_TAGS.tags]
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            tags: [],
            tagsMap: {}
          };
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const tags: WordPressTag[] = await response.json();

      if (!Array.isArray(tags)) {
        console.warn('API response is not an array:', tags);
        return {
          tags: [],
          tagsMap: {}
        };
      }

      const tagsMap: { [slug: string]: number } = {};
      tags.forEach(tag => {
        if (tag && tag.slug && tag.id) {
          tagsMap[tag.slug] = tag.id;
        }
      });

      return {
        tags,
        tagsMap
      };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {
        tags: [],
        tagsMap: {}
      };
    }
  }

  static async getTagBySlug(slug: string): Promise<number | null> {
    try {
      const response = await wpFetch(
        `/tags?slug=${encodeURIComponent(slug)}&_fields=id,slug`,
        [WP_TAGS.all, WP_TAGS.tags]
      );

      if (!response.ok) {
        return null;
      }

      const tags: WordPressTag[] = await response.json();

      if (Array.isArray(tags) && tags.length > 0 && tags[0].id) {
        return tags[0].id;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching tag by slug "${slug}":`, error);
      return null;
    }
  }

  static async getHeroPosts(limit = 6): Promise<WordPressPost[]> {
    try {
      const response = await wpFetch(
        `/posts?_embed&_fields=${LIST_FIELDS}&per_page=${limit}&orderby=date&order=desc`,
        [WP_TAGS.all, WP_TAGS.posts]
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching hero posts:', error);
      throw error;
    }
  }

  static getFeaturedImage(post: WordPressPost): string {
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
      return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return '/placeholder-image.jpg';
  }

  static getCategory(post: WordPressPost): string {
    if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]) {
      const categories = post._embedded['wp:term'][0];

      // Parent categories to avoid showing (prefer more specific categories)
      const parentCategoriesToAvoid = ['Deportes', 'Noticias', 'deportes', 'noticias'];

      // If there's only one category, return it
      if (categories.length === 1) {
        return categories[0]?.name || 'NOTICIAS';
      }

      // If there are multiple categories:
      // 1. First, try to find a subcategory (one with a parent)
      //    OJO: los términos embebidos llegan en context=embed, que no incluye
      //    `parent`, así que esta rama nunca se cumple. Se conserva por si se
      //    deja de usar _embed; el filtro de abajo es el que hace el trabajo.
      const subcategory = categories.find((cat: any) => cat.parent && cat.parent !== 0);
      if (subcategory) {
        return subcategory.name;
      }

      // 2. If no subcategory found, try to find any category that's NOT a generic parent
      const specificCategory = categories.find((cat: any) =>
        !parentCategoriesToAvoid.includes(cat.name)
      );
      if (specificCategory) {
        return specificCategory.name;
      }

      // 3. Fallback to the first category
      return categories[0]?.name || 'NOTICIAS';
    }
    return 'NOTICIAS';
  }

  static getAuthor(post: WordPressPost): string {
    if (post._embedded && post._embedded.author && post._embedded.author[0]) {
      return post._embedded.author[0].name;
    }
    return 'Autor desconocido';
  }

  static getPostTags(post: WordPressPost): string[] {
    if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][1]) {
      return post._embedded['wp:term'][1]
        .filter(term => term.taxonomy === 'post_tag')
        .map(tag => tag.name);
    }
    return [];
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  static formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  }

  static cleanHtml(html: string): string {
    if (!html) return '';

    const withoutTags = html.replace(/<[^>]+>/g, ' ');

    const decodeNamed = (str: string): string => {
      const named: Record<string, string> = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'",
        nbsp: ' ',
        hellip: '…',
        ndash: '–',
        mdash: '—',
        rsquo: '’',
        lsquo: '‘',
        ldquo: '“',
        rdquo: '”',
      };
      return str.replace(/&([a-zA-Z]+);/g, (m, p1) => (named[p1] !== undefined ? named[p1] : m));
    };

    const decodeNumeric = (str: string): string => {
      const dec = str.replace(/&#(\d+);/g, (_m, code) => {
        try { return String.fromCodePoint(parseInt(code, 10)); } catch { return _m; }
      });
      const hex = dec.replace(/&#x([0-9a-fA-F]+);/g, (_m, code) => {
        try { return String.fromCodePoint(parseInt(code, 16)); } catch { return _m; }
      });
      return hex;
    };

    const decodeBrowser = (str: string): string => {
      if (typeof window === 'undefined') return str;
      const textarea = document.createElement('textarea');
      textarea.innerHTML = str;
      return textarea.value;
    };

    const decoded = decodeBrowser(decodeNumeric(decodeNamed(withoutTags)));

    return decoded.replace(/\s+/g, ' ').trim();
  }
}

export default WordPressService;
