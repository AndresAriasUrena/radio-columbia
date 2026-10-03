'use client';

import { useState, useEffect, useCallback } from 'react';
import NewsCard from '../UI/NewsCard';
import NewsCardGrid from '../UI/NewsCardGrid';
import WordPressService from '@/lib/wordpressService';
import { WordPressPost, WordPressCategory } from '@/types/wordpress';
import Link from 'next/link';

interface CategoryNewsGridProps {
  title: string;
  description?: string;
  tagSlug?: string;
  maxPosts?: number;
  showLoadMore?: boolean;
  showCategories?: boolean;
  cardType?: 'default' | 'grid';
  onCategoryChange?: (categorySlug: string) => void;
  parentCategories?: string[];
  viewAllLink?: string;
}

export default function CategoryNewsGrid({
  title,
  description,
  tagSlug,
  maxPosts,
  showLoadMore = true,
  showCategories = false,
  cardType = 'default',
  onCategoryChange,
  parentCategories = [],
  viewAllLink = '/news'
}: CategoryNewsGridProps) {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [categoryId, setCategoryId] = useState<number | null | undefined>(undefined);
  const [tagId, setTagId] = useState<number | null | undefined>(undefined);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [loadedCategoriesCount, setLoadedCategoriesCount] = useState(0);
  const [allCategories, setAllCategories] = useState<WordPressCategory[]>([]);
  const [displayedPostIds, setDisplayedPostIds] = useState<Set<number>>(new Set());
  // Track which category was used to load each post (to prevent showing wrong category labels)
  const [postCategoryMap, setPostCategoryMap] = useState<Map<number, string>>(new Map());

  const POSTS_PER_PAGE = maxPosts || 3;
  const CATEGORIES_PER_LOAD = maxPosts || 9;

  const loadCategoriesBatch = useCallback(async (
    categoriesToLoad: WordPressCategory[],
    startIndex: number,
    count: number,
    currentDisplayedIds: Set<number>,
    currentCategoryMap: Map<number, string>
  ) => {
    try {
      const batch = categoriesToLoad.slice(startIndex, startIndex + count);
      const newPosts: WordPressPost[] = [];
      const newDisplayedIds = new Set(currentDisplayedIds);
      const newCategoryMap = new Map(currentCategoryMap);

      // Una sola petición para todo el lote, en vez de una por categoría.
      // Antes esto eran hasta 9 llamadas secuenciales (~9 s y ~700 KB); ahora
      // es una (~1.7 s y ~310 KB) y el agrupado se hace en memoria con los
      // IDs de categoría que ya trae cada post.
      let pool: WordPressPost[] = [];
      try {
        const result = await WordPressService.getPosts({
          page: 1,
          perPage: Math.min(50, Math.max(batch.length * 5, 10)),
          categories: batch.map(category => category.id),
          orderBy: 'date'
        });
        pool = result.posts;
      } catch (error) {
        console.error('Error loading posts for category batch:', error);
      }

      // Se resuelve por posición para conservar el orden de las tarjetas
      // aunque algunas categorías se completen en la segunda vuelta.
      const picked: Array<WordPressPost | undefined> = batch.map(() => undefined);

      const take = (index: number, candidates: WordPressPost[]) => {
        const category = batch[index];
        const post = candidates.find(
          candidate => !newDisplayedIds.has(candidate.id) && candidate.categories?.includes(category.id)
        );
        if (!post) return false;
        picked[index] = post;
        newDisplayedIds.add(post.id);
        newCategoryMap.set(post.id, category.name);
        return true;
      };

      const missing = batch.reduce<number[]>((acc, _category, index) => {
        if (!take(index, pool)) acc.push(index);
        return acc;
      }, []);

      // Las categorías con poco volumen (unos cientos de posts frente a miles)
      // quedan fuera del lote porque las grandes copan los más recientes. Son
      // pocas, así que se piden en paralelo —no en serie— para no sumar un
      // segundo por categoría.
      if (missing.length > 0) {
        const extras = await Promise.all(
          missing.map(index =>
            WordPressService.getPosts({
              page: 1,
              perPage: 5,
              categories: [batch[index].id],
              orderBy: 'date'
            })
              .then(result => result.posts)
              .catch(error => {
                console.error(`Error loading post for category ${batch[index].name}:`, error);
                return [] as WordPressPost[];
              })
          )
        );

        missing.forEach((index, i) => take(index, extras[i]));
      }

      picked.forEach(post => {
        if (post) newPosts.push(post);
      });

      if (startIndex === 0) {
        setPosts(newPosts);
        setDisplayedPostIds(newDisplayedIds);
        setPostCategoryMap(newCategoryMap);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setDisplayedPostIds(newDisplayedIds);
        setPostCategoryMap(newCategoryMap);
      }

      const newLoadedCount = startIndex + batch.length;
      setLoadedCategoriesCount(newLoadedCount);
      setHasMore(newLoadedCount < categoriesToLoad.length);
      setLoading(false);
    } catch (error) {
      console.error('Error loading category batch:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { categories } = await WordPressService.getCategories();
        let categoriesWithPosts = categories.filter(cat => cat.count > 0);

        // If parentCategories is specified, filter to include ONLY children (subcategories), NOT the parent
        if (parentCategories && parentCategories.length > 0) {
          const normalizedTargets = parentCategories.map(s => s.toLowerCase());

          // Find the parent category IDs
          const parentCats = categories.filter((cat: WordPressCategory) =>
            normalizedTargets.includes(cat.slug.toLowerCase()) ||
            normalizedTargets.includes(cat.name.toLowerCase())
          );

          const parentIds = parentCats.map((cat: WordPressCategory) => cat.id);

          if (parentIds.length > 0) {
            // Include ONLY the children (subcategories), NOT the parent categories themselves
            categoriesWithPosts = categoriesWithPosts.filter((cat: WordPressCategory) =>
              parentIds.includes(cat.parent) && cat.count > 0
            );

            // Deduplicate by ID to ensure each category appears only once
            const seenIds = new Set<number>();
            categoriesWithPosts = categoriesWithPosts.filter((cat: WordPressCategory) => {
              if (seenIds.has(cat.id)) {
                return false;
              }
              seenIds.add(cat.id);
              return true;
            });
          }
        }

        setAllCategories(categoriesWithPosts);
        setCategories(categoriesWithPosts);

        // Reiniciar los IDs mostrados y cargar las primeras categorías
        const emptySet = new Set<number>();
        const emptyMap = new Map<number, string>();
        setDisplayedPostIds(emptySet);
        setPostCategoryMap(emptyMap);
        await loadCategoriesBatch(categoriesWithPosts, 0, CATEGORIES_PER_LOAD, emptySet, emptyMap);
      } catch (error) {
        console.error('Error loading categories:', error);
        setLoading(false);
      }
    };

    if (showCategories) {
      fetchCategories();
    }
  }, [showCategories, CATEGORIES_PER_LOAD, loadCategoriesBatch, parentCategories]);

  useEffect(() => {
    const getTagId = async () => {
      try {
        if (!tagSlug) {
          setTagId(null);
          setError(null);
          return;
        }

        const id = await WordPressService.getTagBySlug(tagSlug);

        if (id) {
          setTagId(id);
          setError(null);
        } else {
          console.warn(`Tag "${tagSlug}" no encontrado en WordPress`);
          setTagId(null);
        }
      } catch (error) {
        console.error('Error loading tag:', error);
        setError('Error al cargar el tag');
        setLoading(false);
      }
    };

    getTagId();
  }, [tagSlug]);

  useEffect(() => {
    const getCategoryId = async () => {
      try {
        if (selectedCategory === 'todas') {
          setCategoryId(null);
          setError(null);
          return;
        }

        const { categoriesMap } = await WordPressService.getCategories();
        const id = categoriesMap[selectedCategory];
        
        if (id) {
          setCategoryId(id);
          setError(null);
        } else {
          setError(`Categoría "${selectedCategory}" no encontrada`);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading categories map:', error);
        setError('Error al cargar las categorías');
        setLoading(false);
      }
    };

    if (showCategories) {
      getCategoryId();
    }
  }, [selectedCategory, showCategories]);

  const fetchPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      if (tagSlug && !tagId) {
        setPosts([]);
        setTotalPosts(0);
        setHasMore(false);
        return;
      }

      if (showCategories && selectedCategory !== 'todas' && !categoryId) {
        setPosts([]);
        setTotalPosts(0);
        setHasMore(false);
        return;
      }

      const result = await WordPressService.getPosts({
        page: pageNum,
        perPage: POSTS_PER_PAGE,
        categories: showCategories && categoryId ? [categoryId] : [],
        tags: tagId ? [tagId] : [],
        orderBy: 'date'
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
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, tagId, showCategories, tagSlug, selectedCategory]);

  useEffect(() => {
    // No ejecutar fetchPosts si estamos en modo "mostrar categorías"
    if (showCategories) return;

    if ((tagId !== undefined || !tagSlug) && (categoryId !== undefined || !showCategories) && !error) {
      setPage(1);
      fetchPosts(1, false);
    }
  }, [categoryId, tagId, error, fetchPosts, tagSlug, showCategories]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setPosts([]);
    setPage(1);
    if (onCategoryChange) {
      onCategoryChange(slug);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchPosts(page, false);
  };

  const handleLoadMore = () => {
    if (showCategories) {
      // Cargar más categorías
      setLoading(true);
      loadCategoriesBatch(allCategories, loadedCategoriesCount, CATEGORIES_PER_LOAD, displayedPostIds, postCategoryMap);
    } else {
      // Cargar más posts (lógica original)
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
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
                {description && <p className="text-sm text-[#64748B] hidden md:block">{description}</p>}
              </div>
              <Link href={viewAllLink} className="text-[#9A9898] border border-[#9A9898] rounded-md px-2 py-1 md:px-4 md:py-2 hover:text-[#1E305F] hover:border-[#1E305F] text-xs md:text-sm flex items-center transition-all duration-300">
                Ver todas <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="h-0.5 w-full bg-[#D4D5DD] my-3" />

          </div>
        </div>

        {loading && posts.length === 0 && (
          <div className={`grid ${
            cardType === 'grid' 
              ? 'grid-cols-1 space-y-4' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
          }`}>
            {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
              <div key={index} className="animate-pulse">
                {cardType === 'grid' ? (
                  <div className="bg-[#D4D5DD] h-32 rounded-2xl"></div>
                ) : (
                  <>
                    <div className="bg-[#D4D5DD] aspect-[16/11] rounded-2xl mb-4"></div>
                    <div className="h-4 bg-[#D4D5DD] rounded mb-2"></div>
                    <div className="h-4 bg-[#D4D5DD] rounded w-2/3"></div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <>
            <div className={`grid  ${
              cardType === 'grid'
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
            }`}>
              {posts.map((post) => (
                cardType === 'grid' ? (
                  <NewsCardGrid
                    key={post.id}
                    post={post}
                    categoryOverride={showCategories ? postCategoryMap.get(post.id) : undefined}
                  />
                ) : (
                  <NewsCard
                    key={post.id}
                    post={post}
                    categoryOverride={showCategories ? postCategoryMap.get(post.id) : undefined}
                  />
                )
              ))}
            </div>

            {hasMore && !loading && showLoadMore && (
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
              No se encontraron noticias en esta categoría
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 