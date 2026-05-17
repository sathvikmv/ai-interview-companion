'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AIInterviewer from '@/components/AIInterviewer';
import CandidateCamera from '@/components/CandidateCamera';
import TranscriptPanel from '@/components/TranscriptPanel';
import { startInterview, submitAnswer } from '@/lib/api';
import { startListening, stopSpeech, isSpeechSupported } from '@/lib/speech';
import {
    Mic, MicOff, ChevronRight, Loader2, BrainCircuit, AlertCircle,
    Volume2, VolumeX, MessageSquare, User, Clock
} from 'lucide-react';

interface TranscriptEntry {
    role: 'interviewer' | 'candidate';
    text: string;
}

type InterviewState = 'loading' | 'active' | 'listening' | 'processing' | 'complete' | 'error';

export default function LiveInterviewPage() {
    const router = useRouter();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [questionNumber, setQuestionNumber] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(6);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [answer, setAnswer] = useState('');
    const [interimAnswer, setInterimAnswer] = useState('');
    const [state, setState] = useState<InterviewState>('loading');
    const [error, setError] = useState('');
    const [muteAI, setMuteAI] = useState(false);
    const [speechSupported] = useState(isSpeechSupported());
    const [elapsedTime, setElapsedTime] = useState(0);

    const stopListeningRef = useRef<(() => void) | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // Auto scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    // Init interview
    useEffect(() => {
        const candidateId = localStorage.getItem('candidateId');
        if (!candidateId) {
            setError('No candidate profile found. Please upload your resume first.');
            setState('error');
            return;
        }

        startInterview(candidateId)
            .then(data => {
                setSessionId(data.session_id);
                setCurrentQuestion(data.question);
                setQuestionNumber(1);
                setTotalQuestions(data.total_questions || 6);
                setTranscript([{ role: 'interviewer', text: data.question }]);
                setState('active');
                localStorage.setItem('sessionId', data.session_id);
            })
            .catch(e => {
                setError(e.message || 'Failed to start interview. Is the backend running?');
                setState('error');
            });
    }, []);

    const startRecording = useCallback(() => {
        if (!speechSupported) {
            setError('Speech recognition not supported. Type your answer below.');
            return;
        }
        if (state === 'listening' || state === 'processing') return;

        setState('listening');
        // Clear previous answers if starting fresh for a new question
        setAnswer('');
        setInterimAnswer('');

        stopListeningRef.current = startListening(
            ({ transcript: t, isFinal }) => {
                if (isFinal) {
                    setAnswer(prev => prev + ' ' + t);
                    setInterimAnswer('');
                } else {
                    setInterimAnswer(t);
                }
            },
            (err) => {
                setError(err);
                setState('active');
                stopSpeech();
            },
            () => {
                setState(prev => prev === 'listening' ? 'active' : prev);
            }
        );
    }, [speechSupported, state]);

    const stopRecording = useCallback(() => {
        if (stopListeningRef.current) {
            stopListeningRef.current();
            stopListeningRef.current = null;
        }
        setState('active');
    }, []);

    const submitCurrentAnswer = async () => {
        if (!sessionId || !answer.trim()) {
            setError('Please record or type an answer first.');
            return;
        }

        // Add candidate answer to transcript
        setTranscript(prev => [...prev, { role: 'candidate', text: answer }]);
        setState('processing');

        try {
            const response = await submitAnswer(sessionId, answer);
            setAnswer('');
            setInterimAnswer('');

            if (response.interview_complete) {
                setState('complete');
                setTranscript(prev => [...prev, {
                    role: 'interviewer',
                    text: response.evaluation || 'Thank you! The interview is now complete.'
                }]);
                setTimeout(() => router.push('/coding'), 3000);
            } else {
                const nextQ = response.next_question;
                setCurrentQuestion(nextQ);
                setQuestionNumber(response.question_number || questionNumber + 1);
                setTotalQuestions(response.total_questions || totalQuestions);
                setTranscript(prev => [...prev, { role: 'interviewer', text: nextQ }]);
                setState('active');
            }
        } catch (e: any) {
            setError(e.message || 'Failed to submit answer.');
            setState('active');
        }
    };

    return (
        <main className="h-screen bg-slate-950 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                    <span className="font-bold text-slate-200">InterviewIQ</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-sm text-slate-400">Live Interview</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{formatTime(elapsedTime)}</span>
                    </div>

                    {/* Question Progress */}
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Q {questionNumber}/{totalQuestions}</span>
                        <div className="flex gap-1">
                            {Array.from({ length: totalQuestions }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i < questionNumber - 1 ? 'bg-blue-400' :
                                    i === questionNumber - 1 ? 'bg-blue-400 animate-pulse' :
                                        'bg-slate-700'
                                    }`} />
                            ))}
                        </div>
                    </div>

                    {/* Mute Toggle */}
                    <button
                        onClick={() => { setMuteAI(v => !v); if (!muteAI) stopSpeech(); }}
                        className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        {muteAI ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - AI Interviewer */}
                <div className="w-[55%] lg:w-[50%] flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/60 overflow-y-auto custom-scrollbar">
                    {state === 'loading' ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center animate-pulse">
                                <BrainCircuit className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-slate-300 font-medium">Initializing Interview...</p>
                            <p className="text-sm text-slate-500">Generating personalized questions</p>
                        </div>
                    ) : state === 'error' ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                            <AlertCircle className="w-12 h-12 text-red-400" />
                            <p className="text-red-300 font-semibold text-center">{error}</p>
                            <button onClick={() => router.push('/candidate')} className="btn-primary">
                                Go to Resume Upload
                            </button>
                        </div>
                    ) : state === 'complete' ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse-slow">
                                <BrainCircuit className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-emerald-400">Interview Complete!</h2>
                            <p className="text-slate-400">Redirecting to coding round...</p>
                            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                        </div>
                    ) : (
                        <AIInterviewer
                            question={muteAI ? '' : currentQuestion}
                            isActive={state === 'active'}
                            questionNumber={questionNumber}
                            totalQuestions={totalQuestions}
                            onSpeechEnd={() => {
                                // Auto-start recording after a tiny delay when AI finishes,
                                // to avoid interference between synthesis and recognition.
                                if (state === 'active' && speechSupported) {
                                    setTimeout(() => startRecording(), 500);
                                }
                            }}
                        />
                    )}
                </div>

                {/* Right Panel - Candidate */}
                <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-950">
                    {/* Camera + Controls */}
                    <div className="p-4 lg:p-6 space-y-4 flex-shrink-0 border-b border-slate-800/50">
                        <div className="max-w-2xl mx-auto w-full space-y-4">
                            <CandidateCamera isRecording={state === 'listening'} />

                            {/* Answer Input Area */}
                            <div className="space-y-2">
                                {/* Mic Button */}
                                <div className="flex gap-2">
                                    {state === 'listening' ? (
                                        <button
                                            id="stop-recording-btn"
                                            onClick={stopRecording}
                                            className="btn-danger flex-1 flex items-center justify-center gap-2 py-3"
                                        >
                                            <div className="w-2 h-2 bg-white rounded-sm" />
                                            Stop Recording
                                        </button>
                                    ) : (
                                        <button
                                            id="start-recording-btn"
                                            onClick={startRecording}
                                            disabled={state !== 'active' || !speechSupported}
                                            className="btn-success flex-1 flex items-center justify-center gap-2 py-3"
                                        >
                                            <Mic className="w-4 h-4" />
                                            {speechSupported ? 'Record Answer' : 'Speech N/A'}
                                        </button>
                                    )}
                                </div>

                                {/* Live transcript of answer */}
                                {(answer || interimAnswer) && (
                                    <div className="glass-card p-3 text-sm text-slate-300 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                                        <p className="text-xs text-slate-500 mb-1">Your answer:</p>
                                        {answer || <span className="text-slate-500 italic">{interimAnswer}...</span>}
                                    </div>
                                )}

                                {/* Manual type option */}
                                {!speechSupported && state === 'active' && (
                                    <textarea
                                        className="input-field text-sm resize-none h-20"
                                        placeholder="Type your answer here..."
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                    />
                                )}

                                {/* Error */}
                                {error && state !== 'error' && (
                                    <p className="text-xs text-amber-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {error}
                                    </p>
                                )}

                                {/* Submit */}
                                <button
                                    id="submit-answer-btn"
                                    onClick={submitCurrentAnswer}
                                    disabled={state === 'processing' || state === 'loading' || state === 'complete' || !answer.trim()}
                                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 shadow-xl shadow-blue-500/10"
                                >
                                    {state === 'processing' ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                    ) : (
                                        <><ChevronRight className="w-5 h-5" /> Submit Answer</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transcript */}
                    <div className="p-4 lg:p-6 pb-12">
                        <p className="section-header mb-4">Interview Transcript</p>
                        <TranscriptPanel history={transcript} />
                    </div>
                    <div ref={transcriptEndRef} />
                </div>
            </div>
        </main>
    );
}