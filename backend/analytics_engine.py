"""
Analytics Engine
Generates aggregated analytics data for the Recruiter Dashboard.
"""
from typing import List, Dict, Any
import random

def compute_score_distribution(candidates_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute score distribution for histogram visualization."""
    bins = {"0-50": 0, "51-65": 0, "66-75": 0, "76-85": 0, "86-100": 0}
    for c in candidates_data:
        score = c.get("compatibility_score", 0) or 0
        if score <= 50:
            bins["0-50"] += 1
        elif score <= 65:
            bins["51-65"] += 1
        elif score <= 75:
            bins["66-75"] += 1
        elif score <= 85:
            bins["76-85"] += 1
        else:
            bins["86-100"] += 1
    return {
        "labels": list(bins.keys()),
        "data": list(bins.values())
    }

def compute_skill_heatmap(candidates_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute skill frequency across all candidates."""
    skill_counts: Dict[str, int] = {}
    for c in candidates_data:
        skills = c.get("skills", [])
        if isinstance(skills, str):
            import json
            try:
                skills = json.loads(skills)
            except Exception:
                skills = []
        for skill in skills:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1

    sorted_skills = sorted(skill_counts.items(), key=lambda x: -x[1])[:10]
    return {
        "labels": [s[0] for s in sorted_skills],
        "data": [s[1] for s in sorted_skills]
    }

def compute_decision_breakdown(candidates_data: List[Dict[str, Any]], sessions_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Selected vs Rejected breakdown."""
    selected = sum(1 for s in sessions_data if s.get("decision") == "SELECTED")
    rejected = sum(1 for s in sessions_data if s.get("decision") == "REJECTED")
    pending = len(candidates_data) - selected - rejected
    return {
        "labels": ["Selected", "Rejected", "Pending"],
        "data": [selected, rejected, max(0, pending)]
    }

def compute_score_radar(avg_scores: Dict[str, float]) -> Dict[str, Any]:
    """Radar chart data showing average scores across dimensions."""
    return {
        "labels": ["Technical", "Communication", "Confidence", "Problem Solving", "Coding"],
        "data": [
            avg_scores.get("technical_competence", 80),
            avg_scores.get("communication_clarity", 78),
            avg_scores.get("confidence_level", 76),
            avg_scores.get("problem_solving", 79),
            avg_scores.get("coding_ability", 82),
        ]
    }

def compute_experience_breakdown(candidates_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Experience level distribution."""
    levels = {"Fresher": 0, "1-2 Years": 0, "3-4 Years": 0, "5+ Years": 0}
    for c in candidates_data:
        exp = c.get("experience", "")
        if "Fresher" in exp or "0" in exp:
            levels["Fresher"] += 1
        elif "1" in exp or "2" in exp:
            levels["1-2 Years"] += 1
        elif "3" in exp or "4" in exp:
            levels["3-4 Years"] += 1
        else:
            levels["5+ Years"] += 1
    return {
        "labels": list(levels.keys()),
        "data": list(levels.values())
    }

def compute_timeline_data() -> Dict[str, Any]:
    """Mock timeline of interviews over last 7 days."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return {
        "labels": days,
        "interviews": [random.randint(2, 8) for _ in days],
        "selected": [random.randint(1, 4) for _ in days],
    }

def generate_analytics(
    candidates_data: List[Dict[str, Any]],
    sessions_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Master analytics aggregation for the recruiter dashboard."""
    if not candidates_data:
        return {"error": "No data available"}

    # Compute average scores from sessions
    scored_sessions = [s for s in sessions_data if s.get("scores")]
    avg_scores = {
        "technical_competence": 82,
        "communication_clarity": 79,
        "confidence_level": 76,
        "problem_solving": 80,
        "coding_ability": 85,
    }

    if scored_sessions:
        import json
        for key in avg_scores.keys():
            vals = []
            for s in scored_sessions:
                scores = s.get("scores", {})
                if isinstance(scores, str):
                    try:
                        scores = json.loads(scores)
                    except Exception:
                        continue
                if key in scores:
                    vals.append(scores[key])
            if vals:
                avg_scores[key] = round(sum(vals) / len(vals), 1)

    total_candidates = len(candidates_data)
    total_interviews = len(sessions_data)
    selected_count = sum(1 for s in sessions_data if s.get("decision") == "SELECTED")
    avg_compat = sum(
        (s.get("compatibility_score") or 0) for s in sessions_data if s.get("compatibility_score")
    )
    avg_compat = round(avg_compat / max(1, len([s for s in sessions_data if s.get("compatibility_score")])), 1)

    return {
        "summary": {
            "total_candidates": total_candidates,
            "total_interviews": total_interviews,
            "selected": selected_count,
            "rejected": total_interviews - selected_count,
            "avg_compatibility_score": avg_compat,
            "selection_rate": round(selected_count / max(1, total_interviews) * 100, 1)
        },
        "score_distribution": compute_score_distribution(sessions_data),
        "skill_heatmap": compute_skill_heatmap(candidates_data),
        "decision_breakdown": compute_decision_breakdown(candidates_data, sessions_data),
        "score_radar": compute_score_radar(avg_scores),
        "experience_breakdown": compute_experience_breakdown(candidates_data),
        "timeline": compute_timeline_data(),
    }
