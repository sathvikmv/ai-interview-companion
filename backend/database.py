import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "interview_platform.db"

def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS candidates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            education TEXT,
            experience TEXT,
            skills TEXT,
            projects TEXT,
            skill_graph TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS recruiters (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS interview_sessions (
            id TEXT PRIMARY KEY,
            candidate_id TEXT NOT NULL,
            recruiter_id TEXT,
            status TEXT DEFAULT 'pending',
            round TEXT DEFAULT 'behavioral',
            history TEXT DEFAULT '[]',
            scores TEXT,
            coding_score REAL,
            compatibility_score REAL,
            decision TEXT,
            started_at TEXT,
            completed_at TEXT,
            FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        );

        CREATE TABLE IF NOT EXISTS interview_results (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            technical_score REAL,
            communication_score REAL,
            confidence_score REAL,
            problem_solving_score REAL,
            coding_score REAL,
            final_score REAL,
            decision TEXT,
            summary TEXT,
            highlights TEXT,
            recommended_roles TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES interview_sessions(id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        );
    """)
    conn.commit()
    conn.close()

def seed_demo_data():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM candidates")
    count = cur.fetchone()[0]
    conn.close()

    if count > 0:
        return

    import uuid
    demo_candidates = [
        {
            "id": str(uuid.uuid4()),
            "name": "Sarah Jenkins",
            "email": "sarah.j@example.com",
            "phone": "+1-555-0101",
            "education": "M.S. Artificial Intelligence, Stanford University",
            "experience": "5 Years",
            "skills": json.dumps(["Python", "Deep Learning", "TensorFlow", "NLP", "Data Structures"]),
            "projects": json.dumps(["Autonomous Driving Vision System", "NLP Chatbot for Healthcare", "Real-time Object Detection"]),
            "skill_graph": json.dumps({"name": "AI/ML Expert", "children": [{"name": "Python"}, {"name": "Deep Learning"}, {"name": "TensorFlow"}]}),
            "compatibility_score": 92.5,
            "decision": "SELECTED",
            "technical": 93, "communication": 90, "confidence": 88, "coding": 95
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Marcus Chen",
            "email": "m.chen@techcorp.io",
            "phone": "+1-555-0102",
            "education": "B.S. Computer Science, MIT",
            "experience": "3 Years",
            "skills": json.dumps(["React", "Node.js", "TypeScript", "GraphQL", "PostgreSQL"]),
            "projects": json.dumps(["E-commerce Platform with 100k+ users", "Real-time Analytics Dashboard", "Microservices Migration"]),
            "skill_graph": json.dumps({"name": "Full Stack Dev", "children": [{"name": "React"}, {"name": "Node.js"}, {"name": "TypeScript"}]}),
            "compatibility_score": 85.0,
            "decision": "SELECTED",
            "technical": 88, "communication": 82, "confidence": 79, "coding": 91
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Priya Sharma",
            "email": "priya.s@devmail.com",
            "phone": "+1-555-0103",
            "education": "B.Tech. Information Technology, IIT Bombay",
            "experience": "2 Years",
            "skills": json.dumps(["Java", "Spring Boot", "Kubernetes", "Docker", "AWS"]),
            "projects": json.dumps(["Distributed Event Processing System", "CI/CD Pipeline Automation"]),
            "skill_graph": json.dumps({"name": "Backend Dev", "children": [{"name": "Java"}, {"name": "Spring Boot"}, {"name": "Kubernetes"}]}),
            "compatibility_score": 78.2,
            "decision": "REJECTED",
            "technical": 75, "communication": 70, "confidence": 72, "coding": 80
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Alex Rodriguez",
            "email": "alex.r@promail.net",
            "phone": "+1-555-0104",
            "education": "B.S. Software Engineering, Carnegie Mellon",
            "experience": "4 Years",
            "skills": json.dumps(["C++", "Rust", "Systems Programming", "CUDA", "OpenCV"]),
            "projects": json.dumps(["High-Performance Trading Engine", "GPU-Accelerated Image Processing Library"]),
            "skill_graph": json.dumps({"name": "Systems Programmer", "children": [{"name": "C++"}, {"name": "Rust"}, {"name": "CUDA"}]}),
            "compatibility_score": 88.7,
            "decision": "SELECTED",
            "technical": 95, "communication": 78, "confidence": 83, "coding": 97
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Emily Watson",
            "email": "e.watson@cloudworks.io",
            "phone": "+1-555-0105",
            "education": "M.S. Data Science, UC Berkeley",
            "experience": "6 Years",
            "skills": json.dumps(["Python", "Apache Spark", "Databricks", "MLflow", "Airflow"]),
            "projects": json.dumps(["Petabyte-scale Data Lake Architecture", "Recommendation Engine serving 5M users", "ML Feature Store"]),
            "skill_graph": json.dumps({"name": "Data Engineer", "children": [{"name": "Python"}, {"name": "Spark"}, {"name": "MLflow"}]}),
            "compatibility_score": 94.1,
            "decision": "SELECTED",
            "technical": 96, "communication": 94, "confidence": 91, "coding": 89
        },
    ]

    conn = get_connection()
    cur = conn.cursor()
    import uuid as _uuid

    for c in demo_candidates:
        cid = c["id"]
        cur.execute(
            "INSERT OR IGNORE INTO candidates (id, name, email, phone, education, experience, skills, projects, skill_graph) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (cid, c["name"], c["email"], c["phone"], c["education"], c["experience"], c["skills"], c["projects"], c["skill_graph"])
        )
        session_id = str(_uuid.uuid4())
        scores = json.dumps({
            "technical_competence": c["technical"],
            "communication_clarity": c["communication"],
            "confidence_level": c["confidence"],
            "behavioral_reasoning": int((c["technical"] + c["communication"]) / 2),
            "integrity_score": 90
        })
        cur.execute(
            "INSERT OR IGNORE INTO interview_sessions (id, candidate_id, status, scores, coding_score, compatibility_score, decision, started_at, completed_at) VALUES (?, ?, 'completed', ?, ?, ?, ?, ?, ?)",
            (session_id, cid, scores, c["coding"], c["compatibility_score"], c["decision"], datetime.now().isoformat(), datetime.now().isoformat())
        )
        result_id = str(_uuid.uuid4())
        cur.execute(
            "INSERT OR IGNORE INTO interview_results (id, session_id, candidate_id, technical_score, communication_score, confidence_score, problem_solving_score, coding_score, final_score, decision) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (result_id, session_id, cid, c["technical"], c["communication"], c["confidence"], int((c["technical"]+c["coding"])/2), c["coding"], c["compatibility_score"], c["decision"])
        )

    conn.commit()
    conn.close()

init_db()
seed_demo_data()
