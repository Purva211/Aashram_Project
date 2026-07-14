import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../../components/ScrollReveal';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaInstagram } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import heroBg from '../../assets/hero_bg.jpeg';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { validateName, getMobileError } from '../../utils/validationUtils';

const ContactUs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const handleChange = (e) => {
    let finalValue = e.target.value;
    if (e.target.name === 'name') finalValue = finalValue.replace(/[^A-Za-z\s]/g, '');
    if (e.target.name === 'phone') finalValue = finalValue.replace(/\D/g, '');
    setFormData({ ...formData, [e.target.name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      return navigate('/login', { state: { message: "Please log in before contacting the trust.", returnUrl: location.pathname } });
    }
    if (!validateName(formData.name)) {
      return alert("Name must contain only alphabets and spaces.");
    }
    if (formData.phone) {
      const mobileError = getMobileError(formData.phone);
      if (mobileError) return alert(mobileError);
    }
    try {
      await api.post('/contact', formData);
      alert("Thank you for your message!");
      setFormData({ name: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error("Contact Error:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans selection:bg-gold selection:text-caramel-deep">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] bg-[#8D5B2F] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-30 mix-blend-overlay z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#8D5B2F]/80 via-[#8D5B2F]/60 to-cream z-10"></div>
        <img src={heroBg} alt="Contact Hero" className="absolute inset-0 w-full h-full object-cover object-top scale-105" />
        
        <div className="relative z-40 text-center px-4 pt-20">
          <ScrollReveal as="h1" 
            direction="up" duration={0.8}
            className="font-serif font-bold text-white mb-6 drop-shadow-2xl"
          >
            Contact Us
          </ScrollReveal>
          <ScrollReveal as="p" 
            direction="up" duration={0.8} delay={0.2}
            className="text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto drop-shadow-md"
          >
            We welcome you to reach out to Shri Rudrapashupati Kolekar Maharaj Sansthan.
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <ScrollReveal as="section" direction="up" delay={0.3} className="relative z-30 -mt-20 max-w-7xl mx-auto px-0 sm:px-4 md:px-6 w-full pb-24">
        <div className="bg-white sm:rounded-[3rem] shadow-2xl p-6 sm:p-8 md:p-16 flex flex-col lg:flex-row gap-12 lg:gap-20 border-y sm:border border-gold/20">
          
          {/* Contact Details & Form */}
          <div className="lg:w-1/2 flex flex-col gap-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-caramel-deep mb-4">Get in Touch</h2>
              <p className="text-caramel-dark font-light mb-8">Fill out the form below or use our contact details to reach us for any spiritual inquiries, pooja bookings, or donations.</p>
              
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <a href="https://maps.app.goo.gl/5899epDHbXBEZzUo6?g_st=aw" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-12 h-12 bg-cream rounded-full flex items-center justify-center text-primary text-xl shadow-inner border border-gold/30 hover:bg-gold hover:text-white transition-colors">
                    <FaMapMarkerAlt />
                  </a>
                  <div>
                    <h4 className="font-bold text-caramel-deep text-sm tracking-wider uppercase">Address</h4>
                    <p className="text-caramel-dark text-sm">Shri Gurumurti Kolekar Maharaj Sansthan.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-cream rounded-full flex items-center justify-center text-primary text-xl shadow-inner border border-gold/30">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <h4 className="font-bold text-caramel-deep text-sm tracking-wider uppercase">Phone</h4>
                    <p className="text-caramel-dark text-sm">+91 8830760116</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-cream rounded-full flex items-center justify-center text-primary text-xl shadow-inner border border-gold/30">
                    <FaEnvelope />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-caramel-deep text-sm tracking-wider uppercase">Email</h4>
                    <p className="text-caramel-dark text-sm break-all">gurumurtikolekarmaharaj44@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a href="https://www.instagram.com/shri_gurumurti_kolekar_maharaj?igsh=b24xeW1nNWJuaG14" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-12 h-12 bg-cream rounded-full flex items-center justify-center text-primary text-xl shadow-inner border border-gold/30 hover:bg-gold hover:text-white transition-colors">
                    <FaInstagram />
                  </a>
                  <div className="min-w-0">
                    <h4 className="font-bold text-caramel-deep text-sm tracking-wider uppercase">Instagram</h4>
                    <a href="https://www.instagram.com/shri_gurumurti_kolekar_maharaj?igsh=b24xeW1nNWJuaG14" target="_blank" rel="noopener noreferrer" className="text-caramel-dark text-sm hover:text-primary transition-colors break-all">@shri_gurumurti_kolekar_maharaj</a>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-cream/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white shadow-inner flex flex-col gap-6">
              <h3 className="text-xl font-bold text-primary font-serif mb-2">Send a Message</h3>
              <div>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  pattern="[A-Za-z\s]+"
                  title="Name must contain only alphabets and spaces"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Your Phone Number (Optional)" 
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="\d{10}"
                  title="Mobile number must be exactly 10 digits"
                  maxLength={10}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  name="subject"
                  placeholder="Subject (Optional)" 
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <textarea 
                  name="message"
                  placeholder="Your Message" 
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                ></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className={`flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary to-gold text-white font-bold rounded-xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'}`}>
                {isSubmitting ? 'Sending...' : 'Send Message'} {!isSubmitting && <FaPaperPlane size={14} />}
              </button>
            </form>
          </div>

          {/* Map */}
          <div className="lg:w-1/2 flex flex-col">
             <div className="w-full h-[300px] sm:h-[400px] lg:h-full min-h-[300px] sm:min-h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-4 border-cream relative">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3810.3674299737!2d74.9389059!3d17.2494499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc14d958b49240f%3A0x6effc68927abd446!2z4KS24KWN4KSw4KWALiDgpLbgpY3gpLDgpYAuIOCktuCljeCksOClgC4g4KSX4KWB4KSw4KWB4KSu4KWC4KSw4KWN4KSk4KWAIOCksOClgeCkpuCljeCksOCkquCktuClguCkquCkpOClgCDgpJXgpYvgpLPgpYfgpJXgpLAg4KSu4KS54KS-4KSw4KS-4KScIOCkruCkoA!5e0!3m2!1sen!2sin!4v1780996722543!5m2!1sen!2sin" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0 }} 
                 allowFullScreen="" 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
                 title="Map"
                 className="absolute inset-0"
               ></iframe>
             </div>
          </div>

        </div>
      </ScrollReveal>

      <Footer />
    </div>
  );
};

export default ContactUs;
