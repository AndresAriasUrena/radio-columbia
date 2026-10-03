'use client';

import { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/home/Hero';
import Footer from '@/components/Footer';
import CategoryNewsGrid from '@/components/home/CategoryNewsGrid';
import NewsGridWithImage from '@/components/home/NewsGridWithImage';
import FilterSidebar from '@/components/news/FilterSidebar';
import { Search } from 'lucide-react';

function HomeContent() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const handleFilterChange = (newFilters) => {
    // no-op; el sidebar maneja internamente los filtros en home
  };

  return (
    <>
      <div className="min-h-screen">
        <div className="xl:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="bg-[#1E305F] hover:bg-[#D51F2F] text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row -my-4 md:pr-4">
          <div className="flex-1">
            <Hero tagSlug="destacados"/>
            <CategoryNewsGrid
              title="Categorías de Deportes"
              description="Mantente al día con las últimas noticias deportivas"
              showCategories={true}
              maxPosts={9}
              parentCategories={["deportes"]}
              viewAllLink="/sports"
            />
            <CategoryNewsGrid
              title="Categorías de Noticias"
              description="Conoce todos los tipos de noticias de Columbia"
              showCategories={true}
              maxPosts={9}
              parentCategories={["noticias"]}
              viewAllLink="/news"
            />
            <CategoryNewsGrid
              title="Tendencias Actuales"
              description="Mira que es lo que tiene a la gente hablando"
              tagSlug="tendencias"
              cardType="grid"
            />
            <NewsGridWithImage
              title="Lo último – Nacionales"
              description="Infórmate de las últimas noticias en Costa Rica"
              tagSlug="nacionales"
              maxPosts={3}
            />
          </div>

          {/* Sidebar desktop */}
          <div className="hidden xl:block">
            <FilterSidebar
              onFilterChange={handleFilterChange}
              isMobileOpen={false}
              setIsMobileOpen={() => {}}
              parentSlugs={[]}
              isDesktopSidebarOpen={isDesktopSidebarOpen}
              setIsDesktopSidebarOpen={setIsDesktopSidebarOpen}
            />
          </div>
        </div>

        <div
          className={`fixed inset-0 backdrop-blur-sm z-40 xl:hidden transition-opacity duration-300 ${
            isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileFiltersOpen(false)}
        />

        <div className={`fixed right-0 top-0 h-full w-80 bg-[#1E305F] z-50 transform transition-transform duración-300 ease-in-out xl:hidden ${
          isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="-my-5 h-full overflow-y-auto">
            <FilterSidebar 
              onFilterChange={handleFilterChange}
              isMobileOpen={isMobileFiltersOpen}
              setIsMobileOpen={setIsMobileFiltersOpen}
              parentSlugs={[]}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen">
        <Navbar />
        <Suspense fallback={<div />}> 
          <HomeContent />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
