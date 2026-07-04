import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaInfoCircle, 
  FaVideo, 
  FaImages, 
  FaTimes,
  FaShareAlt 
} from 'react-icons/fa';
import api from '../../utils/api';

const EventDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        // Using the exact route requested in the prompt
        const res = await api.get(`/events/public/${slug}`);
        if (res.data?.success) {
          setEvent(res.data.data);
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error("Failed to load event details:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEventDetails();
    }
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Event Details',
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that do not support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert("Event link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-serif text-caramel-deep font-bold">Event Not Found</h2>
        <p className="text-gray-500">The event you are looking for does not exist or has been removed.</p>
        <Link to="/events" className="text-primary hover:underline flex items-center gap-2">
          <FaArrowLeft /> Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      
      {/* 3. Header Section (Split Layout) */}
      <section className="bg-white border-b border-gray-200 mt-[70px] py-12 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-center">
          
          {/* Left Side (Info - w-1/2) */}
          <div className="w-full lg:w-1/2 space-y-6">
            <button 
              onClick={() => navigate(-1)} 
              className="text-primary font-medium hover:underline flex items-center gap-2 transition-colors"
            >
              <FaArrowLeft /> Back to Events
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {event.branch?.name && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {event.branch.name}
                </span>
              )}
              {event.status && (
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-2">
                  {event.status.toLowerCase() === 'ongoing' && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                  {event.status}
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-5xl font-serif font-bold text-caramel-deep leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-primary mt-0.5 text-lg" />
                <div>
                  <p className="font-bold text-gray-800">Date</p>
                  <p>{new Date(event.date || event.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaClock className="text-primary mt-0.5 text-lg" />
                <div>
                  <p className="font-bold text-gray-800">Time</p>
                  <p>{event.time || "TBA"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-primary mt-0.5 text-lg" />
                <div>
                  <p className="font-bold text-gray-800">Location</p>
                  <p>{event.location || event.branch?.name || "Main Ashram"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side (Media - w-1/2) */}
          <div className="w-full lg:w-1/2">
            {event.featuredImage ? (
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.featuredImage}`} 
                alt={event.title} 
                className="w-full aspect-video lg:aspect-[4/3] rounded-2xl shadow-md object-cover border border-gray-100"
              />
            ) : (
              <div className="w-full aspect-video lg:aspect-[4/3] rounded-2xl shadow-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                <FaImages className="text-gray-300 text-6xl" />
              </div>
            )}
          </div>
          
        </div>
      </section>

      {/* 4. Main Content Area (12-Column Grid) */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column (Main Details - lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* About Event */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-caramel-deep flex items-center gap-3 pb-4 border-b border-gray-200 mb-6">
                <FaInfoCircle className="text-primary" /> About This Event
              </h2>
              <div className="prose prose-lg whitespace-pre-wrap text-gray-700">
                {event.fullDescription || event.description || "No description provided."}
              </div>
            </div>

            {/* Event Recording (Conditional) */}
            {event.videoFile && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-caramel-deep flex items-center gap-3 pb-4 border-b border-gray-200 mb-6">
                  <FaVideo className="text-primary" /> Event Recording
                </h2>
                <div className="bg-black rounded-2xl overflow-hidden shadow-md aspect-video border border-gray-800">
                  <video 
                    controls 
                    className="w-full h-full object-contain"
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${event.videoFile}`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* Event Gallery (Conditional) */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-caramel-deep flex items-center gap-3 pb-4 border-b border-gray-200 mb-6">
                  <FaImages className="text-primary" /> Event Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.galleryImages.map((imgUrl, index) => (
                    <div 
                      key={index}
                      onClick={() => setLightboxImg(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imgUrl}`)}
                      className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                    >
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imgUrl}`} 
                        alt={`Gallery item ${index + 1}`}
                        className="w-full aspect-square object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Right Column (Sidebar - lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Organizer Info Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-serif font-bold text-xl text-caramel-deep mb-4">Organizer</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-medium text-gray-800">{event.organizerName || "Main Temple Trust"}</p>
                </div>
                
                {event.organizerContact && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                    <p className="font-medium text-gray-800">{event.organizerContact}</p>
                  </div>
                )}
                
                {event.branch && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Associated Branch</p>
                    <p className="font-medium text-gray-800">{event.branch.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{event.branch.location}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleShare}
                className="w-full mt-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <FaShareAlt /> Share Event
              </button>
            </div>

            {/* Tags Card (Conditional) */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-serif font-bold text-xl text-caramel-deep mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 5. Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImg(null);
              }}
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors p-2 text-3xl z-50"
            >
              <FaTimes />
            </button>
            
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={lightboxImg} 
              alt="Full screen view" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing modal
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventDetails;
