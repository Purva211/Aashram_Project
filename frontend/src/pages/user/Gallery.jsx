import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ZoomIn, ChevronRight, ChevronLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?q=80&w=2000";
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${ASSETS_URL}${url}`;
  return `${ASSETS_URL}/${url}`;
};

// Use the existing hero background for the header
import heroBg from "../../assets/hero_bg.jpeg";

const GALLERY_CATEGORIES = ["All", "Blessings", "Festivals", "Pooja", "Pravachan", "Monastery", "Maharaj", "News"];

const GALLERY_DATA = [
  { id: 1, src: "/about_images/kolekar_real_1.jpg", category: "Blessings", title: "Morning Darshan", aspect: "aspect-square" },
  { id: 2, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.28 AM (1).jpeg", category: "Festivals", title: "Maha Shivaratri", aspect: "aspect-[3/4]" },
  { id: 3, src: "/about_images/kolekar_real_2.jpg", category: "Monastery", title: "Temple Architecture", aspect: "aspect-[4/3]" },
  { id: 4, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.15 AM.jpeg", category: "Pooja", title: "Maha Aarti", aspect: "aspect-[3/4]" },
  { id: 5, src: "/about_images/kolekar_real_3.jpg", category: "Pravachan", title: "Spiritual Discourse", aspect: "aspect-video" },
  { id: 6, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.16 AM (2).jpeg", category: "Monastery", title: "Ancient Scriptures", aspect: "aspect-[3/4]" },
  { id: 7, src: "/about_images/kolekar_real_4.jpg", category: "Festivals", title: "Diwali Deepotsav", aspect: "aspect-square" },
  { id: 8, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.17 AM (1).jpeg", category: "Blessings", title: "Holy Sanctum", aspect: "aspect-[4/3]" },
  { id: 9, src: "/about_images/kolekar_real_5.jpg", category: "Maharaj", title: "Guru Parampara", aspect: "aspect-[3/4]" },
  { id: 10, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.18 AM.jpeg", category: "Pooja", title: "Rudrabhishek", aspect: "aspect-video" },
  { id: 11, src: "/about_images/kolekar_real_6.jpg", category: "Maharaj", title: "Maharaj's Vani", aspect: "aspect-[3/4]" },
  { id: 12, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.20 AM.jpeg", category: "Blessings", title: "Devotees Gathering", aspect: "aspect-square" },
  { id: 13, src: "/about_images/kolekar_real_7.jpg", category: "Pooja", title: "Special Homam", aspect: "aspect-[4/3]" },
  { id: 14, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.26 AM.jpeg", category: "Monastery", title: "Sacred Texts", aspect: "aspect-[3/4]" },
  { id: 15, src: "/about_images/kolekar_real_8.jpg", category: "Pravachan", title: "Satsang", aspect: "aspect-video" },
  { id: 16, src: "/about_images/WhatsApp Image 2026-04-19 at 6.33.29 AM (2).jpeg", category: "Blessings", title: "Divine Procession", aspect: "aspect-[3/4]" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // News states
  const [newsItems, setNewsItems] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedNewsSlideIdx, setSelectedNewsSlideIdx] = useState(0);

  useEffect(() => {
    if (activeCategory === "News" && newsItems.length === 0) {
      fetchNews();
    }
  }, [activeCategory]);

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const res = await api.get('/news');
      setNewsItems(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch news items", err);
    } finally {
      setLoadingNews(false);
    }
  };

  const formatDateString = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  useEffect(() => {
    document.title = "Gallery | Shri Rudrapashupati Kolekar Maharaj Sansthan";
    
    const fetchGallery = async () => {
      try {
        const res = await api.get('/gallery');
        // Shuffle images so the sequence is different every time the page loads
        const shuffled = [...res.data.data].sort(() => 0.5 - Math.random());
        setDisplayImages(shuffled);
      } catch (error) {
        console.error("Failed to fetch gallery items", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGallery();
  }, []);

  const filteredImages = displayImages.filter(img => 
    activeCategory === "All" ? true : img.category === activeCategory
  );

  const openLightbox = (index) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  
  const showNext = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % filteredImages.length);
  };
  
  const showPrev = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-caramel-deep selection:bg-gold selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Modern Editorial Hero Section */}
      <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex flex-col justify-end overflow-hidden bg-[#FDFBF7]">
        {/* Parallax Background Fading into Cream */}
        <div className="absolute top-0 left-0 w-full h-[80%] md:h-[85%] z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#FDFBF7] z-10"></div>
          <img src={heroBg} alt="Temple Heritage" className="w-full h-full object-cover object-top opacity-90" />
        </div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 md:pb-20 mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full md:w-3/4 lg:w-2/3"
          >
            <div className="flex items-center gap-4 mb-6">
               <span className="w-12 h-px bg-gold"></span>
               <h4 className="text-gold font-bold tracking-[0.3em] uppercase text-xs md:text-sm">Visual Archive</h4>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-caramel-deep mb-8 tracking-tight leading-[1.1] drop-shadow-sm">
              Sacred <br /> <span className="text-[#4A0E0E]">Memories</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-caramel-dark max-w-xl font-light leading-relaxed">
              A timeless journey through divine ceremonies, ancient heritage, and the boundless grace of the Guru-Shishya parampara.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Gallery Area */}
      <section className="relative z-30 pt-8 pb-32 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Minimalist Underlined Filters */}
          <div className="flex flex-wrap justify-start gap-8 md:gap-12 mb-16 border-b border-gray-200/60 pb-4 overflow-x-auto hide-scrollbar">
            {GALLERY_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm md:text-base font-bold uppercase tracking-widest transition-colors duration-300 relative pb-4 whitespace-nowrap ${
                  activeCategory === category
                    ? "text-[#4A0E0E]"
                    : "text-gray-400 hover:text-gold"
                }`}
              >
                {category}
                {activeCategory === category && (
                  <motion.div 
                    layoutId="activeGalleryFilter"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4A0E0E] to-gold"
                  />
                )}
              </button>
            ))}
          </div>

          {activeCategory === "News" ? (
            loadingNews ? (
              <div className="text-center py-20">
                <p className="text-caramel-dark text-xl font-light">Loading Divine News...</p>
              </div>
            ) : newsItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsItems.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200/60 flex flex-col group hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100 shrink-0">
                      <img src={getImageUrl(item.coverImage)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 bg-orange-600/95 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow border border-white/10">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 bg-[#FAF9F5] border-x border-b border-gray-200/40 rounded-b-2xl">
                      <span className="text-[10px] text-stone-500 font-bold block mb-1">
                        {new Date(item.publishDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {item.branch?.name && ` • Branch: ${item.branch.name}`}
                      </span>
                      <h4 className="text-xl font-serif font-bold text-[#4A0E0E] mb-3 line-clamp-1 group-hover:text-orange-600 transition-colors">{item.title}</h4>
                      <p className="text-stone-600 text-sm font-light line-clamp-3 leading-relaxed mb-6 flex-1">{item.shortDescription}</p>
                      <button
                        onClick={() => {
                          setSelectedNews(item);
                          setSelectedNewsSlideIdx(0);
                        }}
                        className="self-start text-orange-600 hover:text-[#4A0E0E] font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        Read More →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#FAF9F5] rounded-3xl border border-stone-200/40">
                <p className="text-stone-500 font-light text-lg">No news items found at this time.</p>
              </div>
            )
          ) : (
            <>
              {/* Masonry Grid */}
              <motion.div 
                layout
                className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
              >
                <AnimatePresence>
                  {filteredImages.map((image, index) => (
                    <motion.div
                      key={image.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="break-inside-avoid relative group overflow-hidden cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-2xl transition-all duration-500"
                      onClick={() => openLightbox(index)}
                    >
                      {image.type === 'video' ? (
                        <iframe 
                          src={image.url?.includes('youtube.com') || image.url?.includes('youtu.be') ? image.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") : getImageUrl(image.url)} 
                          title={image.title} 
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out pointer-events-none"
                          loading="lazy"
                        />
                      ) : (
                        <img 
                          src={getImageUrl(image.url)} 
                          alt={image.title} 
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                          loading="lazy"
                        />
                      )}
                      
                      {/* Elegant Fade Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                        <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          {image.category}
                        </span>
                        <h3 className="text-white font-serif text-xl md:text-2xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                          {image.title}
                        </h3>
                      </div>
                      
                      {/* Subtle Zoom Icon */}
                      <div className="absolute top-4 right-4 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/20">
                        <ZoomIn className="text-white w-5 h-5" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {loading && (
                <div className="text-center py-32">
                  <p className="text-caramel-dark text-2xl font-light">Loading Divine Memories...</p>
                </div>
              )}

              {!loading && filteredImages.length === 0 && (
                <div className="text-center py-32">
                  <p className="text-caramel-dark text-2xl font-light">No media found for this category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-gold hover:text-[#4A0E0E] text-white rounded-full flex items-center justify-center transition-colors border border-white/20 z-[110]"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            <button 
              className="absolute left-4 md:left-10 w-12 h-12 md:w-16 md:h-16 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/10 z-[110] backdrop-blur-md"
              onClick={showPrev}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button 
              className="absolute right-4 md:right-10 w-12 h-12 md:w-16 md:h-16 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/10 z-[110] backdrop-blur-md"
              onClick={showNext}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Image Container */}
            <div 
              className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-20"
              onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing
            >
              {filteredImages[selectedImageIndex].type === 'video' ? (
                <iframe
                  src={filteredImages[selectedImageIndex].url?.includes('youtube.com') || filteredImages[selectedImageIndex].url?.includes('youtu.be') ? filteredImages[selectedImageIndex].url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") : getImageUrl(filteredImages[selectedImageIndex].url)}
                  title={filteredImages[selectedImageIndex].title}
                  className="w-full md:w-[80vw] h-[50vh] md:h-[80vh] object-contain rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 bg-black"
                  allowFullScreen
                />
              ) : (
                <motion.img
                  key={selectedImageIndex} // forces re-animation on change
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(filteredImages[selectedImageIndex].url)}
                  alt={filteredImages[selectedImageIndex].title}
                  className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                />
              )}
              
              <div className="absolute bottom-8 left-0 w-full text-center">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">
                  {filteredImages[selectedImageIndex].category}
                </span>
                <h2 className="text-white font-serif text-2xl md:text-3xl mt-2 drop-shadow-lg">
                  {filteredImages[selectedImageIndex].title}
                </h2>
                <div className="text-white/40 text-sm mt-3 font-mono tracking-widest">
                  {selectedImageIndex + 1} / {filteredImages.length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Detailed News Modal Popup */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side: Image Slider / Carousel */}
              <div className="relative w-full md:w-[50%] h-[300px] md:h-[480px] bg-stone-900 flex items-center justify-center overflow-hidden group/modal shrink-0">
                {(() => {
                  const mediaList = [selectedNews.coverImage, ...(selectedNews.galleryImages || [])];
                  const currentImgUrl = mediaList[selectedNewsSlideIdx % mediaList.length];
                  
                  return (
                    <>
                      <img src={getImageUrl(currentImgUrl)} alt={selectedNews.title} className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                      
                      {/* Nav Arrows inside modal carousel */}
                      {mediaList.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNewsSlideIdx(prev => (prev - 1 + mediaList.length) % mediaList.length);
                            }}
                            className="absolute left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all opacity-0 group-hover/modal:opacity-100 shadow"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNewsSlideIdx(prev => (prev + 1) % mediaList.length);
                            }}
                            className="absolute right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all opacity-0 group-hover/modal:opacity-100 shadow"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          {/* Slide Indicator */}
                          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 rounded-full text-white text-[10px] font-mono">
                            { (selectedNewsSlideIdx % mediaList.length) + 1 } / { mediaList.length }
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Right Side: News Information */}
              <div className="w-full md:w-[50%] p-6 md:p-10 flex flex-col justify-between max-h-[400px] md:max-h-[480px] overflow-y-auto bg-[#FAF9F5]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-saffron-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider shadow">
                      {selectedNews.category}
                    </span>
                    {selectedNews.priority === 'High' && (
                      <span className="px-2.5 py-1 bg-red-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider shadow">
                        High Priority
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight mb-4">
                    {selectedNews.title}
                  </h3>

                  <div className="text-xs text-stone-400 font-semibold mb-6 flex flex-wrap items-center gap-2 border-b border-stone-200/40 pb-4">
                    <span>{formatDateString(selectedNews.publishDate)}</span>
                    {selectedNews.branch?.name && (
                      <>
                        <span>•</span>
                        <span>Branch: {selectedNews.branch.name}</span>
                      </>
                    )}
                  </div>

                  <div className="text-stone-600 text-sm sm:text-base leading-relaxed font-light whitespace-pre-wrap">
                    {selectedNews.fullDescription || selectedNews.shortDescription}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-200/40 flex justify-end">
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Close Button Top-Right */}
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/95 hover:bg-red-600 hover:text-white text-stone-500 rounded-full flex items-center justify-center transition-all border border-stone-200 shadow z-50"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;

