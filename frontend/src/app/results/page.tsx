'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import ScoreCard from '@/components/ScoreCard';
import { getInterviewReport } from '@/lib/api';
import {
    BrainCircuit, CheckCircle, XCircle, Loader2, Download, Home,
    MessageSquare, Award, Star, Briefcase, RefreshCw, User, ArrowLeft
} from 'lucide-react';

interface Report {
    candidate: {
        id: string; name: string; email: string;
        skills: string[]; projects: string[];
        education: string; experience: string;
        compatibility_score: number;
    };
    transcript: Array<{ role: string; text: string }>;
    summary: string;
    highlights: string[];
    scores: Record<string, number>;
    coding_score: number;
    hiring_compatibility: number;
    recommended_roles: string[];
    decision: string;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'details'>('overview');

    useEffect(() => {
        const sessionId = searchParams.get('session') || localStorage.getItem('sessionId');
        if (!sessionId) {
            setError('No session ID found.');
            setLoading(false);
            return;
        }

        getInterviewReport(sessionId)
            .then(data => {
                setReport(data);
                setLoading(false);
            })
            .catch(e => {
                setError(e.message || 'Failed to load report.');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-mesh-blue flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto animate-pulse">
                        <BrainCircuit className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-slate-300 font-medium">Generating Your Report...</p>
                    <p className="text-sm text-slate-500">Analyzing all interview dimensions</p>
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen bg-mesh-blue flex items-center justify-center p-6">
                <div className="glass-card p-8 text-center space-y-4 max-w-md">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto" />
                    <p className="text-red-300 font-semibold">{error || 'Report not found'}</p>
                    <button onClick={() => router.push('/')} className="btn-secondary flex items-center gap-2 mx-auto">
                        <Home className="w-4 h-4" /> Go Home
                    </button>
                </div>
            </div>
        );
    }

    const isSelected = report.decision === 'SELECTED';

    return (
        <main className="min-h-screen bg-mesh-purple py-10 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-blue-400" />
                        <span className="font-bold text-slate-200">Interview Report</span>
                    </div>
                </div>

                {/* Decision Banner */}
                <div className={`relative overflow-hidden rounded-2xl p-8 border ${isSelected
                        ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/30 border-emerald-500/40'
                        : 'bg-gradient-to-r from-red-900/30 to-rose-900/20 border-red-500/30'
                    } animate-fadeIn`}>
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-64 h-full opacity-5 ${isSelected ? 'bg-emerald-400' : 'bg-red-400'
                        }`} style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0% 100%)' }} />

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isSelected ? 'bg-emerald-500/30' : 'bg-red-500/30'
                            }`}>
                            {isSelected
                                ? <CheckCircle className="w-10 h-10 text-emerald-400" />
                                : <XCircle className="w-10 h-10 text-red-400" />
                            }
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-sm text-slate-400 font-medium mb-1">Final Decision</p>
                            <h1 className={`text-5xl font-black tracking-wider ${isSelected ? 'text-emerald-300' : 'text-red-300'
                                }`}>
                                {report.decision}
                            </h1>
                            <p className="text-slate-300 mt-2">
                                {report.candidate.name} • Compatibility Score:{' '}
                                <span className="font-bold text-white">{Math.round(report.hiring_compatibility)}/100</span>
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-white">{Math.round(report.hiring_compatibility)}</div>
                            <div className="text-xs text-slate-400 font-medium">/ 100</div>
                            <div className="text-xs text-slate-500 mt-1">Compatibility</div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <div className="lg:col-span-1">
                        <ScoreCard
                            scores={report.scores}
                            codingScore={report.coding_score}
                            compatibility={report.hiring_compatibility}
                            decision={report.decision}
                            candidateName={report.candidate.name}
                        />

                        {/* Recommended Roles */}
                        <div className="glass-card p-5 mt-4 space-y-3">
                            <p className="section-header">Recommended Roles</p>
                            {report.recommended_roles.map(role => (
                                <div key={role} className="flex items-center gap-2 text-sm text-slate-300">
                                    <Briefcase className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                    {role}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Report */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Tabs */}
                        <div className="flex gap-1 glass-card p-1">
                            {[
                                { id: 'overview', label: 'Overview', icon: Award },
                                { id: 'transcript', label: 'Transcript', icon: MessageSquare },
                                { id: 'details', label: 'Candidate', icon: User },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-4 animate-fadeIn">
                                {/* Summary */}
                                <div className="glass-card p-6 space-y-3">
                                    <p className="section-header">Performance Summary</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
                                </div>

                                {/* Highlights */}
                                <div className="glass-card p-6 space-y-3">
                                    <p className="section-header">Interview Highlights</p>
                                    <div className="space-y-2">
                                        {report.highlights.map((h, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm">
                                                <Star className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-300">{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Score Overview Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(report.scores).map(([key, val]) => (
                                        <div key={key} className="glass-card p-4 text-center">
                                            <p className={`text-2xl font-black ${val >= 85 ? 'text-emerald-400' : val >= 70 ? 'text-blue-400' : 'text-amber-400'
                                                }`}>{Math.round(val)}</p>
                                            <p className="text-xs text-slate-500 mt-1 capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="glass-card p-4 text-center border border-cyan-500/20">
                                        <p className={`text-2xl font-black text-cyan-400`}>{Math.round(report.coding_score)}</p>
                                        <p className="text-xs text-slate-500 mt-1">Coding Score</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transcript Tab */}
                        {activeTab === 'transcript' && (
                            <div className="glass-card overflow-hidden animate-fadeIn">
                                <div className="px-5 py-3 border-b border-slate-700/50">
                                    <p className="text-sm font-semibold text-slate-200">Full Interview Transcript</p>
                                    <p className="text-xs text-slate-500">{report.transcript.length} exchanges</p>
                                </div>
                                <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {report.transcript.map((entry, i) => (
                                        <div key={i} className={`flex gap-3 ${entry.role === 'candidate' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${entry.role === 'interviewer'
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                                }`}>
                                                {entry.role === 'interviewer' ? 'AI' : 'C'}
                                            </div>
                                            <div className={`max-w-[80%] ${entry.role === 'candidate' ? 'items-end' : ''}`}>
                                                <p className="text-xs text-slate-500 mb-1">
                                                    {entry.role === 'interviewer' ? 'ARIA (AI Interviewer)' : 'Candidate'}
                                                </p>
                                                <div className={`px-4 py-3 rounded-2xl text-sm ${entry.role === 'interviewer'
                                                        ? 'bg-slate-800/60 border border-slate-700/40 text-slate-200'
                                                        : 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                                                    }`}>
                                                    {entry.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="glass-card p-6 space-y-4">
                                    <p className="section-header">Candidate Profile</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Name</p>
                                            <p className="text-slate-200 font-medium">{report.candidate.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Email</p>
                                            <p className="text-slate-200 font-medium">{report.candidate.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Education</p>
                                            <p className="text-slate-200 font-medium">{report.candidate.education}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Experience</p>
                                            <p className="text-slate-200 font-medium">{report.candidate.experience}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-2 text-sm">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {report.candidate.skills.map(s => (
                                                <span key={s} className="skill-tag">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-2 text-sm">Projects</p>
                                        <div className="space-y-1">
                                            {report.candidate.projects.map((p, i) => (
                                                <p key={i} className="text-sm text-slate-300">• {p}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => router.push('/')}
                                className="btn-secondary flex items-center gap-2 flex-1"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </button>
                            <button
                                onClick={() => router.push('/recruiter')}
                                className="btn-primary flex items-center gap-2 flex-1"
                            >
                                <BrainCircuit className="w-4 h-4" />
                                Recruiter Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
