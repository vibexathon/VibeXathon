import React, { useState, useMemo } from 'react';
import { AppState, Submission, SubmissionStatus, SubmissionScores } from '../types';
import { analyzeSubmission } from '../geminiService';
import NavbarManagement from '../components/NavbarManagement';

interface JudgeProps {
  store: {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    logout: () => Promise<void>;
  };
}

const INITIAL_SCORES: SubmissionScores = {
  problemUnderstanding: 0,
  technicalImplementation: 0,
  innovation: 0,
  aiRigor: 0,
  feasibility: 0,
  presentation: 0,
  demo: 0,
  bonus: 0
};

const JudgeDashboard: React.FC<JudgeProps> = ({ store }) => {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState<SubmissionScores>(INITIAL_SCORES);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeDomain, setActiveDomain] = useState<string>('All');

  const themes = ['AI/ML', 'smart city and sustainability', 'open innovation'];

  const filteredSubmissions = useMemo(() => {
    const subs = store.state.submissions.filter(s => s.status === SubmissionStatus.SELECTED);
    return activeDomain === 'All' ? subs : subs.filter(s => s.theme === activeDomain);
  }, [store.state.submissions, activeDomain]);

  const selectedSub = useMemo(() => {
    return store.state.submissions.find(s => s.id === selectedSubId);
  }, [selectedSubId, store.state.submissions]);

  const handleJudge = (status: SubmissionStatus) => {
    if (!selectedSub) return;
    
    const totalScore = Object.values(scores).reduce((a, b) => (a as number) + (b as number), 0);
    
    store.updateState(prev => ({
      ...prev,
      submissions: prev.submissions.map(s => 
        s.id === selectedSubId 
          ? { ...s, status, feedback, totalScore, scores } 
          : s
      )
    }));
    
    setSelectedSubId(null);
    setFeedback('');
    setScores(INITIAL_SCORES);
  };

  const runAIAnalysis = async (sub: Submission) => {
    setIsAiLoading(true);
    try {
      const analysis = await analyzeSubmission(sub);
      setAiAnalysis(analysis);
    } catch (error) {
      setAiAnalysis('AI analysis failed. Please try again.');
    }
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <NavbarManagement 
        user={{ id: 'judge-001', role: 'JUDGE' }}
        onLogout={store.logout}
        isSyncing={false}
        lastSync={new Date()}
        onRefresh={() => {}}
      />
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Judging Panel</h1>
              <p className="text-slate-400">Evaluating: <span className="text-indigo-400 font-bold">{activeDomain}</span></p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {themes.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveDomain(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeDomain === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass rounded-2xl overflow-hidden flex flex-col h-[75vh]">
              <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                <span className="font-bold text-xs tracking-widest text-slate-400 uppercase">Queue</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{filteredSubmissions.length}</span>
              </div>
              <div className="overflow-y-auto flex-grow divide-y divide-slate-800">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 italic">No pending submissions in this domain.</div>
                ) : (
                  filteredSubmissions.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setSelectedSubId(sub.id); setAiAnalysis(null); setScores(INITIAL_SCORES); }}
                      className={`w-full text-left p-6 hover:bg-slate-800/50 transition-colors ${selectedSubId === sub.id ? 'bg-indigo-600/10 border-l-4 border-indigo-500' : ''}`}
                    >
                      <p className="font-bold text-slate-100">{sub.teamName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase font-bold">{sub.theme}</span>
                        <span className="text-[10px] text-slate-500">{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2 glass rounded-2xl p-8 overflow-y-auto h-[75vh]">
              {selectedSub ? (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-800 pb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedSub.teamName}</h2>
                      <div className="flex items-center space-x-3">
                        <span className="text-indigo-400 text-sm font-bold">{selectedSub.problemId}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 text-sm uppercase tracking-tighter">{selectedSub.theme}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       <a href={selectedSub.githubLink} target="_blank" className="flex items-center space-x-2 px-3 py-2 bg-slate-800 rounded-lg hover:text-indigo-400 border border-slate-700 text-xs font-bold transition-all hover:border-indigo-500/50">
                         <span>GitHub</span>
                       </a>
                       <a href={selectedSub.videoLink} target="_blank" className="flex items-center space-x-2 px-3 py-2 bg-slate-800 rounded-lg hover:text-indigo-400 border border-slate-700 text-xs font-bold transition-all hover:border-indigo-500/50">
                         <span>Video</span>
                       </a>
                       <a href={selectedSub.deployLink} target="_blank" className="flex items-center space-x-2 px-3 py-2 bg-slate-800 rounded-lg hover:text-indigo-400 border border-slate-700 text-xs font-bold transition-all hover:border-indigo-500/50">
                         <span>Demo</span>
                       </a>
                    </div>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">✨</span>
                        <h3 className="font-bold text-indigo-300">AI Quick Assessment</h3>
                      </div>
                      {!aiAnalysis && (
                        <button 
                          onClick={() => runAIAnalysis(selectedSub)}
                          disabled={isAiLoading}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          {isAiLoading ? 'Analyzing...' : 'Generate Review'}
                        </button>
                      )}
                    </div>
                    {aiAnalysis && <div className="text-slate-300 text-sm leading-relaxed">{aiAnalysis}</div>}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(scores).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={value}
                            onChange={(e) => setScores(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/40"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Feedback</label>
                      <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                        placeholder="Summarize your evaluation..."
                      />
                    </div>

                    <button 
                      onClick={() => handleJudge(SubmissionStatus.SELECTED)}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                    >
                      Submit Final Grade
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                  <p className="font-medium">Select a submission from the queue to start judging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;