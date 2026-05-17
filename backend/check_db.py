import sqlite3
import json
from pathlib import Path

DB_PATH = Path('interview_platform.db')

def check_db():
    if not DB_PATH.exists():
        print(f"Database {DB_PATH} does not exist.")
        return

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    print("--- Interview Sessions ---")
    cur.execute("SELECT id, candidate_id, status, compatibility_score FROM interview_sessions ORDER BY rowid DESC LIMIT 5")
    rows = cur.fetchall()
    for row in rows:
        print(dict(row))

    print("\n--- Candidates ---")
    cur.execute("SELECT id, name, created_at FROM candidates ORDER BY rowid DESC LIMIT 5")
    rows = cur.fetchall()
    for row in rows:
        print(dict(row))

    conn.close()

if __name__ == "__main__":
    check_db()
