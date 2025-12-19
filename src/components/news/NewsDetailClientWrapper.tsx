'use client';

import { useState, ReactNode } from 'react';
import FilterSidebar from '@/components/news/FilterSidebar';
import { FilterData } from '@/types/wordpress';
import { Search } from 'lucide-react';

interface NewsDetailClientWrapperProps {
  children: ReactNode;
}

export default function NewsDetailClientWrapper({ children }: NewsDetailClientWrapperProps) {
  const [filters, setFilters] = useState<FilterData>({ categories: [] });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const handleFilterChange = (newFilters: FilterData) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen">
      {/* Mobile filter button */}
      <div className="xl:hidden fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="bg-[#1E305F] hover:bg-[#D51F2F] text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <Search className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row -my-4 md:pr-4">
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            onFilterChange={handleFilterChange}
            isMobileOpen={false}
            setIsMobileOpen={() => {}}
            parentSlugs={["noticias", "noticas", "Noticias"]}
            isDesktopSidebarOpen={isDesktopSidebarOpen}
            setIsDesktopSidebarOpen={setIsDesktopSidebarOpen}
          />
        </div>
      </div>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm z-40 xl:hidden transition-opacity duration-300 ${
          isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileFiltersOpen(false)}
      />

      {/* Mobile sidebar drawer */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-[#1E305F] z-50 transform transition-transform duration-300 ease-in-out xl:hidden ${
        isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="-my-5 h-full overflow-y-auto">
          <FilterSidebar
            onFilterChange={handleFilterChange}
            isMobileOpen={isMobileFiltersOpen}
            setIsMobileOpen={setIsMobileFiltersOpen}
            parentSlugs={["noticias", "noticas", "Noticias"]}
          />
        </div>
      </div>
    </div>
  );
}
