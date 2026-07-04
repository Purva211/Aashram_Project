import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, Calendar, MapPin, ArrowRight, History, Users, ShieldCheck, BookOpen, Heart, Sun, Star, Leaf } from 'lucide-react';
import { FaOm } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useTranslation } from 'react-i18next';

// Staggered text animation variants
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

const About = () => {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    document.title = "About Us | Shri Rudrapashupati Kolekar Maharaj Sansthan";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans selection:bg-mahakal-saffron selection:text-white pt-32 overflow-x-hidden text-mahakal-burgundy">
      <Navbar />

      {/* Standard Grounded Header */}
      <div className="text-center pt-8 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-6 max-w-4xl"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
             <span className="w-12 h-px bg-mahakal-saffron"></span>
             <h4 className="text-mahakal-saffron font-bold tracking-[0.2em] uppercase text-xs md:text-sm">The Sacred Heritage</h4>
             <span className="w-12 h-px bg-mahakal-saffron"></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-mahakal-burgundy mb-6 tracking-tight leading-tight">
            Shri Rudrapashupati <br className="hidden md:block" /> 
            <span className="text-mahakal-saffron">Kolekar Maharaj</span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-600 font-medium max-w-2xl mx-auto leading-relaxed italic">
            "A sacred spiritual epicenter dedicated to eradicating blind faith, preserving the noble Guru-Shishya lineage, and upholding the truth of the Veerashaiva Lingayat Dharma."
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
             <div className="px-6 py-2 bg-mahakal-saffron/10 border border-mahakal-saffron/20 rounded-full text-mahakal-burgundy text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <History size={16} className="text-mahakal-saffron" /> Ancient Lineage
             </div>
             <div className="px-6 py-2 bg-mahakal-saffron/10 border border-mahakal-saffron/20 rounded-full text-mahakal-burgundy text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck size={16} className="text-mahakal-saffron" /> Social Reform
             </div>
          </div>
        </motion.div>
      </div>

      {/* Clean Editorial Blocks: Vision & Mission */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 w-full mb-20 mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-10 border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col text-center group"
          >
            <div className="w-16 h-16 bg-mahakal-saffron/10 rounded-full flex items-center justify-center mx-auto mb-6 text-mahakal-saffron group-hover:scale-110 transition-transform">
              <Sun className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold font-serif text-mahakal-burgundy mb-4 uppercase tracking-widest">Divine Vision</h4>
            <p className="text-stone-600 font-medium leading-relaxed">
              To create a universal spiritual awakening where every soul recognizes the divine light of Lord Shiva within, completely dispelling blind faith and superstition to foster absolute social equality.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-mahakal-burgundy rounded-2xl p-10 border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col text-center group"
          >
            <div className="w-16 h-16 bg-mahakal-saffron/20 rounded-full border border-mahakal-saffron/30 flex items-center justify-center mx-auto mb-6 text-mahakal-saffron group-hover:scale-110 transition-transform">
              <Star className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold font-serif text-white mb-4 uppercase tracking-widest">Sacred Mission</h4>
            <p className="text-stone-300 font-medium leading-relaxed">
              To preserve the sacred Guru-Shishya Parampara, uphold the ancient Vachana literature, and selflessly serve humanity through continuous Annadaan (Food Donation) and spiritual education.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-10 border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col text-center group"
          >
            <div className="w-16 h-16 bg-mahakal-saffron/10 rounded-full flex items-center justify-center mx-auto mb-6 text-mahakal-saffron group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold font-serif text-mahakal-burgundy mb-4 uppercase tracking-widest">Core Values</h4>
            <p className="text-stone-600 font-medium leading-relaxed">
              Rooted in pure Devotion (Bhakti), Absolute Equality (Samanate), the philosophy that Work is Worship (Kayakave Kailasa), and unconditional Seva for all living beings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Heritage & Teachings - Editorial Grounded Section */}
      <section className="py-24 relative flex flex-col items-center">
        <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-mahakal-saffron font-bold uppercase tracking-[0.3em] text-xs mb-4 flex items-center justify-center gap-4"
            >
              <span className="w-8 h-px bg-mahakal-saffron"></span> Comprehensive Heritage <span className="w-8 h-px bg-mahakal-saffron"></span>
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif font-bold text-mahakal-burgundy mb-6 leading-tight tracking-tight"
            >
              Our Golden History
            </motion.h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-white p-2">
                <img src="/about_images/kolekar_real_2.jpg" alt="History" className="w-full h-[500px] object-cover object-top rounded-xl" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-12"
            >
              <div>
                <h4 className="text-2xl font-serif font-bold text-mahakal-burgundy mb-4 flex items-center gap-3">
                  <History className="w-6 h-6 text-mahakal-saffron" /> The Legacy of Kole Throne
                </h4>
                <p className="text-stone-600 text-lg leading-relaxed font-medium mb-6">
                  Established to anchor the Veerashaiva Lingayat Dharma, the Kole Throne has grown from ancient roots into a powerful beacon of spiritual awakening. Over the centuries, it has miraculously expanded its influence, championed monumental social reform, and tirelessly served the poor and needy without discrimination.
                </p>
                <Link to="/math-history" className="inline-flex items-center gap-2 text-mahakal-saffron font-bold text-xs uppercase tracking-widest hover:text-amber-600 transition-colors">
                  Read Full History <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="w-full h-px bg-stone-200"></div>

              <div>
                <h4 className="text-2xl font-serif font-bold text-mahakal-burgundy mb-4 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-mahakal-saffron" /> Veerashaiva Lingayat Dharma
                </h4>
                <p className="text-stone-600 text-lg leading-relaxed font-medium mb-6">
                  Rooted in profound devotion to Lord Shiva and the sacred Ishtalinga, our philosophy transcends worldly illusions. It embraces universal equality, spiritual awakening, and mandates that *Kayakave Kailasa* (Work is Worship), making Seva (service) the ultimate form of devotion.
                </p>
                <Link to="/about/veerashaiva-philosophy" className="inline-flex items-center gap-2 text-mahakal-saffron font-bold text-xs uppercase tracking-widest hover:text-amber-600 transition-colors">
                  Explore Philosophy <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Royal Slate Block for Lineage and Monastery Importance -> Replaced with clean grid */}
      <section className="py-12 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-3 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Vanshavali Parampara (Lineage) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#FFFDF6] rounded-2xl p-8 lg:p-10 border border-stone-200 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow group"
          >
            <div className="w-16 h-16 bg-white border border-stone-200 shadow-sm rounded-2xl flex items-center justify-center mb-6 text-mahakal-saffron group-hover:bg-mahakal-saffron group-hover:text-white group-hover:border-mahakal-saffron transition-all">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-mahakal-burgundy mb-4">Vanshavali Parampara</h3>
            <p className="text-stone-600 mb-8 leading-relaxed font-medium">
              The unbroken chain of divine spiritual masters, dedicating their entire lives to passing down profound wisdom, divine grace, and preserving the utmost sanctity of the lineage.
            </p>
            <Link to="/lineage" className="mt-auto px-6 py-3 w-full bg-mahakal-saffron text-white font-bold rounded-xl hover:bg-amber-600 transition-colors flex justify-center items-center gap-3 uppercase tracking-widest text-xs">
              View Sacred Lineage <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Importance of Monastery */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#FFFDF6] rounded-2xl p-8 lg:p-10 border border-stone-200 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow group"
          >
            <div className="w-16 h-16 bg-white border border-stone-200 shadow-sm rounded-2xl flex items-center justify-center mb-6 text-mahakal-saffron group-hover:bg-mahakal-saffron group-hover:text-white group-hover:border-mahakal-saffron transition-all">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-mahakal-burgundy mb-4">Importance of the Monastery</h3>
            <p className="text-stone-600 mb-8 leading-relaxed font-medium">
              More than just a physical structure, the Monastery is a living sanctuary preserving ancient Vachana literature and radiating the divine grace of the Maharaj.
            </p>
            <Link to="/monastery-importance" className="mt-auto px-6 py-3 w-full bg-mahakal-saffron text-white font-bold rounded-xl hover:bg-amber-600 transition-colors flex justify-center items-center gap-3 uppercase tracking-widest text-xs">
              Read Monastery Importance <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* The Management Trust */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#FFFDF6] rounded-2xl p-8 lg:p-10 border border-stone-200 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow group md:col-span-2 lg:col-span-1"
          >
            <div className="w-16 h-16 bg-white border border-stone-200 shadow-sm rounded-2xl flex items-center justify-center mb-6 text-mahakal-saffron group-hover:bg-mahakal-saffron group-hover:text-white group-hover:border-mahakal-saffron transition-all">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-mahakal-burgundy mb-4">The Management Trust</h3>
            <p className="text-stone-600 mb-8 leading-relaxed font-medium">
              The Shri Rudrapashupati Kolekar Maharaj Sansthan Trust meticulously manages the daily operations, ensures absolute transparency in donations, and drives our massive Annadaan initiatives.
            </p>
            <Link to="/trustee-board" className="mt-auto px-6 py-3 w-full bg-mahakal-saffron text-white font-bold rounded-xl hover:bg-amber-600 transition-colors flex justify-center items-center gap-3 uppercase tracking-widest text-xs">
              Trustee Board <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
        </div>
      </section>

      {/* Explore Sansthan */}
      <section className="bg-[#FFFDF6] py-24 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-mahakal-saffron font-bold uppercase tracking-[0.3em] text-xs mb-4 flex items-center gap-4 justify-center">
               <span className="w-12 h-px bg-mahakal-saffron/40"></span> Active Engagement <span className="w-12 h-px bg-mahakal-saffron/40"></span>
            </h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-mahakal-burgundy tracking-tight">Experience the Sansthan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { to: "/gallery", img: "/about_images/kolekar_real_2.jpg", title: "Divine Gallery", desc: "Explore beautiful visual memories of ancient rituals and deep spiritual devotion.", icon: Camera, offset: "lg:-translate-y-4" },
              { to: "/events", img: "/about_images/kolekar_real_1.jpg", title: "Temple Events", desc: "Join our grand social & spiritual celebrations, deeply rooted in centuries of tradition.", icon: Calendar, offset: "lg:translate-y-8" },
              { to: "/branches", img: "/about_images/kolekar_real_2.jpg", title: "Our Branches", desc: "Find affiliated centers worldwide actively extending our Annadaan services.", icon: MapPin, offset: "lg:-translate-y-4" }
            ].map((item, idx) => (
              <Link key={idx} to={item.to} className={`block relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg border border-stone-200 bg-white flex flex-col transform ${item.offset} transition-all duration-300`}>
                <div className="h-64 relative overflow-hidden bg-stone-100">
                   <div className="absolute inset-0 bg-cover bg-top opacity-90 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${item.img}')` }}></div>
                </div>
                <div className="p-8 text-center bg-white relative flex-1">
                  <div className="w-12 h-12 bg-white border border-stone-200 shadow-sm rounded-full flex items-center justify-center mx-auto -mt-14 mb-4 text-mahakal-saffron relative z-10 group-hover:bg-mahakal-saffron group-hover:text-white group-hover:border-mahakal-saffron transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-mahakal-burgundy mb-2">{item.title}</h3>
                  <p className="text-stone-600 text-sm mb-6 font-medium leading-relaxed">{item.desc}</p>
                  <span className="text-mahakal-saffron font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 group-hover:translate-x-2 transition-transform relative mt-auto">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
