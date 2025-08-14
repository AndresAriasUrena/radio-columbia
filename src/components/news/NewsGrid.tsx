// src/components/news/NewsGrid.tsx
'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import NewsCard from '../UI/NewsCard';
import { IoFilter, IoClose, IoReload } from 'react-icons/io5';
import { SearchContext } from '@/lib/SearchContext';
import { useRouter, useSearchParams } from 'next/navigation';
import WordPressService from '@/lib/wordpressService';
import { WordPressPost, FilterData } from '@/types/wordpress';

interface NewsGridProps {
  filters: FilterData | null;
  onOpenFilters: () => void;
  title: string;
}

export default function NewsGrid({ filters, onOpenFilters, title }: NewsGridProps) {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'title-asc' | 'title-desc'>('date');
  const [totalPosts, setTotalPosts] = useState(0);
  const [categoriesMap, setCategoriesMap] = useState<{[slug: string]: number}>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { searchTerm } = useContext(SearchContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const POSTS_PER_PAGE = 9;
  const INITIAL_LOAD = 9;

  useEffect(() => {
    const fetchCategoriesMap = async () => {
      try {
        const { categoriesMap } = await WordPressService.getCategories();
        setCategoriesMap(categoriesMap as {[slug: string]: number});
        setCategoriesLoaded(true);
      } catch (error) {
        console.error('Error loading categories map:', error);
        setCategoriesLoaded(true);
      }
    };

    fetchCategoriesMap();
  }, []);

  const fetchPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const perPage = pageNum === 1 ? INITIAL_LOAD : POSTS_PER_PAGE;

      const categoryIds = filters?.categories && filters.categories.length > 0
        ? filters.categories
            .map(slug => categoriesMap[slug])
            .filter(id => id !== undefined)
        : [];

      const result = await WordPressService.getPosts({
        page: pageNum,
        perPage,
        categories: categoryIds,
        search: searchTerm || '',
        orderBy: sortBy
      });

      if (append) {
        setPosts(prev => [...prev, ...result.posts]);
      } else {
        setPosts(result.posts);
      }

      setTotalPosts(result.totalItems);
      setHasMore(pageNum < result.totalPages);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar noticias');
    } finally {
      setLoading(false);
    }
  }, [sortBy, filters, searchTerm, categoriesMap]);

  useEffect(() => {
    if (categoriesLoaded) {
      setPage(1); 
      fetchPosts(1, false);
    }
  }, [categoriesLoaded, fetchPosts]);

  const handleRetry = () => {
    setError(null);
    fetchPosts(page, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  if (error) {
    return (
      <div className="flex-1 px-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-7xl mx-auto">
          <div className="rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-[#D51F2F] mb-2">
              Error al cargar noticias
            </h3>
            <p className="text-[#C7C7C7] mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="text-white bg-[#1E305F] px-4 py-2 rounded-md hover:bg-[#D51F2F] transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-12 lg:py-16 bg-[#F8FBFF] mx-2 my-4 rounded-2xl">
      <div className="flex-1 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-2">
                <h2 className="font-semibold text-lg md:text-2xl text-[#1B1B1B]">{title}</h2>
                <p className="text-sm text-[#64748B] hidden md:block">
                  {loading && posts.length === 0 
                    ? 'Cargando...' 
                    : `${posts.length} de ${totalPosts} noticias encontradas`}
                  {searchTerm && ` para "${searchTerm}"`}
                </p>
              </div>
              <button
                onClick={onOpenFilters}
                className="lg:hidden flex items-center gap-2 bg-[#1E305F] text-white px-3 py-2 rounded-md hover:bg-[#D51F2F] transition-colors"
              >
                <IoFilter className="w-4 h-4" />
                <span className="text-sm font-semibold">Filtros</span>
              </button>
            </div>
            <div className="h-0.5 w-full bg-[#D4D5DD] my-3" />
          </div>
        </div>

        {loading && posts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: INITIAL_LOAD }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-[#D4D5DD] aspect-[16/11] rounded-2xl mb-4"></div>
                <div className="h-4 bg-[#D4D5DD] rounded mb-2"></div>
                <div className="h-4 bg-[#D4D5DD] rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>

            {hasMore && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="text-[#9A9898] border border-[#9A9898] px-4 py-2 rounded-md hover:border-[#1E305F] hover:text-white hover:bg-[#1E305F] transition-colors duration-300"
                >
                  Cargar más noticias
                </button>
              </div>
            )}
          </>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#C7C7C7] text-lg">
              No se encontraron noticias
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}