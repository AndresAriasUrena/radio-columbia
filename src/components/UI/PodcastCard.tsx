'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PodcastShow } from '@/types/podcast';

interface PodcastCardProps {
  podcast: PodcastShow;
}

export default function PodcastCard({ podcast }: PodcastCardProps) {
  const cleanHtml = (htmlString: string): string => {
    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = htmlString;
      return div.textContent || div.innerText || '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
  };

  return (
    <Link href={`/podcasts/${podcast.id}`}>
      <article className="group overflow-hidden hover:scale-[1.02] transition-all duration-700">
        <div className="relative aspect-[16/11] bg-[#232323] rounded-2xl">
          <Image
            src={podcast.imageUrl || '/placeholder-podcast.jpg'}
            alt={cleanHtml(podcast.title)}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        <div className="py-5">
          <div className="flex justify-between items-center mb-1">
            <span className="inline-block text-[#E5754C] bg-transparent text-xs font-medium px-0 py-0 rounded">
              {podcast.category || 'Podcast'}
            </span>
            {podcast.author && (
              <span className="text-xs font-medium text-[#B4B4B4]">
                {podcast.author}
              </span>
            )}
          </div>
          <h3 className="font-urbanist text-xl font-medium text-[#B4B4B4] line-clamp-2">
            {cleanHtml(podcast.title)}
          </h3>
        </div>
      </article>
    </Link>
  );
} 