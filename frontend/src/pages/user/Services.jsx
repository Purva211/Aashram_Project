import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Sun, Lightbulb, ShieldCheck, ArrowRight, Video, Calendar, HandHeart } from 'lucide-react';
import { FaOm, FaPrayingHands, FaVideo, FaCalendarAlt } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useTranslation } from 'react-i18next';

const textContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const textItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Services = () => {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);

  useEffect(() => {
    document.title = "Services | Shri Rudrapashupati Kolekar Maharaj Sansthan";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans selection:bg-gold selection:text-caramel-deep overflow-x-hidden">
      <Navbar />

      {/* Majestic & Highly Attractive Parallax Hero Section */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-[#8D5B2F] z-10">
        <motion.div 
          style={{ y: heroY }}
          className="absolute inset-0 w-full h-full z-0"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-40 mix-blend-color-burn z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A0E0E]/90 via-[#8D5B2F]/80 to-[#8D5B2F] z-10"></div>
          
          {/* Animated Glowing Orbs */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] z-10"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gold/20 rounded-full blur-[150px] z-10"
          />
          
          <img src="/about_images/kolekar_real_1.jpg" alt="Temple Services" className="w-full h-full object-cover object-top scale-110" />
        </motion.div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col items-center pt-20">
          
          {/* Central Animated Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-5xl relative"
          >
            {/* Glowing Icon Top */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-primary to-gold rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,103,31,0.6)] relative border-2 border-white/30"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur animate-pulse"></div>
              <FaPrayingHands className="text-white text-4xl drop-shadow-md relative z-10" />
            </motion.div>

            <motion.h1 
              variants={textContainer}
              initial="hidden"
              animate="show"
              className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white mb-6 leading-[1.1] drop-shadow-2xl flex flex-wrap justify-center gap-x-6 relative z-10"
            >
              {["Divine", "Offerings"].map((word, i) => (
                <motion.span key={i} variants={textItem} className={i === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-[#FFD8A8] via-gold to-[#FFA726] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]" : ""}>
                  {word}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-xl md:text-3xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed drop-shadow-xl border-t border-b border-gold/30 py-6 mb-12 bg-black/10 backdrop-blur-sm rounded-3xl"
            >
              Discover profound spiritual teachings, sweeping social reform initiatives, and absolute selfless service provided by the Sansthan.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="flex items-center gap-6"
            >
              <span className="w-16 h-px bg-gradient-to-r from-transparent to-gold"></span>
              <span className="text-gold uppercase tracking-[0.4em] text-xs font-bold bg-white/10 px-6 py-2 rounded-full border border-gold/30 backdrop-blur-md">Explore Our Services</span>
              <span className="w-16 h-px bg-gradient-to-l from-transparent to-gold"></span>
            </motion.div>
          </motion.div>

          {/* Floating Glassmorphic Stat Cards around Hero */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 flex-col gap-6"
          >
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-r-3xl shadow-2xl flex items-center gap-4 w-64 hover:bg-white/20 transition-all cursor-default">
               <div className="w-12 h-12 bg-primary/80 rounded-full flex items-center justify-center text-white"><Heart size={20} /></div>
               <div>
                 <p className="text-xs text-gold uppercase tracking-wider font-bold">Daily Seva</p>
                 <p className="text-white font-serif font-bold text-xl">Massive Annadaan</p>
               </div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-6"
          >
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-l-3xl shadow-2xl flex items-center gap-4 w-64 hover:bg-white/20 transition-all cursor-default flex-row-reverse text-right">
               <div className="w-12 h-12 bg-gold/80 rounded-full flex items-center justify-center text-[#4A0E0E]"><Sun size={20} /></div>
               <div>
                 <p className="text-xs text-[#FFD8A8] uppercase tracking-wider font-bold">Core Teaching</p>
                 <p className="text-white font-serif font-bold text-xl">Equality For All</p>
               </div>
             </div>
          </motion.div>

        </div>
        
        {/* Soft gradient blend into next section */}
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-cream via-cream/80 to-transparent z-20 pointer-events-none"></div>
      </section>

      {/* Block 1: Spiritual Awakening (Image Left, Text Right) */}
      <section className="py-24 md:py-32 bg-cream relative z-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border border-white"
          >
            <div className="absolute inset-0 bg-[#8D5B2F]/20 mix-blend-overlay z-10"></div>
            <img src="/about_images/kolekar_real_2.jpg" alt="Spiritual Awakening" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-[2s]" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-8 text-primary shadow-sm">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h2 className="text-sm font-bold text-primary tracking-[0.3em] uppercase mb-4">Spiritual Reform</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-caramel-deep mb-6 leading-tight">Eradicating Blind Faith & Inequality</h3>
            <p className="text-lg text-caramel-dark font-light leading-relaxed mb-6">
              A core tenet of the Sansthan is to promote rational and spiritual awakening. We educate devotees to overcome deep-rooted superstitions (अंधश्रद्धा विरोधी विचार) and follow the pure path of true knowledge.
            </p>
            <p className="text-lg text-caramel-dark font-light leading-relaxed mb-10">
              By emphasizing absolute spiritual equality (समतेचा संदेश), we break down societal barriers, ensuring that every devotee is united through universal brotherhood, regardless of caste or creed.
            </p>
            
            <div className="flex items-center gap-4 text-primary font-bold">
               <ShieldCheck className="w-6 h-6" /> <span>Guided by Veerashaiva Lingayat Principles</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Block 2: Massive Annadaan & Seva (Text Left, Image Right) */}
      <section className="py-24 md:py-32 bg-[#8D5B2F] relative z-20 overflow-hidden text-white shadow-[0_0_50px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-multiply"></div>
        <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[150px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 flex-col-reverse lg:flex-row">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center order-2 lg:order-1"
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-gold/30 rounded-2xl flex items-center justify-center mb-8 text-gold shadow-sm">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-sm font-bold text-gold tracking-[0.3em] uppercase mb-4">Karma & Seva</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-md">Unconditional Service to Humanity</h3>
            <p className="text-lg text-[#FFD8A8] font-light leading-relaxed mb-6">
              Our philosophy states that work is worship (*Kayakave Kailasa*). The highest form of devotion to Lord Shiva is selfless service (कर्म आणि सेवा) to His creation.
            </p>
            <p className="text-lg text-[#FFD8A8] font-light leading-relaxed mb-10">
              The Sansthan actively engages in massive community support initiatives, providing continuous **Annadaan** (free food donation) to thousands of devotees and underprivileged individuals daily.
            </p>
            
            <Link to="/donate" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold text-[#4A0E0E] font-bold rounded-2xl hover:bg-white transition-all w-max shadow-lg uppercase tracking-widest text-xs">
              Support Annadaan <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gold/20 order-1 lg:order-2"
          >
            <div className="absolute inset-0 bg-[#4A0E0E]/20 mix-blend-overlay z-10"></div>
            <img src="/about_images/kolekar_real_5.jpg" alt="Karma and Seva" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-[2s]" />
          </motion.div>
        </div>
      </section>

      {/* Block 3: Digital Temple Offerings (Features Left, Text Right) */}
      <section className="py-24 md:py-32 bg-[#FDFBF7] relative z-20 overflow-hidden border-t border-white">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Grid of digital services (Left side, takes 7 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 grid sm:grid-cols-2 gap-6"
          >
            {[
              { icon: FaPrayingHands, title: "Online Donations", desc: "Contribute to temple development securely.", link: "/donate", color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", hover: "hover:border-primary/50" },
              { icon: FaOm, title: "Annadaan Booking", desc: "Sponsor daily meals for devotees.", link: "/annadaan", color: "text-[#8D5B2F]", bg: "bg-[#8D5B2F]/5", border: "border-[#8D5B2F]/20", hover: "hover:border-[#8D5B2F]/50" },
              { icon: FaVideo, title: "Live Darshan", desc: "Join daily aarti and darshan via our live stream.", link: "/events", color: "text-red-700", bg: "bg-red-700/5", border: "border-red-700/20", hover: "hover:border-red-700/50" },
              { icon: FaCalendarAlt, title: "Events Conducted", desc: "Stay updated with past and upcoming spiritual camps.", link: "/events", color: "text-orange-600", bg: "bg-orange-600/5", border: "border-orange-600/20", hover: "hover:border-orange-600/50" }
            ].map((service, idx) => (
              <Link key={idx} to={service.link} className={`block bg-white p-8 rounded-[2rem] border ${service.border} ${service.hover} shadow-sm hover:shadow-xl transition-all duration-300 group`}>
                <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center mb-6 ${service.color} group-hover:scale-110 transition-transform`}>
                   <service.icon size={24} />
                </div>
                <h4 className="text-xl font-serif font-bold text-caramel-deep mb-3">{service.title}</h4>
                <p className="text-caramel-dark font-light text-sm leading-relaxed mb-6">{service.desc}</p>
                <span className={`text-xs font-bold uppercase tracking-widest ${service.color} flex items-center gap-2 group-hover:translate-x-2 transition-transform`}>
                  Access Service <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </motion.div>

          {/* Text Description (Right side, takes 5 columns) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <h2 className="text-sm font-bold text-primary tracking-[0.3em] uppercase mb-4">Temple Connectivity</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-caramel-deep mb-6 leading-tight">Digital Temple Offerings</h3>
            <p className="text-lg text-caramel-dark font-light leading-relaxed mb-8">
              We bring deeply traditional devotional practices to the modern world, making your spiritual journey accessible and serene from absolutely anywhere.
            </p>
            <p className="text-lg text-caramel-dark font-light leading-relaxed mb-10">
              Whether you wish to sponsor a day of Annadaan, book a personalized Abhishek for your family, or experience the divine darshan live, our seamless digital portals connect you directly to the Sansthan's grace.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Cinematic Quote Section */}
      <section className="py-32 bg-cream relative z-30 flex items-center justify-center border-t border-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto px-6 text-center"
        >
          <HandHeart className="w-16 h-16 text-[#8D5B2F] mx-auto mb-10 opacity-60" />
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-caramel-deep mb-10 leading-relaxed italic drop-shadow-sm">
            "True religion lies in unconditionally serving humanity. The ultimate path to the Divine is paved with good deeds and an endlessly open heart."
          </h2>
          <div className="flex items-center justify-center gap-6">
            <span className="w-16 h-px bg-[#8D5B2F]/30"></span>
            <p className="text-sm text-[#8D5B2F] font-bold tracking-[0.3em] uppercase">
              Core Philosophy
            </p>
            <span className="w-16 h-px bg-[#8D5B2F]/30"></span>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
