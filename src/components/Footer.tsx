import React from 'react';
import { Mail, Phone, MapPin, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-10 px-6 text-slate-300 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="space-y-3">
          <div className="text-white font-bold text-lg">Vibexathon</div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Vibexathon is a community-driven hackathon focusing on AI, sustainability and open innovation. Register your team, submit projects, and compete for prizes.
          </p>
          <div className="flex items-center space-x-3 text-slate-400 mt-3">
              <MapPin className="w-4 h-4" />
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Nagarjuna+College+of+Engineering+and+Technology+Bengaluru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline hover:text-white"
              >
                Nagarjuna College of Engineering & Technology Beedaganahalli, Venkatagiri Kote, Post, Devanahalli, Bengaluru, Karnataka 562110
              </a>
          </div>
        </div>

        <div className="flex justify-between md:justify-center">
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/register" className="hover:text-white">Register</a></li>
              <li><a href="/login" className="hover:text-white">Login</a></li>
            </ul>
          </div>
        </div>

        <div className="text-sm">
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <div className="flex items-center space-x-2 text-slate-400 mb-2">
            <Mail className="w-4 h-4" />
            <a href="mailto:vibexthon@gmail.com" className="hover:text-white">vibexthon@gmail.com</a>
          </div>
          <div className="flex items-center space-x-2 text-slate-400 mb-4">
            <Phone className="w-4 h-4" />
            <a href="tel:+919741488780" className="hover:text-white">+91 97414 88780</a>
          </div>

          <div className="flex items-center space-x-3 mt-2">
            <a href="https://x.com/dsncet?s=21&fbclid=PAb21jcAQIO5JleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAacMNRazTSDdsGSQyfamxd5luILMPxRUPktHsu9p08NmTbog_MT4rcwv23AOMw_aem_-ZTLGKOzE5EdHhTjHn8NVA" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/vibexathon_?igsh=MThpNGxxNTBkenA2eQ==" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://whatsapp.com/channel/0029Vb7eeY2Au3aVmysx1I1e" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-500">
              <span className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24" height="24">
                  <path fill="currentColor" d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"></path>
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-800 pt-6 text-center text-slate-500 text-xs">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© 2026 Vibexathon. All Rights Reserved.</p>
          <p>
            Designed by{' '}
            <a
              href="https://share.google/YaoSdrnCCES1ZHNyS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors underline"
            >
              Samrak Production
            </a>
          </p>
          <div className="flex items-center space-x-4">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
