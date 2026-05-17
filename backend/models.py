from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CandidateProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    skills: List[str]
    projects: List[str]
    education: str
    experience: str
    skill_graph: Dict[str, Any]
    compatibility_score: Optional[float] = None

class InterviewSession(BaseModel):
    id: str
    candidate_id: str
    status: str
    current_question: Optional[str] = None
    history: List[Dict[str, str]] = []
    scores: Optional[Dict[str, Any]] = None
    coding_score: Optional[float] = None
    compatibility_score: Optional[float] = None
    decision: Optional[str] = None

class AnswerRequest(BaseModel):
    session_id: str
    answer_text: str
    audio_present: bool = True
    video_present: bool = True

class CodeEvaluationRequest(BaseModel):
    session_id: str
    code: str
    language: str
    problem_id: Optional[str] = "default"

class StartInterviewRequest(BaseModel):
    candidate_id: str

class CandidateResult(BaseModel):
    candidate: Dict[str, Any]
    transcript: List[Dict[str, str]]
    summary: str
    highlights: List[str]
    scores: Dict[str, Any]
    coding_score: float
    hiring_compatibility: float
    recommended_roles: List[str]
    decision: str
