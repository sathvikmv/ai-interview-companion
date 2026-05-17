'use client';

import { Trophy, CheckCircle, XCircle, Star, Code, Brain, MessageSquare, Zap, TrendingUp } from 'lucide-react';

interface ScoreCardProps {
    scores: {
        technical_competence?: number;
        communication_clarity?: number;
        confidence_level?: number;
        problem_solving?: number;
        coding_ability?: number;
        integrity_score?: number;
    };
    codingScore?: number;
    compatibility?: number;
    decision?: string;
    candidateName?: string;
    compact?: boolean;
}

function ScoreMeter({ label, value, icon, color }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={color}>{icon}</span>
                    <span className="text-xs font-medium text-slate-400">{label}</span>
                </div>
                <span className={`text-sm font-bold ${value >= 85 ? 'text-emerald-400' : value >= 70 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                    {Math.round(value)}
                </span>
            </div>
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${value >= 85
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : value >= 70
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                                : 'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

export default function ScoreCard({
    scores,
    codingScore = 0,
    compatibility = 0,
    decision = 'PENDING',
    candidateName = 'Candidate',
    compact = false,
}: ScoreCardProps) {
    const isSelected = decision === 'SELECTED';
    const scoreItems = [
        { label: 'Technical Knowledge', value: scores.technical_competence || 0, icon: <Brain className="w-3.5 h-3.5" />, color: 'text-blue-400' },
        { label: 'Communication', value: scores.communication_clarity || 0, icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-cyan-400' },
        { label: 'Confidence', value: scores.confidence_level || 0, icon: <Star className="w-3.5 h-3.5" />, color: 'text-amber-400' },
        { label: 'Problem Solving', value: scores.problem_solving || 0, icon: <Zap className="w-3.5 h-3.5" />, color: 'text-purple-400' },
        { label: 'Coding Ability', value: scores.coding_ability || codingScore || 0, icon: <Code className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
    ];

    return (
        <div className="glass-card p-6 space-y-6">
            {/* Compatibility Score Circle */}
            <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(51,65,85,0.5)" strokeWidth="10" />
                        <circle
                            cx="60" cy="60" r="50" fill="none"
                            stroke={isSelected ? 'url(#greenGrad)' : 'url(#blueGrad)'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - compatibility / 100)}`}
                            className="transition-all duration-1500 ease-out"
                        />
                        <defs>
                            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-black ${isSelected ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {Math.round(compatibility)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ 100</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 font-medium">Compatibility Score</p>
                    <p className="text-sm font-semibold text-slate-200">{candidateName}</p>
                </div>
            </div>

            {/* Decision Badge */}
            <div className={`flex items-center justify-center gap-3 py-3 rounded-xl border ${isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : decision === 'REJECTED'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                {isSelected ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : decision === 'REJECTED' ? (
                    <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                )}
                <span className={`text-base font-black tracking-wider ${isSelected ? 'text-emerald-300' : decision === 'REJECTED' ? 'text-red-300' : 'text-amber-300'
                    }`}>
                    {decision}
                </span>
            </div>

            {/* Score Breakdown */}
            {!compact && (
                <div className="space-y-3">
                    <p className="section-header">Score Breakdown</p>
                    {scoreItems.map(item => (
                        <ScoreMeter key={item.label} {...item} />
                    ))}
                </div>
            )}
        </div>
    );
}
