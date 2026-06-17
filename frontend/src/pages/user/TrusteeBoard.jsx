import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Loader2 } from 'lucide-react';
import { FaOm } from "react-icons/fa";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import heroBg from "../../assets/hero_bg.jpeg";

const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || "http://localhost:5000";

const TrusteeBoard = () => {
  const [trustees, setTrustees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Trustee Board | Shri Rudrapashupati Kolekar Maharaj Sansthan";
    window.scrollTo(0, 0);
    fetchTrustees();
  }, []);

  const fetchTrustees = async () => {
    try {
      const res = await api.get('/trustees/public');
      setTrustees(res.data.trustees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-sans selection:bg-[#FF8C00]/30 selection:text-[#4A0E0E] overflow-x-hidden text-stone-800">
      <Navbar />

      {/* Professional Light-Themed Trustee Board Hero Section */}
      <section className="relative w-full pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#FDFBF7] via-[#F6F4EB] to-[#EBE5D9] border-b border-stone-200/60 shadow-[inset_0_-30px_60px_rgba(0,0,0,0.02)]">
        {/* Subtle, elegant background accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#FF8C00]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#4A0E0E]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-stone-50 border border-stone-200 rounded-full mb-8 shadow-sm">
              <ShieldCheck size={16} className="text-[#FF8C00]" />
              <span className="text-[#4A0E0E] font-bold tracking-[0.2em] uppercase text-[10px]">Transparent Governance</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-extrabold text-[#4A0E0E] mb-6 leading-[1.1] tracking-tight">
              The Management <span className="text-[#FF8C00] italic font-light relative whitespace-nowrap">
                Trust
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FF8C00]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>
            
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#FF8C00] to-[#4A0E0E] rounded-full mb-8"></div>
            
            <p className="text-lg md:text-2xl text-stone-500 font-light max-w-3xl mx-auto leading-relaxed">
              Dedicated to absolute transparency, selfless service, and the preservation of our sacred spiritual heritage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Board Members Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full flex-1">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 bg-white rounded-[2rem] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF8C00] mb-4" />
            <p className="text-stone-500 font-serif italic text-lg">Loading Trust Members...</p>
          </div>
        ) : trustees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
            {trustees.map((trustee, idx) => {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const imageUrl = trustee.profilePhoto 
                ? (trustee.profilePhoto.startsWith('http') ? trustee.profilePhoto : `${API_URL}${trustee.profilePhoto.startsWith('/') ? '' : '/'}${trustee.profilePhoto}`)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(trustee.name)}&background=8D5B2F&color=fff&size=200`;
                
              return (
                <motion.div 
                  key={trustee._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % 15) * 0.05, duration: 0.4 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-stone-200 group flex flex-col relative"
                >
                  <div className="p-6 pb-0 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden mb-5 border-[6px] border-stone-50 shadow-md group-hover:border-[#FF8C00]/30 transition-colors duration-500 relative shrink-0">
                      <div className="absolute inset-0 bg-[#FF8C00]/0 group-hover:bg-[#FF8C00]/10 transition-colors duration-500 z-10 pointer-events-none"></div>
                      <img src={imageUrl} alt={trustee.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold font-serif text-[#4A0E0E] mb-2 text-center group-hover:text-[#FF8C00] transition-colors line-clamp-1 w-full px-2">{trustee.name}</h3>
                    
                    <div className="inline-block px-3 py-1.5 bg-stone-50 border border-stone-100 rounded-full mb-4">
                      <p className="text-[#FF8C00] text-[10px] font-bold uppercase tracking-widest">{trustee.designation}</p>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 flex-1 flex flex-col items-center">
                    {trustee.address && (
                      <p className="text-stone-500 font-light text-xs md:text-sm leading-relaxed text-center flex-1 line-clamp-3">{trustee.address}</p>
                    )}
                  </div>
                  
                  <div className="h-1.5 w-full bg-stone-100 group-hover:bg-gradient-to-r group-hover:from-[#FF8C00] group-hover:to-[#E67E22] transition-colors duration-500 mt-auto"></div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-stone-300 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-[#4A0E0E] mb-2">No Trustees Found</h3>
            <p className="text-stone-500 font-medium">The management trust members are not yet available.</p>
          </div>
        )}
      </section>

      {/* Mission Banner */}
      <section className="bg-white py-10 relative overflow-hidden border-t border-stone-200">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full bg-[#FF8C00]/5 blur-[80px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
          <div className="w-16 h-16 shrink-0 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100 shadow-sm">
            <Heart className="w-8 h-8 text-[#FF8C00]" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold mb-2 text-[#4A0E0E]">Committed to Service</h3>
            <p className="text-sm md:text-base text-stone-600 font-light leading-relaxed">
              The Trust meticulously oversees all Sansthan operations, ensuring every donation directly supports our massive Annadaan initiatives, educational programs, and the maintenance of our sacred Monastery.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrusteeBoard;
