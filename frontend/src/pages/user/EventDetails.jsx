import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

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
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col relative selection:bg-primary/20 selection:text-primary">
      <Navbar />
      
      {/* Immersive Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[75vh] bg-cream overflow-hidden flex items-center justify-center mt-[70px]">
        {/* Deep Blurred Background for Parallax */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center blur-[50px] opacity-60 scale-125"
          style={{ backgroundImage: `url(${event.featuredImage || 'https://via.placeholder.com/1200x500'})`, y: y1 }}
        ></motion.div>
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10 mix-blend-overlay"></div>
        
        {/* Main Floating Image */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pb-20 md:p-12 md:pb-32 z-10 perspective-1000">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            src={event.featuredImage || 'https://via.placeholder.com/1200x500'} 
            className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            alt={event.title}
          />
        </div>
        
        {/* Gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-transparent pointer-events-none z-10"></div>
        
        {/* Floating Content */}
        <motion.div 
          style={{ opacity }}
          className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-caramel-deep z-20"
        >
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/events')}
              className="group flex items-center gap-3 text-caramel-deep/80 hover:text-caramel-deep mb-8 font-medium transition-all bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full backdrop-blur-md w-fit border border-white/10"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Events
            </button>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-5 py-2 bg-gradient-to-r from-primary to-orange-500 text-caramel-deep text-xs font-black rounded-full uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,122,0,0.4)]">
                {event.branch?.name || "Global"}
              </span>
              <span className={`px-5 py-2 backdrop-blur-md border border-white/20 text-caramel-deep text-xs font-black rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 ${event.status === 'ongoing' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-white/10'}`}>
                {event.status === 'ongoing' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
                {event.status}
              </span>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-black mb-6 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 drop-shadow-sm max-w-4xl"
            >
              {event.title}
            </motion.h1>
          </div>
        </motion.div>
      </div>

      {/* Floating Stats Bar */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 -mt-12 mb-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-wrap lg:flex-nowrap items-center justify-between gap-8"
        >
           <div className="flex items-center gap-5 flex-1 min-w-[220px]">
             <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
               <FaCalendarAlt className="text-2xl text-primary" />
             </div>
             <div>
               <p className="text-xs font-bold text-caramel-dark uppercase tracking-widest mb-1">Date</p>
               <p className="text-lg font-bold text-caramel-deep">{new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
           </div>
           
           <div className="hidden lg:block w-px h-16 bg-gradient-to-br from-cream to-caramel/10"></div>
           
           <div className="flex items-center gap-5 flex-1 min-w-[220px]">
             <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
               <FaClock className="text-2xl text-blue-500" />
             </div>
             <div>
               <p className="text-xs font-bold text-caramel-dark uppercase tracking-widest mb-1">Time</p>
               <p className="text-lg font-bold text-caramel-deep">{event.eventTime}</p>
             </div>
           </div>
           
           <div className="hidden lg:block w-px h-16 bg-gradient-to-br from-cream to-caramel/10"></div>

           <div className="flex items-center gap-5 flex-1 min-w-[220px]">
             <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
               <FaMapMarkerAlt className="text-2xl text-green-500" />
             </div>
             <div>
               <p className="text-xs font-bold text-caramel-dark uppercase tracking-widest mb-1">Location</p>
               <p className="text-lg font-bold text-caramel-deep line-clamp-1">{event.location}</p>
             </div>
           </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-24 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -z-10" />
              <div className="flex items-center gap-4 mb-8">
                <FaInfoCircle className="text-3xl text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-caramel-deep font-serif">About the Event</h2>
              </div>
              <div className="prose prose-lg md:prose-xl max-w-none text-caramel-dark leading-relaxed font-medium whitespace-pre-wrap">
                {event.fullDescription}
              </div>
            </motion.div>

            {event.videoFile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-8">
                  <FaVideo className="text-3xl text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold text-caramel-deep font-serif">Historical Recording</h2>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg bg-stone-900 aspect-video">
                  <video 
                    src={event.videoFile.startsWith('http') ? event.videoFile : `http://localhost:5000${event.videoFile}`} 
                    controls 
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </motion.div>
            )}

            {event.galleryImages && event.galleryImages.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-8">
                  <FaImages className="text-3xl text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold text-caramel-deep font-serif">Event Gallery</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {event.galleryImages.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="rounded-2xl overflow-hidden cursor-pointer aspect-square shadow-md group relative"
                      onClick={() => setLightboxImg(img)}
                    >
                      <img src={img} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
                      <div className="absolute inset-0 bg-cream/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/20 backdrop-blur-md text-caramel-deep px-5 py-2.5 rounded-full text-sm font-bold border border-white/40 shadow-xl">View Image</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-28">
              
              <div className="flex items-center gap-4 mb-8">
                <FaUserTie className="text-2xl text-caramel-deep" />
                <h3 className="text-2xl font-serif font-bold text-caramel-deep">Organizer Info</h3>
              </div>
              
              <div className="space-y-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-caramel-dark uppercase tracking-widest mb-2">Organized By</p>
                  <p className="font-bold text-caramel-deep text-lg">{event.organizerName}</p>
                  {event.organizerContact && <p className="text-primary font-medium mt-1">{event.organizerContact}</p>}
                </div>

                {event.branch && (
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-xs font-bold text-caramel-dark uppercase tracking-widest mb-2">Temple Branch</p>
                    <p className="font-bold text-caramel-deep text-lg">{event.branch.name}</p>
                    <p className="text-caramel-dark text-sm mt-1">{event.branch.location}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: event.title, text: event.shortDescription, url: window.location.href });
                  }
                }}
                className="mt-8 w-full group relative flex items-center justify-center gap-3 py-4 bg-cream text-caramel-deep font-bold rounded-2xl overflow-hidden transition-all hover:shadow-[0_10px_20px_rgba(10,37,64,0.2)] hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <FaShareAlt className="relative z-10" /> 
                <span className="relative z-10">Share with Community</span>
              </button>
            </div>
            
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <FaTags className="text-xl text-caramel-dark" />
                  <h3 className="font-bold text-caramel-deep font-serif text-xl">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-50 text-caramel-dark rounded-xl text-sm font-bold border border-gray-100 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cream/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}
          >
            <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-caramel-deep text-xl transition-colors border border-white/20 backdrop-blur-md">
              <FaTimes />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImg} className="max-w-full max-h-[90vh] object-contain rounded-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt="Enlarged" 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventDetails;
