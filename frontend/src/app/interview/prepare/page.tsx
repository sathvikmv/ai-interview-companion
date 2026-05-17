'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, ArrowRight, AlertCircle, CheckCircle, Cpu, Mic, Video, Code, BarChart3 } from 'lucide-react';

export default function InterviewPreparePage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedCandidate = localStorage.getItem('candidate');
    if (storedCandidate) {
      try {
        setCandidate(JSON.parse(storedCandidate));
      } catch {
        setCandidate({ name: 'Candidate', skills: [], experience: 'N/A' });
      }
    }
  }, []);

  const checklist = [
    { id: 'mic', icon: <Mic className="w-4 h-4" />, label: 'Microphone available', desc: 'Needed for voice answers' },
    { id: 'cam', icon: <Video className="w-4 h-4" />, label: 'Camera available', desc: 'Used for behavior analysis' },
    { id: 'conn', icon: <BrainCircuit className="w-4 h-4" />, label: 'Quiet environment', desc: 'Reduces speech recognition errors' },
    { id: 'time', icon: <BarChart3 className="w-4 h-4" />, label: '30–40 minutes free', desc: 'Full interview + coding round' },
  ];

  const rounds = [
    { num: 1, title: 'Introduction', desc: 'Tell the AI about yourself', icon: '👋', dur: '2 min' },
    { num: 2, title: 'Behavioral', desc: 'STAR-method situational questions', icon: '🤔', dur: '5–8 min' },
    { num: 3, title: 'Technical', desc: 'Skill-based technical questions', icon: '🧠', dur: '10–15 min' },
    { num: 4, title: 'Assessment Round', desc: 'Solve a coding problem or a sector-specific case study', icon: '💻', dur: '15–20 min' },
    { num: 5, title: 'Final Evaluation', desc: 'Scores calculated, decision generated', icon: '📊', dur: '1 min' },
  ];

  return (
    <main className="min-h-screen bg-mesh-blue py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span className="text-slate-400">Interview Preparation</span>
          </div>
          <h1 className="text-4xl font-black text-slate-100">
            Ready to <span className="gradient-text-blue">Begin?</span>
          </h1>
          {candidate && (
            <p className="text-slate-400">
              Welcome, <span className="text-blue-400 font-semibold">{candidate.name}</span>.
              {candidate.skills?.length > 0 && ` Questions will be tailored to your ${candidate.skills[0]} experience.`}
            </p>
          )}
        </div>

        {/* Interview Rounds */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-200 mb-5">Interview Structure</h2>
          <div className="space-y-3">
            {rounds.map((round, i) => (
              <div key={round.num} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  {round.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">Round {round.num}: {round.title}</p>
                  <p className="text-xs text-slate-500">{round.desc}</p>
                </div>
                <span className="text-xs text-slate-600 bg-slate-800/60 px-2 py-1 rounded-full whitespace-nowrap">{round.dur}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Interview Checklist */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-200 mb-5">Pre-Interview Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklist.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-auto mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* No candidate warning */}
        {!candidate && (
          <div className="flex items-start gap-3 glass-card p-4 border border-amber-500/30 bg-amber-500/5">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium text-sm">No resume uploaded</p>
              <p className="text-slate-500 text-xs mt-1">
                You can still proceed, but questions won't be personalized.
                <a href="/candidate" className="text-blue-400 hover:underline ml-1">Upload resume</a>
              </p>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="flex gap-4">
          <button
            id="start-interview-session-btn"
            onClick={() => router.push('/interview/live')}
            className="btn-primary flex-1 flex items-center justify-center gap-3 py-5 text-lg rounded-2xl"
          >
            <BrainCircuit className="w-6 h-6" />
            Begin Interview
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.back()}
            className="btn-secondary px-6 py-5 rounded-2xl"
          >
            Go Back
          </button>
        </div>

        <p className="text-center text-xs text-slate-600">
          By proceeding, you agree to AI-powered evaluation and automated proctoring.
        </p>
      </div>
    </main>
  );
}