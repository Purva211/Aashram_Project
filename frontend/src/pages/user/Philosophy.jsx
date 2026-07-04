import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChevronRight, Sparkles, HeartHandshake, Shield, 
  BookOpen, Star, Hand, Users, Leaf, Sun, ChevronDown, CheckCircle2
} from 'lucide-react';
import { FaOm } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Data Arrays for modularity
const panchacharas = [
  { id: 1, title: 'Lingachara', desc: 'Worshipping only the Ishtalinga (Lord Shiva), rejecting idol worship and polytheism. Recognizing the divine in the palm of your hand.' },
  { id: 2, title: 'Sadachara', desc: 'Living a moral, virtuous, and honest life. Earning one\'s livelihood through righteous means (Kayaka) and practicing absolute purity in character.' },
  { id: 3, title: 'Shivachara', desc: 'Treating all devotees of Shiva equally, disregarding caste, creed, gender, or social status. Complete dedication to social equality.' },
  { id: 4, title: 'Bhrityachara', desc: 'Cultivating profound humility. Considering oneself a humble servant of society, nature, and the divine.' },
  { id: 5, title: 'Ganachara', desc: 'Possessing the courage to defend the truth and the community from injustice, blind faith, and oppression.' },
];

const ashtavaranas = [
  { title: 'Guru', mrTitle: 'गुरू', desc: 'The spiritual master who initiates the seeker and imparts divine knowledge.', icon: Users },
  { title: 'Linga', mrTitle: 'लिंग', desc: 'The Ishtalinga worn on the body, representing the formless Absolute.', icon: FaOm },
  { title: 'Jangama', mrTitle: 'जंगम', desc: 'The wandering spiritual guide or realized soul, representing active divinity.', icon: Leaf },
  { title: 'Teertha', mrTitle: 'तीर्थ', desc: 'The holy water, symbolizing the internal purification of the mind.', icon: Sparkles },
  { title: 'Prasada', mrTitle: 'प्रसाद', desc: 'Sacred food offering, symbolizing the acceptance of God\'s grace.', icon: HeartHandshake },
  { title: 'Bhasma', mrTitle: 'भस्म', desc: 'Holy ash worn on the forehead, symbolizing the ultimate reality and detachment.', icon: Sun },
  { title: 'Rudraksha', mrTitle: 'रुद्राक्ष', desc: 'Sacred beads, symbolizing the tears of compassion of Lord Shiva.', icon: Star },
  { title: 'Mantra', mrTitle: 'मंत्र', desc: 'The sacred chant "Om Namah Shivaya", the ultimate vibration of the universe.', icon: BookOpen },
];


const Philosophy = () => {
  const { i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';

  useEffect(() => {
    document.title = "Explore Philosophy | Shri Rudrapashupati Kolekar Maharaj Sansthan";
    window.scrollTo(0, 0);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] font-sans text-mahakal-burgundy selection:bg-mahakal-saffron selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section (Ultra Premium) */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden flex items-center justify-center min-h-[50vh] md:min-h-[70vh]">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-[url('/about_images/hero_philosophy_bg.png')] bg-cover bg-center"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-mahakal-burgundy/90 via-mahakal-burgundy/70 to-[#FFFDF6]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 mb-12 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-mahakal-saffron">Veerashaiva Philosophy</span>
          </nav>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
               <span className="w-16 h-[2px] bg-mahakal-saffron"></span>
               <span className="text-mahakal-saffron font-bold tracking-[0.3em] uppercase text-sm">The Divine Path</span>
               <span className="w-16 h-[2px] bg-mahakal-saffron"></span>
            </div>
            <h1 className="text-4xl md:text-8xl font-serif font-bold text-white mb-6 md:mb-8 leading-[1.1] md:leading-[1.1] tracking-tight drop-shadow-2xl">
              Veerashaiva <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mahakal-saffron to-amber-300">Lingayat Dharma</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed italic max-w-3xl mx-auto">
              "A revolutionary spiritual awakening founded on absolute equality, inner devotion, and the profound truth that physical work is worship."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-20 md:space-y-32">
        
        {/* 1. Intro & Core Beliefs */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahakal-burgundy mb-6">Introduction & Origins</h2>
              <div className="prose prose-lg prose-stone max-w-none text-stone-600 font-medium leading-relaxed mb-8">
                <p>
                  The Veerashaiva Lingayat Dharma is one of the most progressive and egalitarian spiritual traditions in India. Originating in its prominent form during the 12th century under the guidance of the great social reformer Lord Basavanna and his contemporary Sharanas, it challenged the orthodox paradigms of the time.
                </p>
                <p>
                  It vehemently rejected the rigid caste system, gender discrimination, and the necessity of temple priests for divine communion. Instead, it proposed a direct, unmediated relationship with the Divine (Lord Shiva) through the medium of the Ishtalinga—a personal, miniature linga worn constantly on the body.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full aspect-square rounded-[3rem] overflow-hidden bg-stone-100 border-4 border-white shadow-xl relative flex items-center justify-center group">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('/about_images/ishtalinga_hd.png')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-serif font-bold text-lg tracking-widest uppercase">The Sacred Ishtalinga</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. Kayaka & Dasoha */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="bg-mahakal-burgundy text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Background Texture/Image Overlay */}
            <div className="absolute inset-0 bg-[url('/about_images/monastery_hd.png')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Hand className="w-96 h-96" />
            </div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="bg-black/20 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
                <h3 className="text-3xl font-serif font-bold mb-4 text-orange-200 flex items-center gap-3">
                  <Hand className="w-8 h-8" /> Kayaka 
                </h3>
                <p className="text-white/90 font-medium leading-relaxed text-lg mb-4">
                  "Kayakave Kailasa" (Work is Heaven). In this dharma, physical labor is not just a means of livelihood, but a sacred spiritual practice. Every honest work, however menial it may seem, is considered a form of divine worship. There is absolute dignity of labor.
                </p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
                <h3 className="text-3xl font-serif font-bold mb-4 text-orange-200 flex items-center gap-3">
                  <HeartHandshake className="w-8 h-8" /> Dasoha
                </h3>
                <p className="text-white/90 font-medium leading-relaxed text-lg mb-4">
                  Dasoha translates to selfless service or giving back to society. The wealth earned through honest Kayaka must be shared with the community. It represents the realization that "I am a servant of the Lord and society."
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. The Panchacharas (Accordions) */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahakal-burgundy mb-4">The Panchacharas</h2>
            <p className="text-stone-600 font-medium max-w-2xl mx-auto">The Five Codes of Conduct that dictate the moral and social life of a follower, ensuring purity in action and thought.</p>
          </div>
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6">
            {panchacharas.map((item, idx) => (
              <motion.div 
                key={item.id} 
                variants={fadeUp} 
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:border-mahakal-saffron/40 hover:shadow-lg transition-all relative overflow-hidden group flex flex-col"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-125 z-0"></div>
                <div className="w-12 h-12 bg-mahakal-saffron text-white rounded-2xl flex items-center justify-center font-bold font-serif text-xl mb-6 relative z-10 shadow-md">
                  {item.id}
                </div>
                <h3 className="text-2xl font-serif font-bold text-mahakal-burgundy mb-4 relative z-10">{item.title}</h3>
                <p className="text-stone-600 font-medium leading-relaxed relative z-10 flex-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. Ashtavaranas (Grid) */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahakal-burgundy mb-4">The Ashtavaranas</h2>
            <p className="text-stone-600 font-medium max-w-2xl mx-auto">The Eight Shields that protect the devotee's spiritual aura and guide them toward ultimate liberation.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {ashtavaranas.map((item, idx) => (
              <motion.div key={idx} variants={fadeUp} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm text-center flex flex-col items-center hover:border-mahakal-saffron/40 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-mahakal-saffron mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-lg md:text-xl text-mahakal-burgundy mb-2">
                  {isMarathi ? item.mrTitle : item.title}
                </h4>
                <p className="text-sm md:text-base text-stone-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 5. Lord Basavanna & Teachings */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="grid lg:grid-cols-12 gap-12 items-center bg-white rounded-[3rem] p-6 md:p-12 border border-stone-200 shadow-xl relative overflow-hidden">
             
             {/* Left side: Image */}
             <div className="lg:col-span-4 relative h-[350px] md:h-[600px] w-full rounded-[2rem] overflow-hidden group shadow-lg border-4 border-white bg-amber-50/50">
                <div className="absolute inset-0 bg-[url('/about_images/basavanna_real.jpg')] bg-cover bg-[center_top] group-hover:scale-105 transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white z-10 pr-6">
                  <h3 className="font-serif font-bold text-2xl md:text-3xl tracking-wide mb-1">Vishwaguru Basavanna</h3>
                  <p className="text-white/80 font-medium text-sm uppercase tracking-widest">12th Century Social Reformer</p>
                </div>
             </div>
             
             {/* Right side: Vachanas */}
             <div className="lg:col-span-8 space-y-8">
                <div>
                   <h2 className="text-3xl md:text-5xl font-serif font-bold text-mahakal-burgundy mb-4">Wisdom of the Sharanas</h2>
                   <p className="text-stone-600 font-medium leading-relaxed text-lg">Through profound yet simple poetry called Vachanas, Lord Basavanna and his contemporaries dismantled orthodox hierarchies and spread the light of absolute equality.</p>
                </div>
                
                <div className="space-y-6">
                  {/* Quote 1 */}
                  <div className="bg-[#FFFDF6] p-8 rounded-3xl shadow-sm border border-stone-200 relative group hover:border-mahakal-saffron/40 transition-colors">
                    <Quote className="w-12 h-12 text-mahakal-saffron/10 absolute top-6 right-6 group-hover:text-mahakal-saffron/20 transition-colors" />
                    
                    <div className="relative z-10 mb-6">
                      {isMarathi ? (
                        <div>
                           <p className="font-medium text-stone-700 leading-relaxed text-[1.1rem]">
                             "चोरी करू नकोस, हत्या करू नकोस, खोटे बोलू नकोस, रागवू नकोस... स्वतःची स्तुती करू नकोस, इतरांचा तिरस्कार करू नकोस. हीच अंतरंग शुद्धी, हीच बहिरंग शुद्धी आहे..."
                           </p>
                        </div>
                      ) : (
                        <div>
                           <p className="font-medium text-stone-600 italic leading-relaxed text-[1.1rem]">
                             "Do not steal, do not kill, do not lie, do not be angry... do not praise yourself, do not despise others. This is internal purity, this is external purity."
                           </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10 border-t border-stone-100 pt-4 mt-auto">
                      <span className="font-bold text-mahakal-burgundy uppercase text-xs tracking-widest flex items-center gap-2">
                        <Star className="w-4 h-4 text-mahakal-saffron" /> Lord Basavanna
                      </span>
                    </div>
                  </div>
                  
                  {/* Quote 2 */}
                  <div className="bg-[#FFFDF6] p-8 rounded-3xl shadow-sm border border-stone-200 relative group hover:border-mahakal-saffron/40 transition-colors">
                    <Quote className="w-12 h-12 text-mahakal-saffron/10 absolute top-6 right-6 group-hover:text-mahakal-saffron/20 transition-colors" />
                    
                    <div className="relative z-10 mb-6">
                      {isMarathi ? (
                        <div>
                           <p className="font-medium text-stone-700 leading-relaxed text-[1.1rem]">
                             "ज्यांच्याकडे संपत्ती आहे ते शिवाची मंदिरे बांधतात. मी एक गरीब माणूस काय बांधू, देवा?... माझे पाय हेच खांब आहेत, माझे शरीर हेच मंदिर आहे, आणि माझे मस्तक हाच सुवर्ण कळस आहे."
                           </p>
                        </div>
                      ) : (
                        <div>
                           <p className="font-medium text-stone-600 italic leading-relaxed text-[1.1rem]">
                             "Those who have money build temples to Shiva. What can I build? A poor man, Lord... My legs are pillars, my body the shrine, my head the golden cupola."
                           </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10 border-t border-stone-100 pt-4 mt-auto">
                      <span className="font-bold text-mahakal-burgundy uppercase text-xs tracking-widest flex items-center gap-2">
                        <Star className="w-4 h-4 text-mahakal-saffron" /> Lord Basavanna
                      </span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </motion.section>

        {/* 6. Linga Pooja Section */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-5 relative h-[300px] md:h-[450px] w-full rounded-[3rem] overflow-hidden group shadow-xl">
               <div className="absolute inset-0 bg-[url('/about_images/linga_pooja.png')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"></div>
            </div>
            <div className="lg:col-span-7">
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-mahakal-burgundy mb-6">
                 Ishtalinga <span className="text-mahakal-saffron">Pooja</span>
               </h2>
               <p className="text-lg text-stone-600 font-medium leading-relaxed mb-6">
                 The worship of the Ishtalinga is a deeply personal and transformative daily practice. Unlike traditional Hinduism which relies on temple priests and external idols, the Lingayat devotee becomes their own priest, and their own body becomes the temple.
               </p>
               <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110"></div>
                  <h4 className="font-serif font-bold text-xl text-mahakal-burgundy mb-4 relative z-10 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-mahakal-saffron" /> The Ritual (Linganga Samarasya)
                  </h4>
                  <p className="text-stone-600 font-medium leading-relaxed relative z-10">
                    The devotee places the Ishtalinga on the palm of their left hand. Fixing their gaze entirely upon it, they apply holy ash (Bhasma), offer sacred water (Padodaka), and meditate deeply while chanting the Panchakshari Mantra, <em>"Om Namah Shivaya"</em>. This intense focus aligns the inner self with the supreme Absolute.
                  </p>
               </div>
            </div>
          </div>
        </motion.section>

        {/* 7. Manmath Swami Section */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="grid lg:grid-cols-12 gap-12 items-center bg-white rounded-[3rem] p-6 md:p-12 border border-stone-200 shadow-xl relative overflow-hidden">
             
             {/* Left side: Text */}
             <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-2">
                   <span className="w-12 h-[2px] bg-mahakal-saffron"></span>
                   <span className="text-mahakal-saffron font-bold tracking-[0.2em] uppercase text-sm">The Divine Saint</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-mahakal-burgundy mb-6">Shri Manmath Swami</h2>
                <p className="text-stone-600 font-medium leading-relaxed text-lg">
                  Shri Manmath Swami holds a revered place in our spiritual lineage. Known for his profound spiritual realization and immense compassion, he spent his life guiding seekers toward the path of devotion and absolute equality.
                </p>
                <div className="bg-[#FFFDF6] p-6 rounded-2xl border border-amber-100">
                   <p className="text-stone-700 font-medium italic leading-relaxed">
                     His teachings continued the rich legacy of the Sharanas, emphasizing that true enlightenment is found not in isolation, but through unconditional love, community service, and seeing the divine in every living creature.
                   </p>
                </div>
             </div>

             {/* Right side: Image */}
             <div className="lg:col-span-5 relative h-[350px] md:h-[500px] w-full rounded-[2rem] overflow-hidden group shadow-lg border-4 border-white order-1 lg:order-2 bg-amber-50/50">
                <div className="absolute inset-0 bg-[url('/about_images/manmath_swami_real.png')] bg-cover bg-[center_top] group-hover:scale-105 transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white z-10">
                  <h3 className="font-serif font-bold text-2xl tracking-wide mb-1">Shri Manmath Swami</h3>
                </div>
             </div>
             
          </div>
        </motion.section>



      </div>

      <Footer />
    </div>
  );
};

// Simple Quote Icon since lucide-react Quote might not be imported correctly in my list above
const Quote = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);

export default Philosophy;
