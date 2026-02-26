import React from 'react';
import Footer from './components/Footer';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { UserRole } from './types';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ParticipantDashboard from './pages/ParticipantDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TestQR from './pages/TestQR';


const App: React.FC = () => {
  const { state, updateState, login, register, logout, isLoading, isSyncing, lastSync, error, refresh } = useStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-white font-bold text-lg tracking-tight">Vibexathon 1.0</p>
          <p className="text-slate-500 text-sm animate-pulse">Almost their.....</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Removed global Navbar - each page handles its own navigation */}
        
        <main className="flex-grow">
          {error && (
            <div className="mb-6 mx-auto max-w-2xl bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 flex items-center justify-between text-red-400 text-xs">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
              <button onClick={() => refresh()} className="underline font-bold hover:text-white">Retry Sync</button>
            </div>
          )}

          {isSyncing && (
            <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-4">
              <div className="glass px-4 py-2 rounded-full border border-indigo-500/30 flex items-center space-x-2 text-xs font-bold text-indigo-400">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                <span>PROCESSING.....</span>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test-qr" element={<TestQR />} />
            <Route 
              path="/login" 
              element={state.currentUser ? <Navigate to="/dashboard" /> : <Login store={{ state, updateState, login }} />} 
            />
            <Route 
              path="/register" 
              element={<Register store={{ state, updateState, register, logout }} />} 
            />
            
            <Route 
              path="/dashboard" 
              element={
                !state.currentUser ? <Navigate to="/login" /> :
                state.currentUser.role === UserRole.PARTICIPANT ? <ParticipantDashboard store={{ state, updateState, logout: handleLogout }} /> :
                state.currentUser.role === UserRole.JUDGE ? <JudgeDashboard store={{ state, updateState, logout: handleLogout }} /> :
                <AdminDashboard store={{ state, updateState, logout: handleLogout }} />
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;