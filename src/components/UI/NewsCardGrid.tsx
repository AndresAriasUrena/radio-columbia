'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WordPressPost } from '@/types/wordpress';

interface NewsCardGridProps {
  post: WordPressPost;
}

import WordPressService from '@/lib/wordpressService';

export default function NewsCardGrid({ post }: NewsCardGridProps) {
  const featuredImage = WordPressService.getFeaturedImage(post);
  const category = WordPressService.getCategory(post);
  const formatDate = WordPressService.formatDate;
  const cleanTitle = WordPressService.cleanHtml;

  return (
    <Link href={`/news/${post.slug}`}>
      <article className="group overflow-hidden border-b border-[#333030]">
        <div className="flex flex-col md:flex-row py-5 gap-5">
          {/* Categoría */}
          <div className="flex md:justify-start items-start w-full md:w-[20%]">
            <span className="inline-block text-[#E5754C] bg-transparent text-xs font-medium px-3 py-1 rounded-full border border-[#E5754C] whitespace-nowrap">
              {category}
            </span>
          </div>

          {/* Contenido */}
          <div className="flex flex-col justify-between md:order-2 order-3 w-full md:w-[45%]">
            <div>
              <h3 className="font-urbanist text-lg md:text-2xl font-medium text-[#C7C7C7] line-clamp-2 md:line-clamp-3 mb-3 group-hover:text-white transition-colors">
                {cleanTitle(post.title.rendered)}
              </h3>

              <div 
                className="text-[#C7C7C7]/70 text-xs line-clamp-2 md:line-clamp-3 mb-4 md:mb-0"
                dangerouslySetInnerHTML={{ 
                  __html: post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, "") 
                }}
              />
            </div>

            <div className="mt-auto pt-8">
              <div className="flex flex-col gap-1 text-white/30">
                <span className="text-xs font-medium">
                  {formatDate(post.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative h-48 md:h-56 bg-[#232323] rounded-xl overflow-hidden md:order-3 order-2 w-full md:w-[35%]">
            <Image
              src={featuredImage}
              alt={cleanTitle(post.title.rendered)}
              fill
              className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}