# 🤖 AI Interview Platform — InterviewIQ

A **complete full-stack AI-powered hiring platform** that automatically conducts end-to-end technical interviews, evaluates candidates across 5 dimensions, and provides hiring decisions with detailed reports.

---

## 🏗️ Architecture

```
ai-interview-platform/
├── backend/                        # FastAPI Python Backend
│   ├── main.py                     # FastAPI app, all API routes
│   ├── database.py                 # SQLite setup, models, demo seeding
│   ├── models.py                   # Pydantic request/response models
│   ├── resume_parser.py            # Resume text extraction & skill detection
│   ├── interview_engine.py         # AI question generation & answer evaluation
│   ├── scoring_engine.py           # Multi-dimensional scoring & decision logic
│   ├── coding_evaluator.py         # Code evaluation with AST analysis
│   ├── analytics_engine.py         # Recruiter analytics aggregation
│   └── requirements.txt
│
├── frontend/                       # Next.js 14 TypeScript Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # 🏠 Homepage with platform overview
│   │   │   ├── candidate/          # 📤 Resume upload portal
│   │   │   ├── interview/
│   │   │   │   ├── prepare/        # ⏳ Pre-interview checklist
│   │   │   │   └── live/           # 🎙️ Live AI interview session
│   │   │   ├── coding/             # 💻 Monaco coding assessment
│   │   │   ├── results/            # 📊 Interview report & decision
│   │   │   └── recruiter/          # 📋 Recruiter dashboard & analytics
│   │   │
│   │   ├── components/
│   │   │   ├── AIInterviewer.tsx   # AI avatar with TTS & animations
│   │   │   ├── CandidateCamera.tsx # Webcam monitoring component
│   │   │   ├── TranscriptPanel.tsx # Real-time chat transcript
│   │   │   ├── CodingEditor.tsx    # Monaco multi-language editor
│   │   │   ├── ScoreCard.tsx       # Score visualization component
│   │   │   └── RecruiterDashboard.tsx  # Candidate list & stats
│   │   │
│   │   └── lib/
│   │       ├── api.ts              # All backend API calls
│   │       └── speech.ts           # TTS & speech recognition utilities
│   │
│   └── public/
│       └── ai-interviewer.png      # AI avatar image
```

---

## 🚀 Quick Start

### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

---

## 🎯 25 Features Implemented

| # | Feature | Status |
|---|---------|--------|
| 1 | Resume Upload System | ✅ |
| 2 | Resume Skill Extraction Engine | ✅ |
| 3 | Resume Project Detection | ✅ |
| 4 | Experience Level Detection | ✅ |
| 5 | AI Question Generator | ✅ |
| 6 | Skill-Based Interview Questions | ✅ |
| 7 | Adaptive Question Difficulty | ✅ |
| 8 | AI Female Voice Interviewer (TTS) | ✅ |
| 9 | Speech-to-Text Candidate Answers | ✅ |
| 10 | Real-time Interview Transcript | ✅ |
| 11 | Candidate Webcam Monitoring | ✅ |
| 12 | Behavior Observation Module | ✅ |
| 13 | Coding Interview Round | ✅ |
| 14 | Monaco Code Editor | ✅ |
| 15 | Multi-Language Coding Support (Python, JS, Java, C++, C) | ✅ |
| 16 | Automatic Code Evaluation | ✅ |
| 17 | Candidate Technical Score | ✅ |
| 18 | Communication Score | ✅ |
| 19 | Confidence Score | ✅ |
| 20 | Final Compatibility Score | ✅ |
| 21 | Multi-Round Interview System | ✅ |
| 22 | Recruiter Dashboard | ✅ |
| 23 | Candidate Ranking System | ✅ |
| 24 | Selection/Rejection Message Generator | ✅ |
| 25 | Responsive UI for All Devices | ✅ |

---

## 🔴 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-resume` | Upload and parse resume |
| POST | `/api/interview/start` | Start a new interview session |
| POST | `/api/interview/answer` | Submit an answer to get next question |
| POST | `/api/interview/code-evaluate` | Submit code for evaluation |
| GET | `/api/interview/{session_id}/report` | Get final interview report |
| GET | `/api/candidates` | List all candidates with session data |
| GET | `/api/recruiter/analytics` | Get analytics data for dashboard |
| GET | `/api/coding/problems` | Get all coding problems |
| GET | `/api/coding/problem/{id}` | Get specific coding problem |
| GET | `/api/health` | Health check |

---

## 🎨 UI Design

- **Dark theme** with glassmorphism cards
- **Gradient accents** — blue, indigo, cyan, purple
- **Micro-animations** — float, glow, wave, slide-up, fade-in
- **Inter font** from Google Fonts
- **Responsive** — desktop, tablet, mobile
- **Interview UI** styled like Zoom/Google Meet

---

## 📊 Scoring Dimensions

| Dimension | Weight | Source |
|-----------|--------|--------|
| Technical Competence | 30% | Q&A analysis + coding |
| Skill Match | 25% | Resume vs job requirements |
| Communication Clarity | 20% | Answer depth & structure |
| Problem Solving | 15% | Coding + reasoning |
| Confidence Level | 10% | Speech patterns & word count |

**Decision threshold**: ≥80% compatibility + ≥75% technical → SELECTED

---

## 🛠️ Tech Stack

**Backend**: FastAPI, Uvicorn, SQLite (via stdlib), pdfplumber, Pydantic v2

**Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion, Monaco Editor, React-Webcam, Chart.js

**AI Features**: Browser Web Speech API, rule-based NLP, AST-based code analysis

---

## 📝 Notes

- Speech recognition requires **Chrome or Edge** browser
- Text-to-speech uses browser's built-in voices (prefers female English voices)
- The platform uses rule-based AI for prototype — can be upgraded with OpenAI/Google APIs
- SQLite database is created automatically at first run with demo data
