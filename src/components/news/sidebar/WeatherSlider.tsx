'use client';

import { useEffect, useRef, useState } from 'react';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';

interface WeatherData {
  city: string;
  temp_c: number;
  condition: string;
  icon: string;
  feelslike_c: number;
  wind_kph: number;
  last_updated: string;
}

export default function WeatherSlider() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WeatherData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/weather');
        const data = await res.json();
        if (!ignore && data?.cities) setItems(data.cities);
      } catch {
        if (!ignore) setError('No se pudo cargar el clima');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchAll();
    const id = setInterval(fetchAll, 30 * 60 * 1000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, []);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = dir === 'left' ? -260 : 260;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center ml-auto mb-1 gap-2">
          <button onClick={() => scrollBy('left')} className="p-2 rounded-full bg-[#FFFFFF]/15 hover:bg-[#D51F2F] transition-colors">
            <IoArrowBack className="w-4 h-4 text-[#D4D5DD]" />
          </button>
          <button onClick={() => scrollBy('right')} className="p-2 rounded-full bg-[#FFFFFF]/15 hover:bg-[#D51F2F] transition-colors">
            <IoArrowForward className="w-4 h-4 text-[#D4D5DD]" />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-[#D4D5DD]">{error}</div>
      )}

      <div ref={scrollerRef} className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory">
        {(loading ? Array.from({ length: 5 }) : items).map((item, idx) => (
          <div key={idx} className="min-w-[220px] snap-start bg-[#FFFFFF]/10 rounded-xl px-4 py-4 flex flex-col items-center text-[#D4D5DD]">
            {loading ? (
              <div className="w-full animate-pulse">
                <div className="h-4 bg-[#FFFFFF]/20 rounded mb-2"></div>
                <div className="h-10 bg-[#FFFFFF]/20 rounded mb-2"></div>
                <div className="h-3 bg-[#FFFFFF]/20 rounded w-1/2 mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="text-sm opacity-80 mb-1">{(item as WeatherData).city}</div>
                <div className="flex items-center gap-2">
                  {(item as WeatherData).icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(item as WeatherData).icon} alt="condición" className="w-10 h-10" />
                  )}
                  <div className="text-3xl font-semibold">{Math.round((item as WeatherData).temp_c)}°</div>
                </div>
                <div className="text-xs opacity-80 mt-1">{(item as WeatherData).condition}</div>
                <div className="text-[11px] opacity-60 mt-1">Sensación {(item as WeatherData).feelslike_c.toFixed(0)}° · Viento {(item as WeatherData).wind_kph.toFixed(0)} km/h</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 