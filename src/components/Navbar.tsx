'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSearch } from '@/lib/SearchContext';
import { usePlayer } from '@/lib/PlayerContext';
import Link from 'next/link';
import { IoRadio } from 'react-icons/io5';

interface NavLink {
  href: string;
  label: string;
}

interface MenuItem {
  key: string;
  href: string;
  isButton?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const { searchTerm, setSearchTerm } = useSearch();
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
    { key: 'radionovelas', href: '/podcasts#radionovelas' },
    { key: 'contacto', href: '/contact' },
    { key: 'nosotros', href: '/about-us' },
    { key: 'en-vivo', href: '#', isButton: true },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent, searchValue: string) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchTerm(searchValue.trim());
      setLocalSearchTerm('');
      closeMenu();

      const params = new URLSearchParams();
      params.set('search', searchValue.trim());
      const newURL = `/news?${params.toString()}`;

      if (window.location.pathname === '/news') {
        router.replace(newURL, { scroll: false });
      } else {
        router.push(newURL);
      }
    }
  };

  const handleSearchInputChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const handleEnVivoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playRadio();
    closeMenu();
  };

  return (
    <>
      <nav className="flex items-center px-4 sm:px-6 py-4 bg-[#F8FBFF] mx-2 my-4 rounded-2xl">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src="/assets/LogoColumbia.svg" alt="Columbia" width={120} height={80} className='mr-5 h-20 w-20 md:h-[60px] md:w-[120px]'/>
          </div>

   {/* Desktop Navigation Links - Hidden on mobile */}
   <div className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => {
              if (item.isButton) {
                return (
                  <button
                    key={item.key}
                    onClick={handleEnVivoClick}
                    className="text-[#2F3037] hover:text-[#D51F2F] transition-colors rounded-full flex items-center gap-2"
                  >
                    <div className='bg-[#D51F2F] rounded-full p-1'/>
                    {item.key.charAt(0).toUpperCase() + item.key.slice(1).replace('-', ' ')}
                  </button>
                );
              }
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => handleLinkClick(item.key)}
                  className={`text-[#2F3037] hover:text-[#D51F2F] transition-colors rounded-full ${
                    pathname === item.href ? 'text-[#D51F2F] font-semibold' : ''
                  }`}
                >
                  {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                </Link>
              );
            })}
          </div>

          {/* Desktop Search Bar - Hidden on mobile */}
          <div className="hidden lg:block relative">
            <form onSubmit={(e) => handleSearch(e, localSearchTerm)}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="¿Qué estás buscando hoy?"
                  value={localSearchTerm}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="bg-zinc-900 text-white rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#E5754C] placeholder-zinc-400"
                />
              </div>
            </form>
          </div>

          {/* Mobile Hamburger Button - Only visible on mobile */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-[#E5754C] transition-colors p-2"
              aria-label="Abrir menú"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-zinc-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <img src="/assets/LogoColumbia.svg" alt="Amplify" width={80} height={60} />
              <button
                onClick={closeMenu}
                className="text-white hover:text-[#E5754C] transition-colors p-2"
                aria-label="Cerrar menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="p-6 border-b border-zinc-800">
            <div className="relative">
              <form onSubmit={(e) => handleSearch(e, localSearchTerm)}>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="¿Qué estás buscando hoy?"
                    value={localSearchTerm}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="w-full bg-zinc-800 text-white rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5754C] placeholder-zinc-400"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Navigation Links - Mobile */}
          <div className="flex-1 py-6">
            <nav className="space-y-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                if (item.isButton) {
                  return (
                    <button
                      key={item.key}
                      onClick={handleEnVivoClick}
                      className="flex items-center px-6 py-3 text-lg transition-colors text-[#E5754C] font-bold w-full text-left"
                    >
                      <IoRadio className="w-5 h-5 mr-2" />
                      {item.key.charAt(0).toUpperCase() + item.key.slice(1).replace('-', ' ')}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => {
                      handleLinkClick(item.key);
                      closeMenu();
                    }}
                    className={`flex items-center px-6 py-3 text-lg transition-colors ${
                      isActive
                        ? 'text-[#E5754C] font-bold'
                        : 'text-white hover:text-[#E5754C]'
                    }`}
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