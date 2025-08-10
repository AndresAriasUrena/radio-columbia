export const SEO_CONFIG = {
  siteName: 'Amplify Radio',
  siteUrl: 'https://amplifyradio.com/',
  description: 'Amplify Radio - Tu estación de radio online con las últimas noticias, música y entretenimiento. Mantente informado con nuestras noticias actualizadas y disfruta de la mejor música las 24 horas.',
  keywords: 'radio online, noticias, música, entretenimiento, streaming, amplify radio, radio en vivo',
  author: 'Amplify Radio',
  twitterHandle: '@AmplifyRadio',
  language: 'es',
  locale: 'es_ES',
  themeColor: '#E5754C',
  backgroundColor: '#0a0a0a',
  socialMedia: {
    facebook: 'https://www.facebook.com/amplifyradiofm/',
    instagram: 'https://www.instagram.com/amplifyradiofm/'
  }
};

export const generatePageMetadata = (options = {}) => {
  const {
    title = '',
    description = SEO_CONFIG.description,
    image = '/og-image.jpg',
    path = '',
    keywords = SEO_CONFIG.keywords,
    type = 'website',
    publishedTime = null,
    modifiedTime = null,
    author = SEO_CONFIG.author,
    section = null
  } = options;

  const fullTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}` 
    : SEO_CONFIG.siteName;
  
  const fullUrl = `${SEO_CONFIG.siteUrl}${path}`;
  const fullImageUrl = image.startsWith('http') ? image : `${SEO_CONFIG.siteUrl}${image}`;

  const metadata = {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: author }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    formatDetection: {
      telephone: false,
    },
    metadataBase: new URL(SEO_CONFIG.siteUrl),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || SEO_CONFIG.siteName,
        },
      ],
      locale: SEO_CONFIG.locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: SEO_CONFIG.twitterHandle,
      images: [fullImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  if (type === 'article') {
    metadata.openGraph.type = 'article';
    if (publishedTime) {
      metadata.openGraph.publishedTime = publishedTime;
    }
    if (modifiedTime) {
      metadata.openGraph.modifiedTime = modifiedTime;
    }
    if (author) {
      metadata.openGraph.authors = [author];
    }
    if (section) {
      metadata.openGraph.section = section;
    }
  }

  return metadata;
};

export const generateNewsSchema = (post) => {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const author = post._embedded?.author?.[0]?.name || 'Amplify Radio';
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Noticias';
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title.rendered.replace(/<[^>]+>/g, ''),
    "description": post.excerpt.rendered.replace(/<[^>]+>/g, '').trim(),
    "image": featuredImage ? [featuredImage] : [],
    "datePublished": post.date,
    "dateModified": post.modified,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_CONFIG.siteUrl}/assets/LogoColumbia.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SEO_CONFIG.siteUrl}/news/${post.slug}`
    },
    "articleSection": category,
    "inLanguage": SEO_CONFIG.language
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "name": SEO_CONFIG.siteName,
    "description": SEO_CONFIG.description,
    "url": SEO_CONFIG.siteUrl,
    "logo": `${SEO_CONFIG.siteUrl}/assets/LogoColumbia.svg`,
    "sameAs": [
      SEO_CONFIG.socialMedia.facebook,
      SEO_CONFIG.socialMedia.instagram
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Spanish"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES"
    }
  };
};

export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}; 