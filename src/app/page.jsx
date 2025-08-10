'use client';
import Navbar from '@/components/Navbar';
import Hero from '@/components/home/Hero';
import Footer from '@/components/Footer';
import CategoryNewsGrid from '@/components/home/CategoryNewsGrid';
import NewsGridWithImage from '@/components/home/NewsGridWithImage';
import PodcastsGridHome from '@/components/home/PodcastsGridHome';

export default function HomePage() {

  return (
    <>
      <div className="min-h-screen font-jost">
        <Navbar />
        <Hero tagSlug="destacado" />
        <div className="space-y-10">
          <div className="mx-2 bg-[#121212] py-8 lg:py-16">
            <CategoryNewsGrid
              title="NOVEDADES"
              tagSlug="novedades"
            />
          </div>
          <div className="mx-2">
            <CategoryNewsGrid
              title="CATEGORÍAS"
              showCategories={true}
            />
          </div>
          <div className="mx-2 bg-[#121212] py-8 lg:py-16">
            <CategoryNewsGrid
              title="Tendencias Actuales"
              tagSlug="tendencias"
              cardType="grid"
            />
          </div>
          <div className="mx-2">
            <NewsGridWithImage
              title="EN EL MUNDO"
              tagSlug="mundo"
              maxPosts={4}
            />
          </div>
          <div className="mx-2 bg-[#121212] py-8 lg:py-16">
              <PodcastsGridHome />
            </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
