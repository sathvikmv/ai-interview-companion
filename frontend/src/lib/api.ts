// API client for all backend calls
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/upload-resume`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error(`Resume upload failed: ${res.statusText}`);
    return res.json();
}

export async function startInterview(candidateId: string) {
    const res = await fetch(`${API_BASE}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidateId }),
    });
    if (!res.ok) throw new Error(`Failed to start interview: ${res.statusText}`);
    return res.json();
}

export async function submitAnswer(sessionId: string, answerText: string) {
    const res = await fetch(`${API_BASE}/api/interview/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            answer_text: answerText,
            audio_present: true,
            video_present: true,
        }),
    });
    if (!res.ok) throw new Error(`Failed to submit answer: ${res.statusText}`);
    return res.json();
}

export async function evaluateCode(sessionId: string, code: string, language: string, problemId: string = 'default') {
    const res = await fetch(`${API_BASE}/api/interview/code-evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            code,
            language,
            problem_id: problemId,
        }),
    });
    if (!res.ok) throw new Error(`Code evaluation failed: ${res.statusText}`);
    return res.json();
}

export async function getInterviewReport(sessionId: string) {
    const res = await fetch(`${API_BASE}/api/interview/${sessionId}/report`);
    if (!res.ok) throw new Error(`Failed to get report: ${res.statusText}`);
    return res.json();
}

export async function getCandidates() {
    const res = await fetch(`${API_BASE}/api/candidates`);
    if (!res.ok) throw new Error(`Failed to fetch candidates: ${res.statusText}`);
    return res.json();
}

export async function getAnalytics() {
    const res = await fetch(`${API_BASE}/api/recruiter/analytics`);
    if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
    return res.json();
}

export async function getCodingProblems() {
    const res = await fetch(`${API_BASE}/api/coding/problems`);
    if (!res.ok) throw new Error(`Failed to fetch problems: ${res.statusText}`);
    return res.json();
}

export async function getCodingProblem(problemId: string) {
    const res = await fetch(`${API_BASE}/api/coding/problem/${problemId}`);
    if (!res.ok) throw new Error(`Failed to fetch problem: ${res.statusText}`);
    return res.json();
}

export async function checkHealth() {
    try {
        const res = await fetch(`${API_BASE}/api/health`);
        return res.ok;
    } catch {
        return false;
    }
}
