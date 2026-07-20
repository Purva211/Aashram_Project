import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaSpinner, FaArrowLeft, FaClock, FaUserTie, FaShareAlt, FaTimes, FaTags, FaInfoCircle, FaImages, FaVideo } from 'react-icons/fa';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../utils/api";

const EventDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetchEventDetails();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/public/${slug}`);
      setEvent(res.data.data);
    } catch (err) {
      console.error("Failed to fetch event:", err);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <FaSpinner className="animate-spin text-6xl text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />
      
      <div className="flex-1 w-full mt-[70px]">
        {/* Header Area: Split Layout */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              
              {/* Left: Info */}
              <div className="w-full lg:w-1/2 space-y-6">
                <button 
                  onClick={() => navigate('/events')}
                  className="inline-flex items-center gap-2 text-primary hover:text-orange-700 font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  <FaArrowLeft /> Back to Events
                </button>
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-orange-50 text-primary border border-orange-100 text-xs font-bold rounded-md uppercase tracking-wider">
                    {event.branch?.name || "Global"}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider flex items-center gap-2 border ${event.status === 'ongoing' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {event.status === 'ongoing' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                    {event.status}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-caramel-deep leading-tight">
                  {event.title}
                </h1>

                {/* Stats Inline */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><FaCalendarAlt className="text-primary"/> Date</p>
                    <p className="font-semibold text-gray-900 text-sm">{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><FaClock className="text-primary"/> Time</p>
                    <p className="font-semibold text-gray-900 text-sm">{event.eventTime}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><FaMapMarkerAlt className="text-primary"/> Location</p>
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Right: Media */}
              <div className="w-full lg:w-1/2">
                <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-black aspect-video lg:aspect-[4/3] w-full flex items-center justify-center">
                  {event.featuredImage ? (
                    <img 
                      src={event.featuredImage} 
                      alt={event.title}
                      onError={(e) => { e.target.src = "/about_images/kolekar_real_1.jpg"; }}
                      className="w-full h-full object-cover"
                    />
                  ) : event.videoFile ? (
                    <video 
                      src={event.videoFile.startsWith('http') ? event.videoFile : `${import.meta.env.VITE_ASSETS_URL || 'http://localhost:5000'}${event.videoFile.startsWith('/') ? '' : '/'}${event.videoFile}`} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src="/about_images/kolekar_real_1.jpg" 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Main Details */}
            <div className="lg:col-span-8 space-y-12">
              <section>
                <h2 className="text-2xl font-serif font-bold text-caramel-deep mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                  <FaInfoCircle className="text-primary" /> About Event
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.fullDescription}
                </div>
              </section>

              {event.videoFile && (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-caramel-deep mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                    <FaVideo className="text-primary" /> Event Recording
                  </h2>
                  <div className="rounded-xl overflow-hidden shadow-sm bg-black aspect-video border border-gray-200">
                    <video 
                      src={event.videoFile.startsWith('http') ? event.videoFile : `${import.meta.env.VITE_ASSETS_URL || 'http://localhost:5000'}${event.videoFile}`} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </section>
              )}

              {event.galleryImages && event.galleryImages.length > 0 && (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-caramel-deep mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                    <FaImages className="text-primary" /> Event Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.galleryImages.map((img, idx) => (
                      <div 
                        key={idx}
                        className="rounded-xl overflow-hidden cursor-pointer aspect-square shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                        onClick={() => setLightboxImg(img)}
                      >
                        <img 
                          src={img} 
                          onError={(e) => { e.target.src = "/about_images/kolekar_real_1.jpg"; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt="Gallery" 
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-serif font-bold text-caramel-deep mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <FaUserTie className="text-primary" /> Organizer Info
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Organized By</p>
                    <p className="font-bold text-gray-900">{event.organizerName}</p>
                    {event.organizerContact && <p className="text-primary font-medium text-sm mt-0.5">{event.organizerContact}</p>}
                  </div>

                  {event.branch && (
                    <div className="pt-5 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Temple Branch</p>
                      <p className="font-bold text-gray-900">{event.branch.name}</p>
                      <p className="text-gray-600 text-sm mt-0.5">{event.branch.location}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: event.title, text: event.shortDescription, url: window.location.href });
                    }
                  }}
                  className="mt-8 w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 border border-gray-200 font-bold rounded-lg hover:bg-gray-100 hover:text-primary transition-colors text-sm uppercase tracking-wider"
                >
                  <FaShareAlt /> Share Event
                </button>
              </div>
              
              {event.tags && event.tags.length > 0 && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-serif font-bold text-caramel-deep mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <FaTags className="text-primary" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImg(null)}
          >
            <button 
              className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl transition-colors border border-white/20"
              onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}
            >
              <FaTimes />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImg} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="Enlarged" 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventDetails;
