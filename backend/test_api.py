import requests
import json

BASE_URL = "http://localhost:8000"

def test_flow():
    with open("test_results.log", "w") as f:
        # 1. Health
        f.write("Testing /api/health...\n")
        try:
            r = requests.get(f"{BASE_URL}/api/health")
            f.write(f"Health: {r.status_code}, {r.json()}\n")
        except Exception as e:
            f.write(f"Health Error: {e}\n")
            return

        # 2. Upload Mock Resume
        f.write("\nTesting /api/upload-resume...\n")
        files = {'file': ('resume.txt', 'John Doe\nPython Developer\n5 Years Experience\nSkills: Python, Django, React\nProject: E-commerce Site')}
        r = requests.post(f"{BASE_URL}/api/upload-resume", files=files)
        if r.status_code != 200:
            f.write(f"Upload failed: {r.status_code}, {r.text}\n")
            return
        data = r.json()
        candidate_id = data['candidate']['id']
        f.write(f"Uploaded: Candidate ID {candidate_id}\n")

        # 3. Start Interview
        f.write("\nTesting /api/interview/start...\n")
        r = requests.post(f"{BASE_URL}/api/interview/start", json={"candidate_id": candidate_id})
        if r.status_code != 200:
            f.write(f"Start failed: {r.status_code}, {r.text}\n")
            return
        session_data = r.json()
        session_id = session_data['session_id']
        f.write(f"Started: Session ID {session_id}\n")
        f.write(f"First Question: {session_data['question']}\n")

        # 4. Answer First Question
        f.write("\nTesting /api/interview/answer...\n")
        r = requests.post(f"{BASE_URL}/api/interview/answer", json={
            "session_id": session_id,
            "answer_text": "I am a experienced Python developer who has worked on web applications using Django and React. I enjoy solving complex problems and building scalable systems."
        })
        if r.status_code != 200:
            f.write(f"Answer failed: {r.status_code}, {r.text}\n")
            return
        answer_data = r.json()
        f.write(f"Evaluation: {answer_data['evaluation']}\n")
        f.write(f"Next Question: {answer_data['next_question']}\n")

        # 5. Check Candidates
        f.write("\nTesting /api/candidates...\n")
        r = requests.get(f"{BASE_URL}/api/candidates")
        f.write(f"Candidates Count: {len(r.json()['candidates'])}\n")

if __name__ == "__main__":
    test_flow()
