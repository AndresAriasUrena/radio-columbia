'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Facebook, Instagram, X, Search } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { SearchContext } from '@/lib/SearchContext';
import WordPressService from '@/lib/wordpressService';
import { WordPressCategory, FilterItem, FilterData } from '@/types/wordpress';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterData) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

const FilterSidebar = ({ onFilterChange, isMobileOpen = false, setIsMobileOpen = () => { } }: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchTerm, setSearchTerm } = useContext(SearchContext);

  const [selectedFilters, setSelectedFilters] = useState<FilterData>({
    categories: []
  });

  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as FilterItem[]
  });

  const [loading, setLoading] = useState(true);

  const updateURL = (filters: FilterData) => {
    const params = new URLSearchParams();
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    const newURL = params.toString() ? `/news?${params.toString()}` : '/news';

    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/news') {
        router.replace(newURL, { scroll: false });
      } else {
        router.push(newURL);
      }
    }
  };

  const loadFiltersFromURL = () => {
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    return { categories };
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const { categories } = await WordPressService.getCategories();

        setAvailableFilters({
          categories: categories
            .map((cat: WordPressCategory) => ({
              label: cat.name,
              count: cat.count,
              slug: cat.slug
            }))
            .sort((a: FilterItem, b: FilterItem) => b.count - a.count) 
        });

        const urlFilters = loadFiltersFromURL();
        setSelectedFilters(urlFilters);

        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching WordPress categories:', error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!loading) {
      onFilterChange?.(selectedFilters);
    }
  }, [selectedFilters]);

  const handleCheckboxChange = (category: keyof FilterData, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const newFilters = {
        ...prev,
        [category]: newValues
      };
      updateURL(newFilters);
      return newFilters;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(selectedFilters);
  };

  return (
    <div className="w-full lg:w-72 text-[#C7C7C7]">
      <div className="lg:hidden flex items-center justify-between mb-6">
        <h2 className="font-lexend font-semibold text-xl">FILTROS</h2>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
        >
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-8">
        <h2 className="font-lexend font-semibold text-xl">BUSCAR NOTICIAS</h2>
        <div className="h-0.5 w-full bg-[#E5754C] my-4" />
        <form onSubmit={handleSearch} className="relative">
          <button type="submit" className="absolute left-3 top-2">
            <Search className="w-5 h-5 text-[#C7C7C7]" />
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="w-full bg-black border border-[#C7C7C7] pl-10 rounded-lg px-4 py-2 text-sm text-[#C7C7C7] placeholder-[#C7C7C7] focus:outline-none focus:ring-"
          />
        </form>
      </div>

      <div className="mb-8">
        <h2 className="font-lexend font-semibold text-xl">CATEGORÍAS</h2>
        <div className="h-0.5 w-full bg-[#E5754C] my-4" />
        {loading ? (
          <div className="text-[#C7C7C7] text-sm">Cargando categorías...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableFilters.categories.map((category) => (
              <a 
                key={category.slug}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxChange('categories', category.slug);
                }}
                className={`
                  px-3 py-2 rounded-lg text-sm hover:scale-105 transition-all duration-300
                  flex items-center justify-between
                  ${selectedFilters.categories.includes(category.slug) 
                    ? 'bg-[#C7C7C7] text-[#0a0a0a]' 
                    : 'bg-[#E5754C] text-[#0a0a0a]'
                  }
                `}
              >
                <span className="truncate">{category.label}</span>
                <span className="text-xs ml-2 flex-shrink-0">({category.count})</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-lexend font-semibold text-xl">SÍGUENOS</h2>
        <div className="h-0.5 w-full bg-[#E5754C] my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href="https://x.com/amplifyradiofm"
            target="_blank"
            className="flex items-center border border-[#C7C7C7] text-[#C7C7C7] rounded-lg px-4 py-2 space-x-2 hover:border-[#E5754C] hover:text-[#E5754C] transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Twitter (X)</span>
          </a>

          <a
            href="https://www.instagram.com/amplifyradiofm/"
            target="_blank"
            className="flex items-center border border-[#C7C7C7] text-[#C7C7C7] rounded-lg px-4 py-2 space-x-2 hover:border-[#E5754C] hover:text-[#E5754C] transition-colors"
          >
            <Instagram className="w-5 h-5" />
            <span className="text-sm">Instagram</span>
          </a>

          <a
            href="https://www.facebook.com/amplifyradiofm/"
            target="_blank"
            className="flex items-center border border-[#C7C7C7] text-[#C7C7C7] rounded-lg px-4 py-2 space-x-2 hover:border-[#E5754C] hover:text-[#E5754C] transition-colors"
          >
            <Facebook className="w-5 h-5" />
            <span className="text-sm">Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar; 