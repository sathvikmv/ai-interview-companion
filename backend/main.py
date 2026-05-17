from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import json
import random
from datetime import datetime

from database import get_connection, init_db
from models import AnswerRequest, CodeEvaluationRequest
from resume_parser import parse_resume
from interview_engine import (
    get_intro_question,
    generate_questions_for_skills,
    get_closing_question,
    get_coding_problem,
    evaluate_answer_quality,
    get_follow_up,
    CODING_PROBLEMS,
)
from scoring_engine import (
    calculate_technical_score,
    calculate_communication_score,
    calculate_confidence_score,
    calculate_problem_solving_score,
    calculate_compatibility_score,
    generate_decision,
    generate_score_breakdown,
    generate_report_summary,
    generate_highlights,
    recommend_roles,
)
from coding_evaluator import evaluate_code
from analytics_engine import generate_analytics

# In-memory session state (supplements persistent DB)
session_state: Dict[str, Dict[str, Any]] = {}

app = FastAPI(
    title="AI Interview Platform API",
    description="Complete AI-powered hiring platform with adaptive interviews, scoring, and analytics",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== RESUME UPLOAD ====================

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse resume. Returns extracted candidate profile."""
    content = await file.read()
    parsed = parse_resume(content, file.filename or "resume.txt")

    candidate_id = str(uuid.uuid4())
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO candidates (id, name, email, skills, projects, education, experience, skill_graph)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            candidate_id,
            parsed["name"],
            parsed["email"],
            json.dumps(parsed["skills"]),
            json.dumps(parsed["projects"]),
            parsed["education"],
            parsed["experience"],
            json.dumps(parsed["skill_graph"]),
        )
    )
    conn.commit()
    conn.close()

    return {
        "message": "Resume parsed successfully",
        "candidate": {
            "id": candidate_id,
            "name": parsed["name"],
            "email": parsed["email"],
            "skills": parsed["skills"],
            "projects": parsed["projects"],
            "education": parsed["education"],
            "experience": parsed["experience"],
            "experience_level": parsed["experience_level"],
            "skill_graph": parsed["skill_graph"],
            "skill_count": parsed["skill_count"],
        }
    }

# ==================== INTERVIEW SESSIONS ====================

@app.post("/api/interview/start")
async def start_interview(body: dict):
    """Start a new interview session for a candidate."""
    candidate_id = body.get("candidate_id")
    if not candidate_id:
        raise HTTPException(status_code=400, detail="candidate_id is required")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Candidate not found")

    skills = json.loads(row["skills"]) if row["skills"] else []
    projects = json.loads(row["projects"]) if row["projects"] else []

    # Generate question set
    intro_q = get_intro_question()
    remaining_questions = generate_questions_for_skills(skills, count=4)
    closing_q = get_closing_question()
    all_questions = [intro_q] + remaining_questions + [closing_q]

    session_id = str(uuid.uuid4())

    # Store in memory
    session_state[session_id] = {
        "candidate_id": candidate_id,
        "candidate_name": row["name"],
        "skills": skills,
        "projects": projects,
        "experience": row["experience"],
        "education": row["education"],
        "questions": all_questions,
        "current_index": 0,
        "history": [{"role": "interviewer", "text": intro_q}],
        "answer_evaluations": [],
        "status": "in_progress",
        "started_at": datetime.now().isoformat(),
    }

    # Persist in DB
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO interview_sessions (id, candidate_id, status, history, started_at)
           VALUES (?, ?, 'in_progress', ?, ?)""",
        (session_id, candidate_id, json.dumps([{"role": "interviewer", "text": intro_q}]), datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

    return {
        "session_id": session_id,
        "question": intro_q,
        "question_number": 1,
        "total_questions": len(all_questions),
        "candidate_name": row["name"],
    }

@app.post("/api/interview/answer")
async def process_answer(request: AnswerRequest):
    """Process a candidate's answer and return the next question or completion."""
    session_id = request.session_id
    if session_id not in session_state:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    state = session_state[session_id]
    answer_text = request.answer_text.strip()

    if not answer_text:
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    # Evaluate the answer
    eval_result = evaluate_answer_quality(answer_text)
    state["answer_evaluations"].append(eval_result)

    # Record in history
    state["history"].append({"role": "candidate", "text": answer_text})

    # Determine next question
    state["current_index"] += 1
    questions = state["questions"]

    # Possibly insert a follow-up
    follow_up = get_follow_up(answer_text, state["current_index"])
    if follow_up and state["current_index"] < len(questions) - 1:
        questions.insert(state["current_index"], follow_up)

    if state["current_index"] < len(questions):
        next_q = questions[state["current_index"]]
        state["history"].append({"role": "interviewer", "text": next_q})
        interview_complete = False
    else:
        next_q = None
        interview_complete = True
        state["status"] = "verbal_complete"

    # Update DB history
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE interview_sessions SET history = ? WHERE id = ?",
        (json.dumps(state["history"]), session_id)
    )
    conn.commit()
    conn.close()

    return {
        "evaluation": eval_result["feedback"],
        "technical_score": eval_result["technical_score"],
        "communication_score": eval_result["communication_score"],
        "confidence_score": eval_result["confidence_score"],
        "word_count": eval_result["word_count"],
        "next_question": next_q,
        "question_number": state["current_index"] + 1,
        "total_questions": len(questions),
        "interview_complete": interview_complete,
    }

@app.post("/api/interview/code-evaluate")
async def evaluate_code_submission(request: CodeEvaluationRequest):
    """Evaluate submitted code and update the session coding score."""
    session_id = request.session_id
    result = evaluate_code(request.code, request.language, request.problem_id or "default")

    # Update session with coding score
    if session_id in session_state:
        session_state[session_id]["coding_score"] = result["overall_coding_score"]
        session_state[session_id]["status"] = "coding_complete"

    # Update DB
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE interview_sessions SET coding_score = ?, status = 'coding_complete' WHERE id = ?",
        (result["overall_coding_score"], session_id)
    )
    conn.commit()
    conn.close()

    return result

@app.get("/api/interview/{session_id}/report")
async def get_report(session_id: str):
    """Generate the final interview report with all scores and hiring decision."""
    if session_id not in session_state:
        # Try to reconstruct from DB
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM interview_sessions WHERE id = ?", (session_id,))
        db_session = cur.fetchone()
        if not db_session:
            raise HTTPException(status_code=404, detail="Session not found")

        cur.execute("SELECT * FROM candidates WHERE id = ?", (db_session["candidate_id"],))
        candidate_row = cur.fetchone()
        conn.close()

        if not candidate_row:
            raise HTTPException(status_code=404, detail="Candidate not found")

        skills = json.loads(candidate_row["skills"]) if candidate_row["skills"] else []
        projects = json.loads(candidate_row["projects"]) if candidate_row["projects"] else []
        history = json.loads(db_session["history"]) if db_session["history"] else []

        # Use DB scores if available
        scores_raw = db_session["scores"]
        if scores_raw:
            scores = json.loads(scores_raw) if isinstance(scores_raw, str) else scores_raw
            tech = scores.get("technical_competence", 82)
            comm = scores.get("communication_clarity", 78)
            conf = scores.get("confidence_level", 76)
            prob = scores.get("problem_solving", 79)
            coding = db_session["coding_score"] or 85
        else:
            tech, comm, conf, prob, coding = 82, 78, 76, 79, 85

        compat = db_session["compatibility_score"] or calculate_compatibility_score(tech, comm, conf, prob, coding)
        decision = db_session["decision"] or generate_decision(compat, tech)
        transcript = history

        return _build_report(
            candidate_row["id"], candidate_row["name"], candidate_row["email"],
            skills, projects, candidate_row["education"], candidate_row["experience"],
            transcript, tech, comm, conf, prob, coding, compat, decision, session_id
        )

    state = session_state[session_id]
    evaluations = state["answer_evaluations"]
    coding_score = state.get("coding_score", random.randint(75, 92))

    tech = calculate_technical_score(evaluations, coding_score)
    comm = calculate_communication_score(evaluations)
    conf = calculate_confidence_score(evaluations)
    prob = calculate_problem_solving_score(evaluations, coding_score)
    compat = calculate_compatibility_score(tech, comm, conf, prob, coding_score)
    decision = generate_decision(compat, tech)

    # Persist results
    scores_dict = generate_score_breakdown(tech, comm, conf, prob, coding_score)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """UPDATE interview_sessions
           SET scores=?, coding_score=?, compatibility_score=?, decision=?, status='completed', completed_at=?
           WHERE id=?""",
        (json.dumps(scores_dict), coding_score, compat, decision, datetime.now().isoformat(), session_id)
    )
    result_id = str(uuid.uuid4())
    cur.execute(
        """INSERT OR IGNORE INTO interview_results
           (id, session_id, candidate_id, technical_score, communication_score, confidence_score, problem_solving_score, coding_score, final_score, decision)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (result_id, session_id, state["candidate_id"], tech, comm, conf, prob, coding_score, compat, decision)
    )
    conn.commit()
    conn.close()

    state["status"] = "completed"
    state["decision"] = decision

    return _build_report(
        state["candidate_id"], state["candidate_name"], "",
        state["skills"], state["projects"], state["education"], state["experience"],
        state["history"], tech, comm, conf, prob, coding_score, compat, decision, session_id
    )

def _build_report(
    cid, name, email, skills, projects, education, experience,
    transcript, tech, comm, conf, prob, coding, compat, decision, session_id
):
    scores = generate_score_breakdown(tech, comm, conf, prob, coding)
    summary = generate_report_summary(name, skills, decision, scores)
    highlights = generate_highlights(skills, scores)
    roles = recommend_roles(skills, experience, tech)

    return {
        "candidate": {
            "id": cid, "name": name, "email": email,
            "skills": skills, "projects": projects,
            "education": education, "experience": experience,
            "compatibility_score": compat,
        },
        "transcript": transcript,
        "summary": summary,
        "highlights": highlights,
        "scores": scores,
        "coding_score": coding,
        "hiring_compatibility": compat,
        "recommended_roles": roles,
        "decision": decision,
        "session_id": session_id,
        "generated_at": datetime.now().isoformat(),
    }

# ==================== CODING CHALLENGES ====================

@app.get("/api/coding/problems")
async def get_coding_problems():
    """Return all available coding problems."""
    return {"problems": CODING_PROBLEMS}

@app.get("/api/coding/problem/{problem_id}")
async def get_problem(problem_id: str):
    """Get a specific coding problem by ID."""
    problem = next((p for p in CODING_PROBLEMS if p["id"] == problem_id), None)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

# ==================== CANDIDATES & RECRUITER ====================

@app.get("/api/candidates")
async def get_candidates():
    """Get all candidates with their latest session data."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM candidates ORDER BY created_at DESC")
    candidates = [dict(row) for row in cur.fetchall()]

    for c in candidates:
        c["skills"] = json.loads(c["skills"]) if c.get("skills") else []
        c["projects"] = json.loads(c["projects"]) if c.get("projects") else []
        c["skill_graph"] = json.loads(c["skill_graph"]) if c.get("skill_graph") else {}

        # Get latest session
        cur.execute(
            "SELECT * FROM interview_sessions WHERE candidate_id = ? ORDER BY rowid DESC LIMIT 1",
            (c["id"],)
        )
        session = cur.fetchone()
        if session:
            c["session_id"] = session["id"]
            c["session_status"] = session["status"]
            c["compatibility_score"] = session["compatibility_score"]
            c["decision"] = session["decision"]
            scores_raw = session["scores"]
            c["scores"] = json.loads(scores_raw) if isinstance(scores_raw, str) and scores_raw else {}
        else:
            c["session_id"] = None
            c["session_status"] = "no_interview"
            c["decision"] = "PENDING"

    conn.close()
    return {"candidates": candidates}

@app.get("/api/recruiter/analytics")
async def get_analytics():
    """Get aggregated analytics for the recruiter dashboard."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM candidates")
    candidates = [dict(row) for row in cur.fetchall()]
    for c in candidates:
        c["skills"] = json.loads(c["skills"]) if c.get("skills") else []

    cur.execute("SELECT * FROM interview_sessions")
    sessions = [dict(row) for row in cur.fetchall()]
    for s in sessions:
        if s.get("scores") and isinstance(s["scores"], str):
            try:
                s["scores"] = json.loads(s["scores"])
            except Exception:
                s["scores"] = {}

    conn.close()
    return generate_analytics(candidates, sessions)

@app.get("/api/candidate/{candidate_id}")
async def get_candidate(candidate_id: str):
    """Get a specific candidate's full profile."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Candidate not found")

    data = dict(row)
    data["skills"] = json.loads(data["skills"]) if data.get("skills") else []
    data["projects"] = json.loads(data["projects"]) if data.get("projects") else []
    data["skill_graph"] = json.loads(data["skill_graph"]) if data.get("skill_graph") else {}
    return data

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat(), "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
