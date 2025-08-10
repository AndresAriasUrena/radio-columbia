 'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WordPressPost } from '@/types/wordpress';
import WordPressService from '@/lib/wordpressService';

interface NewsGridWithImageProps {
  title?: string;
  maxPosts?: number;
  posts?: WordPressPost[];
  tagSlug?: string;
}

export default function NewsGridWithImage({ 
  title, 
  maxPosts = 4,
  posts: externalPosts,
  tagSlug
}: NewsGridWithImageProps) {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [tagId, setTagId] = useState<number | null | undefined>(undefined);

  const displayPosts = externalPosts || posts;

  useEffect(() => {
    const getTagId = async () => {
      try {
        if (!tagSlug) {
          setTagId(null);
          return;
        }

        const result = await WordPressService.getTags();
        const id = result.tagsMap[tagSlug];
        
        if (id) {
          setTagId(id);
        } else {
          console.warn(`Tag "${tagSlug}" no encontrado en WordPress`);
          setTagId(null);
        }
      } catch (error) {
        console.error('Error loading tags map:', error);
        setTagId(null);
      }
    };

    getTagId();
  }, [tagSlug]);

  const fetchPosts = useCallback(async () => {
    if (externalPosts) return;
    
    try {
      setLoading(true);
      setError(null);

      if (!tagId) {
        setPosts([]);
        return;
      }

      const result = await WordPressService.getPosts({
        page: 1,
        perPage: maxPosts,
        tags: [tagId],
        orderBy: 'date'
      });

      setPosts(result.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar noticias');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [maxPosts, externalPosts, tagId]);

  useEffect(() => {
    if (tagId !== undefined || !tagSlug) {
      fetchPosts();
    }
  }, [fetchPosts, tagId, tagSlug]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#C7C7C7]">{error}</p>
      </div>
    );
  }

    if (loading && !externalPosts) {
    return (
      <div className="w-full max-w-7xl mx-auto px-8">
        {title && (
          <div className="mb-6">
            <h2 className="font-lexend font-semibold text-xl text-[#C7C7C7]">{title}</h2>
            <div className="h-0.5 w-full bg-[#E5754C] my-4" />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse">
            <div className="bg-[#232323] aspect-[4/3] rounded-2xl"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: maxPosts }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-[#232323] h-20 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!displayPosts || displayPosts.length === 0) {
    return null;
  }

  const featuredImage = WordPressService.getFeaturedImage(displayPosts[selectedPostIndex]);
  const formatDate = WordPressService.formatDate;
  const cleanTitle = WordPressService.cleanHtml;

  return (
    <div className="w-full max-w-7xl mx-auto px-8">
      {title && (
        <div className="mb-6">
          <h2 className="font-lexend font-semibold text-xl text-[#C7C7C7]">{title}</h2>
          <div className="h-0.5 w-full bg-[#E5754C] my-4" />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative aspect-[4/3] bg-[#232323] rounded-2xl overflow-hidden">
          <Image
            src={featuredImage}
            alt={cleanTitle(displayPosts[selectedPostIndex].title.rendered)}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-4 h-full">
          {displayPosts.map((post, index) => {
            const category = WordPressService.getCategory(post);
            
            return (
              <Link 
                key={post.id} 
                href={`/news/${post.slug}`}
                onMouseEnter={() => setSelectedPostIndex(index)}
                className="group block"
              >
                <article className={`p-4 border-b border-[#333030]`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block text-[#E5754C] bg-transparent text-xs font-medium">
                      {category}
                    </span>
                    <span className="text-xs font-medium text-[#B4B4B4]">
                      {formatDate(post.date)}
                    </span>
                  </div>

                  <h4 className={`font-urbanist text-lg font-medium line-clamp-2 transition-colors duration-300 text-[#C7C7C7] group-hover:text-white`}>
                    {cleanTitle(post.title.rendered)}
                  </h4>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}