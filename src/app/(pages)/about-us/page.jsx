'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/about-us/Hero';

const Radios = dynamic(() => import('@/components/about-us/Radios'), { ssr: false });
const Values = dynamic(() => import('@/components/about-us/Values'), { ssr: false });

export default function AboutUs() {
  useEffect(() => {
    document.title = 'Sobre Nosotros | Amplify Radio - Conoce Nuestra Historia';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = 'Conoce la historia de Amplify Radio, tu estación de radio online. Descubre nuestra misión, valores y el equipo que hace posible la mejor música y noticias las 24 horas.';
    
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const keywords = 'amplify radio historia, sobre nosotros, equipo radio, misión radio online, valores amplify radio';
    
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <>
      <div className="min-h-screen font-jost">
        <Navbar />
        <Hero />
        <Radios />
        <Values />
      </div>
      <Footer />
    </>
  );
}
