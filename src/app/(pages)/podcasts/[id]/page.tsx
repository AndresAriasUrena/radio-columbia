'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RSSService from '@/lib/rssService';
import { PodcastShow, PodcastEpisode } from '@/types/podcast';
import Image from 'next/image';
import Link from 'next/link';
import { IoArrowBack, IoPlay, IoTime, IoCalendar, IoArrowForward } from 'react-icons/io5';
import { FaInstagram } from "react-icons/fa";
import PodcastsGridHome from '@/components/home/PodcastsGridHome';
import { usePlayer } from '@/lib/PlayerContext';
import ScheduleGrid from '@/components/podcasts/ScheduleGrid';

export default function PodcastDetailPage() {
  const params = useParams();
  const [podcast, setPodcast] = useState<PodcastShow | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playEpisode, playerState } = usePlayer();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);
  const EPISODES_PER_PAGE = 7;

  const cleanHtml = (htmlString: string): string => {
    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = htmlString;
      return div.textContent || div.innerText || '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (duration: string): string => {
    if (!duration) return '00:00';
    if (duration.includes(':')) return duration;
    const totalSeconds = parseInt(duration);
    if (isNaN(totalSeconds)) return duration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchPodcastData = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const podcastData = await RSSService.getPodcastById(params.id as string);
        if (!podcastData) {
          setError('Podcast no encontrado');
          return;
        }

        setPodcast(podcastData);

        const episodesData = await RSSService.getPodcastEpisodes(podcastData.rssUrl);
        setEpisodes(episodesData);

        document.title = `${podcastData.title} | Amplify Radio`;
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el podcast');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcastData();
  }, [params.id]);

  const handlePlayEpisode = (episode: PodcastEpisode, index: number) => {
    if (podcast) {
      playEpisode(episode, podcast, episodes, index);
    }
  };

  const handlePlayFirstEpisode = () => {
    if (podcast && episodes.length > 0) {
      playEpisode(episodes[0], podcast, episodes, 0);
    }
  };

  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * EPISODES_PER_PAGE,
    currentPage * EPISODES_PER_PAGE
  );

  if (loading) {
    return (
      <>
        <div className="min-h-screen font-jost">
          <Navbar />
          <div className="px-4 sm:px-8">
            <div className="max-w-7xl mx-auto relative mt-4 flex flex-col lg:flex-row gap-4">
              {/* Columna izquierda */}
              <div className="w-full lg:w-[75%] lg:overflow-y-auto lg:max-h-[90vh] scrollbar-hide">
                <div className="bg-[#1A1A1A] rounded-2xl">
                  <div className="p-8">
                    {/* Botón volver */}
                    <div className="animate-pulse mb-8">
                      <div className="h-4 bg-[#232323] rounded w-32"></div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-between">
                      <div className="flex-1">
                        {/* Título y autor */}
                        <div className="animate-pulse space-y-4 mb-6">
                          <div className="h-8 bg-[#232323] rounded w-3/4"></div>
                          <div className="h-4 bg-[#232323] rounded w-1/4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-[#232323] rounded"></div>
                            <div className="h-4 bg-[#232323] rounded"></div>
                            <div className="h-4 bg-[#232323] rounded w-2/3"></div>
                          </div>
                        </div>
                        {/* Botón reproducir */}
                        <div className="animate-pulse">
                          <div className="h-10 bg-[#232323] rounded-full w-36"></div>
                        </div>
                      </div>
                      {/* Imagen */}
                      <div className="animate-pulse flex-shrink-0">
                        <div className="w-40 h-40 bg-[#232323] rounded-2xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Episodios */}
              <div className="w-full lg:w-[25%]">
                <div className="animate-pulse">
                  {/* Título y navegación */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-6 bg-[#232323] rounded w-32"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-6 bg-[#232323] rounded"></div>
                      <div className="h-6 w-6 bg-[#232323] rounded"></div>
                    </div>
                  </div>
                  {/* Línea separadora */}
                  <div className="h-0.5 w-full bg-[#232323] mb-3"></div>
                  {/* Lista de episodios */}
                  <div className="space-y-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="bg-[#1A1A1A] rounded-xl p-3">
                        <div className="space-y-2">
                          <div className="h-5 bg-[#232323] rounded w-3/4"></div>
                          <div className="flex gap-4">
                            <div className="h-4 bg-[#232323] rounded w-24"></div>
                            <div className="h-4 bg-[#232323] rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !podcast) {
    return (
      <>
        <div className="min-h-screen font-jost">
          <Navbar />
          <div className="px-4 sm:px-8">
            <div className="max-w-7xl mx-auto relative mt-4">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-[#E5754C] mb-4">
                  {error || 'Podcast no encontrado'}
                </h1>
                <Link 
                  href="/podcasts" 
                  className="text-[#C7C7C7] hover:text-[#E5754C] transition-colors"
                >
                  Volver a podcasts
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isPlayingThisPodcast = playerState.currentShow?.id === podcast.id;

  return (
    <>
      <div className="min-h-screen font-jost">
        <Navbar />
        <div className="px-4 sm:px-8">
          <div className="max-w-7xl mx-auto relative mt-4 flex flex-col lg:flex-row gap-4 ">
            <div className="w-full lg:w-[75%] lg:overflow-y-auto lg:max-h-[90vh] scrollbar-hide">
              <div className='bg-[#1A1A1A] rounded-2xl'>
                <Link
                  href="/podcasts"
                  className="inline-flex items-center gap-2 text-[#C7C7C7] hover:text-[#E5754C] transition-colors pl-8 pt-8"
                >
                  <IoArrowBack className="w-4 h-4" />
                  Volver a podcasts
                </Link>

                <div className="flex flex-col md:flex-row gap-6 p-8 justify-between lg:mb-14">
                  <div className="flex-1 order-2 lg:order-1">
                    <h1 className="font-lexend font-medium text-3xl text-[#EDEEF6] mb-1">
                      {cleanHtml(podcast.title)}
                    </h1>
                    {podcast.author && (
                      <p className="text-[#B4B4B4] mb-4 text-sm">
                      {podcast.author}
                      </p>
                    )}
                    <div 
                      className="text-[#C7C7C7] leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: cleanHtml(podcast.description).replace(/\n/g, '<br>') 
                      }}
                    />
                    <button 
                      onClick={handlePlayFirstEpisode}
                      className='text-[#FFFFFF] bg-[#E5754C] rounded-full px-4 py-2 text-sm mt-4 flex flex-row items-center gap-2 hover:bg-[#FFFFFF] hover:text-[#E5754C] transition-all duration-300 group'
                    >
                      Reproducir
                      <IoPlay className='w-6 h-6 text-[#E5754C] bg-[#FFFFFF] rounded-full p-1 group-hover:text-[#FFFFFF] group-hover:bg-[#E5754C] transition-all duration-300' />
                    </button>
                  </div>
                  <div className="flex-shrink-0 order-1 lg:order-2 border-[#B4B4B4]">
                    <Image
                      src={podcast.imageUrl || '/placeholder-podcast.jpg'}
                      alt={cleanHtml(podcast.title)}
                      width={100}
                      height={100}
                      className="rounded-2xl object-cover w-full lg:w-40 shadow-md shadow-black" style={{boxShadow: '2px 10px 10px 2px rgba(0, 0, 0, 0.9)'}}
                    />
                  </div>
                </div>
                <div className='hidden lg:block'>
                  <PodcastsGridHome />
                </div>
              </div>
              <div className='hidden lg:block'>
                <ScheduleGrid />
              </div>
            </div>

            <div className='w-full lg:w-[25%] lg:overflow-y-auto lg:max-h-[90vh] scrollbar-hide'>
              <div className=''>
                <div className='flex flex-row items-center justify-between'>
                  <h2 className="font-lexend font-semibold text-xl uppercase">CAPITULOS ({episodes.length})</h2>
                  <div className='flex flex-row items-center gap-2'>
                    <button
                      className={`text-[#C7C7C7] hover:text-[#E5754C] transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <IoArrowBack className='w-4 h-4' />
                    </button>
                    <button
                      className={`text-[#C7C7C7] hover:text-[#E5754C] transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <IoArrowForward className='w-4 h-4' />
                    </button>
                  </div>
                </div>
                <div className="h-0.5 w-full bg-[#E5754C] my-3" />
                <div className="space-y-2">
                  {paginatedEpisodes.map((episode, index) => {
                    const globalIndex = (currentPage - 1) * EPISODES_PER_PAGE + index;
                    const isPlaying = isPlayingThisPodcast &&
                      playerState.currentEpisode?.id === episode.id &&
                      playerState.isPlaying;
                    return (
                      <button
                        key={episode.id}
                        onClick={() => handlePlayEpisode(episode, globalIndex)}
                        className={`bg-[#1A1A1A] rounded-xl p-3 hover:bg-[#232323] transition-colors group w-full ${isPlaying ? 'bg-[#232323] border border-[#E5754C]' : ''
                          }`}
                      >
                        <div className="flex items-start text-left gap-4">
                          <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2">
                              {isPlaying && (
                                <div className="flex space-x-1">
                                  <div className="w-1 h-3 bg-[#E5754C] animate-pulse rounded-full"></div>
                                  <div className="w-1 h-3 bg-[#E5754C] animate-pulse rounded-full animation-delay-200"></div>
                                  <div className="w-1 h-3 bg-[#E5754C] animate-pulse rounded-full animation-delay-400"></div>
                                </div>
                              )}
                              <h3 className="font-urbanist text-md font-medium text-[#B4B4B4] line-clamp-2 titlecase flex-1">
                                {cleanHtml(episode.title)}
                              </h3>
                            </div>
                            <div className="flex items-end gap-4 text-sm text-[#9A9898] mt-1">
                              <span className="flex items-center gap-1">
                                <IoCalendar className="w-4 h-4" />
                                {formatDate(episode.pubDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {podcast?.authors && podcast.authors.length > 0 && (
                <div className='mt-5'>
                  <div className='flex flex-row items-center justify-between'>
                    <h2 className="font-lexend font-semibold text-xl uppercase">Amplifiers</h2>
                    <div className='flex flex-row items-center gap-2'>
                      {podcast?.authors && podcast.authors.length > 1 && (
                        <>
                          <span className="text-sm text-[#C7C7C7]/60 mr-2">
                            {currentAuthorIndex + 1} / {podcast.authors.length}
                          </span>
                          <button
                            className={`text-[#C7C7C7] hover:text-[#E5754C] transition-colors ${currentAuthorIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => setCurrentAuthorIndex((i) => Math.max(0, i - 1))}
                            disabled={currentAuthorIndex === 0}
                          >
                            <IoArrowBack className='w-4 h-4' />
                          </button>
                          <button
                            className={`text-[#C7C7C7] hover:text-[#E5754C] transition-colors ${currentAuthorIndex === (podcast?.authors?.length || 1) - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => setCurrentAuthorIndex((i) => Math.min((podcast?.authors?.length || 1) - 1, i + 1))}
                            disabled={currentAuthorIndex === (podcast?.authors?.length || 1) - 1}
                          >
                            <IoArrowForward className='w-4 h-4' />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-0.5 w-full bg-[#E5754C] my-3" />
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <div className='flex flex-col gap-2'>
                      <div className='relative rounded-2xl'>
                        <Image 
                          src={podcast.authors[currentAuthorIndex]?.imageUrl || '/placeholder-author.jpg'} 
                          alt={podcast.authors[currentAuthorIndex]?.name || 'Amplifier'} 
                          width={100} 
                          height={100} 
                          className='rounded-2xl w-full aspect-square object-cover' 
                        />
                        <a 
                          href={podcast.authors[currentAuthorIndex]?.instagramUrl || '#'} 
                          target='_blank' 
                          className="absolute top-2 left-2 bg-[#E5754C] rounded-md p-1 flex items-center shadow-md shadow-black" 
                          style={{boxShadow: '2px 10px 10px 2px rgba(0, 0, 0, 0.9)'}}
                        >
                          <FaInstagram className="w-8 h-8 text-[#FFFFFF]"/>
                        </a>
                      </div>
                      <div className='flex flex-col gap-1'>
                        {podcast.authors[currentAuthorIndex]?.status === 'actual' ? (
                          <Link href={`/amplifiers?author=${encodeURIComponent(podcast.authors[currentAuthorIndex]?.name || '')}`} className='font-lexend font-medium text-lg text-[#C7C7C7] hover:text-[#e4754c] transition-colors cursor-pointer'>
                            {podcast.authors[currentAuthorIndex]?.name || 'Amplifier'}
                          </Link>
                        ) : (
                          <h3 className='font-lexend font-medium text-lg text-[#C7C7C7]'>
                            {podcast.authors[currentAuthorIndex]?.name || 'Amplifier'}
                          </h3>
                        )}
                        <p className='text-sm text-[#C7C7C7]/60 leading-tight'>
                          {podcast.authors[currentAuthorIndex]?.description || 'Descripción del amplifier'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 