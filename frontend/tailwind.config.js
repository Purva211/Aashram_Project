/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mahakal: {
          burgundy: '#4A1D0B', // Deep brownish red for text/headers/footer
          saffron: '#D97706',  // Amber-500 equivalent
          cream: '#FFFDF6',    // Off-white main background
          card: '#FAF2DC',     // Light cream for cards/interactive
        },
        primary: {
          DEFAULT: '#D97706', // Saffron
          hover: '#B45309',
          light: '#F59E0B',
          glow: 'rgba(217, 119, 6, 0.4)',
        },
        navy: {
          DEFAULT: '#1F2937',
          light: '#374151',
          lighter: '#4B5563',
          dark: '#111827',
        },
        smoke: {
          DEFAULT: '#FAFAFA',
          dark: '#F3F4F6',
        },
        gold: {
          DEFAULT: '#FBBF24',
          hover: '#FCD34D',
          glow: 'rgba(251, 191, 36, 0.4)',
        },
        cream: {
          DEFAULT: '#FFFDF6',
          light: '#FFFFFF',
          dark: '#FAF2DC',
        },
        divine: {
          red: '#4A1D0B', // Matched to Mahakal Burgundy
        },
        'divine-brown': {
          DEFAULT: '#4A1D0B',
          faint: '#8C6B5D',
          light: '#D7CCC8',
          dark: '#3E2723',
        },
        'caramel': '#C07C40',
        'caramel-light': '#D29062',
        'caramel-dark': '#8B5A2B',
        'caramel-deep': '#654321',
        footer: {
          DEFAULT: '#E8DED5', // Distinct faint brown for footer
        },
        glass: {
          10: 'rgba(255, 255, 255, 0.6)',
          20: 'rgba(255, 255, 255, 0.8)',
          30: 'rgba(255, 255, 255, 0.9)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-light': 'radial-gradient(at 40% 20%, rgba(255, 103, 31, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(251, 191, 36, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(255, 248, 231, 1) 0px, transparent 50%)',
      },
      boxShadow: {
        'neon-primary': '0 0 20px 2px rgba(255, 103, 31, 0.2)',
        'neon-gold': '0 0 20px 2px rgba(251, 191, 36, 0.2)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'glow-spin 10s linear infinite',
        'marquee': 'marquee 18s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'glow-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
};