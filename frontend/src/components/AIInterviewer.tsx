'use client';

import { useEffect, useState, useRef } from 'react';
import { speakText } from '@/lib/speech';

interface AIInterviewerProps {
  question: string;
  isActive?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
  onSpeechEnd?: () => void;
}

export default function AIInterviewer({
  question,
  isActive = true,
  questionNumber = 1,
  totalQuestions = 6,
  onSpeechEnd
}: AIInterviewerProps) {
  const [speaking, setSpeaking] = useState(false);
  const [animFrame, setAnimFrame] = useState(0);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!question || !isActive) return;

    setSpeaking(true);
    speakText(
      question,
      () => setSpeaking(true),
      () => {
        setSpeaking(false);
        if (onSpeechEnd) onSpeechEnd();
      }
    );

    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
      setSpeaking(false);
    };
  }, [question, isActive]);

  useEffect(() => {
    if (speaking) {
      animRef.current = setInterval(() => {
        setAnimFrame(f => (f + 1) % 8);
      }, 200);
    } else {
      if (animRef.current) clearInterval(animRef.current);
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [speaking]);

  const waveHeights = [3, 6, 4, 8, 5, 7, 3, 6];

  return (
    <div className="flex flex-col items-center gap-6 w-full p-6">
      {/* Avatar Container */}
      <div className="relative">
        {/* Outer glow rings */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${speaking
          ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 animate-pulse scale-110'
          : 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10'
          }`} style={{ margin: '-12px' }} />
        <div className={`absolute inset-0 rounded-full transition-all duration-700 ${speaking ? 'bg-blue-400/20 scale-125 animate-ping' : ''
          }`} style={{ margin: '-24px' }} />

        {/* Avatar image */}
        <div className={`relative w-40 h-40 rounded-full overflow-hidden border-4 transition-all duration-300 ${speaking
          ? 'border-blue-400 shadow-2xl shadow-blue-500/50'
          : 'border-slate-600/60 shadow-xl shadow-black/40'
          }`}>
          <img
            src="/ai-interviewer.png"
            alt="AI Interviewer"
            className={`w-full h-full object-cover transition-transform duration-300 ${speaking ? 'scale-105' : 'scale-100'
              }`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Fallback avatar */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-4xl font-bold" style={{ display: 'none' }}>
            AI
          </div>
        </div>

        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-blue-500/90 backdrop-blur px-3 py-1 rounded-full">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-0.5 bg-white rounded-full transition-all duration-150"
                style={{
                  height: `${waveHeights[(animFrame + i) % waveHeights.length] * 2}px`,
                  minHeight: '4px',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Name & Status */}
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center mb-1">
          <div className={`w-2 h-2 rounded-full ${speaking ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-sm font-medium text-slate-300">
            {speaking ? 'ARIA is speaking...' : 'ARIA — AI Interviewer'}
          </span>
        </div>
        <p className="text-xs text-slate-500">Powered by AI Interview Engine</p>
      </div>

      {/* Question Text */}
      <div className="w-full max-w-lg">
        <div className="glass-card p-5 relative overflow-hidden">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-2xl" />
          <div className="pl-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Question {questionNumber} of {totalQuestions}
              </span>
              <div className="h-px flex-1 bg-slate-700/60" />
            </div>
            <p className="text-slate-100 text-sm leading-relaxed font-medium">
              {question}
            </p>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i < questionNumber
              ? 'bg-blue-400 w-4'
              : i === questionNumber - 1
                ? 'bg-blue-400 w-4 animate-pulse'
                : 'bg-slate-700 w-1.5'
              }`}
          />
        ))}
      </div>
    </div>
  );
}