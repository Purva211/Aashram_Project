import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const LineageCard = ({ node, isRoot }) => (
  <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-700 border border-stone-200 relative group overflow-hidden w-full h-full flex flex-col">
     {/* Subtle glow behind card top */}
     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-gradient-to-b from-orange-50 to-transparent pointer-events-none rounded-t-[2rem]"></div>

     {isRoot && (
        <div className="absolute top-3 right-4 text-mahakal-saffron text-[10px] font-black uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-full border border-orange-100 z-20">
          Root
        </div>
     )}

     {/* Profile Image */}
     <div className="relative w-28 h-28 lg:w-32 lg:h-32 mx-auto mb-6 group-hover:-translate-y-2 transition-transform duration-500 shrink-0">
        <div className="absolute inset-0 border-[2px] border-mahakal-saffron/20 rounded-full scale-[1.15] animate-[spin_10s_linear_infinite_reverse]"></div>
        <div className="w-full h-full rounded-full flex items-center justify-center border-[4px] border-white shadow-[0_5px_15px_rgba(0,0,0,0.1)] overflow-hidden relative z-10 bg-stone-50">
            {node.profileImage ? (
               <img src={getImageUrl(node.profileImage)} alt={node.name} className="w-full h-full object-cover object-[50%_15%] group-hover:scale-110 transition-transform duration-700 ease-out" />
            ) : (
               <Crown className="w-10 h-10 text-mahakal-saffron/40" />
            )}
        </div>
     </div>
     
     <div className="text-center relative z-10 flex flex-col flex-1">
       <h4 className="text-xl lg:text-2xl font-black text-mahakal-burgundy mb-2 font-serif leading-tight">
          {node.name}
       </h4>
       
       <div className="mb-4 flex items-center justify-center gap-2">
          <div className="h-[1px] w-4 bg-gradient-to-r from-transparent to-mahakal-saffron/50"></div>
          <span className="text-mahakal-saffron text-[9px] font-black uppercase tracking-[0.2em]">
             {node.era}
          </span>
          <div className="h-[1px] w-4 bg-gradient-to-l from-transparent to-mahakal-saffron/50"></div>
       </div>

       <p className="text-stone-600 text-xs lg:text-sm leading-relaxed font-medium mb-4">
          {node.shortDescription}
       </p>
       
       {node.biography && (
           <div className="text-left text-xs text-stone-500 border-t border-stone-100 pt-3 mt-auto whitespace-pre-wrap font-medium leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2 relative">
               {node.biography}
           </div>
       )}
     </div>
  </div>
);

const ExtendedLineageCard = ({ node, index }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-700 border border-stone-100 relative group overflow-hidden w-full mb-12`}>
       <div className={`absolute top-0 ${isEven ? 'right-0 rounded-bl-full' : 'left-0 rounded-br-full'} w-64 h-64 bg-gradient-to-br from-orange-50 to-transparent pointer-events-none opacity-50`}></div>

       <div className="relative w-full lg:w-[400px] h-[300px] lg:h-[450px] shrink-0">
          <div className="w-full h-full rounded-[2.5rem] flex items-center justify-center shadow-lg overflow-hidden relative z-10 bg-stone-50 border-8 border-white group-hover:shadow-2xl transition-all duration-700">
              {node.profileImage ? (
                 <img src={getImageUrl(node.profileImage)} alt={node.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
              ) : (
                 <Crown className="w-20 h-20 text-mahakal-saffron/30" />
              )}
          </div>
       </div>
       
       <div className="relative z-10 flex flex-col flex-1 w-full text-center lg:text-left">
         <div className={`flex items-center gap-3 mb-6 justify-center ${isEven ? 'lg:justify-start' : 'lg:justify-start'}`}>
            <span className="bg-gradient-to-r from-mahakal-saffron to-orange-400 text-white text-xs lg:text-sm font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-md">
               {node.era}
            </span>
         </div>

         <h4 className="text-3xl lg:text-5xl font-black text-mahakal-burgundy mb-4 font-serif leading-tight">
            {node.name}
         </h4>
         
         <p className="text-stone-600 text-lg lg:text-xl font-medium mb-6 leading-relaxed italic border-l-4 border-mahakal-saffron/30 pl-4 text-left">
            {node.shortDescription}
         </p>
         
         {node.biography && (
             <div className="text-sm lg:text-base text-stone-600 border-t border-stone-100 pt-6 mt-2 whitespace-pre-wrap leading-loose text-left font-medium">
                 {node.biography}
             </div>
         )}

         {node.galleryImages && node.galleryImages.length > 0 && (
             <div className="mt-8 pt-6 border-t border-stone-100">
                <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 text-left">Sacred Gallery</h5>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {node.galleryImages.map((img, idx) => (
                     <img key={idx} src={getImageUrl(img)} alt={`Gallery ${idx}`} className="h-28 w-40 lg:h-32 lg:w-48 object-cover rounded-2xl shadow-sm border border-stone-200 shrink-0 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 duration-300" />
                  ))}
                </div>
             </div>
         )}
       </div>
    </div>
  );
};

const Lineage = () => {
  const [lineageMembers, setLineageMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerRow, setItemsPerRow] = useState(3); // Default to 3 for laptop/desktop

  useEffect(() => {
    document.title = "Guru-Shishya Lineage | Kolekar Maharaj Sansthan";
    window.scrollTo(0, 0);
    fetchLineage();
  }, []);

  // Dynamic responsive grid calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerRow(1); // Mobile
      } else if (window.innerWidth < 1024) {
        setItemsPerRow(2); // Tablet
      } else {
        setItemsPerRow(3); // Laptop / Desktop
      }
    };
    
    handleResize(); // Set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Build tree and flatten for Snake layout
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

  const flattenedLineage = buildAndFlattenTree(lineageMembers);
  const snakeLineage = flattenedLineage.slice(0, 27);
  const extendedLineage = flattenedLineage.slice(27);

  // Group into rows of 3 to stack bottom-to-top
  const chunks = [];
  for (let i = 0; i < snakeLineage.length; i += itemsPerRow) {
    chunks.push(snakeLineage.slice(i, i + itemsPerRow));
  }

  return (
    <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans text-mahakal-burgundy selection:bg-mahakal-saffron selection:text-white overflow-x-hidden">
      <Navbar />

      {/* PREMIUM CENTERED HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-24 border-b border-stone-200/50 bg-[#FFFDF6]">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-orange-200/40 to-rose-200/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/40 to-orange-300/20 rounded-full blur-[100px] mix-blend-multiply pointer-events-none"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Tag */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <span className="w-16 h-[2px] bg-gradient-to-r from-transparent to-mahakal-saffron"></span>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-mahakal-saffron font-bold text-xs uppercase tracking-[0.25em] shadow-sm">
                 Sacred Tradition
              </span>
              <span className="w-16 h-[2px] bg-gradient-to-l from-transparent to-mahakal-saffron"></span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[5.5rem] font-serif font-bold text-mahakal-burgundy mb-8 leading-[1.1] tracking-tight drop-shadow-sm">
              Guru <br />
              <span className="text-mahakal-saffron relative inline-block mt-2">
                Parampara
                <svg className="absolute w-full h-4 -bottom-1 left-0 text-orange-200/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-2xl text-stone-600 max-w-3xl leading-relaxed font-medium">
              The unbroken chain of divine spiritual masters, passing profound wisdom, spiritual authority, and unconditional grace from generation to generation.
            </p>
          </motion.div>

        </div>
      </section>

      {/* DYNAMIC RESPONSIVE SNAKE TIMELINE (BOTTOM TO TOP) */}
      <section className="py-20 lg:py-32 relative bg-[#FFFDF6] overflow-hidden min-h-screen">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 relative z-10">
          {loading ? (
             <div className="flex justify-center py-32">
                <div className="w-16 h-16 border-4 border-mahakal-saffron border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : flattenedLineage.length === 0 ? (
             <div className="text-center py-32 bg-white rounded-[3rem] border border-stone-200 shadow-sm max-w-2xl mx-auto">
                <Crown className="w-20 h-20 text-stone-300 mx-auto mb-6" />
                <h3 className="text-3xl font-serif font-bold text-stone-500">The sacred lineage awaits documentation.</h3>
             </div>
          ) : (
             <>
                 {/* MODERN ERA GURUS (Extended Lineage) */}
                 {extendedLineage.length > 0 && (
                     <div className="mb-32 relative">
                         <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-serif font-black text-mahakal-burgundy mb-4">
                               Modern Era Gurus
                            </h2>
                            <p className="text-stone-500 font-medium max-w-2xl mx-auto">
                               The recent torchbearers of the Guru Parampara, with extensive documented histories and teachings.
                            </p>
                         </div>
                         
                         <div className="flex flex-col relative z-20 w-full max-w-6xl mx-auto">
                            {extendedLineage.map((node, index) => (
                               <ExtendedLineageCard key={node._id} node={node} index={index} />
                            ))}
                         </div>
                         
                         {/* Connection to S-Curve */}
                         <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-t from-mahakal-saffron/80 to-transparent"></div>
                         <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-mahakal-saffron rounded-full"></div>
                     </div>
                 )}

                 <div className="relative flex flex-col-reverse gap-8 lg:gap-12 relative z-20">
                    {/* Visual Vertical Timeline Line for Mobile/Tablet */}
                    <div className="absolute left-1/2 top-4 bottom-4 w-[3px] bg-gradient-to-b from-mahakal-saffron to-amber-500 lg:hidden -translate-x-1/2 z-0 opacity-40"></div>

                    {chunks.map((row, rowIndex) => {
                        const isEvenRow = rowIndex % 2 === 0;
                        const displayRow = isEvenRow ? row : [...row].reverse();
                        return (
                            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 w-full relative">
                               {displayRow.map((node, colIndex) => {
                                   const isLastInRow = colIndex === itemsPerRow - 1;
                                   const isLastNode = rowIndex === chunks.length - 1 && ((isEvenRow && isLastInRow) || (!isEvenRow && colIndex === 0));

                                   return (
                                       <motion.div
                                         key={node._id}
                                         initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                         whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                         viewport={{ once: true, margin: "-50px" }}
                                         transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                         className="h-full relative z-10"
                                       >
                                         <LineageCard node={node} isRoot={rowIndex === 0 && colIndex === 0 && isEvenRow} />

                                         {/* Desktop/Tablet Snake Connectors */}
                                         {/* 1. Horizontal Connectors */}
                                         {isEvenRow && colIndex < itemsPerRow - 1 && (
                                            <div className="absolute top-1/2 left-full w-8 lg:w-12 h-[3px] bg-gradient-to-r from-mahakal-saffron to-amber-500 z-0 hidden lg:block -translate-y-1/2"></div>
                                         )}
                                         {!isEvenRow && colIndex > 0 && (
                                            <div className="absolute top-1/2 right-full w-8 lg:w-12 h-[3px] bg-gradient-to-l from-mahakal-saffron to-amber-500 z-0 hidden lg:block -translate-y-1/2"></div>
                                         )}

                                         {/* 2. Vertical Connectors to the next row above */}
                                         {((isEvenRow && colIndex === itemsPerRow - 1) || (!isEvenRow && colIndex === 0)) && !isLastNode && (
                                            <div className="absolute bottom-full left-1/2 w-[3px] h-8 lg:h-12 bg-gradient-to-t from-amber-500 to-mahakal-saffron z-0 hidden lg:block -translate-x-1/2"></div>
                                         )}
                                       </motion.div>
                                   );
                               })}
                            </div>
                        );
                    })}
                 </div>
                 </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Lineage;
