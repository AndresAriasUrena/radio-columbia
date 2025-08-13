'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Facebook, Instagram, X, Search, Youtube, Mail, ArrowLeftRight } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { SearchContext } from '@/lib/SearchContext';
import WordPressService from '@/lib/wordpressService';
import { WordPressCategory, FilterItem, FilterData } from '@/types/wordpress';
import WeatherSlider from './sidebar/WeatherSlider';
import EarthquakesBlock from './sidebar/EarthquakesBlock';
import CurrencyConverter from './sidebar/CurrencyConverter';
import StandingsTable from './sidebar/StandingsTable';
import LotteryResults from './sidebar/LotteryResults';

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
  const [visibleCount, setVisibleCount] = useState(8);

  // Estado del conversor de divisas
  const currencies: Array<{ code: string; name: string }> = [
    { code: 'CRC', name: 'Colón de Costa Rica' },
    { code: 'USD', name: 'Dólar Americano' },
    { code: 'EUR', name: 'Euro' },
    { code: 'COP', name: 'Peso Colombiano' },
    { code: 'MXN', name: 'Peso Mexicano' },
    { code: 'ARS', name: 'Peso Argentino' },
  ];
  const [amount, setAmount] = useState<string>('1');
  const [fromCur, setFromCur] = useState<string>('CRC');
  const [toCur, setToCur] = useState<string>('USD');
  const [convLoading, setConvLoading] = useState<boolean>(false);
  const [convResult, setConvResult] = useState<number | null>(null);

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

  // Lista de redes sociales (mapea para renderizar)
  const socialLinks: Array<{ label: string; href: string; Icon: any; external?: boolean }> = [
    { label: 'Twitter (X)', href: 'https://x.com/webcolumbia?lang=es', Icon: X, external: true },
    { label: 'Instagram', href: 'https://www.instagram.com/noticiascolumbia/?hl=es', Icon: Instagram, external: true },
    { label: 'Facebook', href: 'https://www.facebook.com/NoticiasColumbia/?locale2=pt_PT&_rdr', Icon: Facebook, external: true },
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCo2Fr8GUPmevyi7uih-0oTg/featured?view_as=subscriber', Icon: Youtube, external: true },
    { label: 'Email', href: 'mailto:ventas@grupocolumbia.co.cr', Icon: Mail, external: false },
  ];

  // Conversión de divisas usando exchangerate.host
  useEffect(() => {
    let ignore = false;
    const doConvert = async () => {
      try {
        setConvLoading(true);
        const amt = parseFloat((amount || '0').toString().replace(',', '.')) || 0;
        // Primer intento: exchangerate.host
        const url = `https://api.exchangerate.host/convert?from=${fromCur}&to=${toCur}&amount=${amt}`;
        let ok = false;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (typeof data?.result === 'number') {
            if (!ignore) setConvResult(data.result);
            ok = true;
          }
        } catch {}

        // Fallback: open.er-api.com (calcular manualmente)
        if (!ok) {
          try {
            const res2 = await fetch(`https://open.er-api.com/v6/latest/${fromCur}`);
            const data2 = await res2.json();
            const rate = data2?.rates?.[toCur];
            if (typeof rate === 'number') {
              if (!ignore) setConvResult(amt * rate);
              ok = true;
            }
          } catch {}
        }

        if (!ok && !ignore) setConvResult(null);
      } catch (e) {
        if (!ignore) setConvResult(null);
      } finally {
        if (!ignore) setConvLoading(false);
      }
    };
    doConvert();
    return () => { ignore = true; };
  }, [amount, fromCur, toCur]);

  // Fetch últimos sismos (RSN)
  const [quakes, setQuakes] = useState<Array<{ title: string; dateText: string; magnitudeText: string; magnitude: number | null; url: string }>>([]);
  const [quakesLoading, setQuakesLoading] = useState<boolean>(true);
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setQuakesLoading(true);
        const res = await fetch('/api/earthquakes');
        const data = await res.json();
        if (!ignore && data?.items) setQuakes(data.items);
      } catch {
        if (!ignore) setQuakes([]);
      } finally {
        if (!ignore) setQuakesLoading(false);
      }
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => { ignore = true; clearInterval(id); };
  }, []);

  // Fetch tabla posiciones
  type StandingRow = { pos: number; team: string; played: number; wins: number; draws: number; losses: number; points: number; next?: string };
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [standingLoading, setStandingLoading] = useState<boolean>(true);
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setStandingLoading(true);
        const res = await fetch('/api/standings');
        const data = await res.json();
        if (!ignore && data?.rows) setStandings(data.rows);
      } catch {
        if (!ignore) setStandings([]);
      } finally {
        if (!ignore) setStandingLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => { ignore = true; clearInterval(id); };
  }, []);

  return (
    <div className="mx-2">
      <div className="w-full lg:w-96 text-[#D4D5DD] px-4 sm:px-6 py-8 sm:py-12 lg:py-16 bg-[#1E305F] my-4 rounded-2xl">
      <div className="lg:hidden flex items-center justify-between mb-6">
          <h2 className="font-lexend font-semibold text-xl text-[#D4D5DD]">FILTROS</h2>
        <button
          onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-[#FFFFFF]/15 rounded-lg transition-colors"
        >
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-8">
          <h2 className="font-lexend font-semibold text-xl text-[#D4D5DD]">Categorías</h2>
          <div className="h-[0.4px] w-full bg-[#FFFFFF]/20 my-4" />
        {loading ? (
            <div className="text-[#D4D5DD] text-sm">Cargando categorías...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
              {availableFilters.categories.slice(0, visibleCount).map((category) => (
              <a 
                key={category.slug}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxChange('categories', category.slug);
                }}
                className={`
                    w-full px-3 py-2 rounded-md text-sm transition-colors border border-[#FFFFFF]/10
                    flex items-center gap-2
                  ${selectedFilters.categories.includes(category.slug) 
                      ? 'bg-[#D51F2F] text-white' 
                      : 'bg-transparent text-[#D4D5DD] hover:bg-[#D51F2F] hover:text-white'
                  }
                `}
              >
                <span className="truncate">{category.label}</span>
                  <span className="text-sm ml-1 flex-shrink-0">({category.count})</span>
              </a>
            ))}
              {availableFilters.categories.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((c) => Math.min(c + 8, availableFilters.categories.length))}
                  className="w-full py-2 mt-2 rounded-md text-sm hover:bg-[#D51F2F] text-[#D4D5DD] bg-[#D51F2F]/80 transition-all duration-300"
                >
                  Cargar más
                </button>
              )}
          </div>
        )}
      </div>

        <CurrencyConverter />
 
        <EarthquakesBlock />
 
        <StandingsTable />
 
        {/* Clima */}
        <div className="mb-8">
          <WeatherSlider />
        </div>

        {/* Lotería */}
        <div className="mb-8">
          <LotteryResults />
        </div>

        <div>
          <h2 className="font-lexend font-semibold text-xl text-[#D4D5DD]">Nuestras Redes</h2>
          <div className="h-[0.4px] w-full bg-[#FFFFFF]/20 my-4" />
          <div className="grid grid-cols-1 gap-2">
            {socialLinks.map(({ label, href, Icon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-start gap-3 text-[#D4D5DD] bg-[#FFFFFF]/10 hover:bg-[#D51F2F] rounded-md px-4 py-3 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </a>
            ))}
          </div>
      </div>
    </div>
    </div>
  );
};

export default FilterSidebar; 