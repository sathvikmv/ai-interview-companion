'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CodingEditor from '@/components/CodingEditor';
import { evaluateCode, getCodingProblems } from '@/lib/api';
import {
    Code, CheckCircle, XCircle, BrainCircuit, Loader2, ChevronRight,
    AlertTriangle, BarChart3, Terminal, Clock, Lightbulb, ArrowRight
} from 'lucide-react';

interface EvalResult {
    correctness: number;
    efficiency: number;
    readability: number;
    overall_coding_score: number;
    feedback: string;
    complexity: string;
    syntax_valid: boolean;
    test_results: Array<{ name: string; passed: boolean; note: string }>;
}

interface Problem {
    id: string;
    title: string;
    difficulty: string;
    description: string;
    examples: string;
    starter_code: Record<string, string>;
}

export default function CodingPage() {
    const router = useRouter();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes

    useEffect(() => {
        setSessionId(localStorage.getItem('sessionId'));
        getCodingProblems()
            .then(data => {
                setProblems(data.problems || []);
                if (data.problems?.length > 0) {
                    // Pick a random problem
                    const idx = Math.floor(Math.random() * data.problems.length);
                    setSelectedProblem(data.problems[idx]);
                }
            })
            .catch(console.error);
    }, []);

    // Countdown Timer  
    useEffect(() => {
        if (submitted) return;
        const interval = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(interval); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [submitted]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (code: string, language: string) => {
        if (!sessionId) {
            // Use a demo session
            const demoId = 'demo-session-' + Date.now();
            localStorage.setItem('sessionId', demoId);
            setSessionId(demoId);
        }

        setLoading(true);
        try {
            const result = await evaluateCode(
                sessionId || 'demo',
                code,
                language,
                selectedProblem?.id || 'default'
            );
            setEvalResult(result);
            setSubmitted(true);
            localStorage.setItem('codingScore', result.overall_coding_score.toString());
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const goToResults = () => {
        const sid = sessionId || localStorage.getItem('sessionId');
        if (sid) {
            router.push(`/results?session=${sid}`);
        } else {
            router.push('/results');
        }
    };

    const difficultyColor = (d: string) => {
        if (d === 'Easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (d === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    return (
        <main className="h-screen bg-slate-950 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-slate-200">Assessment Round</span>
                    {selectedProblem && (
                        <>
                            <span className="text-slate-600">|</span>
                            <span className="text-sm text-slate-300">{selectedProblem.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${difficultyColor(selectedProblem.difficulty)}`}>
                                {selectedProblem.difficulty}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className={`flex items-center gap-2 text-sm font-mono ${timeLeft < 300 ? 'text-red-400' : 'text-slate-300'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>

                    {submitted && (
                        <button
                            id="go-to-results-btn"
                            onClick={goToResults}
                            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
                        >
                            View Results
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Problem Description */}
                <div className="w-[38%] flex flex-col overflow-y-auto custom-scrollbar bg-slate-900/40 border-r border-slate-800/40 p-6 space-y-5">
                    {selectedProblem ? (
                        <>
                            <div>
                                <h2 className="text-lg font-bold text-slate-100 mb-1">{selectedProblem.title}</h2>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${difficultyColor(selectedProblem.difficulty)}`}>
                                    {selectedProblem.difficulty}
                                </span>
                            </div>

                            <div className="glass-card p-4 space-y-3">
                                <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-cyan-400" />
                                    Problem Description
                                </p>
                                <p className="text-sm text-slate-400 leading-relaxed">{selectedProblem.description}</p>
                            </div>

                            <div className="glass-card p-4 space-y-3">
                                <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-blue-400" />
                                    Examples
                                </p>
                                <pre className="text-xs text-emerald-400 bg-slate-950/60 p-3 rounded-lg whitespace-pre-wrap font-mono">
                                    {selectedProblem.examples}
                                </pre>
                            </div>

                            {/* Hints */}
                            <div className="glass-card p-4 space-y-2 border border-amber-500/20 bg-amber-500/5">
                                <p className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    Hints
                                </p>
                                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                                    <li>Consider edge cases like empty arrays or null inputs</li>
                                    <li>Think about time and space complexity</li>
                                    <li>Use descriptive variable names for readability</li>
                                </ul>
                            </div>

                            {/* Problem selector */}
                            {problems.length > 1 && (
                                <div>
                                    <p className="section-header">Switch Problem</p>
                                    <div className="space-y-2">
                                        {problems.filter(p => p.id !== selectedProblem.id).slice(0, 3).map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setSelectedProblem(p); setEvalResult(null); setSubmitted(false); }}
                                                className="w-full text-left glass-card px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
                                            >
                                                {p.title}
                                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${p.difficulty === 'Easy' ? 'text-emerald-400' : 'text-amber-400'
                                                    }`}>{p.difficulty}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Right: Editor + Results */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden min-h-0">
                        <CodingEditor
                            onSubmit={handleSubmit}
                            isLoading={loading}
                            problem={selectedProblem || undefined}
                        />
                    </div>

                    {/* Evaluation Results */}
                    {evalResult && (
                        <div className="h-56 border-t border-slate-800/50 overflow-y-auto custom-scrollbar bg-slate-900/60 p-4 space-y-4 flex-shrink-0 animate-slideUp">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-semibold text-slate-200">Evaluation Results</span>
                                </div>
                                <div className={`text-xl font-black ${evalResult.overall_coding_score >= 80 ? 'text-emerald-400' :
                                    evalResult.overall_coding_score >= 60 ? 'text-blue-400' : 'text-amber-400'
                                    }`}>
                                    {evalResult.overall_coding_score}/100
                                </div>
                            </div>

                            {/* Score meters inline */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Correctness', val: evalResult.correctness },
                                    { label: 'Efficiency', val: evalResult.efficiency },
                                    { label: 'Readability', val: evalResult.readability },
                                ].map(s => (
                                    <div key={s.label} className="glass-card p-2 text-center">
                                        <p className={`text-lg font-bold ${s.val >= 80 ? 'text-emerald-400' : s.val >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>{s.val}</p>
                                        <p className="text-xs text-slate-500">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Feedback */}
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <span className="text-blue-400 font-medium">Complexity: </span>{evalResult.complexity} • {evalResult.feedback}
                            </p>

                            {/* Test Cases */}
                            <div className="flex flex-wrap gap-2">
                                {evalResult.test_results.map((tc, i) => (
                                    <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${tc.passed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'
                                        }`}>
                                        {tc.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        <span className="hidden sm:inline">{tc.name.substring(0, 30)}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={goToResults}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                            >
                                <BrainCircuit className="w-4 h-4" />
                                Generate Final Report & Decision
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}