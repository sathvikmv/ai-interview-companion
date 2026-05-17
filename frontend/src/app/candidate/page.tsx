'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, Loader2, BrainCircuit, AlertCircle, ArrowRight, Sparkles, X } from 'lucide-react';
import { uploadResume } from '@/lib/api';

interface ParsedCandidate {
    id: string;
    name: string;
    email: string;
    skills: string[];
    projects: string[];
    education: string;
    experience: string;
    experience_level: string;
    skill_count: number;
    skill_graph: any;
}

export default function CandidatePage() {
    const router = useRouter();
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [candidate, setCandidate] = useState<ParsedCandidate | null>(null);
    const [error, setError] = useState('');

    const handleFile = useCallback(async (f: File) => {
        if (!f.name.match(/\.(pdf|txt|doc)$/i)) {
            setError('Please upload a PDF, TXT, or DOC file.');
            return;
        }
        setFile(f);
        setError('');
        setLoading(true);
        try {
            const data = await uploadResume(f);
            setCandidate(data.candidate);
        } catch (e: any) {
            setError(e.message || 'Failed to upload resume. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    const startInterview = () => {
        if (!candidate) return;
        localStorage.setItem('candidateId', candidate.id);
        localStorage.setItem('candidate', JSON.stringify(candidate));
        router.push('/interview/prepare');
    };

    return (
        <main className="min-h-screen bg-mesh-blue py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <BrainCircuit className="w-7 h-7 text-blue-400" />
                        <span className="text-slate-400 font-medium">InterviewIQ</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-100">
                        Candidate <span className="gradient-text-blue">Portal</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Upload your resume to begin your AI-powered interview. Our system will extract your skills and generate personalized questions.
                    </p>
                </div>

                {/* Upload Zone */}
                {!candidate && (
                    <div
                        id="resume-drop-zone"
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${dragging
                                ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                                : 'border-slate-600/60 bg-slate-900/30 hover:border-blue-500/60 hover:bg-slate-900/50'
                            }`}
                    >
                        <label htmlFor="resume-input" className="cursor-pointer block">
                            <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-300 ${dragging
                                    ? 'bg-blue-500/20 scale-110'
                                    : 'bg-slate-800/60'
                                }`}>
                                {loading ? (
                                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                                ) : file ? (
                                    <FileText className="w-10 h-10 text-blue-400" />
                                ) : (
                                    <Upload className="w-10 h-10 text-slate-400" />
                                )}
                            </div>

                            {loading ? (
                                <div className="space-y-2">
                                    <p className="text-xl font-bold text-blue-400">Analyzing Resume...</p>
                                    <p className="text-slate-500 text-sm">AI is extracting your skills and experience</p>
                                    <div className="flex justify-center gap-2 mt-4">
                                        {['Parsing text', 'Extracting skills', 'Building skill graph', 'Generating questions'].map((step, i) => (
                                            <span key={step} className="text-xs text-slate-600 border border-slate-700/40 px-2 py-1 rounded-full">
                                                {step}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : file ? (
                                <div className="space-y-3">
                                    <p className="text-lg font-bold text-slate-200">{file.name}</p>
                                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xl font-bold text-slate-200">
                                        Drop your resume here
                                    </p>
                                    <p className="text-slate-500">or click to browse files</p>
                                    <p className="text-xs text-slate-600 mt-2">Supports PDF, TXT, DOC • Max 10MB</p>
                                </div>
                            )}
                            <input
                                id="resume-input"
                                type="file"
                                accept=".pdf,.txt,.doc,.docx"
                                className="hidden"
                                onChange={onFileInput}
                            />
                        </label>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div id="error-banner" className="flex items-start gap-3 glass-card p-4 border border-red-500/30 bg-red-500/10 animate-slideUp">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-red-300 font-medium text-sm">{error}</p>
                        </div>
                        <button onClick={() => setError('')} className="text-slate-500 hover:text-slate-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Parsed Candidate Card */}
                {candidate && (
                    <div id="candidate-profile-card" className="glass-card p-8 space-y-6 animate-slideUp">
                        {/* Success Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                                {candidate.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-slate-100">{candidate.name}</h2>
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <p className="text-sm text-slate-400">{candidate.email}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xs text-slate-500">Experience Level</p>
                                <span className={`text-sm font-bold ${candidate.experience_level === 'Expert' || candidate.experience_level === 'Senior'
                                        ? 'text-purple-400' : candidate.experience_level === 'Mid-level'
                                            ? 'text-blue-400' : 'text-emerald-400'
                                    }`}>{candidate.experience_level}</span>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="glass-card p-3 text-center">
                                <p className="text-2xl font-black text-blue-400">{candidate.skill_count}</p>
                                <p className="text-xs text-slate-500 mt-1">Skills Extracted</p>
                            </div>
                            <div className="glass-card p-3 text-center">
                                <p className="text-2xl font-black text-indigo-400">{candidate.projects.length}</p>
                                <p className="text-xs text-slate-500 mt-1">Projects Found</p>
                            </div>
                            <div className="glass-card p-3 text-center col-span-2 md:col-span-1">
                                <p className="text-lg font-black text-purple-400">{candidate.experience}</p>
                                <p className="text-xs text-slate-500 mt-1">Experience</p>
                            </div>
                        </div>

                        {/* Education */}
                        <div>
                            <p className="section-header">Education</p>
                            <p className="text-sm text-slate-300 glass-card px-4 py-3">{candidate.education}</p>
                        </div>

                        {/* Skills */}
                        <div>
                            <p className="section-header">Detected Skills ({candidate.skills.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map(skill => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>

                        {/* Projects */}
                        {candidate.projects.length > 0 && (
                            <div>
                                <p className="section-header">Projects Detected</p>
                                <div className="space-y-2">
                                    {candidate.projects.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                id="start-interview-btn"
                                onClick={startInterview}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 text-base py-4 rounded-xl"
                            >
                                <BrainCircuit className="w-5 h-5" />
                                Start AI Interview
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { setCandidate(null); setFile(null); }}
                                className="btn-secondary flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Re-upload
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
