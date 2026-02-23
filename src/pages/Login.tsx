
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppState, UserRole } from '../types';
import Logo from '../components/Logo';

interface LoginProps {
  store: {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  };
}

const Login: React.FC<LoginProps> = ({ store }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await store.login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Glows */}
      <div className="fixed top-1/4 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center mb-6 sm:mb-10">
          <Logo size={48} showText={true} className="scale-90 sm:scale-110" />
        </div>

        <div className="glass-card p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 brand-gradient"></div>
          
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-medium">Log in to manage your project</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-start space-x-3 animate-in shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Team Leader Email</label>
              <input 
                type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-slate-700 font-medium"
                placeholder="leader@vibexthon.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Portal Password</label>
              <input 
                type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>SIGN INTO PORTAL</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center text-sm">
            <p className="text-slate-500 font-medium">New team? <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Start Registration</Link></p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Authorized Access Only</p>
      </div>
    </div>
  );
};

export default Login;
