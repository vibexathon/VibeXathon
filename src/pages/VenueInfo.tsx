import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Home } from 'lucide-react';
import Logo from '../components/Logo';

const VenueInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo size={40} />
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Main Content */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-12 border border-white/10">
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Important Information Before Registration</h1>
            <p className="text-indigo-400 text-xs sm:text-sm mt-2 font-semibold">Please read carefully before registering</p>
          </div>

          <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
            {/* Venue Details */}
            <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-white/5">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Venue Details</h2>
                  <p className="text-base sm:text-lg text-slate-300 font-semibold mb-1">Nagarjuna College of Engineering and Technology</p>
                  <p className="text-sm sm:text-base text-slate-400">Bengaluru, Karnataka</p>
                </div>
              </div>
            </div>

            {/* Accommodation */}
            <div className="bg-amber-500/5 rounded-2xl p-6 sm:p-8 border-2 border-amber-500/30">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-400 mb-3">Accommodation</h2>
                  <p className="text-sm sm:text-base text-slate-300">No accommodation will be provided for participants.</p>
                </div>
              </div>
            </div>

            {/* Refreshments */}
            <div className="bg-green-500/5 rounded-2xl p-6 sm:p-8 border border-green-500/20">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-3">Refreshments</h2>
                  <p className="text-sm sm:text-base text-slate-300">Refreshments will be provided for 40 minutes during the event schedule.</p>
                </div>
              </div>
            </div>

            {/* Distance Information */}
            <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-white/5">
              <div className="flex items-start gap-4 mb-6">
                <svg className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Distance from Major Locations</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Majestic (Bus/Railway Station)</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~49 km</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Yeshwanthpur</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~48 km</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Yelahanka</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~32 km</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Doddaballapura</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~34 km</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Hebbal</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~43 km</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Kempegowda Airport</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~23 km</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Chikkaballapura</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~13 km</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded-xl p-3 sm:p-4">
                      <span className="text-sm sm:text-base text-slate-300 truncate pr-3">Devanahalli</span>
                      <span className="text-base sm:text-lg text-indigo-400 font-bold whitespace-nowrap">~13 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bus Information */}
            <div className="bg-blue-500/5 rounded-2xl p-6 sm:p-8 border border-blue-500/20">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-400 mb-3">Public Transport</h2>
                  <p className="text-sm sm:text-base text-slate-300 mb-2">
                    <span className="font-semibold text-white">Route:</span> Bangalore to Chikkaballapura
                  </p>
                  <p className="text-sm sm:text-base text-slate-300">
                    <span className="font-semibold text-white">Stop:</span> Nagarjuna College of Engineering and Technology
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              I Understand - Proceed to Register
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueInfo;
