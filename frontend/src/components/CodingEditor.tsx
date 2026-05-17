'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Code, Play, RotateCcw, ChevronDown } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodingEditorProps {
    onSubmit: (code: string, language: string) => void;
    isLoading?: boolean;
    problem?: {
        title?: string;
        description?: string;
        examples?: string;
        starter_code?: Record<string, string>;
    };
}

const LANGUAGES = [
    { id: 'python', label: 'Python', monacoId: 'python' },
    { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
    { id: 'java', label: 'Java', monacoId: 'java' },
    { id: 'cpp', label: 'C++', monacoId: 'cpp' },
    { id: 'c', label: 'C', monacoId: 'c' },
];

const DEFAULT_STARTERS: Record<string, string> = {
    python: `# Write your Python solution here
def solution():
    pass

# Test your solution
if __name__ == "__main__":
    print(solution())
`,
    javascript: `// Write your JavaScript solution here
function solution() {
    // Your code here
}

console.log(solution());
`,
    java: `// Write your Java solution here
class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}
`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

// Write your C++ solution here
int main() {
    // Your code here
    return 0;
}
`,
    c: `#include <stdio.h>

// Write your C solution here
int main() {
    // Your code here
    return 0;
}
`,
};

export default function CodingEditor({ onSubmit, isLoading = false, problem }: CodingEditorProps) {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [showLangDropdown, setShowLangDropdown] = useState(false);

    useEffect(() => {
        if (problem?.starter_code?.[language]) {
            setCode(problem.starter_code[language]);
        } else {
            setCode(DEFAULT_STARTERS[language] || '');
        }
    }, [language, problem]);

    const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    const handleReset = () => {
        if (problem?.starter_code?.[language]) {
            setCode(problem.starter_code[language]);
        } else {
            setCode(DEFAULT_STARTERS[language] || '');
        }
    };

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-slate-200">Code Editor</span>

                    {/* Language selector */}
                    <div className="relative">
                        <button
                            id="language-selector"
                            onClick={() => setShowLangDropdown(v => !v)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-sm text-slate-300 hover:border-slate-600 transition-colors"
                        >
                            <span>{currentLang.label}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showLangDropdown && (
                            <div className="absolute top-9 left-0 z-50 glass-card border border-slate-700/60 py-1 min-w-[120px] shadow-xl">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => { setLanguage(lang.id); setShowLangDropdown(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${language === lang.id
                                                ? 'text-blue-400 bg-blue-500/10'
                                                : 'text-slate-300 hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors text-sm"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        id="submit-code-btn"
                        onClick={() => onSubmit(code, language)}
                        disabled={isLoading || !code.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                        <Play className="w-3.5 h-3.5" />
                        {isLoading ? 'Evaluating...' : 'Submit'}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
                <MonacoEditor
                    height="100%"
                    language={currentLang.monacoId}
                    value={code}
                    onChange={v => setCode(v || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        cursorStyle: 'line',
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        padding: { top: 12, bottom: 12 },
                    }}
                />
            </div>
        </div>
    );
}