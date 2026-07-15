import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const LineageNode = ({ node, displayIndex, guruNumber, originalIndex, onClick, isCurrent, isLast }) => {
   const isEven = displayIndex % 2 === 0;

   // Interlocking layout to eliminate extra vertical space:
   // Mobile: -mt-2 (slight overlap for continuous vertical line)
   // Tablet: md:-mt-24
   // Desktop: lg:-mt-32
   const rowMargin = displayIndex !== 0 ? "-mt-2 md:-mt-24 lg:-mt-32" : "";

   return (
      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "-100px" }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className={`w-full flex items-stretch group cursor-pointer relative z-10 md:h-56 lg:h-64 ${rowMargin}`}
         onClick={() => onClick(node, originalIndex)}
      >
          {/* LEFT INFO (Hidden on mobile, Visible for Even nodes on Desktop) */}
          <div className={`hidden md:flex flex-1 min-w-0 flex-col justify-center pr-8 lg:pr-12 transition-all duration-500 group-hover:-translate-x-2 ${!isEven ? 'md:invisible' : ''}`}>
             <div className="relative overflow-hidden text-right bg-gradient-to-bl from-white/95 via-amber-50/90 to-[#FFF8EF]/95 backdrop-blur-2xl p-7 lg:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-inset ring-amber-500/20 group-hover:ring-amber-500/50 group-hover:shadow-[0_20px_40px_rgba(217,119,6,0.25)] transition-all duration-500">
                 
                 {/* Top Accent Line */}
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-mahakal-saffron to-mahakal-burgundy opacity-80 group-hover:opacity-100 transition-opacity"></div>
                 
                 {/* Subtle Watermark */}
                 <div className="absolute -bottom-8 -left-8 text-amber-500/10 rotate-[-15deg] pointer-events-none group-hover:rotate-0 transition-transform duration-700 group-hover:scale-110">
                     <Crown size={140} />
                 </div>

                 {/* Glassmorphism Pointer pointing Right */}
                 <div className="absolute top-1/2 -translate-y-1/2 -right-3 lg:-right-4 w-6 h-6 lg:w-8 lg:h-8 bg-amber-50/90 backdrop-blur-2xl border-t border-r border-amber-500/30 group-hover:border-amber-500/60 rotate-45 hidden md:block -z-10 transition-colors"></div>
                 
                 <h4 className="text-xl md:text-2xl lg:text-3xl font-playfair font-black text-transparent bg-clip-text bg-gradient-to-r from-mahakal-burgundy to-amber-700 leading-tight drop-shadow-sm mb-3 group-hover:from-amber-600 group-hover:to-mahakal-burgundy transition-all duration-700">{node.name}</h4>
                 
                 <div className="flex justify-end items-center mb-4 relative z-10">
                     <div className="inline-flex items-center gap-2 bg-gradient-to-r from-mahakal-saffron to-amber-500 px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(217,119,6,0.3)] ring-1 ring-white/30 text-white group-hover:shadow-[0_4px_16px_rgba(217,119,6,0.5)] transition-all">
                         <Crown size={14} className="text-amber-100 hidden lg:block" />
                         <span className="text-xs lg:text-sm font-poppins font-bold tracking-[0.2em] uppercase">
                             #{guruNumber} • {node.era}
                         </span>
                     </div>
                 </div>
                 
                 <p className="text-stone-700 font-poppins text-sm lg:text-base font-medium line-clamp-3 leading-relaxed group-hover:text-stone-900 transition-colors relative z-10">{node.shortDescription}</p>
             </div>
          </div>

          {/* CENTER ZIG ZAG AREA / MOBILE SPINE */}
          <div className="w-10 sm:w-16 md:w-48 lg:w-80 relative shrink-0 flex flex-col items-center md:block pt-6 md:pt-0">
              {/* Straight line for Mobile (Vertical) */}
              {!isLast && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[3px] sm:w-1 h-[calc(100%+0.5rem)] bg-gradient-to-b from-amber-400 to-mahakal-saffron md:hidden z-0 rounded-full opacity-80"></div>
              )}

              {/* Zig-Zag line for Desktop */}
              {!isLast && (
                  <svg className="hidden md:block absolute top-1/2 left-0 w-full z-0 pointer-events-none overflow-visible opacity-90 drop-shadow-[0_0_12px_rgba(217,119,6,0.4)] md:h-32 lg:h-32" 
                       preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path 
                         d={isEven ? "M 0 0 L 100 100" : "M 100 0 L 0 100"} 
                         fill="none"
                         stroke="url(#zigZagGrad)"
                         strokeWidth="8" 
                         vectorEffect="non-scaling-stroke" 
                         strokeLinecap="round"
                      />
                  </svg>
              )}

              {/* Node Avatar */}
              <div className={`relative md:absolute md:top-1/2 md:-translate-y-1/2 z-20 rounded-full border-[3px] md:border-[6px] border-white bg-stone-50 overflow-hidden transition-all duration-700 md:group-hover:scale-[1.15] shadow-[0_4px_15px_rgba(217,119,6,0.3)] md:shadow-[0_8px_30px_rgba(217,119,6,0.2)] group-hover:shadow-[0_0_40px_rgba(217,119,6,0.6)] ${
                  isEven ? 'md:left-0 md:-translate-x-1/2' : 'md:right-0 md:translate-x-1/2'
              } ${
                  isCurrent ? 'w-12 h-12 md:w-24 md:h-24 ring-2 md:ring-4 ring-amber-400 ring-offset-2 md:ring-offset-4' 
                  : 'w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20'
              }`}>
                  <div className="absolute inset-0 rounded-full border-[1px] md:border-[2px] border-mahakal-saffron/20 m-[1px] md:m-[2px] z-30 pointer-events-none"></div>
                  <img src={node.profileImage ? getImageUrl(node.profileImage) : defaultMahadevPic} 
                       alt={node.name} 
                       onError={(e) => { e.target.src = defaultMahadevPic; }}
                       className="w-full h-full object-cover transition-transform duration-[2s] ease-out md:group-hover:scale-[1.1]" />
              </div>
          </div>

          {/* RIGHT INFO (Visible on Mobile for ALL, Visible on Desktop for Odd nodes) */}
          <div className={`flex-1 min-w-0 flex flex-col justify-center pl-3 sm:pl-6 md:pl-8 lg:pl-12 py-3 md:py-0 transition-all duration-500 md:group-hover:translate-x-2 ${isEven ? 'md:invisible' : ''}`}>
             <div className="relative overflow-hidden text-left bg-gradient-to-br from-white/95 via-amber-50/90 to-[#FFF8EF]/95 backdrop-blur-2xl p-5 md:p-7 lg:p-8 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-inset ring-amber-500/20 group-hover:ring-amber-500/50 group-hover:shadow-[0_20px_40px_rgba(217,119,6,0.25)] transition-all duration-500">
                 
                 {/* Top Accent Line */}
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mahakal-burgundy via-mahakal-saffron to-amber-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>

                 {/* Subtle Watermark */}
                 <div className="absolute -bottom-6 -right-6 text-amber-500/10 rotate-[15deg] pointer-events-none group-hover:rotate-0 transition-transform duration-700 group-hover:scale-110">
                     <Crown size={120} />
                 </div>

                 {/* Glassmorphism Pointer pointing Left (Desktop) */}
                 <div className="absolute top-1/2 -translate-y-1/2 -left-3 lg:-left-4 w-6 h-6 lg:w-8 lg:h-8 bg-amber-50/90 backdrop-blur-2xl border-b border-l border-amber-500/30 group-hover:border-amber-500/60 rotate-45 hidden md:block -z-10 transition-colors"></div>
                 
                 {/* Mobile Pointer (Aligned perfectly with Avatar at pt-6) */}
                 <div className="absolute top-[26px] -left-1.5 w-3 h-3 bg-amber-50/90 border-b border-l border-amber-500/30 rotate-45 md:hidden -z-10"></div>

                 <h4 className="text-xl md:text-2xl lg:text-3xl font-playfair font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-mahakal-burgundy leading-tight drop-shadow-sm mb-2.5 md:mb-3 group-hover:from-mahakal-burgundy group-hover:to-amber-600 transition-all duration-700">{node.name}</h4>
                 
                 <div className="flex justify-start items-center mb-3 md:mb-4 relative z-10">
                     <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-mahakal-saffron px-3 sm:px-4 py-1 md:py-1.5 rounded-full shadow-[0_4px_12px_rgba(217,119,6,0.3)] ring-1 ring-white/30 text-white group-hover:shadow-[0_4px_16px_rgba(217,119,6,0.5)] transition-all">
                         <span className="text-xs lg:text-sm font-poppins font-bold tracking-[0.2em] uppercase">
                             #{guruNumber} • {node.era}
                         </span>
                         <Crown size={14} className="text-amber-100 hidden sm:block" />
                     </div>
                 </div>
                 
                 <p className="text-stone-700 font-poppins text-sm lg:text-base font-medium line-clamp-3 leading-relaxed group-hover:text-stone-900 transition-colors relative z-10">{node.shortDescription}</p>
             </div>
          </div>
      </motion.div>
   );
};


const Lineage = () => {
  const [lineageMembers, setLineageMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Guru-Shishya Lineage | Kolekar Maharaj Sansthan";
    window.scrollTo(0, 0);
    fetchLineage();
  }, []);

  const fetchLineage = async () => {
    try {
      const res = await api.get('/lineage/public');
      setLineageMembers(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Build tree and flatten for single vertical timeline
  const buildAndFlattenTree = (members) => {
    const map = {};
    const roots = [];
    members.forEach(node => {
      map[node._id] = { ...node, children: [] };
    });
    members.forEach(node => {
      if (node.parentId) {
        if (map[node.parentId]) {
           map[node.parentId].children.push(map[node._id]);
        } else {
           roots.push(map[node._id]);
        }
      } else {
        roots.push(map[node._id]);
      }
    });

    const flattened = [];
    const flatten = (nodes, level = 0) => {
      nodes.forEach(node => {
        flattened.push({ ...node, level });
        if (node.children && node.children.length > 0) {
          flatten(node.children, level + 1);
        }
      });
    };
    flatten(roots);
    return flattened;
  };

  const flattenedLineage = buildAndFlattenTree(lineageMembers).map((node, i) => ({
      ...node, 
      originalIndex: i 
  }));
  const reversedLineage = [...flattenedLineage].reverse();

  const handleNodeClick = (node, originalIndex) => {
     if (originalIndex < 28) {
        // Open compact modal for Gurus 1-28
        setSelectedNode(node);
     } else {
        // Navigate to dedicated page for Guru 29+
        navigate(`/lineage/${node._id}`);
     }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans text-mahakal-burgundy selection:bg-mahakal-saffron selection:text-white overflow-x-hidden">
      <Navbar />

      {/* PREMIUM CENTERED HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden pt-20 pb-4 lg:pb-8 border-b border-stone-200/40 bg-gradient-to-b from-[#FFF8EF] to-[#F7F1E3]">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
           {/* Subtle Watermark/Pattern */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03] mix-blend-multiply pointer-events-none"></div>
           {/* Saffron Corner Accents */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/floral-motif.png')] opacity-[0.05] pointer-events-none"></div>
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/floral-motif.png')] opacity-[0.05] pointer-events-none rotate-180"></div>
           {/* Soft Glows */}
           <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-amber-300/20 to-orange-400/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/20 to-orange-300/10 rounded-full blur-[80px] pointer-events-none"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Tag */}
            <div className="mb-4 lg:mb-6 flex items-center justify-center gap-2 sm:gap-4">
              <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-mahakal-saffron"></span>
              <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/90 text-mahakal-saffron font-bold text-[10px] sm:text-xs uppercase tracking-widest sm:tracking-[0.25em] shadow-sm font-poppins">
                 Sacred Tradition
              </span>
              <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-mahakal-saffron"></span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[4.5rem] font-playfair font-bold text-mahakal-burgundy mb-4 lg:mb-6 leading-[1.1] tracking-tight drop-shadow-sm">
              Guru <br className="lg:hidden" />
              <span className="text-mahakal-saffron relative inline-block mt-1 sm:mt-2">
                Parampara
                <svg className="absolute w-full h-2 sm:h-3 -bottom-1 left-0 text-amber-500/40 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg lg:text-xl text-stone-600 max-w-3xl leading-relaxed font-poppins font-medium">
              The unbroken chain of divine spiritual masters, passing profound wisdom, spiritual authority, and unconditional grace from generation to generation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTINUOUS ZIG-ZAG TIMELINE SECTION */}
      <section className="py-8 md:py-12 relative overflow-hidden min-h-screen bg-gradient-to-b from-[#F7F1E3] to-[#FFF8EF]">
        {/* Soft Radial Glow behind entire timeline */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply pointer-events-none"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-[300px] md:w-[600px] bg-gradient-to-b from-amber-300/10 via-orange-400/5 to-amber-300/10 blur-[80px] -translate-x-1/2 pointer-events-none"></div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* SVG Definitions for Gradients used in Lines */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="zigZagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>

          {loading ? (
             <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-mahakal-saffron border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : reversedLineage.length === 0 ? (
             <div className="text-center py-10 bg-white/50 backdrop-blur-md rounded-[2rem] border border-stone-200 shadow-sm max-w-2xl mx-auto">
                <Crown className="w-10 h-10 sm:w-14 sm:h-14 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-playfair font-bold text-stone-500">The sacred lineage awaits documentation.</h3>
             </div>
          ) : (
             <div className="relative w-full flex flex-col items-center pt-4 pb-10">
                   {reversedLineage.map((node, index) => (
                      <LineageNode 
                        key={node._id} 
                        node={node} 
                        displayIndex={index} 
                        guruNumber={node.originalIndex + 1}
                        originalIndex={node.originalIndex}
                        onClick={handleNodeClick}
                        isCurrent={node.originalIndex === flattenedLineage.length - 1 || node.originalIndex === 30}
                        isLast={index === reversedLineage.length - 1}
                      />
                   ))}
             </div>
          )}
        </div>
      </section>

      <Footer />

      {/* COMPACT MODAL FOR EARLY GURUS */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedNode(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF6] rounded-[2rem] p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto relative shadow-2xl custom-scrollbar border border-stone-200"
            >
              <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-stone-100 text-stone-500 rounded-full hover:bg-mahakal-saffron hover:text-white transition-colors">
                 <X size={16} />
              </button>
              
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 shrink-0 relative">
                <div className="absolute inset-0 border-[2px] border-mahakal-saffron/20 rounded-full scale-[1.15] animate-[spin_10s_linear_infinite_reverse]"></div>
                <div className="w-full h-full bg-stone-50 rounded-full overflow-hidden relative z-10 flex items-center justify-center">
                  {selectedNode.profileImage ? (
                     <img src={getImageUrl(selectedNode.profileImage)} alt={selectedNode.name} className="w-full h-full object-cover" />
                  ) : (
                     <Crown className="w-10 h-10 text-mahakal-saffron/40" />
                  )}
                </div>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-playfair font-black text-center text-mahakal-burgundy mb-2">{selectedNode.name}</h3>
              
              <div className="text-center mb-6">
                 <span className="bg-orange-50 border border-orange-100 text-mahakal-saffron px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-poppins font-bold tracking-widest uppercase">
                    {selectedNode.era}
                 </span>
              </div>
              
              <p className="text-stone-700 font-poppins font-medium mb-6 text-center italic text-sm sm:text-base leading-relaxed">
                 "{selectedNode.shortDescription}"
              </p>
              
              <div className="bg-stone-100/70 p-4 rounded-xl text-xs sm:text-sm font-poppins text-stone-500 font-medium text-center border border-stone-200/60 flex items-center gap-2 justify-center">
                 <Crown size={14} className="text-stone-400" />
                 <span>Complete historical records for early Gurus are currently unavailable.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lineage;
