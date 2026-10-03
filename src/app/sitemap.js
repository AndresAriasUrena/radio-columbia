import WordPressService from '@/lib/wordpressService';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://columbia.co.cr';

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sports`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/podcasts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // getPostSlugs pide solo `slug` y `modified`. La versión anterior usaba
  // getPosts, que añade `_embed`, así que cada página traía 1.66 MB de medios,
  // autores y términos que el sitemap nunca usa: 11 KB en vez de 1.66 MB.
  let allPosts = [];
  try {
    const PAGES = 3;
    const first = await WordPressService.getPostSlugs(1, 100);
    allPosts = [...first.slugs];

    const remaining = Array.from(
      { length: Math.max(Math.min(first.totalPages, PAGES) - 1, 0) },
      (_, i) => i + 2
    );

    const results = await Promise.all(
      remaining.map(page => WordPressService.getPostSlugs(page, 100))
    );

    results.forEach(result => {
      allPosts = [...allPosts, ...result.slugs];
    });
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  const newsPages = allPosts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...newsPages];
} 