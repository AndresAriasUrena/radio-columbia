'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSearch } from '@/lib/SearchContext';
import { usePlayer } from '@/lib/PlayerContext';
import Link from 'next/link';
import Image from 'next/image';
import { IoRadio, IoAlertCircleOutline, IoTrophyOutline, IoMegaphoneOutline, IoLogoFacebook, IoLogoInstagram, IoLogoTwitter, IoLogoYoutube } from 'react-icons/io5';
import WordPressService from '@/lib/wordpressService';
import { RotatingText } from '@/components/text/RotatingText';

interface MenuItem {
  key: string;
  href: string;
  isButton?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const { setSearchTerm } = useSearch();
  const { playRadio } = usePlayer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [activeLink, setActiveLink] = useState('services');

  const router = useRouter();

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
    setIsMenuOpen(false);
  };

  const menuItems: MenuItem[] = [
    { key: 'inicio', href: '/' },
    { key: 'noticias', href: '/news' },
    { key: 'deportes', href: '/sports' },
    { key: 'podcasts', href: '/podcasts' },
    { key: 'contacto', href: '/contact' },
    { key: 'nosotros', href: '/about-us' },
    { key: 'en-vivo', href: '#', isButton: true },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSearch = (e: React.FormEvent, searchValue: string) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchTerm(searchValue.trim());
      setLocalSearchTerm('');
      closeMenu();
      const params = new URLSearchParams();
      params.set('search', searchValue.trim());
      const newURL = `/news?${params.toString()}`;
      if (window.location.pathname === '/news') router.replace(newURL, { scroll: false });
      else router.push(newURL);
    }
  };

  const handleEnVivoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playRadio();
    closeMenu();
  };

  // Helpers
  const formatColonesFull = (value: any): string => {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
    if (!isFinite(num)) return '—';
    return num.toLocaleString('es-CR');
  };

  const parseRsnDateToCR = (text: string): Date | null => {
    if (!text) return null;
    
    const meses: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    
    // Patrón más flexible para capturar fechas en diferentes formatos
    const patterns = [
      /(\d{1,2})\s+de\s+([a-zñ]+)\s+del\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s+([a-zñ]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)/i
    ];
    
    for (const pattern of patterns) {
      const m = text.toLowerCase().replace(/\./g, '').match(pattern);
      if (m) {
        const day = parseInt(m[1], 10);
        const month = meses[m[2]] ?? null;
        const year = parseInt(m[3], 10);
        let hour = parseInt(m[4], 10);
        const minute = parseInt(m[5], 10);
        const ampm = m[6];
        
        if (month === null) continue;
        
        if (ampm === 'pm' && hour !== 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        
        const iso = `${year.toString().padStart(4, '0')}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00-06:00`;
        return new Date(iso);
      }
    }
    
    return null;
  };

  const isWithinLastHoursCR = (date: Date, hours: number): boolean => {
    const now = new Date();
    const nowCR = new Date(now.toISOString().replace('Z', '-06:00'));
    const diff = nowCR.getTime() - date.getTime();
    return diff >= 0 && diff <= hours * 3600 * 1000;
  };

  const [currentTime, setCurrentTime] = useState<string>('');

  const formatNowCR = (): string => {
    const now = new Date();
    const cr = new Date(now.getTime() - 6 * 3600 * 1000);
    const dia = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long' }).format(cr);
    const horas = cr.getUTCHours();
    const minutos = cr.getUTCMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'pm' : 'am';
    const h12 = ((horas + 11) % 12) + 1;
    return `${dia.charAt(0).toUpperCase() + dia.slice(1)} | ${h12}:${minutos}${ampm}`;
  };

  const parseLotteryDate = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;

    const meses: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };

    // Try to match patterns like "Domingo 15 de diciembre" or "Miércoles 18 de diciembre"
    const pattern = /(domingo|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado)\s+(\d{1,2})\s+de\s+([a-zñ]+)/i;
    const m = fechaStr.toLowerCase().match(pattern);

    if (m) {
      const day = parseInt(m[2], 10);
      const monthName = m[3];
      const month = meses[monthName];

      if (month === undefined) return null;

      // Determine the year (current or previous)
      const now = new Date();
      const currentYear = now.getFullYear();

      // Try current year first
      let date = new Date(currentYear, month, day, 20, 0, 0); // Assume 8pm draw time

      // If the date is in the future, use previous year
      if (date > now) {
        date = new Date(currentYear - 1, month, day, 20, 0, 0);
      }

      return date;
    }

    return null;
  };

  const isWithinHours = (date: Date, hours: number): boolean => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff >= 0 && diff <= hours * 3600 * 1000;
  };

  // Data state
  const [latestPosts, setLatestPosts] = useState<{ title: string; slug: string }[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [quakeAlert, setQuakeAlert] = useState<{ text: string } | null>(null);
  const [lotteryDisplay, setLotteryDisplay] = useState<{
    premios: Array<{ numero: string; serie: string; premio: any; rank: number; kind: 'chances' | 'loteria'; name: string }>
  } | null>(null);



  useEffect(() => {
    // Actualizar la hora solo en el cliente para evitar problemas de hidratación
    const updateTime = () => {
      setCurrentTime(formatNowCR());
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 60000); // Actualizar cada minuto
    
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const result = await WordPressService.getPosts({ page: 1, perPage: 3, orderBy: 'date' });
        const posts = result.posts?.map(post => ({
          title: WordPressService.cleanHtml(post.title.rendered),
          slug: post.slug
        })) || [];
        setLatestPosts(posts);
      } catch { }
    };

    const fetchQuakeAlert = async () => {
      try {
        const response = await fetch('/api/earthquakes');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            const latestQuake = data.items[0];
            
            // Usar la fecha del texto del terremoto
            const quakeDate = parseRsnDateToCR(latestQuake.title);
            if (quakeDate) {
              const now = new Date();
              const diffHours = (now.getTime() - quakeDate.getTime()) / (1000 * 60 * 60);
              
              // Mostrar alerta si el terremoto es de las últimas 24 horas
              if (diffHours <= 24) {
                setQuakeAlert({
                  text: `${latestQuake.title}`
                });
              } else {
                // Limpiar alerta si ya no es reciente
                setQuakeAlert(null);
              }
            }
          }
        }
      } catch (error) {
        // Error silencioso
      }
    };

    const fetchLotteryAlert = async () => {
      try {
        const combinedPremios: Array<{ numero: string; serie: string; premio: any; rank: number; kind: 'chances' | 'loteria'; name: string }> = [];

        // Fetch Lotería Nacional
        try {
          const loteriaResponse = await fetch('/api/jps/loteria/last');
          if (loteriaResponse.ok) {
            const loteriaData = await loteriaResponse.json();

            if (loteriaData.premios && loteriaData.premios.length > 0) {
              const loteriaDate = parseLotteryDate(loteriaData.fecha);

              // Show if within 48 hours
              if (loteriaDate && isWithinHours(loteriaDate, 48)) {
                const loteriaPremios = loteriaData.premios.slice(0, 3).map((p: any) => ({
                  numero: String(p.numero),
                  serie: String(p.serie),
                  premio: p.premio,
                  rank: p.rank,
                  kind: 'loteria' as const,
                  name: 'Lotería Nacional'
                }));
                combinedPremios.push(...loteriaPremios);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching lotería:', error);
        }

        // Fetch Chances
        try {
          const chancesResponse = await fetch('/api/jps/chances/last');
          if (chancesResponse.ok) {
            const chancesData = await chancesResponse.json();

            if (chancesData.premios && chancesData.premios.length > 0) {
              const chancesDate = parseLotteryDate(chancesData.fecha);

              // Show if within 24 hours
              if (chancesDate && isWithinHours(chancesDate, 24)) {
                const chancesPremios = chancesData.premios.slice(0, 3).map((p: any) => ({
                  numero: String(p.numero),
                  serie: String(p.serie),
                  premio: p.premio,
                  rank: p.rank,
                  kind: 'chances' as const,
                  name: 'Chances'
                }));
                combinedPremios.push(...chancesPremios);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching chances:', error);
        }

        // Update state with combined results (Lotería first, then Chances)
        if (combinedPremios.length > 0) {
          setLotteryDisplay({ premios: combinedPremios });
        } else {
          setLotteryDisplay(null);
        }
      } catch (error) {
        console.error('Error al obtener lotería:', error);
        setLotteryDisplay(null);
      }
    };

    fetchLatestPost();
    fetchQuakeAlert();
    fetchLotteryAlert();

    // Actualizar alertas de terremotos cada 2 minutos (el endpoint ya cachea 60s en el servidor)
    const quakeInterval = setInterval(fetchQuakeAlert, 2 * 60 * 1000);

    return () => {
      clearInterval(quakeInterval);
    };
  }, []);

  // Rotate news index every 4 seconds
  useEffect(() => {
    if (latestPosts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % latestPosts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [latestPosts.length]);

  const handleNewsClick = () => {
    if (latestPosts[currentNewsIndex]) {
      router.push(`/${latestPosts[currentNewsIndex].slug}`);
    }
  };

  return (
    <>
      {/* Barra superior: fecha/hora y titular */}
      <div className="mx-2 mt-2">
        <div className="w-full mx-auto rounded-xl bg-[#1E305F] text-white px-3 sm:px-4 py-2 text-[10px] sm:text-xs flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2">
          <div className="whitespace-nowrap">{currentTime || 'Cargando...'}</div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-center justify-center w-full sm:w-auto">
            <IoMegaphoneOutline className="w-4 h-4" />
            <span className="uppercase opacity-80 whitespace-nowrap">Noticias de última hora</span>
            <span
              className="truncate max-w-full sm:max-w-[60vw] cursor-pointer hover:underline"
              onClick={handleNewsClick}
            >
              {latestPosts.length > 0 ? (
                <RotatingText
                  text={latestPosts.map(post => post.title)}
                  duration={4000}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              ) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-center justify-center w-full sm:w-auto hidden sm:flex">
            <a href="https://www.instagram.com/noticiascolumbia/?hl=es" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">            <IoLogoInstagram className="w-4 h-4" />
            </a>
            <a href="https://www.youtube.com/channel/UCo2Fr8GUPmevyi7uih-0oTg/featured?view_as=subscriber" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">
              <IoLogoYoutube className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/NoticiasColumbia/?locale2=pt_PT&_rdr" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">
              <IoLogoFacebook className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/ColumbiaDigitalcr/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">
              <IoLogoFacebook className="w-4 h-4" />
            </a>
            <a href="https://x.com/webcolumbia?lang=es" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">
              <IoLogoTwitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <nav className="flex items-center px-4 sm:px-6 py-4 bg-[#F8FBFF] mx-2 my-4 rounded-2xl">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/assets/LogoColumbia.svg"
              alt="Columbia"
              width={150}
              height={54}
              priority
              className='mr-5 h-auto w-28 md:w-[150px]'
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => {
              if (item.isButton) {
                return (
                  <button
                    key={item.key}
                    onClick={handleEnVivoClick}
                    className="text-[#2F3037] hover:text-[#D51F2F] transition-colors rounded-full flex items-center gap-2"
                  >
                    <div className='bg-[#D51F2F] rounded-full p-1' />
                    {item.key.charAt(0).toUpperCase() + item.key.slice(1).replace('-', ' ')}
                  </button>
                );
              }
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => handleLinkClick(item.key)}
                  className={`text-[#2F3037] hover:text-[#D51F2F] transition-colors rounded-full ${pathname === item.href ? 'text-[#D51F2F] font-semibold' : ''}`}
                >
                  {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:block relative">
            <form onSubmit={(e) => handleSearch(e, localSearchTerm)}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-[#000000]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="¿Qué estás buscando hoy?"
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="border border-[#000000]/30 bg-transparent text-black rounded-md pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none placeholder-[#000000]/20"
                />
              </div>
            </form>
          </div>

          <div className="lg:hidden">
            <button onClick={toggleMenu} className="text-[#2F3037] hover:text-[#D51F2F] transition-colors p-2" aria-label="Abrir menú">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Barras informativas bajo el navbar */}
      <div className="mx-2">
        <div className="w-full mx-auto space-y-2 mb-5">
          {quakeAlert && (
            <div className="rounded-xl bg-[#D51F2F] text-white py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-sm">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-center">
                <IoAlertCircleOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="uppercase tracking-wide">Alerta de sismo</span>
                <span className="opacity-90 break-words">{quakeAlert.text}</span>
              </div>
            </div>
          )}

          {lotteryDisplay && lotteryDisplay.premios && lotteryDisplay.premios.length > 0 && (
            <div className="rounded-xl bg-[#01A299] text-white py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-sm">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-center">
                <IoTrophyOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="uppercase tracking-wide">Resultados de Lotería</span>
                <span className="opacity-90 break-words">
                  <RotatingText
                    text={lotteryDisplay.premios.map((p) =>
                      `${p.name} - ${p.rank}º Lugar - ${p.numero} | Serie ${p.serie} | ₡${formatColonesFull(p.premio)}`
                    )}
                    duration={4000}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={closeMenu} />
      )}

      <div className={`fixed top-0 right-0 h-full w-80 bg-[#F8FBFF] shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#D4D5DD]">
            <div className="flex items-center justify-between">
              <Image
                src="/assets/LogoColumbia.svg"
                alt="Columbia"
                width={96}
                height={35}
                priority
                className="h-auto w-24"
              />
              <button onClick={closeMenu} className="text-[#2F3037] hover:text-[#D51F2F] transition-colors p-2" aria-label="Cerrar menú">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 border-b border-[#D4D5DD]">
            <div className="relative">
              <form onSubmit={(e) => handleSearch(e, localSearchTerm)}>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-[#000000]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="¿Qué estás buscando hoy?"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="w-full bg-transparent border border-[#000000]/30 text-black rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none placeholder-[#000000]/20"
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="flex-1 py-6">
            <nav className="space-y-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                if (item.isButton) {
                  return (
                    <button key={item.key} onClick={handleEnVivoClick} className="flex items-center px-6 py-3 text-lg transition-colors text-[#2F3037] font-medium w-full text-left hover:text-[#D51F2F]">
                      <IoRadio className="w-5 h-5 mr-2 text-[#D51F2F]" />
                      {item.key.charAt(0).toUpperCase() + item.key.slice(1).replace('-', ' ')}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => { handleLinkClick(item.key); closeMenu(); }}
                    className={`flex items-center px-6 text-lg transition-colors ${isActive ? 'text-[#D51F2F] font-semibold' : 'text-[#2F3037] hover:text-[#D51F2F]'}`}
                  >
                    {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}