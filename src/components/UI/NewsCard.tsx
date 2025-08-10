'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WordPressPost } from '@/types/wordpress';

interface NewsCardProps {
  post: WordPressPost;
}

import WordPressService from '@/lib/wordpressService';

export default function NewsCard({ post }: NewsCardProps) {
  const featuredImage = WordPressService.getFeaturedImage(post);
  const category = WordPressService.getCategory(post);
  const formatDate = WordPressService.formatDate;
  const cleanTitle = WordPressService.cleanHtml;

  return (
    <Link href={`/news/${post.slug}`}>
      <article className="group overflow-hidden hover:scale-[1.02] transition-all duration-700">
        {/* Imagen de la noticia */}
        <div className="relative aspect-[16/11] bg-[#232323] rounded-2xl">
          <Image
            src={featuredImage}
            alt={cleanTitle(post.title.rendered)}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Contenido de la noticia */}
        <div className="py-5">
          <div className="flex justify-between items-center mb-2">
            {/* Categoría */}
            <span className="inline-block text-[#E5754C] bg-transparent text-xs font-medium px-0 py-0 rounded">
              {category}
            </span>
            {/* Fecha */}
            <span className="text-xs font-medium text-[#B4B4B4]">
              {formatDate(post.date)}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-urbanist text-xl font-medium text-[#B4B4B4] line-clamp-2 mb-2">
            {cleanTitle(post.title.rendered)}
          </h3>

          {/* Extracto 
          <div 
            className="mt-1 text-gray-300 text-sm line-clamp-2"
            dangerouslySetInnerHTML={{ 
              __html: post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, "") 
            }}
          />*/}
        </div>
      </article>
    </Link>
  );
}