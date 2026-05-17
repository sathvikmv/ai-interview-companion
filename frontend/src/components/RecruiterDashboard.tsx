'use client';

import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    email: string;
    skills: string[];
    education: string;
    experience: string;
    session_id?: string;
    session_status?: string;
    compatibility_score?: number;
    decision?: string;
    scores?: Record<string, number>;
}

interface RecruiterDashboardProps {
    candidates: Candidate[];
    analytics?: any;
    onViewReport?: (sessionId: string) => void;
}

function CandidateCard({ candidate, onViewReport }: { candidate: Candidate; onViewReport?: (sid: string) => void }) {
    const score = candidate.compatibility_score || 0;
    const decision = candidate.decision || 'PENDING';

    return (
        <div className="glass-card-hover p-5 space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-100 text-sm">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.email}</p>
                    </div>
                </div>
                <span className={
                    decision === 'SELECTED' ? 'badge-selected' :
                        decision === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                }>
                    {decision}
                </span>
            </div>

            {/* Info */}
            <div className="text-xs text-slate-500 space-y-1">
                <p>🎓 {candidate.education?.split(',')[0] || 'N/A'}</p>
                <p>💼 {candidate.experience}</p>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
                {(candidate.skills || []).slice(0, 4).map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                ))}
                {candidate.skills?.length > 4 && (
                    <span className="px-2 py-1 rounded-full text-xs text-slate-500">+{candidate.skills.length - 4}</span>
                )}
            </div>

            {/* Score bar */}
            {score > 0 && (
                <div>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500">Compatibility</span>
                        <span className={`font-bold ${score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-blue-400' : 'text-amber-400'}`}>
                            {Math.round(score)}/100
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                                    score >= 65 ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                                        'bg-gradient-to-r from-amber-500 to-orange-400'
                                }`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            {candidate.session_id && onViewReport && (
                <button
                    onClick={() => onViewReport(candidate.session_id!)}
                    className="w-full btn-secondary text-sm py-2"
                >
                    View Full Report
                </button>
            )}
        </div>
    );
}

export default function RecruiterDashboard({ candidates, analytics, onViewReport }: RecruiterDashboardProps) {
    const stats = analytics?.summary || {};

    const statCards = [
        {
            label: 'Total Candidates',
            value: stats.total_candidates || candidates.length,
            icon: '👥',
            color: 'from-blue-600/20 to-blue-500/5 border-blue-500/20',
        },
        {
            label: 'Interviews Done',
            value: stats.total_interviews || 0,
            icon: '🎙️',
            color: 'from-indigo-600/20 to-indigo-500/5 border-indigo-500/20',
        },
        {
            label: 'Selected',
            value: stats.selected || 0,
            icon: '✅',
            color: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20',
        },
        {
            label: 'Avg. Score',
            value: stats.avg_compatibility_score ? `${stats.avg_compatibility_score}` : '—',
            icon: '📊',
            color: 'from-purple-600/20 to-purple-500/5 border-purple-500/20',
        },
    ];

    // Sort candidates by score descending
    const sorted = [...candidates].sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(stat => (
                    <div key={stat.label} className={`glass-card p-5 bg-gradient-to-br ${stat.color} border`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{stat.icon}</span>
                            <TrendingUp className="w-4 h-4 text-slate-500" />
                        </div>
                        <p className="text-2xl font-black text-slate-100">{stat.value}</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Candidate Cards Grid */}
            <div>
                <h2 className="section-header mb-4">Candidate Rankings</h2>
                {sorted.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <p className="text-slate-500">No candidates found. Upload resumes to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sorted.map((c, i) => (
                            <div key={c.id} className="relative">
                                {i < 3 && (
                                    <div className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                        #{i + 1}
                                    </div>
                                )}
                                <CandidateCard candidate={c} onViewReport={onViewReport} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
