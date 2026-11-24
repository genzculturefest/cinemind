import React, { useState } from 'react';
import { Film, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 backdrop-blur-md border-b shadow-xs ${
      isDark
        ? 'bg-[#0A0A0A]/90 text-white border-[#222222]'
        : 'bg-white/95 text-slate-900 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo with Official Cinemind Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0 overflow-hidden bg-black/5 dark:bg-white/5 p-0.5">
              <img
                src="https://genzculturefest.github.io/speakup/cinemind-removebg-preview.png"
                alt="Cinemind Logo"
                className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display text-2xl font-bold tracking-wider group-hover:text-[#E50914] transition-colors">
                  CINEMIND
                </span>
              </div>
              <p className={`text-[10px] tracking-tight hidden sm:block -mt-0.5 font-body ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                Himpunan Mahasiswa Sinematografi • ITB Bina Sarana Global
              </p>
            </div>
          </div>

          {/* Desktop Nav Links (Exclusively Public Content) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button
              onClick={() => scrollTo('hero')}
              className={`transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E50914] ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-[#E50914]'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => scrollTo('karya')}
              className={`transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E50914] ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-[#E50914]'
              }`}
            >
              Karya Film
            </button>
            <button
              onClick={() => scrollTo('berita')}
              className={`transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E50914] ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-[#E50914]'
              }`}
            >
              Warta & Berita
            </button>
            <button
              onClick={() => scrollTo('struktur')}
              className={`transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E50914] ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-[#E50914]'
              }`}
            >
              Struktur Pengurus
            </button>
            <button
              onClick={() => scrollTo('tentang')}
              className={`transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#E50914] ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-[#E50914]'
              }`}
            >
              Tentang Kami
            </button>
          </nav>

          {/* Action Area: Dual-Theme Switcher */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle showLabel={true} />
          </div>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 focus:outline-none ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-700 hover:text-black'}`}
              aria-label="Menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-4 pt-3 pb-6 space-y-3 ${
          isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <button
            onClick={() => scrollTo('hero')}
            className={`block w-full text-left py-2 text-base font-medium ${
              isDark ? 'text-gray-200 hover:text-white' : 'text-slate-800 hover:text-[#E50914]'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => scrollTo('karya')}
            className={`block w-full text-left py-2 text-base font-medium ${
              isDark ? 'text-gray-200 hover:text-white' : 'text-slate-800 hover:text-[#E50914]'
            }`}
          >
            Karya Film Mahasiswa
          </button>
          <button
            onClick={() => scrollTo('berita')}
            className={`block w-full text-left py-2 text-base font-medium ${
              isDark ? 'text-gray-200 hover:text-white' : 'text-slate-800 hover:text-[#E50914]'
            }`}
          >
            Warta & Press Release
          </button>
          <button
            onClick={() => scrollTo('struktur')}
            className={`block w-full text-left py-2 text-base font-medium ${
              isDark ? 'text-gray-200 hover:text-white' : 'text-slate-800 hover:text-[#E50914]'
            }`}
          >
            Struktur Organisasi (Tata Kelola)
          </button>
          <button
            onClick={() => scrollTo('tentang')}
            className={`block w-full text-left py-2 text-base font-medium ${
              isDark ? 'text-gray-200 hover:text-white' : 'text-slate-800 hover:text-[#E50914]'
            }`}
          >
            Tentang Himpunan
          </button>
        </div>
      )}
    </header>
  );
};
