import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, ArrowLeft, Loader2, Calendar, ChevronRight, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../utils/api";

const BranchDetails = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranchDetails();
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [id]);

  const fetchBranchDetails = async () => {
    try {
      setLoading(true);
      const resBranch = await api.get('/branches');
      const branchData = resBranch.data.branches.find(b => b._id === id);
      setBranch(branchData);
      
      if (branchData) {
        document.title = `${branchData.name} | Spiritual Centers`;
      }

      const resEvents = await api.get(`/events/public?branchId=${id}`);
      setEvents(resEvents.data.data || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
          <p className="text-stone-500 font-serif italic text-xl">Loading spiritual center...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] pt-40 pb-24 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Sanctuary Not Found</h2>
        <p className="text-stone-500 text-lg mb-8 text-center max-w-md">We couldn't locate the details for this specific ashram or branch.</p>
        <Link 
          to="/branches" 
          className="bg-stone-900 text-white hover:bg-amber-600 px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] font-sans text-stone-800 flex flex-col relative">
      <Navbar />

      <div className="flex-1 w-full pt-32 lg:pt-40 pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <Link 
            to="/branches"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 mb-10 font-bold transition-colors text-sm tracking-widest uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            
            {/* Left Column: Uncropped Gallery Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="w-full lg:w-5/12 shrink-0 sticky top-32"
            >
              <div className="w-full bg-white p-3 rounded-[3rem] shadow-2xl shadow-stone-200/60 border border-stone-100">
                <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-100 relative group">
                  <img 
                    src={branch.image || '/about_images/kolekar_real_1.jpg'} 
                    onError={(e) => { e.target.onerror = null; e.target.src = '/about_images/kolekar_real_1.jpg'; }}
                    className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                    alt={branch.name}
                  />
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2.5rem] pointer-events-none"></div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Information & Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-7/12 pt-4 flex flex-col"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {branch.location}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 leading-[1.1] tracking-tight mb-12">
                {branch.name}
              </h1>

              {/* About Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  About the Monastery
                </h2>
                
                <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-transparent mb-6"></div>

                <div className="text-stone-600 leading-loose text-lg font-light whitespace-pre-wrap">
                  {branch.description || (
                    <p className="italic text-stone-400">Detailed information about this spiritual center is currently being updated by the administration.</p>
                  )}
                </div>
              </div>

              {/* Grid for Contact & Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-stone-200 pt-12">
                
                {/* Contact Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-100/50 flex flex-col h-full">
                  <h3 className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-6 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-500" /> Contact Info
                  </h3>
                  
                  <div className="space-y-5 flex-1">
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Region</p>
                      <p className="text-stone-800 font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600" /> {branch.location}
                      </p>
                    </div>

                    {branch.contact && (
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-stone-800 font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-600" /> {branch.contact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Events Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[2rem] border border-amber-100 shadow-xl shadow-amber-100/50 flex flex-col h-full">
                  <h3 className="text-xs font-bold tracking-widest text-amber-800/60 uppercase mb-6 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" /> Upcoming Events
                  </h3>
                  
                  {events.length > 0 ? (
                    <div className="space-y-4 flex-1">
                      {events.map(event => (
                        <Link 
                          to={`/events/${event.slug}`} 
                          key={event._id} 
                          className="group flex gap-3 p-2 -ml-2 rounded-xl hover:bg-white/60 transition-all items-center"
                        >
                          <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white shadow-sm relative">
                            <img 
                              src={event.featuredImage || 'https://via.placeholder.com/100'} 
                              onError={(e) => { e.target.src = "/about_images/kolekar_real_1.jpg"; }}
                              className="w-full h-full object-cover object-top" 
                              alt="" 
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-stone-800 text-sm group-hover:text-amber-700 transition-colors line-clamp-1">{event.title}</h4>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">{new Date(event.eventDate).toLocaleDateString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                      <Calendar className="w-6 h-6 text-amber-300 mb-3" />
                      <p className="text-xs text-amber-800/60 font-medium max-w-[150px]">No upcoming events scheduled here.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Branch Members Section */}
              {branch.members && branch.members.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Committee Members
                  </h2>
                  <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-transparent mb-6"></div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {branch.members.map((member, idx) => (
                      <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
                        <p className="font-bold text-stone-800 text-lg">{member.name}</p>
                        {member.contact && (
                          <p className="text-sm text-stone-500 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-amber-500" /> {member.contact}
                          </p>
                        )}
                        {member.email && (
                          <p className="text-sm text-stone-500 flex items-center gap-2">
                            <span className="font-bold text-amber-500">@</span> {member.email}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BranchDetails;
