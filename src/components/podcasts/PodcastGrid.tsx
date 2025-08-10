'use client';

import { useState, useEffect, useCallback } from 'react';
import PodcastCard from '../UI/PodcastCard';
import { IoFilter, IoClose, IoReload } from 'react-icons/io5';
import { useRouter, useSearchParams } from 'next/navigation';
import RSSService from '@/lib/rssService';
import { PodcastShow } from '@/types/podcast';

interface PodcastGridProps {
  onOpenFilters?: () => void;
}

export default function PodcastGrid() {
  const [currentPodcasts, setCurrentPodcasts] = useState<PodcastShow[]>([]);
  const [historicalPodcasts, setHistoricalPodcasts] = useState<PodcastShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadPodcasts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Cargar ambos tipos de podcasts en paralelo para mejor rendimiento
      const [currentShows, historicalShows] = await Promise.all([
        RSSService.getCurrentPodcasts(),
        RSSService.getHistoricalPodcasts()
      ]);
      
      setCurrentPodcasts(currentShows);
      setHistoricalPodcasts(historicalShows);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('❌ Error loading podcasts:', err);
      setError('Error al cargar los podcasts. Por favor, intenta nuevamente.');
      
      // Auto-retry hasta 3 veces
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadPodcasts();
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    loadPodcasts();
  }, [loadPodcasts]);

  const handleRetry = () => {
    setError(null);
    loadPodcasts();
  };

  if (error) {
    return (
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-[#E5754C] mb-2">
              Error al cargar podcasts
            </h3>
            <p className="text-[#C7C7C7] mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="text-[#E5754C] border-[1.4px] border-[#E5754C] px-4 py-2 rounded-full hover:shadow-[#E5754C] hover:shadow-sm transition-all duration-300 flex items-center gap-2"
            >
              <IoReload className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPodcasts = currentPodcasts.length + historicalPodcasts.length;

  return (
    <div className="flex-1">
      {/* Sección de Podcasts Actuales */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-lexend font-semibold text-xl">PODCASTS ACTUALES</h2>
            </div>
            <div className="h-0.5 w-full bg-[#E5754C] my-4" />
            
            <p className="text-[#C7C7C7]/50 mt-1">
              {isLoading && currentPodcasts.length === 0 
                ? 'Cargando podcasts actuales...' 
                : `${currentPodcasts.length} podcast${currentPodcasts.length !== 1 ? 's' : ''} activo${currentPodcasts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {isLoading && currentPodcasts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-[#232323] aspect-[16/11] rounded-2xl mb-4"></div>
                <div className="h-4 bg-[#232323] rounded mb-2"></div>
                <div className="h-4 bg-[#232323] rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {currentPodcasts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        )}

        {!isLoading && currentPodcasts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#C7C7C7] text-lg">
              No se encontraron podcasts actuales
            </p>
          </div>
        )}
      </div>

      {/* Sección de Podcasts Históricos */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-lexend font-semibold text-xl">HISTORIAL DE PODCASTS</h2>
            </div>
            <div className="h-0.5 w-full bg-[#E5754C] my-4" />
            
            <p className="text-[#C7C7C7]/50 mt-1">
              {isLoading && historicalPodcasts.length === 0 
                ? 'Cargando historial...' 
                : `${historicalPodcasts.length} podcast${historicalPodcasts.length !== 1 ? 's' : ''} en el historial`}
            </p>
          </div>
        </div>

        {isLoading && historicalPodcasts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`historical-${index}`} className="animate-pulse">
                <div className="bg-[#232323] aspect-[16/11] rounded-2xl mb-4"></div>
                <div className="h-4 bg-[#232323] rounded mb-2"></div>
                <div className="h-4 bg-[#232323] rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {historicalPodcasts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {historicalPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        )}

        {!isLoading && historicalPodcasts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#C7C7C7] text-lg">
              No se encontraron podcasts en el historial
            </p>
          </div>
        )}
      </div>
    </div>
  );
}