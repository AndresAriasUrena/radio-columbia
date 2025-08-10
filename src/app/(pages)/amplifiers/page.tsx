'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaInstagram, FaMicrophone } from "react-icons/fa";
import Link from 'next/link';
import { RSSService as RSSServiceClass } from '@/lib/rssService';
import { PodcastShow, Author } from '@/types/podcast';

function AmplifiersContent() {
    const [currentAuthors, setCurrentAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const authorParam = searchParams.get('author');

    useEffect(() => {
        const fetchCurrentAuthors = () => {
            try {
                // Usar la función optimizada que no hace llamadas RSS
                const actualAuthors = RSSServiceClass.getCurrentAuthors();
                setCurrentAuthors(actualAuthors);
            } catch (error) {
                console.error('Error al cargar los autores actuales:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentAuthors();
    }, []);

    useEffect(() => {
        if (authorParam && currentAuthors.length > 0 && !loading) {
            const timer = setTimeout(() => {
                const authorElement = document.getElementById(`author-${authorParam}`);
                if (authorElement) {
                    authorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Añadir efecto de highlight temporal
                    authorElement.classList.add('highlight-author');
                    setTimeout(() => {
                        authorElement.classList.remove('highlight-author');
                    }, 3000);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [authorParam, currentAuthors, loading]);

    if (loading) {
        return (
            <div className="p-4 sm:p-8 bg-[#121212] mx-2">
                <div className="max-w-7xl mx-auto relative">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-16 w-full">
                        <div className="flex-1 items-center justify-center text-center">
                            <span className="inline-block mb-4 px-4 py-2 rounded-full border border-[#e4754c] text-[#e4754c] text-xs font-normal">
                                EQUIPO
                            </span>
                            <h1 className="font-lexend text-3xl font-semibold text-[#C7C7C7] mb-2">
                                Nuestros Amplifiers
                            </h1>
                            <div className="mb-6 text-[#FFFFFF]/60 text-sm">
                                Conoce a los integrantes de Amplify Radio y sus podcast
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-8 mt-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-[#232323] rounded-2xl p-6 md:p-8 animate-pulse">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                                    <div className="flex flex-col gap-2 w-full md:w-[200px] items-center">
                                        <div className="w-28 h-28 md:w-40 md:h-40 bg-[#181818] rounded-full"></div>
                                        <div className="flex gap-2 mt-2">
                                            <div className="w-8 h-8 bg-[#181818] rounded-full"></div>
                                            <div className="w-8 h-8 bg-[#181818] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-6 bg-[#181818] rounded w-48 mb-2"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-[#181818] rounded"></div>
                                            <div className="h-4 bg-[#181818] rounded"></div>
                                            <div className="h-4 bg-[#181818] rounded w-3/4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                .highlight-author {
                    background-color: #2E2E2E !important;
                    transform: scale(1.02);
                    box-shadow: 0 0 20px rgba(229, 117, 76, 0.3);
                }
            `}</style>
            <div className="p-4 sm:p-8 bg-[#121212] mx-2 rounded-2xl">
                <div className="max-w-7xl mx-auto relative">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-16 w-full">
                        <div className="flex-1 items-center justify-center text-center">
                            <span className="inline-block mb-4 px-4 py-2 rounded-full border border-[#e4754c] text-[#e4754c] text-xs font-normal">
                                EQUIPO
                            </span>
                            <h1 className="font-lexend text-3xl font-semibold text-[#C7C7C7] mb-2">
                                Nuestros Amplifiers
                            </h1>
                            <div className="mb-6 text-[#FFFFFF]/60 text-sm">
                                Conoce a los integrantes de Amplify Radio y sus podcast
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 mt-8">
                        {currentAuthors.map((author, index) => (
                            <div 
                                key={index} 
                                id={`author-${author.name}`}
                                className="bg-[#232323] min-h-[250px] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start transition-all duration-300"
                            >
                                <div className="flex flex-col gap-2 w-full md:w-[200px] md:h-40 items-center">
                                    <img 
                                        src={author.imageUrl} 
                                        alt={author.name} 
                                        className="w-28 h-28 md:w-full md:h-40 rounded-full object-cover border-4 border-[#232323] shadow-md" 
                                    />
                                    <div className="flex gap-2 mt-2">
                                        {author.instagramUrl && (
                                            <Link href={author.instagramUrl} target="_blank" className="w-8 h-8 bg-[#2E2E2E] rounded-full flex items-center justify-center text-[#939393] hover:text-[#e4754c] transition-colors">
                                                <FaInstagram />
                                            </Link>
                                        )}
                                        <Link href={`/podcasts/${author.podcastId}`} className="w-8 h-8 bg-[#2E2E2E] rounded-full flex items-center justify-center text-[#939393] hover:text-[#e4754c] transition-colors">
                                            <FaMicrophone />
                                        </Link>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 mb-2">
                                        <span className="text-[#e4754c] font-medium text-lg">{author.name}</span>
                                        <Link href={`/podcasts/${author.podcastId}`} className="text-[#939393] text-base">| {author.podcastName}</Link>
                                    </div>
                                    <div className="text-[#B4B4B4CC]/80 text-md mb-4 text-justify">
                                        {author.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function AmplifiersFallback() {
    return (
        <div className="p-4 sm:p-8 bg-[#121212] mx-2">
            <div className="max-w-7xl mx-auto relative">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-16 w-full">
                    <div className="flex-1 items-center justify-center text-center">
                        <span className="inline-block mb-4 px-4 py-2 rounded-full border border-[#e4754c] text-[#e4754c] text-xs font-normal">
                            EQUIPO
                        </span>
                        <h1 className="font-lexend text-3xl font-semibold text-[#C7C7C7] mb-2">
                            Nuestros Amplifiers
                        </h1>
                        <div className="mb-6 text-[#FFFFFF]/60 text-sm">
                            Conoce a los integrantes de Amplify Radio y sus podcast
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-8 mt-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-[#232323] rounded-2xl p-6 md:p-8 animate-pulse">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                                <div className="flex flex-col gap-2 w-full md:w-[200px] items-center">
                                    <div className="w-28 h-28 md:w-40 md:h-40 bg-[#181818] rounded-full"></div>
                                    <div className="flex gap-2 mt-2">
                                        <div className="w-8 h-8 bg-[#181818] rounded-full"></div>
                                        <div className="w-8 h-8 bg-[#181818] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className="h-6 bg-[#181818] rounded w-48 mb-2"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-[#181818] rounded"></div>
                                        <div className="h-4 bg-[#181818] rounded"></div>
                                        <div className="h-4 bg-[#181818] rounded w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Amplifiers() {
    return (
        <>
            <div className="min-h-screen font-jost">
                <Navbar />
                <Suspense fallback={<AmplifiersFallback />}>
                    <AmplifiersContent />
                </Suspense>
            </div>
            <Footer />
        </>
    );
} 