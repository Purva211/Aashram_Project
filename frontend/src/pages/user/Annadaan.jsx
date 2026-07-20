import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../../components/ScrollReveal';
import { useTranslation } from 'react-i18next';
import { toast, Toaster } from 'react-hot-toast';
import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaClock, FaOm, FaInfoCircle, FaHeart, FaPrayingHands, FaUsers, FaPrint, FaCheckCircle, FaLeaf, FaSun, FaHistory, FaSync, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { createAnnadaan, getAnnadaans } from '../../services/annadaanService';
import heroBg from "../../assets/hero_bg.jpeg"; 
import { validateName, getMobileError } from '../../utils/validationUtils';

const Annadaan = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    annadaanType: '',
    description: ''
  });
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [annadaanHistory, setAnnadaanHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || user.mobile || ''
      }));
    }
  }, [user]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setIsSpinning(true);
    try {
      const response = await getAnnadaans();
      if (response && response.data) {
        const sortedAsc = [...response.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const withRanks = sortedAsc.map((record, index) => ({
          ...record,
          rank: index + 1
        }));
        const sortedDesc = withRanks.reverse();
        setAnnadaanHistory(sortedDesc);
      }
    } catch (error) {
      console.error("Error fetching annadaan history", error);
    } finally {
      setIsLoadingHistory(false);
      setTimeout(() => setIsSpinning(false), 800); // Artificial delay to show spin animation
    }
  };

  React.useEffect(() => {
    fetchHistory();
    const interval = setInterval(() => {
      fetchHistory();
    }, 30000); // 30 seconds polling
    return () => clearInterval(interval);
  }, []);

  const mealTypes = [
    { value: 'Breakfast', label: t('annadaan.meal_breakfast') },
    { value: 'Lunch', label: t('annadaan.meal_lunch') },
    { value: 'Dinner', label: t('annadaan.meal_dinner') },
    { value: 'Mahaprasad', label: t('annadaan.meal_special') },
    { value: 'Full Day Seva', label: t('annadaan.meal_full') }
  ];

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = (fieldName) => {
    if (focusedField === fieldName) setFocusedField('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'name') finalValue = value.replace(/[^A-Za-z\s]/g, '');
    if (name === 'phone') finalValue = value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error(t('annadaan.val_name')); return; }
    if (!validateName(formData.name.trim())) { toast.error("Name must contain only alphabets and spaces."); return; }
    
    const mobileError = getMobileError(formData.phone.trim());
    if (mobileError) { toast.error(mobileError); return; }
    if (!formData.email.trim()) { toast.error(t('annadaan.val_email')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { toast.error(t('annadaan.val_email')); return; }
    if (!formData.date) { toast.error(t('annadaan.val_date')); return; }
    if (!formData.time.trim()) { toast.error(t('annadaan.val_time')); return; }
    if (!formData.annadaanType) { toast.error(t('annadaan.val_type')); return; }

    setIsSubmitting(true);
    const loadingToast = toast.loading(t('annadaan.submitting'));

    try {
      const submissionData = { ...formData };
      if (user && user._id) {
        submissionData.userId = user._id;
      }
      const response = await createAnnadaan(submissionData);
      toast.dismiss(loadingToast);
      toast.success(t('annadaan.booking_success'));
      
      if (response && response.data) {
        setBookingDetails(response.data);
      } else {
        setBookingDetails({ ...formData, _id: 'PENDING' });
      }
      
      setFormData({ name: '', phone: '', email: '', date: '', time: '', annadaanType: '', description: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || t('annadaan.booking_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingDetails) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0,transparent_70%)]"></div>
        <Navbar />
        <Toaster position="top-center" />
        
        <div className="flex-grow flex items-center justify-center p-4 pt-32 pb-12 relative z-10">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden; }
              .print-container, .print-container * { visibility: visible; }
              .print-container {
                position: absolute; left: 0; top: 0; width: 100% !important;
                margin: 0 !important; padding: 20px !important; box-shadow: none !important; border: none !important;
              }
              .no-print { display: none !important; }
            }
          `}} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="print-container bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] p-8 md:p-10 max-w-xl w-full relative overflow-hidden border border-stone-200"
          >
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-mahakal-saffron via-gold to-mahakal-saffron"></div>
            <div className="absolute -left-6 top-24 w-12 h-12 bg-[#FFFDF6] rounded-full shadow-inner no-print"></div>
            <div className="absolute -right-6 top-24 w-12 h-12 bg-[#FFFDF6] rounded-full shadow-inner no-print"></div>
            
            <div className="text-center mb-8 pt-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-green-200"
              >
                <FaCheckCircle className="text-4xl" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-mahakal-burgundy font-serif tracking-tight">{t('annadaan.receipt_success') || 'Request Received!'}</h2>
              <p className="text-stone-500 mt-2 text-sm max-w-md mx-auto font-medium">Your application has been received. Our team will verify the details and reach out to you shortly to confirm the availability for your requested date.</p>
            </div>

            <div className="text-center text-sm text-gold font-serif italic mb-8 font-bold">
              ✨ {t('receipt.blessing')} ✨
            </div>

            <div className="flex flex-col sm:flex-row gap-4 no-print relative z-20">
              <button 
                onClick={() => { setBookingDetails(null); navigate('/devotee/annadaan'); }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-mahakal-saffron to-amber-500 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-400 transition-all font-bold shadow-lg hover:-translate-y-1"
              >
                <FaPrayingHands />
                Go to My Dashboard
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans text-mahakal-burgundy selection:bg-mahakal-saffron selection:text-white pt-32 overflow-x-hidden">
      <Navbar />
      <Toaster position="top-center" />

      {/* Standard Grounded Header */}
      <div className="text-center pt-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full px-4 sm:px-6 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
             <span className="w-12 h-px bg-mahakal-saffron"></span>
             <h4 className="text-mahakal-saffron font-bold tracking-[0.2em] uppercase text-xs md:text-sm">Sacred Offering</h4>
             <span className="w-12 h-px bg-mahakal-saffron"></span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-mahakal-burgundy mb-4 tracking-tight">
            {t('annadaan.hero_title') || "Mahadasoha Annadaan"}
          </h1>
          
          <p className="text-base md:text-lg text-stone-600 max-w-xl mx-auto font-medium leading-relaxed italic">
            "{t('annadaan.hero_subtitle') || "To offer food is to nourish the divine within."}"
          </p>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow w-full px-0 sm:px-4 mt-4 md:-mt-8 relative z-20 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-10">
          
          <ScrollReveal 
            direction="up" delay={0.3} duration={0.8}
            className="lg:col-span-7 bg-white sm:rounded-2xl shadow-sm p-4 sm:p-8 md:p-12 border-y sm:border border-stone-200 relative overflow-hidden"
          >
            {(!user || user.role !== 'Devotee') ? (
               <div className="text-center py-16">
                 <FaUserCircle className="text-6xl text-mahakal-saffron mx-auto mb-4 opacity-50" />
                 <h2 className="text-xl md:text-2xl font-bold text-mahakal-burgundy font-serif mb-2">Login Required</h2>
                 <p className="text-stone-500 mb-6 font-medium">Please login or register as a Devotee to schedule an Annadaan offering.</p>
                 <button onClick={() => navigate('/login', { state: { returnUrl: '/annadaan' } })} className="px-8 py-3 bg-gradient-to-r from-mahakal-saffron to-amber-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">Login to Continue</button>
               </div>
            ) : (
            <>
            <div className="relative z-10 flex items-center gap-4 mb-10 pb-6 border-b border-stone-100">
              <div className="p-4 bg-mahakal-saffron/10 rounded-2xl shadow-sm">
                <FaPrayingHands className="text-mahakal-saffron w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-mahakal-burgundy font-serif tracking-tight">
                  {t('annadaan.form_title')}
                </h2>
                <p className="text-sm text-stone-500 mt-1 font-medium">
                  Schedule your sacred offering securely.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              <div className="space-y-6">
                <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-mahakal-saffron rounded-full"></span>
                  Devotee Details
                </label>
                
                <div className="relative group">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'name' || formData.name ? 'text-mahakal-saffron' : 'text-stone-400'}`}>
                    <FaUser className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    required
                    pattern="[A-Za-z\s]+"
                    title="Name must contain only alphabets and spaces"
                    className="peer w-full pl-14 pr-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron/20 focus:border-mahakal-saffron outline-none transition-all bg-white text-lg font-bold text-mahakal-burgundy shadow-sm hover:border-amber-100"
                  />
                  <label htmlFor="name" className={`absolute left-14 transition-all duration-300 select-none pointer-events-none font-bold ${focusedField === 'name' || formData.name ? 'top-2 text-xs text-mahakal-saffron uppercase tracking-widest' : 'top-1/2 -translate-y-1/2 text-stone-500'}`}>
                    {t('annadaan.form_name')} *
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'phone' || formData.phone ? 'text-mahakal-saffron' : 'text-stone-400'}`}>
                      <FaPhone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus('phone')}
                      onBlur={() => handleBlur('phone')}
                      required
                      pattern="\d{10}"
                      title="Mobile number must be exactly 10 digits"
                      maxLength={10}
                      className="peer w-full pl-14 pr-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron/20 focus:border-mahakal-saffron outline-none transition-all bg-white text-lg font-bold text-mahakal-burgundy shadow-sm hover:border-amber-100 font-mono"
                    />
                    <label htmlFor="phone" className={`absolute left-14 transition-all duration-300 select-none pointer-events-none font-bold ${focusedField === 'phone' || formData.phone ? 'top-2 text-xs text-mahakal-saffron uppercase tracking-widest' : 'top-1/2 -translate-y-1/2 text-stone-500'}`}>
                      {t('annadaan.form_phone')} *
                    </label>
                  </div>

                  <div className="relative group">
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' || formData.email ? 'text-mahakal-saffron' : 'text-stone-400'}`}>
                      <FaEnvelope className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                      required
                      className="peer w-full pl-14 pr-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron/20 focus:border-mahakal-saffron outline-none transition-all bg-white text-lg font-bold text-mahakal-burgundy shadow-sm hover:border-amber-100"
                    />
                    <label htmlFor="email" className={`absolute left-14 transition-all duration-300 select-none pointer-events-none font-bold ${focusedField === 'email' || formData.email ? 'top-2 text-xs text-mahakal-saffron uppercase tracking-widest' : 'top-1/2 -translate-y-1/2 text-stone-500'}`}>
                      {t('annadaan.form_email')} *
                    </label>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-stone-100 my-8"></div>

              <div className="space-y-6">
                <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-mahakal-saffron rounded-full"></span>
                  Seva Details
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-mahakal-saffron pointer-events-none">
                      <FaCalendarAlt className="w-5 h-5" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron/20 focus:border-mahakal-saffron outline-none transition-all bg-white text-lg font-bold text-mahakal-burgundy shadow-sm hover:border-amber-100"
                    />
                    <span className="absolute left-14 top-1 text-[10px] text-mahakal-saffron font-bold uppercase tracking-widest pointer-events-none">
                      {t('annadaan.form_date')} *
                    </span>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-mahakal-saffron pointer-events-none">
                      <FaClock className="w-5 h-5" />
                    </div>
                    <input
                      type="time"
                      name="time"
                      id="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron/20 focus:border-mahakal-saffron outline-none transition-all bg-white text-lg font-bold text-mahakal-burgundy shadow-sm hover:border-amber-100"
                    />
                    <span className="absolute left-14 top-1 text-[10px] text-mahakal-saffron font-bold uppercase tracking-widest pointer-events-none">
                      {t('annadaan.form_time')} *
                    </span>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-mahakal-saffron pointer-events-none z-10">
                    <FaOm className="w-5 h-5" />
                  </div>
                  <select
                    name="annadaanType"
                    id="annadaanType"
                    value={formData.annadaanType}
                    onChange={handleChange}
                    required
                    className="w-full pl-14 pr-10 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron/20 focus:border-mahakal-saffron outline-none transition-all bg-white text-lg font-bold text-mahakal-burgundy shadow-sm hover:border-amber-100 appearance-none cursor-pointer relative z-0"
                  >
                    <option value="" disabled className="text-stone-500">Select Seva Type</option>
                    {mealTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                    ▼
                  </div>
                  <span className="absolute left-14 top-1 text-[10px] text-mahakal-saffron font-bold uppercase tracking-widest pointer-events-none z-10">
                    {t('annadaan.form_type')} *
                  </span>
                </div>

                <div className="relative group">
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Any special instructions or family names for prayers..."
                    rows="3"
                    className="w-full px-6 py-6 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron/20 focus:border-mahakal-saffron outline-none transition-all bg-white text-lg font-bold text-mahakal-burgundy shadow-sm hover:border-amber-100 resize-none placeholder-stone-400"
                  ></textarea>
                  <span className="absolute left-6 top-2 text-[10px] text-mahakal-saffron font-bold uppercase tracking-widest pointer-events-none">
                    {t('annadaan.form_desc')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 mt-6 ${
                  isSubmitting 
                    ? 'bg-stone-300 cursor-not-allowed' 
                    : 'bg-mahakal-saffron hover:bg-amber-600 shadow-sm hover:shadow-md'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('annadaan.processing')}
                    </>
                  ) : (
                    <>
                      <FaPrayingHands className="w-6 h-6" />
                      {t('annadaan.btn_book')}
                    </>
                  )}
                </span>
              </button>
            </form>
            </>
            )}
          </ScrollReveal>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              
              <ScrollReveal 
                direction="left" delay={0.4} duration={0.8}
                className="bg-white rounded-[2rem] shadow-sm p-6 md:p-10 border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-orange-50 rounded-full flex items-center justify-center shadow-inner border border-orange-100">
                    <FaHeart className="w-8 h-8 text-mahakal-saffron animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-mahakal-burgundy mb-4 leading-snug">"{t('annadaan.quote')}"</h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-mahakal-saffron to-amber-400 mx-auto mb-4 rounded-full"></div>
                  <p className="text-stone-600 text-sm leading-relaxed font-medium">
                    {t('annadaan.quote_meaning')}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal 
                direction="left" delay={0.6} duration={0.8}
                className="bg-white rounded-[2rem] shadow-sm p-6 md:p-10 relative overflow-hidden border border-stone-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-mahakal-burgundy font-serif flex items-center gap-3">
                    <button onClick={fetchHistory} className="focus:outline-none hover:text-amber-500 transition-colors" title="Refresh Feed">
                      <FaSync className={`w-5 h-5 text-mahakal-saffron ${isSpinning ? 'animate-spin' : ''}`} />
                    </button>
                    Seva History
                  </h3>
                  <span className="text-[10px] font-bold bg-mahakal-saffron/10 text-mahakal-saffron px-3 py-1 rounded-full uppercase tracking-widest border border-mahakal-saffron/20">
                    Live Feed
                  </span>
                </div>
                
                <div className={`space-y-4 max-h-[350px] overflow-y-auto pr-2 transition-all duration-300 ${(isLoadingHistory || isSpinning) ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`} style={{ scrollbarWidth: 'thin', scrollbarColor: '#FBBF24 transparent' }}>
                  {isLoadingHistory && annadaanHistory.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 font-medium">Loading history...</div>
                  ) : annadaanHistory.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 font-medium">No records found.</div>
                  ) : (
                    annadaanHistory.map((record) => {
                      const isCurrentUser = user && (
                        (record.email && user.email && record.email.toLowerCase() === user.email.toLowerCase()) || 
                        (record.userId && user._id && record.userId.toString() === user._id.toString()) ||
                        (record.name && user.name && record.name.toLowerCase() === user.name.toLowerCase())
                      );
                      
                      return (
                        <div key={record._id} className={`p-4 rounded-xl border transition-colors flex items-center gap-4 group ${isCurrentUser ? 'bg-orange-50 border-mahakal-saffron/40 hover:bg-orange-100/70' : 'bg-stone-50 border-stone-100 hover:border-amber-200 hover:bg-orange-50/50'}`}>
                          <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border flex-shrink-0 transition-colors ${isCurrentUser ? 'bg-mahakal-saffron text-white border-mahakal-saffron' : 'bg-white text-mahakal-burgundy border-stone-200 group-hover:border-mahakal-saffron/50'}`}>
                            <span className={`text-[9px] uppercase font-bold leading-none mb-0.5 ${isCurrentUser ? 'text-white/80' : 'text-stone-400'}`}>Rank</span>
                            <span className="font-bold text-sm leading-none">#{record.rank}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold truncate ${isCurrentUser ? 'text-mahakal-saffron text-[1.05rem]' : 'text-mahakal-burgundy'}`}>
                              {record.name} {isCurrentUser && <span className="text-xs ml-1 bg-mahakal-saffron/10 text-mahakal-saffron px-1.5 py-0.5 rounded font-bold">(You)</span>}
                            </p>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-1 font-medium truncate">
                            <FaCalendarAlt className="text-mahakal-saffron/70" />
                            {new Date(record.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                            <span className="text-stone-300">•</span>
                            <span className="text-mahakal-saffron font-bold">{record.annadaanType}</span>
                          </p>
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              </ScrollReveal>

            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Annadaan;
