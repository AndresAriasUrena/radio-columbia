'use client';
import Navbar from '@/components/Navbar';
import Hero from '@/components/home/Hero';
import Footer from '@/components/Footer';
import CategoryNewsGrid from '@/components/home/CategoryNewsGrid';
import NewsGridWithImage from '@/components/home/NewsGridWithImage';
import FilterSidebar from '@/components/news/FilterSidebar';

export default function HomePage() {

  return (
    <>
      <div className="min-h-screen overflow-hidden">
        <Navbar />
        <div className="flex flex-col lg:flex-row -my-4">
          <div className="flex-1">
          <Hero tagSlug="travel"/>
              <CategoryNewsGrid
                title="Categorías"
                description="Conoce todos los tipos de noticias de Columbia"
                showCategories={true}
              />
              <CategoryNewsGrid
                title="Tendencias Actuales"
                description="Mira que es lo que tiene a la gente hablando"
                tagSlug="travel"
                cardType="grid"
              />
              <NewsGridWithImage
                title="Lo último – Nacionales"
                description="destacado"
                tagSlug="travel"
                maxPosts={3}
              />
          </div>
          <FilterSidebar />
        </div>
      </div>
      <Footer />
    </>
  );
}
