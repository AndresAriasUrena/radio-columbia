"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import WordPressService from "@/lib/wordpressService";

const Hero = ({ tagSlug = "hero" }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [tagId, setTagId] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getTagId = async () => {
      try {
        if (!tagSlug) {
          setTagId(null);
          return;
        }

        const result = await WordPressService.getTags();
        const id = result.tagsMap[tagSlug];
        
        if (id) {
          setTagId(id);
        } else {
          console.warn(`Tag "${tagSlug}" no encontrado en WordPress`);
          setTagId(null);
        }
      } catch (error) {
        console.error('Error loading tags map:', error);
        setTagId(null);
      }
    };

    getTagId();
  }, [tagSlug]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      if (!tagId) {
        setPosts([]);
        return;
      }

      const result = await WordPressService.getPosts({
        page: 1,
        perPage: 3,
        tags: [tagId],
        orderBy: 'date'
      });
      
      const data = result.posts;
      
      if (data.length === 3) {
        const reorderedPosts = [data[2], data[0], data[1]];
        setPosts(reorderedPosts);
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tagId !== undefined) {
      fetchPosts();
    }
  }, [tagId]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
    centerPadding: "0",
    initialSlide: 0,
    afterChange: (current) => setActiveSlide(current),
    autoplay: true,           
    autoplaySpeed: 5000,  
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: "0",
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "0",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "60px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "10px",
        },
      },
    ],
  };

  const formatDate = WordPressService.formatDateShort;
  const getCategory = WordPressService.getCategory;
  const getFeaturedImage = WordPressService.getFeaturedImage;

  if (loading) {
    return (
      <section className="my-8 overflow-hidden h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5754C]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden h-[60vh] flex items-center mt-8 mb-2">
      <div className="container mx-auto px-4 flex justify-center flex-col">

        <div className="relative lg:left-1/2 lg:-translate-x-1/2 lg:w-[170vw] overflow-x-visible">
          <Slider ref={sliderRef} {...settings} className="news-slider">
            {posts.map((post, index) => {
              const getCenterIndex = (currentSlide, totalSlides) => {
                if (isMobile) {
                  return currentSlide;
                }
                if (totalSlides === 3) {
                  return (currentSlide + 1) % totalSlides;
                }
                return currentSlide;
              };

              const centerIndex = getCenterIndex(activeSlide, posts.length);
              const isActive = index === centerIndex;

              const featuredImage = getFeaturedImage(post);
              const category = getCategory(post);
              const formattedDate = formatDate(post.date);

              return (
                <div key={post.id} className="px-3 outline-none h-[58vh]">
                  <div
                    className={`
                        relative transition-all rounded-2xl overflow-hidden h-full
                        ${isActive
                        ? "scale-100 z-10 shadow-xl rounded-2xl"
                        : "scale-[85%] opacity-90"}
                      `}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center rounded-2xl"
                      style={{ backgroundImage: `url(${featuredImage})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Link href={`/news/${post.slug}`} className="cursor-pointer">
                        <div className="mb-1">
                          <span className="text-[#C4C4C4] text-sm uppercase font-normal">
                            {category} | {formattedDate}
                          </span>
                        </div>
                        <h3 className={`xl:text-2xl text-xl uppercase leading-tight text-[#E3E3E3] font-jost font-medium`}>
                          {post.title.rendered}
                        </h3>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>

      <style jsx>{`
        .news-slider .slick-track {
          display: flex !important;
          align-items: center !important;
        }
        .news-slider .slick-slide {
          transition: all 0.3s ease;
          height: inherit !important;
        }
        .news-slider .slick-current {
          z-index: 10;
        }
        .news-slider .slick-dots {
          bottom: -40px;
        }
        .news-slider .slick-dots li button:before {
          color: #E5754C;
          opacity: 0.5;
        }
        .news-slider .slick-dots li.slick-active button:before {
          color: #E5754C;
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Hero;