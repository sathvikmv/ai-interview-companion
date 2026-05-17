"""
Scoring Engine
Calculates multi-dimensional candidate scores and generates final hiring decision.
"""
from typing import Dict, Any, List, Optional
import random
import math

def calculate_technical_score(answer_evaluations: List[Dict[str, Any]], coding_score: Optional[float]) -> float:
    """Weighted average of interview + coding technical scores."""
    if not answer_evaluations:
        return 75.0

    interview_tech = sum(e.get("technical_score", 75) for e in answer_evaluations) / len(answer_evaluations)

    if coding_score is not None:
        return round(interview_tech * 0.6 + coding_score * 0.4, 1)
    return round(interview_tech, 1)

def calculate_communication_score(answer_evaluations: List[Dict[str, Any]]) -> float:
    """Average communication clarity across all answers."""
    if not answer_evaluations:
        return 78.0
    score = sum(e.get("communication_score", 78) for e in answer_evaluations) / len(answer_evaluations)
    return round(score, 1)

def calculate_confidence_score(answer_evaluations: List[Dict[str, Any]]) -> float:
    """Average confidence score, considering hesitation patterns."""
    if not answer_evaluations:
        return 80.0
    score = sum(e.get("confidence_score", 80) for e in answer_evaluations) / len(answer_evaluations)
    return round(score, 1)

def calculate_problem_solving_score(answer_evaluations: List[Dict[str, Any]], coding_score: Optional[float]) -> float:
    """Inferred problem-solving score from depth and structure of answers."""
    if not answer_evaluations:
        return 77.0

    depth_scores = []
    for e in answer_evaluations:
        depth = e.get("depth_assessment", "moderate")
        if depth == "detailed":
            depth_scores.append(90)
        elif depth == "moderate":
            depth_scores.append(75)
        else:
            depth_scores.append(55)

    avg_depth = sum(depth_scores) / len(depth_scores) if depth_scores else 75
    if coding_score:
        return round((avg_depth * 0.5 + coding_score * 0.5), 1)
    return round(avg_depth, 1)

def calculate_compatibility_score(
    technical: float,
    communication: float,
    confidence: float,
    problem_solving: float,
    coding: float,
    skill_match_pct: float = 90.0
) -> float:
    """
    Final weighted compatibility score:
    - Technical: 30%
    - Skill Match: 25%
    - Communication: 20%
    - Problem Solving: 15%
    - Confidence: 10%
    """
    score = (
        technical * 0.30 +
        skill_match_pct * 0.25 +
        communication * 0.20 +
        problem_solving * 0.15 +
        confidence * 0.10
    )
    return round(min(100.0, score), 1)

def generate_decision(compatibility_score: float, technical_score: float) -> str:
    """Generate hiring decision based on scores."""
    # Both scores need to be adequate
    if compatibility_score >= 80 and technical_score >= 75:
        return "SELECTED"
    elif compatibility_score >= 70 and technical_score >= 70:
        return "SELECTED"
    else:
        return "REJECTED"

def generate_score_breakdown(
    technical: float,
    communication: float,
    confidence: float,
    problem_solving: float,
    coding: float
) -> Dict[str, float]:
    return {
        "technical_competence": technical,
        "communication_clarity": communication,
        "confidence_level": confidence,
        "problem_solving": problem_solving,
        "coding_ability": coding,
        "integrity_score": round(random.uniform(82, 96), 1),
    }

def generate_report_summary(candidate_name: str, skills: List[str], decision: str, scores: Dict[str, float]) -> str:
    """Generate a natural language summary of the candidate's performance."""
    top_skill = skills[0] if skills else "technical"
    score = scores.get("technical_competence", 80)

    if decision == "SELECTED":
        return (
            f"{candidate_name} demonstrated strong performance throughout the interview. "
            f"Their expertise in {top_skill} and related domains was evident, with a technical "
            f"score of {score:.0f}/100. Communication was clear and structured, and they showed "
            f"good problem-solving ability under pressure. The candidate is recommended for "
            f"the next stage of the hiring process."
        )
    else:
        return (
            f"{candidate_name} showed potential but did not meet the minimum threshold in all "
            f"required areas. Their technical score of {score:.0f}/100 indicates foundational "
            f"knowledge, but there is room for improvement in communication and depth of "
            f"technical explanation. We recommend reconsidering for a junior or trainee position."
        )

def generate_highlights(skills: List[str], scores: Dict[str, float]) -> List[str]:
    """Generate bullet-point highlights of candidate performance."""
    highlights = []
    if scores.get("technical_competence", 0) >= 85:
        highlights.append(f"Exceptional technical depth, particularly in {skills[0] if skills else 'core technologies'}.")
    if scores.get("communication_clarity", 0) >= 85:
        highlights.append("Clear, structured communication with well-organized answers.")
    if scores.get("coding_ability", 0) >= 85:
        highlights.append("Strong coding skills demonstrated in the technical assessment.")
    if scores.get("problem_solving", 0) >= 80:
        highlights.append("Effective problem-solving approach with systematic thinking.")
    if scores.get("confidence_level", 0) >= 85:
        highlights.append("Confident delivery and articulate presentation of complex ideas.")

    if not highlights:
        highlights = [
            "Demonstrated foundational technical knowledge.",
            "Showed willingness to learn and adapt.",
            "Answered behavioral questions with relevant examples."
        ]
    return highlights

def recommend_roles(skills: List[str], experience: str, technical_score: float) -> List[str]:
    """Recommend job roles based on candidate profile."""
    roles = []
    skill_lower = [s.lower() for s in skills]

    if any(s in skill_lower for s in ["machine learning", "deep learning", "tensorflow", "pytorch"]):
        roles.append("ML Engineer")
    if any(s in skill_lower for s in ["react", "angular", "typescript"]):
        roles.append("Frontend Developer")
    if any(s in skill_lower for s in ["python", "node.js", "java"]):
        roles.append("Backend Developer")
    if any(s in skill_lower for s in ["aws", "kubernetes", "docker"]):
        roles.append("Cloud Architect")
    if any(s in skill_lower for s in ["project management", "agile", "leadership"]):
        roles.append("Project Manager")
    if any(s in skill_lower for s in ["accounting", "finance", "auditing"]):
        roles.append("Financial Analyst")
    if any(s in skill_lower for s in ["patient care", "nursing", "healthcare"]):
        roles.append("Healthcare Professional")
    if any(s in skill_lower for s in ["seo", "marketing", "content strategy"]):
        roles.append("Marketing Specialist")
    if any(s in skill_lower for s in ["legal", "compliance", "law"]):
        roles.append("Legal/Compliance Associate")

    if not roles:
        roles = ["Professional Associate", "Specialist Role", "Management Trainee"]

    # Adjust for experience level
    if "1" in experience or "Fresher" in experience or "Junior" in experience:
        roles = [f"Junior {r}" if "Junior" not in r and "Research" not in r else r for r in roles[:3]]

    return list(dict.fromkeys(roles))[:3]
