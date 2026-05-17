'use client';

import { MessageSquare, User, Bot } from 'lucide-react';

interface TranscriptEntry {
    role: 'interviewer' | 'candidate';
    text: string;
}

interface TranscriptPanelProps {
    history: TranscriptEntry[];
    className?: string;
}

export default function TranscriptPanel({ history, className = '' }: TranscriptPanelProps) {
    return (
        <div className={`glass-card flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-slate-200">Live Transcript</span>
                <span className="ml-auto text-xs text-slate-500">{history.length} entries</span>
            </div>

            {/* Transcript Entries */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-4">
                {history.length === 0 && (
                    <div className="text-center text-slate-500 text-sm py-8">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Transcript will appear here...</p>
                    </div>
                )}
                {history.map((entry, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 animate-slideUp ${entry.role === 'interviewer' ? 'flex-row' : 'flex-row-reverse'
                            }`}
                    >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${entry.role === 'interviewer'
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}>
                            {entry.role === 'interviewer'
                                ? <Bot className="w-3.5 h-3.5 text-white" />
                                : <User className="w-3.5 h-3.5 text-white" />
                            }
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[80%] flex flex-col gap-1 ${entry.role === 'candidate' ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs font-medium text-slate-500">
                                {entry.role === 'interviewer' ? 'ARIA (AI Interviewer)' : 'You'}
                            </span>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${entry.role === 'interviewer'
                                    ? 'bg-slate-800/80 border border-slate-700/40 text-slate-200 rounded-tl-sm'
                                    : 'bg-blue-600/30 border border-blue-500/30 text-blue-100 rounded-tr-sm'
                                }`}>
                                {entry.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
