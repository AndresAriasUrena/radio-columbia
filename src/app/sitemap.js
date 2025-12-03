import WordPressService from '@/lib/wordpressService';

export default async function sitemap() {
  const baseUrl = 'https://columbia.co.cr';

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

  let allPosts = [];
  try {
    // Fetch solo las primeras 2 páginas con timeout
    const fetchWithTimeout = (promise, timeout = 10000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
    };

    const firstBatch = await fetchWithTimeout(
      WordPressService.getPosts({
        page: 1,
        perPage: 100,
        orderBy: 'date',
        order: 'desc'
      })
    );

    allPosts = [...firstBatch.posts];

    // Limitar a máximo 3 páginas para evitar timeouts
    const maxPages = Math.min(firstBatch.totalPages, 3);

    if (maxPages > 1) {
      const remainingPages = Array.from(
        { length: maxPages - 1 },
        (_, i) => i + 2
      );

      // Fetch en paralelo con límite de concurrencia
      const batchSize = 2;
      for (let i = 0; i < remainingPages.length; i += batchSize) {
        const batch = remainingPages.slice(i, i + batchSize);
        const promises = batch.map(page =>
          fetchWithTimeout(
            WordPressService.getPosts({
              page,
              perPage: 100,
              orderBy: 'date',
              order: 'desc'
            }),
            10000
          ).catch(error => {
            console.error(`Error fetching page ${page}:`, error);
            return { posts: [] };
          })
        );

        const results = await Promise.all(promises);
        results.forEach(result => {
          if (result.posts) {
            allPosts = [...allPosts, ...result.posts];
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  const newsPages = allPosts.map((post) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...newsPages];
} 