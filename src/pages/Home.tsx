import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Trophy, 
  CalendarDays, 
  MapPin, 
  Phone,
  Sparkles,
  Zap,
  ArrowRight,
  CreditCard,
  Users,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CountdownTimer from '../components/CountdownTimer';
import { 
  THEMES, 
  JUDGING_CRITERIA, 
  CONVENERS,
  FACULTY_COORDINATORS_LIST,
  STUDENT_COORDINATORS_BY_DEPT,
  QUICK_ACTIONS,
  RULES,
  BROCHURE_URL
} from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [animatedSections, setAnimatedSections] = useState<Record<string, boolean>>({});
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterImageError, setPosterImageError] = useState(false);
  const [posterImageSrc, setPosterImageSrc] = useState('/assets/poster.png');
  const [showVenueModal, setShowVenueModal] = useState(false);
  
  const [heroText, setHeroText] = useState("");
  const [heroVersion, setHeroVersion] = useState("");
  const fullHeroText = "Vibexathon";
  const fullHeroVersion = "1.0";

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullHeroText.length) {
        idx++;
        setHeroText(fullHeroText.slice(0, idx));
      } else {
        clearInterval(interval);
        
        // Start typing version after main text is done
        let vIdx = 0;
        const vInterval = setInterval(() => {
          if (vIdx < fullHeroVersion.length) {
            vIdx++;
            setHeroVersion(fullHeroVersion.slice(0, vIdx));
          } else {
            clearInterval(vInterval);
          }
        }, 150);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleJoinNow = () => {
    navigate('/login');
  };

  const handleQuickAction = (actionLabel: string) => {
    if (actionLabel === 'Register Your Team') {
      navigate('/venue-info');
    } else if (actionLabel === 'View Poster') {
      setPosterImageError(false);
      setPosterImageSrc('/assets/poster.png');
      setShowPosterModal(true);
    } else if (actionLabel === 'Download Brochure') {
      // Open brochure PDF from the provided URL
      window.open(BROCHURE_URL, '_blank');
    }
  };

  const handlePosterImageError = () => {
    const formats = ['/assets/poster.jpg', '/assets/poster.jpeg', '/assets/poster.webp'];
    const currentIndex = formats.findIndex(f => posterImageSrc.includes(f.split('.').pop() || ''));
    
    if (currentIndex < formats.length - 1) {
      setPosterImageSrc(formats[currentIndex + 1]);
    } else {
      setPosterImageError(true);
    }
  };

  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Helper function to get animation classes
  const getSectionAnimation = (sectionKey: string) => {
    return `transition-all duration-1000 ease-out ${animatedSections[sectionKey] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;
  };

  // Helper function to set section ref
  const setSectionRef = (key: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[key] = el;
  };

  // Show scroll button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle scroll animations for sections
  useEffect(() => {
    const handleScrollAnimation = () => {
      Object.entries(sectionRefs.current).forEach(([key, element]) => {
        if (element) {
          const rect = (element as HTMLElement).getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight * 0.85;
          if (isVisible && !animatedSections[key]) {
            setAnimatedSections(prev => ({ ...prev, [key]: true }));
          }
        }
      });
    };

    window.addEventListener('scroll', handleScrollAnimation);
    handleScrollAnimation(); // Check on initial load
    return () => window.removeEventListener('scroll', handleScrollAnimation);
  }, [animatedSections]);

  // Handle Escape key to close poster modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPosterModal) {
        setShowPosterModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPosterModal]);

  return (
    <div className="min-h-screen pb-16 overflow-x-hidden">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <header ref={setSectionRef("hero")} className={`relative pt-24 sm:pt-36 pb-12 sm:pb-24 px-4 sm:px-6 text-center ${getSectionAnimation("hero")}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] hero-glow -z-10" />
        
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* 1. HERO TITLE */}
          <div className="space-y-3 sm:space-y-6">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[1.1] sm:leading-[0.85] flex flex-col items-center justify-center">
              <span className="block text-white mb-2 min-h-[1.2em] flex items-center">
                {heroText}
                {heroText.length < fullHeroText.length && <span className="animate-pulse text-indigo-500 ml-1">|</span>}
              </span>
              <span className="gradient-text min-h-[1.2em] flex items-center">
                {heroVersion}
                {heroText.length === fullHeroText.length && heroVersion.length < fullHeroVersion.length && <span className="animate-pulse text-indigo-500 ml-1">|</span>}
              </span>
            </h1>
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <p className="text-xl sm:text-3xl font-light text-slate-300 tracking-wide uppercase">24-Hour Hackathon</p>
              <div className="flex items-center gap-4 text-slate-600 font-bold tracking-[0.4em] uppercase text-[11px] sm:text-[12px]">
                <span>Innovate</span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <span>Build</span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <span>Vibe</span>
              </div>
            </div>
          </div>

          {/* 2. ORGANIZED BY */}
          <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl glass border-white/[0.04] bg-white/[0.01] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 relative z-10 text-center">
              <div className="flex items-center gap-3 text-indigo-400">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest">Organized by</span>
              </div>
              <p className="text-sm sm:text-base text-slate-100 font-bold tracking-tight">
                Nagarjuna College of Engineering and Technology
              </p>
              <span className="hidden sm:inline text-slate-700 text-lg">|</span>
              <p className="text-sm sm:text-base text-cyan-300 font-bold italic">
                CSE – Data Science
              </p>
            </div>
          </div>

          {/* 3. COUNTDOWN */}
          <div className="pt-4 sm:pt-6 scale-95 sm:scale-100">
            <CountdownTimer />
          </div>

          {/* 4. PRIZE POOL */}
          <div className="relative inline-flex items-center w-full sm:w-auto px-4 group">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
            <div className="relative glass border-white/[0.08] rounded-[2rem] sm:rounded-full px-8 sm:px-12 py-6 sm:py-7 w-full sm:w-auto animate-float overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                <Trophy className="w-24 h-24 text-white" />
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
                  <Sparkles className="w-3 h-3" style={{color: '#f59e0b'}} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none" style={{color: 'rgba(245, 158, 11, 0.8)'}}>Grand Prize Pool</span>
                </div>
                <h2 className="text-6xl sm:text-7xl font-black tracking-tighter text-shine leading-none">
                  ₹50,000
                </h2>
              </div>
            </div>
          </div>

          {/* 5. LOCATION & DATE CAPSULES */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="flex items-center gap-5 px-8 py-6 rounded-3xl glass border-white/10 w-full sm:w-auto hover:bg-white/[0.06] transition-all group shadow-xl">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm uppercase text-slate-400 font-black tracking-widest leading-none mb-2">Date</p>
                <p className="font-bold text-slate-100 text-base sm:text-lg">March 16 – 17</p>
              </div>
            </div>
            <div className="flex items-center gap-5 px-8 py-6 rounded-3xl glass border-white/10 w-full sm:w-auto hover:bg-white/[0.06] transition-all group shadow-xl">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm uppercase text-slate-400 font-black tracking-widest leading-none mb-2">Venue</p>
                <p className="font-bold text-slate-100 text-base sm:text-lg whitespace-nowrap">NCET Bengaluru</p>
              </div>
            </div>
          </div>


        </div>
      </header>

      {/* --- QUICK ACTIONS --- */}
      <section ref={setSectionRef("quickActions")} className={`px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto ${getSectionAnimation("quickActions")}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {QUICK_ACTIONS.map((action, idx) => (
            <button 
              key={idx}
              onClick={() => handleQuickAction(action.label)}
              className="group relative flex flex-col items-start p-6 sm:p-7 rounded-3xl glass border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-500 text-left overflow-hidden shadow-lg cursor-pointer"
            >
              <div className={`p-3.5 rounded-xl bg-${action.color}-500/10 text-${action.color}-500 mb-6 group-hover:scale-110 group-hover:rotate-2 transition-all duration-500`}>
                {action.icon}
              </div>
              <div className="flex items-center justify-between w-full relative z-10">
                <span className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-white transition-colors tracking-tight">{action.label}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-200 transition-all" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-${action.color}-500/20 to-transparent w-0 group-hover:w-full transition-all duration-1000`} />
            </button>
          ))}
        </div>
      </section>

      {/* Poster Modal */}
      {showPosterModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={() => setShowPosterModal(false)}
        >
          <div 
            className="relative flex items-center justify-center w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/70 hover:bg-black text-white transition-colors text-lg"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            {posterImageError ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-black/80 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-2">Poster image not found</p>
                <p className="text-slate-500 text-xs">Please ensure the poster file exists at:</p>
                <p className="text-slate-600 text-xs font-mono mt-1">/public/assets/poster.png</p>
                <p className="text-slate-600 text-xs font-mono">or poster.jpg / poster.jpeg</p>
              </div>
            ) : (
              <img 
                src={posterImageSrc} 
                alt="Vibexathon 1.0 Poster" 
                className="max-w-[95vw] max-h-[80vh] object-contain"
                onError={handlePosterImageError}
                onLoad={() => setPosterImageError(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Venue Information Modal */}
      {showVenueModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowVenueModal(false)}
        >
          <div 
            className="relative bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Separate from content */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setShowVenueModal(false)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors shadow-lg"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 md:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">Venue & Logistics</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Important information for participants</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Venue Details */}
                <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Venue Details</h3>
                      <p className="text-sm sm:text-base text-slate-300 font-semibold">Nagarjuna College of Engineering and Technology</p>
                      <p className="text-xs sm:text-sm text-slate-400">Bengaluru, Karnataka</p>
                    </div>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="bg-amber-500/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-amber-400 mb-1 sm:mb-2">Accommodation</h3>
                      <p className="text-xs sm:text-sm text-slate-300">No accommodation will be provided for participants.</p>
                    </div>
                  </div>
                </div>

                {/* Refreshments */}
                <div className="bg-green-500/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-green-400 mb-1 sm:mb-2">Refreshments</h3>
                      <p className="text-xs sm:text-sm text-slate-300">Refreshments will be provided for 40 minutes during the event schedule.</p>
                    </div>
                  </div>
                </div>

                {/* Distance Information */}
                <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                  <div className="flex items-start gap-3 mb-3 sm:mb-4">
                    <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">Distance from Major Locations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Majestic</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~49 km</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Yeshwanthpur</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~48 km</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Yelahanka</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~32 km</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Doddaballapura</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~34 km</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Hebbal</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~43 km</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Airport</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~23 km</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Chikkaballapura</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~13 km</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5 sm:p-3">
                          <span className="text-slate-300 truncate pr-2">Devanahalli</span>
                          <span className="text-indigo-400 font-bold whitespace-nowrap">~13 km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bus Information */}
                <div className="bg-blue-500/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-400 mb-1 sm:mb-2">Public Transport</h3>
                      <p className="text-xs sm:text-sm text-slate-300 mb-1"><span className="font-semibold">Route:</span> Bangalore to Chikkaballapura</p>
                      <p className="text-xs sm:text-sm text-slate-300"><span className="font-semibold">Stop:</span> Nagarjuna College of Engineering and Technology</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <button
                  onClick={() => {
                    setShowVenueModal(false);
                    navigate('/register');
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Proceed to Register
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MAJOR UPDATES WHATSAPP CHANNEL --- */}
      <div className="max-w-2xl mx-auto mb-10 mt-8 flex flex-col items-center justify-center bg-green-500/5 border border-green-500/20 rounded-2xl p-6 shadow-lg sm:p-6 p-3">
        <p className="text-green-400 font-bold text-base sm:text-base text-sm mb-3 text-center">For Major Updates Join The WhatsApp Channel</p>
        <a
          href="https://whatsapp.com/channel/0029Vb7eeY2Au3aVmysx1I1e"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-500 hover:underline font-semibold bg-green-500/10 rounded-full transition-colors shadow-md sm:text-base text-sm sm:px-5 sm:py-2 px-3 py-1"
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="sm:w-[22px] sm:h-[22px] w-[18px] h-[18px]" width="18" height="18">
              <path fill="currentColor" d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"></path>
            </svg>
          </span>
          <span>Join WhatsApp Channel</span>
        </a>
      </div>

      {/* --- ABOUT --- */}
      <section ref={setSectionRef("about")} className={`px-4 sm:px-6 py-16 sm:py-24 max-w-6xl mx-auto ${getSectionAnimation("about")}`} id="about">
        <div className="space-y-10">
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight text-center">
            About <span className="gradient-text">Vibexathon 1.0</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="border-l-4 border-indigo-500/50 pl-6 sm:pl-10 py-2">
                <p className="text-xl sm:text-2xl text-slate-300 font-medium leading-relaxed">
                  Vibexathon 1.0 is a 24-hour hackathon organized by Nagarjuna College of Engineering and Technology, scheduled on March 16 & 17. The event brings together student innovators to ideate, build, and showcase impactful solutions in an intensive innovation sprint.
                </p>
              </div>
              
              <p className="text-lg sm:text-xl text-slate-400 font-normal leading-relaxed">
                Focused on AI/ML, Smart City and Sustainability, and Open Innovation, VibeXthon 1.0 encourages participants to solve real-world challenges through creativity, collaboration, and technology.
              </p>
            </div>
            
            {/* Video Content */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
              <video 
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/assets/logovid.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      

      {/* --- THEMES --- */}
      <section ref={setSectionRef("themes")} className={`px-4 sm:px-6 py-16 sm:py-24 bg-white/[0.003] ${getSectionAnimation("themes")}`} id="themes">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Themes</h2>
            <p className="text-slate-500 max-w-lg mx-auto font-medium text-sm">Choose your theme and start building.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {THEMES.map((theme, i) => (
              <div key={i} className="group p-8 sm:p-10 rounded-[2rem] glass border-white/5 hover:border-indigo-500/10 transition-all duration-500 flex flex-col items-center text-center hover:-translate-y-2">
                <div className="mb-6 p-6 rounded-2xl bg-slate-950 border border-white/5 group-hover:scale-105 group-hover:border-indigo-500/20 transition-all duration-500">
                  {theme.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors tracking-tight">{theme.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{theme.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- GUIDELINES --- */}
      <section ref={setSectionRef("guidelines")} className={`px-4 sm:px-6 py-16 sm:py-24 ${getSectionAnimation("guidelines")}`} id="guidelines">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Guidelines</h2>
            <p className="text-slate-600 uppercase tracking-widest text-[10px] font-black">Code of Engagement</p>
          </div>
          <div className="p-8 sm:p-12 rounded-[2.5rem] glass border-white/5 bg-slate-950/60 shadow-xl relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 sm:gap-y-8">
              {RULES.map((rule, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[9px] font-black text-slate-500 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed group-hover:text-slate-100 transition-colors">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

{/* --- HACKATHON JUDGING CRITERIA --- */}
      <section ref={setSectionRef("judging")} className={`px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-b from-slate-950 to-slate-900 ${getSectionAnimation("judging")}`} id="judging">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Hackathon <span className="gradient-text">Judging Criteria</span>
              </h2>
            </div>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium">
              Transparent evaluation framework designed to reward innovation, technical excellence, and real-world impact.
            </p>
          </div>

          {/* Criteria Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Problem Understanding */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20">
                    15 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  Problem Understanding
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Clarity of problem statement, understanding of requirements.
                </p>
              </div>
            </div>

            {/* Technical Implementation */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20">
                    25 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  Technical Implementation
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Code quality, architecture, tools, and technical depth.
                </p>
              </div>
            </div>

            {/* Innovation */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20">
                    15 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-purple-400 transition-colors">
                  Innovation
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Originality, creativity, and uniqueness of the solution.
                </p>
              </div>
            </div>

            {/* Data Science Rigor */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-green-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20">
                    15 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-green-400 transition-colors">
                  Data Science Rigor
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Data handling, model selection, validation, and analysis quality.
                </p>
              </div>
            </div>

            {/* Feasibility */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20">
                    10 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-blue-400 transition-colors">
                  Feasibility
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Practicality, scalability, and real-world applicability.
                </p>
              </div>
            </div>

            {/* Presentation */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-rose-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20">
                    10 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-rose-400 transition-colors">
                  Presentation
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Clarity of pitch, communication, and explanation.
                </p>
              </div>
            </div>

            {/* Demo */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-yellow-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20">
                    10 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-yellow-400 transition-colors">
                  Demo
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Functionality, completeness, and effectiveness of the demo.
                </p>
              </div>
            </div>

            {/* Bonus */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/20">
                    5 PTS
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  Bonus
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Extra effort, creativity, or outstanding execution.
                </p>
              </div>
            </div>
          </div>

          {/* Total Score Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-8 py-4 rounded-full border border-indigo-500/30 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Score</p>
                <p className="text-2xl font-black text-white tracking-tighter">100 <span className="text-slate-500 text-lg font-medium">Points</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- REGISTRATION FEE --- */}
      <section ref={setSectionRef("fees")} className={`px-4 sm:px-6 py-16 sm:py-24 bg-white/[0.005] ${getSectionAnimation("fees")}`}>
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">Registration Fee</h2>
            <p className="text-slate-500 font-medium text-sm">Join the movement. Secure your spot.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl glass border-white/5 bg-slate-950/40 hover:border-indigo-500/20 transition-all group flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">IEEE Student Member</h4>
              <p className="text-4xl font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors">₹400</p>
              <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest">Valid IEEE ID Required</p>
            </div>
            <div className="p-8 rounded-3xl glass border-white/5 bg-slate-950/40 hover:border-rose-500/20 transition-all group flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Non-IEEE Student</h4>
              <p className="text-4xl font-black text-white tracking-tighter group-hover:text-rose-400 transition-colors">₹500</p>
              <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest">Open for all students</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- GET IN TOUCH --- */}
      <section ref={setSectionRef("contact")} className={`px-4 sm:px-6 py-16 sm:py-24 bg-[#020617] ${getSectionAnimation("contact")}`}>
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              Get In <span className="gradient-text">Touch</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full" />
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-0 -mx-4 sm:mx-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {CONVENERS.map((c, i) => (
              <div key={i} className={`min-w-[72%] sm:min-w-0 flex-shrink-0 snap-start scroll-ml-6 p-8 rounded-2xl glass bg-white/[0.01] border-white/5 text-center flex flex-col items-center transition-all hover:bg-white/[0.03] hover:border-${c.color}-500/20 shadow-xl group`}>
                <p className={`text-[10px] font-black tracking-[0.2em] mb-4 uppercase ${c.color === 'cyan' ? 'text-cyan-400' : 'text-purple-500'}`}>
                  {c.role}
                </p>
                <h4 className="text-xl font-black text-white mb-1 tracking-tight">{c.name}</h4>
                <p className="text-[10px] text-slate-600 font-bold mb-6 tracking-wide uppercase">{c.sub}</p>
                <div className="flex items-center gap-2 text-slate-300 font-bold group-hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-slate-600 group-hover:text-indigo-500" />
                  <a href={`tel:${c.phone}`} className="text-sm">{c.phone}</a>
                </div>
              </div>
            ))}
          </div>

          {/* Follow us row (mobile & desktop) */}
          <div className="w-full text-center mt-6">
            <h3 id="followus" className="text-lg font-black text-white">Follow us on</h3>
            <p className="text-slate-400 text-sm mt-2">Stay updated — follow Vibexathon on social media</p>
            <div className="mt-4 flex items-center justify-center space-x-6">
              <a href="https://www.instagram.com/vibexathon_?igsh=MThpNGxxNTBkenA2eQ==" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM17.75 6a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
              </a>

              <a href="https://x.com/dsncet?s=21&fbclid=PAb21jcAQIO5JleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAacMNRazTSDdsGSQyfamxd5luILMPxRUPktHsu9p08NmTbog_MT4rcwv23AOMw_aem_-ZTLGKOzE5EdHhTjHn8NVA" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20c7.547 0 11.675-6.155 11.675-11.497 0-.175 0-.349-.012-.522A8.18 8.18 0 0 0 22 5.92a8.27 8.27 0 0 1-2.357.635 4.07 4.07 0 0 0 1.804-2.243 8.18 8.18 0 0 1-2.605.98A4.093 4.093 0 0 0 12.07 8.03a11.6 11.6 0 0 1-8.433-4.26 4.06 4.06 0 0 0 1.27 5.45A4.07 4.07 0 0 1 3.2 9.7v.05a4.09 4.09 0 0 0 3.278 4.007 4.1 4.1 0 0 1-1.085.144c-.266 0-.524-.027-.776-.076a4.096 4.096 0 0 0 3.823 2.837A8.21 8.21 0 0 1 2 18.407 11.588 11.588 0 0 0 8.29 20z"/></svg>
              </a>

              
              <a href="https://whatsapp.com/channel/0029Vb7eeY2Au3aVmysx1I1e" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-500">
              <span className="w-6 h-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24" height="24">
                  <path fill="currentColor" d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"></path>
                </svg>
              </span>
            </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-8 sm:p-10 rounded-3xl glass bg-white/[0.01] border-white/5 shadow-2xl space-y-8">
              <h3 className="text-2xl font-black text-white tracking-tight">Faculty Coordinators</h3>
              <div className="space-y-4">
                {FACULTY_COORDINATORS_LIST.map((f, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                    <span className="text-slate-200 font-semibold">{f.name}</span>
                    <span className="text-[10px] font-black text-slate-600 bg-white/[0.03] px-3 py-1 rounded-md uppercase tracking-wider">{f.dept}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 rounded-3xl glass bg-white/[0.01] border-white/5 shadow-2xl space-y-6 sm:space-y-8">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Student Coordinators</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {STUDENT_COORDINATORS_BY_DEPT.map((d, i) => (
                  <div key={i} className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 space-y-4 text-center group">
                    <h4 className="text-xs sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">{d.dept}</h4>
                    <div className="space-y-3">
                      {d.names.map((name, idx) => (
                        <p key={idx} className="text-sm sm:text-base text-slate-200 font-semibold group-hover:text-white transition-colors">{name}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VENUE --- */}
      <section ref={setSectionRef("venue")} className={`px-4 sm:px-6 py-16 sm:py-24 text-center ${getSectionAnimation("venue")}`}>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">The Venue</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-lg">Nagarjuna College of Engineering and Technology, Bengaluru.</p>
          </div>
          
          <div className="flex justify-center">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=Nagarjuna+College+of+Engineering+and+Technology+Bengaluru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-10 py-5 rounded-2xl bg-white text-slate-950 text-xs sm:text-sm font-black hover:bg-slate-200 transition-all flex items-center gap-4 uppercase tracking-[0.2em] shadow-2xl shadow-white/5"
            >
              Get Directions <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>



      {/* Scroll to Top Button */}
      <div className={`fixed bottom-8 right-8 transition-all duration-500 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-600/30 flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 active:scale-95 border border-white/10"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Home;