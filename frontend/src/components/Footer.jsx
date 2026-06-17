import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-mahakal-burgundy relative pt-12 pb-6 border-t-[4px] border-mahakal-saffron text-mahakal-cream/80 overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt="Kolekar Maharaj Logo" 
                className="w-16 h-16 object-contain group-hover:scale-105 transition-all duration-300 drop-shadow-lg rounded-full bg-white p-0.5" 
              />
              <div className="flex flex-col">
                <h2 className="font-serif text-lg font-bold tracking-wide text-white leading-tight">
                  {t('global.logo_title') || 'Kolekar Maharaj'}
                </h2>
                <span className="text-mahakal-saffron font-bold uppercase tracking-widest text-[9px]">Trust Foundation</span>
              </div>
            </Link>
            <p className="text-mahakal-cream/70 text-xs leading-relaxed font-light">
              {t('footer.brand_desc') || 'An advanced spiritual platform dedicated to preserving timeless traditions while embracing modern digital devotion for seekers worldwide.'}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-black/20 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-mahakal-saffron hover:text-white hover:border-mahakal-saffron hover:-translate-y-1 transition-all duration-300">
                <FaFacebookF size={14} />
              </a>
              <a href="https://www.instagram.com/shri_gurumurti_kolekar_maharaj?igsh=b24xeW1nNWJuaG14" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-black/20 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-mahakal-saffron hover:text-white hover:border-mahakal-saffron hover:-translate-y-1 transition-all duration-300">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="w-8 h-8 bg-black/20 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-mahakal-saffron hover:text-white hover:border-mahakal-saffron hover:-translate-y-1 transition-all duration-300">
                <FaYoutube size={14} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-mahakal-saffron mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-mahakal-saffron"></span> {t('footer.quick_links') || 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              {[
                { name: t('footer.about_us') || 'About Us', path: '/about' }, 
                { name: t('footer.temple_branches') || 'Temple Branches', path: '/branches' }, 
                { name: t('footer.our_services') || 'Our Services', path: '/services' }, 
                { name: t('footer.galleries') || 'Galleries', path: '/gallery' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-mahakal-cream/80 hover:text-white text-xs flex items-center gap-2 group transition-colors">
                    <span className="w-1.5 h-1.5 bg-mahakal-saffron rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Services */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-mahakal-saffron mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-mahakal-saffron"></span> {t('footer.our_services') || 'Digital Services'}
            </h3>
            <ul className="space-y-2">
              {[
                { name: 'Book Donation', path: '/donate' }, 
                { name: 'Book Annadaan', path: '/annadaan' }, 
                { name: t('footer.live_darshan') || 'Live Darshan', path: '/events' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-mahakal-cream/80 hover:text-white text-xs flex items-center gap-2 group transition-colors">
                    <span className="w-1.5 h-1.5 bg-mahakal-saffron rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-mahakal-saffron mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-mahakal-saffron"></span> {t('footer.contact_us') || 'Contact Support'}
            </h3>
            <ul className="space-y-3 text-xs text-mahakal-cream/80 font-light">
              <li className="flex items-start gap-3 p-2 bg-black/10 border border-white/5 rounded-xl">
                <span className="text-mahakal-saffron font-bold mt-0.5 text-base">📍</span>
                <span>Shri Gurumurti Kolekar Maharaj Sansthan.</span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="text-mahakal-saffron font-bold text-base group-hover:scale-110 transition-transform">📞</span>
                <span className="group-hover:text-white transition-colors">+91 8830760116</span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="text-mahakal-saffron font-bold text-base group-hover:scale-110 transition-transform">✉️</span>
                <a href="mailto:gurumurtikolekarmaharaj44@gmail.com" className="group-hover:text-white transition-colors">gurumurtikolekarmaharaj44@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-mahakal-cream/60 text-[10px] font-light">
            {t('footer.rights', { year: new Date().getFullYear() }) || `© ${new Date().getFullYear()} Kolekar Maharaj Trust. All rights reserved.`}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] text-mahakal-cream/60 font-medium tracking-wider uppercase">
            <Link to="#" className="hover:text-white transition-colors">{t('footer.privacy') || 'Privacy Policy'}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t('footer.terms') || 'Terms of Service'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;