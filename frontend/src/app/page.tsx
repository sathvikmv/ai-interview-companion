'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrainCircuit, Upload, Video, Code, BarChart3, Shield, Zap, ArrowRight, CheckCircle, Cpu, Users2, Star } from 'lucide-react';
import { checkHealth } from '@/lib/api';

const features = [
    { icon: '🧠', title: 'AI-Powered Questions', desc: 'Adaptive questions based on resume skills and real-time performance' },
    { icon: '🎙️', title: 'Voice Recognition', desc: 'Natural speech-to-text answers with real-time transcription' },
    { icon: '💻', title: 'Case & Coding Assessment', desc: 'Monaco editor with multi-language support or case-study templates' },
    { icon: '📊', title: 'Smart Scoring', desc: '5-dimensional scoring: technical, communication, confidence, problem-solving, coding' },
    { icon: '📹', title: 'Webcam Monitoring', desc: 'Real-time behavior analysis and proctoring with eye contact detection' },
    { icon: '📋', title: 'Instant Reports', desc: 'Detailed PDF-ready reports with SELECTED/REJECTED decision + role recommendations' },
];

const navItems = [
    {
        href: '/candidate',
        label: 'Candidate Portal',
        description: 'Upload resume, start interview',
        icon: <Upload className="w-6 h-6" />,
        color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 hover:border-blue-400/60',
        iconColor: 'text-blue-400',
        badge: 'Start Here',
    },
    {
        href: '/interview/prepare',
        label: 'Live Interview',
        description: 'AI-powered conversational interview',
        icon: <Video className="w-6 h-6" />,
        color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 hover:border-indigo-400/60',
        iconColor: 'text-indigo-400',
        badge: null,
    },
    {
        href: '/coding',
        label: 'Assessment Round',
        description: 'Technical or Case-based Assessment',
        icon: <Code className="w-6 h-6" />,
        color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 hover:border-cyan-400/60',
        iconColor: 'text-cyan-400',
        badge: null,
    },
    {
        href: '/recruiter',
        label: 'Recruiter Dashboard',
        description: 'View candidates, scores, analytics',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 hover:border-purple-400/60',
        iconColor: 'text-purple-400',
        badge: 'Recruiters',
    },
];

export default function HomePage() {
    const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkHealth().then(ok => setBackendStatus(ok ? 'online' : 'offline'));
    }, []);

    return (
        <main className="min-h-screen bg-mesh-blue relative overflow-hidden">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/8 blur-3xl" />
                <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-indigo-600/8 blur-3xl" />
                <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-purple-600/6 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-16 space-y-6 animate-fadeIn">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-glow">
                            <BrainCircuit className="w-8 h-8 text-white" strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-blue-400 tracking-wider uppercase">AI-Powered</p>
                            <p className="text-2xl font-black text-slate-100">InterviewIQ</p>
                        </div>
                    </div>

                    {/* Backend status */}
                    <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border ${backendStatus === 'online'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : backendStatus === 'offline'
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-slate-700/40 border-slate-600/30 text-slate-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' :
                                backendStatus === 'offline' ? 'bg-red-400' : 'bg-slate-400 animate-pulse'
                                }`} />
                            API {backendStatus === 'checking' ? 'Connecting...' : backendStatus === 'online' ? 'Online' : 'Offline — Start backend first'}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                        <span className="gradient-text-blue">AI Interview</span>
                        <br />
                        <span className="text-slate-100">Platform</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Next-generation hiring intelligence that evaluates candidates on{' '}
                        <span className="text-blue-400 font-semibold">technical skills</span>,{' '}
                        <span className="text-indigo-400 font-semibold">communication</span>, and{' '}
                        <span className="text-cyan-400 font-semibold">coding ability</span> — automatically and at scale.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center mt-8">
                        <Link href="/candidate" className="btn-primary flex items-center gap-2 text-base px-8 py-4 rounded-2xl">
                            <Zap className="w-5 h-5" />
                            Start as Candidate
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/recruiter" className="btn-secondary flex items-center gap-2 text-base px-8 py-4 rounded-2xl">
                            <Users2 className="w-5 h-5" />
                            Recruiter Dashboard
                        </Link>
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {navItems.map((item, i) => (
                        <Link key={item.href} href={item.href}>
                            <div className={`glass-card p-6 h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${item.color} border animate-slideUp`}
                                style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center ${item.iconColor}`}>
                                        {item.icon}
                                    </div>
                                    {item.badge && (
                                        <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-slate-100 mb-2">{item.label}</h3>
                                <p className="text-sm text-slate-400 mb-4">{item.description}</p>
                                <div className="flex items-center gap-1 text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                                    <span>Open</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-100 mb-3">Platform Features</h2>
                        <p className="text-slate-400">Everything you need to run automated technical interviews at scale</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((f, i) => (
                            <div key={f.title} className="glass-card p-5 flex gap-4 animate-slideUp" style={{ animationDelay: `${i * 0.08}s` }}>
                                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-slate-200 mb-1">{f.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interview Flow Steps */}
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">How It Works</h2>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {[
                            'Upload Resume', 'AI Extracts Skills', 'Questions Generated',
                            'AI Interviewer Speaks', 'Candidate Answers', 'Behavior Analysis',
                            'Coding Round', 'Auto-Evaluation', 'Score Generated', 'Final Decision'
                        ].map((step, i) => (
                            <div key={step} className="flex items-center gap-2">
                                <div className="flex items-center gap-2 glass-card px-3 py-2 border border-slate-700/40">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="text-xs text-slate-300">{step}</span>
                                </div>
                                {i < 9 && <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-slate-600 text-sm">
                    <p>InterviewIQ Platform • Powered by FastAPI + Next.js 14 • AI Interview Engine</p>
                </div>
            </div>
        </main>
    );
}
