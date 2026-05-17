import requests
import json
import time
import os

BASE_URL = "http://localhost:8000"

def log(msg):
    print(f"[TEST] {msg}")

def test_complete_flow():
    errors = []
    
    # 1. Check Health
    try:
        r = requests.get(f"{BASE_URL}/api/health")
        if r.status_code == 200:
            log("Health Check: SUCCESS")
        else:
            errors.append(f"Health Check Failed: {r.status_code}")
    except Exception as e:
        errors.append(f"Health Check Error: {e}")
        return errors

    # 2. Upload Resume
    log("Uploading Resume...")
    resume_content = "Name: Jane Doe\nEmail: jane@example.com\nSkills: Python, React, FastAPI, SQL\nExperience: 3 years as Full Stack Dev."
    files = {'file': ('resume.txt', resume_content)}
    try:
        r = requests.post(f"{BASE_URL}/api/upload-resume", files=files)
        if r.status_code == 200:
            candidate = r.json()['candidate']
            candidate_id = candidate['id']
            log(f"Resume Upload: SUCCESS (ID: {candidate_id})")
            log(f"Extracted Skills: {candidate['skills']}")
        else:
            errors.append(f"Upload Failed: {r.status_code} - {r.text}")
            return errors
    except Exception as e:
        errors.append(f"Upload Error: {e}")
        return errors

    # 3. Start Interview
    log("Starting Interview...")
    try:
        r = requests.post(f"{BASE_URL}/api/interview/start", json={"candidate_id": candidate_id})
        if r.status_code == 200:
            session = r.json()
            session_id = session['session_id']
            log(f"Interview Start: SUCCESS (Session: {session_id})")
            log(f"First Question: {session['question'][:50]}...")
        else:
            errors.append(f"Start Failed: {r.status_code}")
            return errors
    except Exception as e:
        errors.append(f"Start Error: {e}")
        return errors

    # 4. Answer 2 Questions (Simulate short interview)
    for i in range(2):
        log(f"Answering Question {i+1}...")
        try:
            answer = "I have extensive experience building REST APIs with FastAPI and integrating them with React frontends. I follow clean architecture principles and write comprehensive tests."
            r = requests.post(f"{BASE_URL}/api/interview/answer", json={
                "session_id": session_id,
                "answer_text": answer
            })
            if r.status_code == 200:
                resp = r.json()
                log(f"Answer {i+1}: Evaluation received ({resp['evaluation']})")
                if resp.get('interview_complete'):
                    log("Interview signaled as complete early.")
                    break
                log(f"Next Question: {resp['next_question'][:50]}...")
            else:
                errors.append(f"Answer {i+1} Failed: {r.status_code}")
                break
        except Exception as e:
            errors.append(f"Answer {i+1} Error: {e}")
            break

    # 5. Evaluate Code
    log("Evaluating Code...")
    code = "def solution(arr):\n    return sorted(list(set(arr)))"
    try:
        r = requests.post(f"{BASE_URL}/api/interview/evaluate-code", json={
            "session_id": session_id,
            "code": code,
            "language": "python",
            "problem_id": "duplicate-remover"
        })
        if r.status_code == 200:
            eval_res = r.json()
            log(f"Code Evaluation: SUCCESS (Score: {eval_res['overall_coding_score']})")
        else:
            errors.append(f"Code Eval Failed: {r.status_code}")
    except Exception as e:
        errors.append(f"Code Eval Error: {e}")

    # 6. Fetch Final Report
    log("Fetching Final Report...")
    try:
        # Wait a moment for any async processing if needed (though current is sync)
        r = requests.get(f"{BASE_URL}/api/interview/{session_id}/report")
        if r.status_code == 200:
            report = r.json()
            log(f"Final Report: SUCCESS (Decision: {report['decision']})")
            log(f"Compatibility Score: {report['compatibility_score']}")
        else:
            errors.append(f"Report Failed: {r.status_code}")
    except Exception as e:
        errors.append(f"Report Error: {e}")

    # 7. Check Recruiter Dashboard Analytics
    log("Checking Analytics...")
    try:
        r = requests.get(f"{BASE_URL}/api/analytics")
        if r.status_code == 200:
            log("Analytics: SUCCESS")
        else:
            errors.append(f"Analytics Failed: {r.status_code}")
    except Exception as e:
        errors.append(f"Analytics Error: {e}")

    return errors

if __name__ == "__main__":
    results = test_complete_flow()
    if not results:
        print("\n" + "="*30)
        print("ALL TESTS PASSED SUCCESSFULLY!")
        print("="*30)
    else:
        print("\n" + "="*30)
        print("TESTS COMPLETED WITH ERRORS:")
        for err in results:
            print(f"- {err}")
        print("="*30)
