import { WordPressPost, WordPressCategory, WordPressTag, PostsResponse, CategoriesResponse, TagsResponse, GetPostsOptions } from '@/types/wordpress';

const WORDPRESS_API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://radiodev.aurigital.com/wp-json/wp/v2';

// El backend de WordPress rechaza conexiones (ECONNREFUSED) cuando recibe
// muchas peticiones concurrentes. Reintentamos antes de rendirnos, ya que
// suele recuperarse en milisegundos.
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2, delayMs = 300): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
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

    let url = `${WORDPRESS_API_BASE}/posts?_embed&per_page=${perPage}&page=${page}`;

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
      const response = await fetchWithRetry(url, {
        next: { revalidate: 60 } // Revalidar cada 60 segundos
      });

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

  static async getPostBySlug(slug: string): Promise<WordPressPost | null> {
    try {
      const response = await fetchWithRetry(`${WORDPRESS_API_BASE}/posts?slug=${slug}&_embed`, {
        next: { revalidate: 60 } // Revalidar cada 60 segundos
      });

      if (!response.ok) {
        console.error(`Error fetching post by slug "${slug}": ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }
  }

  static async getRelatedPosts(categoryId: number, excludeId: number, limit = 3): Promise<WordPressPost[]> {
    try {
      const response = await fetchWithRetry(
        `${WORDPRESS_API_BASE}/posts?categories=${categoryId}&exclude=${excludeId}&per_page=${limit}&orderby=date&order=desc&_embed`,
        {
          next: { revalidate: 60 } // Revalidar cada 60 segundos
        }
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

  static async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await fetchWithRetry(`${WORDPRESS_API_BASE}/categories?per_page=100`, {
        next: { revalidate: 60 } // Revalidar cada 60 segundos
      });

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
      const response = await fetchWithRetry(`${WORDPRESS_API_BASE}/tags?per_page=100`, {
        next: { revalidate: 60 } // Revalidar cada 60 segundos
      });

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
      const response = await fetchWithRetry(`${WORDPRESS_API_BASE}/tags?slug=${slug}`, {
        next: { revalidate: 60 } // Revalidar cada 60 segundos
      });

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
      const response = await fetchWithRetry(
        `${WORDPRESS_API_BASE}/posts?_embed&per_page=${limit}&orderby=date&order=desc`,
        {
          next: { revalidate: 60 } // Revalidar cada 60 segundos
        }
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