import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { UserRole } from '../types';
import Logo from './Logo';

interface NavbarProps {
  user: { id: string; role: UserRole };
  onLogout: () => void;
  teamName?: string;
  isSyncing?: boolean;
  lastSync?: Date | null;
  onRefresh?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, teamName, isSyncing, lastSync, onRefresh }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-950/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
          <span className="hidden sm:inline"><Logo size={36} showText={false} /></span>
          <span className="sm:hidden"><Logo size={28} showText={false} /></span>
        </Link>
        
        {/* Desktop: sync + role + logout */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/5 rounded-full border border-indigo-500/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'}`}></div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                {isSyncing ? 'Synchronizing' : 'Network Active'}
              </span>
            </div>
            {lastSync && (
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tighter">
                Last Refresh: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-indigo-400 transition-all active:rotate-180 duration-500"
                title="Force Sync"
              >
                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-black">{user.role}</span>
            <span className="text-sm font-bold text-slate-100">{teamName || 'Administrator'}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <button 
            onClick={onLogout}
            className="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-white bg-white/5 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 hover:border-red-500/30 uppercase tracking-widest"
          >
            Logout
          </button>
        </div>

        {/* Mobile: hamburger only */}
        <div className="md:hidden flex items-center flex-shrink-0">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:bg-slate-700/50 transition-colors touch-manipulation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-700/100 backdrop-blur-xl border-b border-white/10 py-4 px-4">
          <div className="container mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">{user.role}</span>
              <span className="text-sm font-bold text-slate-100 truncate">{teamName || 'Administrator'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-500'}`} />
              <span className="text-xs text-indigo-300">{isSyncing ? 'Synchronizing…' : 'Network Active'}</span>
              {lastSync && <span className="text-[10px] text-slate-500 ml-auto">{lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
            {onRefresh && (
              <button 
                onClick={() => { onRefresh(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 py-3 px-4 rounded-xl text-left text-slate-300 hover:bg-white/5 text-sm font-medium"
              >
                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
            <button 
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="w-full py-3 px-4 rounded-xl text-left text-sm font-black text-slate-400 hover:text-white bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 uppercase tracking-widest"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
