import Link from 'next/link';
import Image from 'next/image';
import { WordPressPost } from '@/types/wordpress';

interface RelatedNewsGridProps {
  posts: WordPressPost[];
}

import WordPressService from '@/lib/wordpressService';

export default function RelatedNewsGrid({ posts }: RelatedNewsGridProps) {
  const formatDate = WordPressService.formatDate;
  const cleanTitle = WordPressService.cleanHtml;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-lexend font-semibold text-xl">MÁS NOTICIAS</h2>
        <Link href="/news" className="text-[#9A9898] hover:text-[#E5754C] text-sm flex items-center gap-1">
          Ver todas <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="h-0.5 w-full bg-[#E5754C] mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const featuredImage = WordPressService.getFeaturedImage(post);
          const category = WordPressService.getCategory(post);
          return (
            <Link href={`/news/${post.slug}`} key={post.id}>
              <article className="group overflow-hidden hover:scale-[1.02] transition-all duration-700">
                <div className="relative aspect-[16/11] bg-[#232323] rounded-2xl">
                  <Image
                    src={featuredImage}
                    alt={cleanTitle(post.title.rendered)}
                    fill
                    className="object-cover rounded-2xl"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="py-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block text-[#E5754C] bg-transparent text-xs font-medium px-0 py-0 rounded">
                      {category}
                    </span>
                    <span className="text-xs font-medium text-[#B4B4B4]">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h3 className="font-urbanist text-base font-medium text-[#B4B4B4] line-clamp-2 mb-2">
                    {cleanTitle(post.title.rendered)}
                  </h3>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
} 