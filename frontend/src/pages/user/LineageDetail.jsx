import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import defaultMahadevPic from '../../assets/kolekar1.jpeg';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const LineageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guru, setGuru] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGuruData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchGuruData = async () => {
    try {
      const res = await api.get('/lineage/public');
      const allMembers = res.data.data || [];
      const found = allMembers.find(m => m._id === id);
      if (found) {
        setGuru(found);
        document.title = `${found.name} | Kolekar Maharaj Sansthan`;
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch guru detail:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-mahakal-saffron border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!guru) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans text-mahakal-burgundy">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <h2 className="text-4xl font-serif font-black mb-4">Guru Not Found</h2>
          <button onClick={() => navigate('/lineage')} className="text-mahakal-saffron font-bold underline">
            Return to Lineage
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans text-mahakal-burgundy selection:bg-mahakal-saffron selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 relative">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-orange-200/40 to-rose-200/20 rounded-full blur-[120px] mix-blend-multiply"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.04] mix-blend-overlay"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Back button */}
          <button 
            onClick={() => navigate('/lineage')}
            className="flex items-center gap-2 text-stone-500 hover:text-mahakal-saffron transition-colors font-bold mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Parampara
          </button>

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-2xl border border-stone-100 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center mb-16 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50 to-transparent opacity-50 rounded-bl-full pointer-events-none"></div>
            
            {/* Profile Image */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] shrink-0 relative">
              <div className="absolute inset-0 border-[2px] border-mahakal-saffron/20 rounded-full scale-[1.15] animate-[spin_10s_linear_infinite_reverse]"></div>
              <div className="w-full h-full bg-stone-50 rounded-full flex items-center justify-center border-[8px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden relative z-10">
                 {guru.profileImage ? (
                    <img src={getImageUrl(guru.profileImage)} 
                         alt={guru.name} 
                         onError={(e) => { e.target.src = defaultMahadevPic; }}
                         className="w-full h-full object-cover" />
                 ) : (
                    <Crown className="w-24 h-24 text-mahakal-saffron/30" />
                 )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left z-10">
              <span className="inline-block bg-gradient-to-r from-mahakal-saffron to-orange-400 text-white text-xs sm:text-sm font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full shadow-md mb-6">
                 {guru.era}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-mahakal-burgundy mb-6 leading-tight">
                 {guru.name}
              </h1>
              <p className="text-xl sm:text-2xl text-stone-600 font-medium leading-relaxed italic border-l-4 border-mahakal-saffron/30 pl-6 mx-auto lg:mx-0 max-w-2xl">
                 "{guru.shortDescription}"
              </p>
            </div>
          </motion.div>

          {/* Biography Section */}
          {guru.biography && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 lg:p-16 shadow-lg border border-stone-100 mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-serif font-black mb-8 flex items-center gap-4 justify-center lg:justify-start">
                <span className="w-12 h-[2px] bg-mahakal-saffron hidden lg:block"></span>
                Divine Biography
              </h2>
              <div className="text-stone-700 text-lg sm:text-xl leading-[2.2] font-medium whitespace-pre-wrap">
                 {guru.biography}
              </div>
            </motion.div>
          )}

          {/* Sacred Gallery */}
          {guru.galleryImages && guru.galleryImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-serif font-black mb-10 text-center">
                Sacred Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {guru.galleryImages.map((img, idx) => (
                  <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md group">
                    <img 
                      src={getImageUrl(img)} 
                      alt={`${guru.name} gallery ${idx + 1}`} 
                      onError={(e) => { e.target.src = defaultMahadevPic; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LineageDetail;
