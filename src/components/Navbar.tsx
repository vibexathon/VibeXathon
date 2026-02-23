import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoImage from '../assets/logo.png';


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'followus') {
      // Scroll directly to the element with id 'followus'
      const followUs = document.getElementById('followus');
      if (followUs) {
        followUs.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsMobileMenuOpen(false);
        return;
      }
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Always visible navbar
  const getAnimationClass = () => {
    return 'transition-all duration-700 ease-out opacity-100 translate-y-0';
  };

  const navLinks = [
    { name: 'About', id: 'about' },
    { name: 'Themes', id: 'themes' },
    { name: 'Guidelines', id: 'guidelines' },
    { name: 'Judging', id: 'judging' },
    { name: 'Follow us', id: 'followus' }
  ];
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-3 sm:px-6 py-3 sm:py-4 ${getAnimationClass()}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo — larger on both mobile and desktop */}
        <div className="flex items-center min-w-0 flex-shrink-0">
          <img
            src={logoImage}
            alt="Nagarjuna College Logo"
            className="h-12 sm:h-16 w-18 max-w-[200px] sm:max-w-[240px] object-contain object-left"
          />
         
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
            >
              {link.name}
            </button>
          ))}
          <div className="flex items-center gap-3 ml-4">
            <Link 
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Register
            </Link>
            <Link 
              to="/login"
              className="hidden lg:block bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all border border-slate-700 active:scale-95"
            >
              Login
            </Link>
          </div>
        </div>
        
        {/* Mobile: Register button visible + hamburger */}
        <div className="md:hidden flex items-center gap-2 flex-shrink-0">
          <Link 
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
          >
            Register
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:bg-slate-700/50 transition-colors touch-manipulation"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-b border-white/10 py-4 px-4 safe-area-pb">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-left text-slate-300 hover:text-white font-medium text-sm transition-colors py-3 px-4 rounded-xl hover:bg-white/5 active:bg-white/10"
              >
                {link.name}
              </button>
            ))}
            <div className="border-t border-white/10 pt-3 mt-2">
              <Link 
                to="/login"
                className="block w-full text-left text-slate-300 hover:text-white font-medium text-sm transition-colors py-3 px-4 rounded-xl hover:bg-white/5 active:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
