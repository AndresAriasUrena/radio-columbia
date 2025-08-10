'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/contact/ContactForm';

const Location = dynamic(() => import('@/components/contact/Location'), { ssr: false });

export default function Contact() {
  useEffect(() => {
    document.title = 'Contacto | Amplify Radio - Ponte en Contacto con Nosotros';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = 'Contáctanos en Amplify Radio. Envíanos tus comentarios, sugerencias o consultas. Estamos aquí para atenderte y mejorar tu experiencia en nuestra radio online.';
    
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const keywords = 'amplify radio contacto, formulario contacto, comunicarse amplify radio, sugerencias radio, consultas radio online';
    
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
        <ContactForm />
        <Location />
      </div>
      <Footer />
    </>
  );
}
