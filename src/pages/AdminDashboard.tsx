
import React, { useState, useMemo } from 'react';
import { AppState, Team, Submission } from '../types';
import NavbarManagement from '../components/NavbarManagement';
import { downloadReceipt } from '../receiptService';

interface AdminProps {
  store: {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    logout: () => Promise<void>;
  };
}

const AdminDashboard: React.FC<AdminProps> = ({ store }) => {
  const { state, updateState } = store;
  const [view, setView] = useState<'registry' | 'leaderboard' | 'approvals'>('approvals');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const themes = ['AI/ML', 'smart city and sustainability', 'open innovation'];

  const pendingApprovals = useMemo(() => {
    return state.teams.filter(t => !t.isVerified);
  }, [state.teams]);

  const leaderboardData = useMemo(() => {
    const results: Record<string, Submission[]> = {};
    themes.forEach(theme => {
      results[theme] = state.submissions
        .filter(s => s.theme === theme && s.totalScore !== undefined)
        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
        .slice(0, 3);
    });
    return results;
  }, [state.submissions]);

  const approveTeam = (teamId: string) => {
    if (confirm('Confirm payment verification and grant portal access to this team?')) {
      updateState(prev => ({
        ...prev,
        teams: prev.teams.map(t => t.id === teamId ? { ...t, isVerified: true, paymentVerifiedAt: Date.now() } : t)
      }));
    }
  };

  const rejectTeam = (teamId: string) => {
    if (confirm('Are you sure you want to REJECT this registration? This will permanently delete the request. (The team can re-register if needed).')) {
      updateState(prev => ({
        ...prev,
        teams: prev.teams.filter(t => t.id !== teamId),
        submissions: prev.submissions.filter(s => s.teamId !== teamId)
      }));
    }
  };

  const toggleSubmissionPortal = () => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, isSubmissionPortalEnabled: !prev.settings.isSubmissionPortalEnabled }
    }));
  };

  const toggleJudgePortal = () => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, isJudgePortalEnabled: !prev.settings.isJudgePortalEnabled }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <NavbarManagement 
        user={{ id: 'admin-001', role: 'ADMIN' }}
        onLogout={store.logout}
        isSyncing={false}
        lastSync={new Date()}
        onRefresh={() => {}}
      />
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Verification Center</h1>
          <p className="text-slate-400">Admin Command & Control</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-xl">
           <button 
             onClick={() => setView('approvals')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${view === 'approvals' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
           >
             <span>Requests</span>
             {pendingApprovals.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{pendingApprovals.length}</span>}
           </button>
           <button 
             onClick={() => setView('leaderboard')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'leaderboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
           >
             Leaderboard
           </button>
           <button 
             onClick={() => setView('registry')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'registry' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
           >
             Full Registry
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex flex-col justify-between border-l-4 border-l-indigo-500">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Submission Portal</p>
          <button 
            onClick={toggleSubmissionPortal}
            className={`w-full py-3 rounded-lg text-xs font-black transition-all border ${state.settings.isSubmissionPortalEnabled ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}
          >
            {state.settings.isSubmissionPortalEnabled ? 'PORTAL ACTIVE' : 'PORTAL CLOSED'}
          </button>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col justify-between border-l-4 border-l-purple-500">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Judge Portal</p>
          <button 
            onClick={toggleJudgePortal}
            className={`w-full py-3 rounded-lg text-xs font-black transition-all border ${state.settings.isJudgePortalEnabled ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}
          >
            {state.settings.isJudgePortalEnabled ? 'JUDGING ACTIVE' : 'JUDGING CLOSED'}
          </button>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-l-slate-400">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Total Verified</p>
          <div className="text-3xl font-black text-white">{state.teams.filter(t => t.isVerified).length}<span className="text-sm text-slate-500 font-normal"> / {state.teams.length} Teams</span></div>
        </div>
      </div>

      {view === 'approvals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
              <span>Pending Verification Queue</span>
            </h2>
            <p className="text-xs text-slate-500 italic">Verify team roster and payment proof before approval.</p>
          </div>
          
          {pendingApprovals.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-slate-500 font-medium">No pending registration requests at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingApprovals.map(team => (
                <div key={team.id} className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Column 1: Team Identity & IEEE */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Team Identity</p>
                        <h3 className="text-xl font-bold text-white leading-tight">{team.teamName}</h3>
                        <p className="text-xs text-indigo-400 font-medium mt-1">Leader: {team.leaderName}</p>
                        <p className="text-xs text-slate-500">{team.leaderContact}</p>
                      </div>
                      <div className="space-y-2">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border ${team.isIeeeMember ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                          {team.isIeeeMember ? 'IEEE MEMBER' : 'GENERAL'}
                        </span>
                        {team.ieeeNumber && (
                          <div className="bg-indigo-950/30 p-2 rounded border border-indigo-500/20">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Verified IEEE ID</p>
                            <p className="text-sm font-black text-indigo-300">{team.ieeeNumber}</p>
                          </div>
                        )}
                        {team.ieeeProofUrl && (
                          <div className="mt-2">
                            <a href={team.ieeeProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 underline font-bold hover:text-indigo-300">
                              View IEEE Card/Profile Proof
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Full Roster Verification */}
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Team Roster ({team.members.length})</p>
                      <div className="space-y-3 max-h-[120px] overflow-y-auto pr-2">
                        {team.members.map((m, i) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-xs font-bold text-slate-300">{m.name}</span>
                            <span className="text-[10px] text-slate-500 truncate">{m.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Payment Ref */}
                    <div className="space-y-4">
                       <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Payment Reference</p>
                        <div className="bg-slate-900 p-2 rounded font-mono text-xs text-indigo-300 truncate">
                          {team.paymentId}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Amount Recieved</p>
                        <p className="text-xl font-black text-white">₹{team.amountPaid}</p>
                      </div>
                      {team.receiptData && (
                        <div>
                          <button
                            onClick={() => downloadReceipt(team.receiptData!)}
                            className="text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-bold py-1.5 px-3 rounded border border-indigo-500/30 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span>Download Receipt</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Column 4: Evidence & Actions */}
                    <div className="flex flex-col justify-between gap-4">
                      {team.paymentScreenshot ? (
                        <div className="flex items-center space-x-3">
                           <button 
                            onClick={() => setSelectedScreenshot(team.paymentScreenshot!)}
                            className="group relative h-20 w-20 overflow-hidden rounded-xl border-2 border-indigo-500/20 bg-slate-800"
                          >
                            {team.paymentScreenshot.startsWith('data:application/pdf') ? (
                              <div className="h-full w-full flex items-center justify-center bg-slate-800">
                                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                              </div>
                            ) : (
                              <img src={team.paymentScreenshot} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="Proof" />
                            )}
                            <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                          </button>
                          <span className="text-[10px] text-slate-500 font-bold uppercase cursor-help underline decoration-dotted" title="Click image to expand">Evidence Attached</span>
                        </div>
                      ) : (
                        <div className="h-20 w-20 bg-red-500/10 rounded-xl border-2 border-dashed border-red-500/20 flex items-center justify-center">
                          <span className="text-[8px] text-red-400 font-bold uppercase text-center px-2">Missing Screenshot</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => approveTeam(team.id)}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 rounded-lg shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span>Verify & Approve</span>
                        </button>
                        <button 
                          onClick={() => rejectTeam(team.id)}
                          className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold py-2 rounded-lg border border-red-500/20 transition-all"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'leaderboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {themes.map(theme => (
            <div key={theme} className="glass rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-slate-800/80 p-4 border-b border-slate-700">
                <h3 className="font-black text-xs tracking-widest text-indigo-400 uppercase text-center">{theme}</h3>
              </div>
              <div className="p-4 flex-grow">
                {leaderboardData[theme].length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">Awaiting evaluation results...</div>
                ) : (
                  <div className="space-y-4">
                    {leaderboardData[theme].map((sub, idx) => (
                      <div key={sub.id} className={`p-5 rounded-xl border flex items-center justify-between transition-all ${idx === 0 ? 'bg-indigo-600/20 border-indigo-500/50 scale-105' : 'bg-slate-800/40 border-slate-700/50'}`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : idx === 1 ? 'bg-slate-300 text-black' : 'bg-orange-600 text-white'}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{sub.teamName}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{sub.problemId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-indigo-400">{sub.totalScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'registry' && (
        <div className="glass rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-800/30">
            <h2 className="text-xl font-bold text-white">Consolidated Team Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-800">
                  <th className="px-6 py-4">Team Details</th>
                  <th className="px-6 py-4">Membership</th>
                  <th className="px-6 py-4">Portal Access</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {state.teams.map(team => (
                  <tr key={team.id} className="hover:bg-slate-800/30 group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{team.teamName}</p>
                      <p className="text-xs text-slate-500">{team.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit mb-1 ${team.isIeeeMember ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'}`}>
                          {team.isIeeeMember ? 'IEEE' : 'GENERAL'}
                        </span>
                        {team.ieeeNumber && <span className="text-[10px] text-slate-500 font-mono">{team.ieeeNumber}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {team.isVerified ? (
                        <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold border border-green-500/20 uppercase tracking-widest">ACTIVE</span>
                      ) : (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded font-bold border border-yellow-500/20 uppercase tracking-widest">AWAITING</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      {team.receiptData && (
                        <button 
                          onClick={() => downloadReceipt(team.receiptData!)} 
                          className="text-indigo-400 hover:text-indigo-300 p-2 transition-colors"
                          title="Download Receipt"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                      )}
                      <button onClick={() => rejectTeam(team.id)} className="text-slate-600 hover:text-red-500 p-2 transition-colors" title="Reject Team">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedScreenshot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedScreenshot(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="absolute -top-12 right-0 flex items-center space-x-4">
               <button 
                 onClick={() => setSelectedScreenshot(null)}
                 className="text-white hover:text-indigo-400 p-2 text-sm font-bold flex items-center space-x-2 bg-slate-800 rounded-lg px-4 border border-slate-700"
               >
                 <span>Dismiss</span>
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            {selectedScreenshot.startsWith('data:application/pdf') ? (
              <object data={selectedScreenshot} type="application/pdf" className="w-full h-[80vh] rounded-2xl shadow-2xl border border-white/10 bg-white">
                <div className="bg-slate-800 p-8 rounded-2xl text-center h-full flex flex-col items-center justify-center">
                  <p className="text-white mb-4">Your browser does not support inline PDFs.</p>
                  <a href={selectedScreenshot} download="receipt.pdf" className="text-indigo-400 hover:underline font-bold">Download PDF</a>
                </div>
              </object>
            ) : (
              <img src={selectedScreenshot} className="w-full rounded-2xl shadow-2xl border border-white/10" alt="Evidence Viewer" />
            )}
            <p className="text-center text-slate-500 text-xs mt-4 uppercase tracking-widest font-bold">Payment Evidence Viewer • ESC to Close</p>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
