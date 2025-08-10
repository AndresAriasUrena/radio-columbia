// src/app/(pages)/news/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilterSidebar from '@/components/news/FilterSidebar';
import NewsGrid from '@/components/news/NewsGrid';
import { FilterData } from '@/types/wordpress';

function NewsContent() {
  const [filters, setFilters] = useState<FilterData>({ categories: [] });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    document.title = 'Noticias | Amplify Radio - Últimas Noticias y Actualidad';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Descubre las últimas noticias y actualidad en Amplify Radio. Mantente informado con nuestras noticias de música, entretenimiento y más.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Descubre las últimas noticias y actualidad en Amplify Radio. Mantente informado con nuestras noticias de música, entretenimiento y más.';
      document.head.appendChild(meta);
    }

    if (filters.categories.length > 0) {
    }
  }, [filters]);

  const handleFilterChange = (newFilters: FilterData) => {
    setFilters(newFilters);
  };

  return (
    <div className="px-4 sm:px-8">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <Suspense>
              <NewsGrid 
                filters={filters} 
                onOpenFilters={() => setIsMobileFiltersOpen(true)}
              />
            </Suspense>
          </div>

          <div className="order-1 lg:order-2">
            <div className="hidden lg:block">
              <Suspense>
                <FilterSidebar 
                  onFilterChange={handleFilterChange}
                  isMobileOpen={false}
                  setIsMobileOpen={() => {}}
                />
              </Suspense>
            </div>
          </div>
        </div>

        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
            isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileFiltersOpen(false)}
        />
        
        <div className={`fixed right-0 top-0 h-full w-80 bg-[#0a0a0a] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 h-full overflow-y-auto">
            <Suspense>
              <FilterSidebar 
                onFilterChange={handleFilterChange}
                isMobileOpen={isMobileFiltersOpen}
                setIsMobileOpen={setIsMobileFiltersOpen}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <>
      <div className="min-h-screen font-jost">
        <Navbar />
        <NewsContent />
      </div>
      <Footer />
    </>
  );
} 