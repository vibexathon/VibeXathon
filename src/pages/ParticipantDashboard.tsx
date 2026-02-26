
import React, { useState } from 'react';
import { AppState, Submission, SubmissionStatus } from '../types';
import { improveAbstract } from '../geminiService';
import NavbarManagement from '../components/NavbarManagement';

interface ParticipantProps {
  store: {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    logout: () => Promise<void>;
  };
}

const ParticipantDashboard: React.FC<ParticipantProps> = ({ store }) => {
  const team = store.state.teams.find(t => t.id === store.state.currentUser?.teamId);
  const existingSubmission = store.state.submissions.find(s => s.teamId === team?.id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [formData, setFormData] = useState({
    problemId: '',
    theme: '',
    abstract: '',
    githubLink: '',
    readmeLink: '',
    deployLink: '',
    videoLink: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.state.settings.isSubmissionPortalEnabled) return;

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      teamId: team!.id,
      teamName: team!.teamName,
      ...formData,
      submittedAt: Date.now(),
      status: SubmissionStatus.PENDING
    };

    store.updateState(prev => ({
      ...prev,
      submissions: [...prev.submissions, newSubmission]
    }));
    setIsSubmitting(false);
  };

  const handleAIImprove = async () => {
    if (!formData.abstract) return;
    setIsAILoading(true);
    const improved = await improveAbstract(formData.abstract);
    setFormData(prev => ({ ...prev, abstract: improved }));
    setIsAILoading(false);
  };

  if (!team) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      <div className="glass-card p-12 rounded-3xl text-center max-w-md border-t-4 border-t-red-500">
        <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Team Not Found</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your account exists but is not linked to a team. Please logout and register again.
        </p>
        <button
          onClick={store.logout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          Logout & Return Home
        </button>
      </div>
    </div>
  );

  // Check if team is verified
  if (!team.isVerified) return (
    <div className="min-h-screen bg-slate-950">
      <NavbarManagement 
        user={{ id: 'participant-001', role: 'PARTICIPANT' }}
        onLogout={store.logout}
        teamName={team?.teamName}
        isSyncing={false}
        lastSync={new Date()}
        onRefresh={() => {}}
      />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="glass-card p-12 rounded-3xl text-center border-t-4 border-t-amber-500">
          <div className="w-24 h-24 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Verification Pending</h2>
          <p className="text-slate-400 mb-10 font-medium leading-relaxed">
            Your team <span className="text-white font-bold">{team.teamName}</span> is currently under review by our admin team.
          </p>

          <div className="mb-10">
            <p className="text-green-400 font-bold text-sm mb-2">For Major Updates Join The Whatsapp Channel</p>
            <a
              href="https://whatsapp.com/channel/0029Vb7eeY2Au3aVmysx1I1e"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-green-500 hover:underline text-sm font-semibold bg-green-500/10 px-4 py-2 rounded-full transition-colors"
            >
              Join WhatsApp Channel
            </a>
          </div>

          <div className="bg-slate-900/40 rounded-3xl p-8 border border-white/5 text-left mb-10 space-y-6">
            <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] pb-2 border-b border-white/5">Verification Process</h3>
            
            <div className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-black">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Registration Completed</p>
                <p className="text-xs text-slate-500">Team details and payment submitted successfully.</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-black animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400">Admin Review In Progress</p>
                <p className="text-xs text-slate-500">Verifying payment proof and team credentials.</p>
              </div>
            </div>

            <div className="flex space-x-4 opacity-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black">03</div>
              <div>
                <p className="text-sm font-bold text-slate-400">Portal Access Granted</p>
                <p className="text-xs text-slate-600">Full dashboard and submission features unlocked.</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-bold text-indigo-400 mb-1">What's Next?</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Once verified, you'll receive full access to submit your hackathon project, track progress, and compete for prizes. This usually takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={store.logout}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/5"
            >
              Logout
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const isPortalEnabled = store.state.settings.isSubmissionPortalEnabled;

  return (
    <div className="min-h-screen bg-slate-950">
      <NavbarManagement 
        user={{ id: 'participant-001', role: 'PARTICIPANT' }}
        onLogout={store.logout}
        teamName={team?.teamName}
        isSyncing={false}
        lastSync={new Date()}
        onRefresh={() => {}}
      />
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-2">
         <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Project Hub</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Operational Command & Control</p>
         </div>
         <div className="flex items-center space-x-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status:</span>
            <div className={`px-4 py-1 rounded-full border text-[10px] font-black tracking-[0.2em] ${isPortalEnabled ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
               {isPortalEnabled ? 'SUBMISSIONS OPEN' : 'PORTAL LOCKED'}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-3xl">
            <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">Team Roster</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Designation</p>
                <p className="text-xl font-black text-white">{team.teamName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Leader Node</p>
                <p className="text-sm font-bold text-slate-200">{team.leaderName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-3">Collaborators</p>
                <div className="space-y-2">
                  {team.members.map((m, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                      <span className="text-xs font-bold text-slate-300">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card p-10 rounded-[2.5rem] min-h-[400px] flex flex-col justify-center items-center text-center relative overflow-hidden group">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-full h-1 brand-gradient"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-colors"></div>

            {existingSubmission ? (
              <div className="space-y-8 animate-in zoom-in-95 duration-500 w-full">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500 ${
                  existingSubmission.status === SubmissionStatus.SELECTED ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 glow-indigo' :
                  'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                }`}>
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white mb-2">Project Analyzed</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Evaluation Score Matrix Generated</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 inline-block px-12">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Aggregated Score</p>
                   <p className="text-6xl font-black text-indigo-400 tabular-nums">
                     {existingSubmission.totalScore ?? '--'}<span className="text-xl text-slate-700 font-black">/100</span>
                   </p>
                </div>

                {/* Detailed Score Breakdown */}
                {existingSubmission.scores && (
                  <div className="max-w-3xl mx-auto bg-slate-900/30 border border-white/5 rounded-3xl p-8">
                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-6 text-center">Score Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">Problem Understanding</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.problemUnderstanding}<span className="text-xs text-slate-600">/15</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">Technical Implementation</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.technicalImplementation}<span className="text-xs text-slate-600">/25</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">Innovation</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.innovation}<span className="text-xs text-slate-600">/15</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">AI Rigor</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.aiRigor}<span className="text-xs text-slate-600">/15</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">Feasibility</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.feasibility}<span className="text-xs text-slate-600">/10</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">Presentation</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.presentation}<span className="text-xs text-slate-600">/10</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">Demo</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.demo}<span className="text-xs text-slate-600">/10</span></span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-bold">Bonus</span>
                          <span className="text-lg font-black text-white">{existingSubmission.scores.bonus}<span className="text-xs text-slate-600">/5</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {existingSubmission.feedback && (
                  <div className="max-w-md mx-auto p-5 bg-white/5 rounded-2xl border border-white/10 italic text-slate-400 text-sm">
                    "{existingSubmission.feedback}"
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-indigo-500/5 text-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto border border-indigo-500/10">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="max-w-md">
                  <h2 className="text-4xl font-black text-white mb-4">Launch Project</h2>
                  <p className="text-slate-400 font-medium">Link your repository, provide an abstract and demonstrate your impact to the judging panel.</p>
                </div>
                {isPortalEnabled ? (
                  <button 
                    onClick={() => setIsSubmitting(true)}
                    className="group bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-2xl shadow-2xl shadow-indigo-600/20 transition-all flex items-center space-x-3 mx-auto"
                  >
                    <span>SUBMIT NOW</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                ) : (
                  <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl text-red-400 text-xs font-black uppercase tracking-[0.2em]">
                    Submissions are currently locked
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 py-12">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsSubmitting(false)}></div>
          <div className="glass w-full max-w-4xl p-10 md:p-14 rounded-[3rem] relative max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-10">
               <div>
                 <h2 className="text-3xl font-black text-white tracking-tight">Project Submission</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Step into the final round</p>
               </div>
               <button onClick={() => setIsSubmitting(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Problem Reference ID</label>
                  <input 
                    type="text" required
                    value={formData.problemId}
                    onChange={(e) => setFormData({ ...formData, problemId: e.target.value })}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="e.g., PS-AI-01"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Domain</label>
                  <select 
                    required
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none"
                  >
                    <option value="">Select Domain</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="smart city and sustainability">smart city & sustainability</option>
                    <option value="open innovation">open innovation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GitHub Repository</label>
                  <input type="url" required value={formData.githubLink} onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none" placeholder="https://github.com/..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Live Demo / Deployment</label>
                  <input type="url" required value={formData.deployLink} onChange={(e) => setFormData({ ...formData, deployLink: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none" placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="flex-grow space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Abstract</label>
                    <button 
                      type="button" 
                      onClick={handleAIImprove} 
                      disabled={isAILoading || !formData.abstract}
                      className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 disabled:opacity-30 transition-all flex items-center space-x-1.5"
                    >
                      {isAILoading ? (
                        <div className="w-2.5 h-2.5 border border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : <span></span>}
                    </button>
                  </div>
                  <textarea 
                    required rows={8}
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    className="w-full h-[calc(100%-24px)] bg-slate-900 border border-white/5 rounded-3xl px-6 py-5 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none font-medium leading-relaxed"
                    placeholder="Describe your solution's core architecture and innovation..."
                  />
                </div>
                
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setIsSubmitting(false)} className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Discard</button>
                  <button type="submit" className="bg-indigo-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-[0.98]">Confirm Submission</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
