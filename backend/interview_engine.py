"""
AI Interview Engine
Generates adaptive, skill-based interview questions and evaluates candidate responses.
"""
import random
from typing import List, Dict, Any, Optional

# ----- QUESTION BANK -----

INTRO_QUESTIONS = [
    "Hello! Welcome to your AI-powered interview. To begin, could you please introduce yourself and give us a brief overview of your background?",
    "Welcome! I'm your AI interviewer today. Let's start with you telling me about yourself — your background, current role, and what excites you most about technology.",
]

BEHAVIORAL_QUESTIONS = [
    "Tell me about a time when you had to meet a tight deadline. How did you manage your time and deliver results?",
    "Describe a situation where you disagreed with a team member or manager. How did you handle the disagreement professionally?",
    "Give me an example of a challenging project you led. What was your approach and what was the outcome?",
    "Tell me about a time you failed at something. What did you learn from it?",
    "Describe a time you had to learn a new technology quickly. What was your learning strategy?",
    "Tell me about a time you had to work with ambiguous requirements. How did you handle it?",
    "Give an example of when you went above and beyond what was expected at work.",
]

COMMUNICATION_PROBES = [
    "Can you elaborate on that point? I'd love to hear more details about the specific outcome.",
    "That's interesting. What metrics or KPIs did you use to measure the success of that?",
    "How did your team react to that approach? What was the feedback like?",
]

TECHNICAL_QUESTIONS_BY_SKILL = {
    "Python": [
        "Explain the difference between a list and a tuple in Python, and when would you use each?",
        "How does Python's GIL affect multi-threaded programs? When would you use multiprocessing instead?",
        "What are decorators in Python? Can you write a simple caching decorator?",
    ],
    "Machine Learning": [
        "Explain the bias-variance tradeoff in machine learning. How do you balance it in practice?",
        "What's the difference between overfitting and underfitting? What techniques do you use to address each?",
        "Walk me through the steps you'd take to build and deploy a machine learning model in production.",
    ],
    "TensorFlow": [
        "How do you structure a TensorFlow training pipeline? What components do you consider essential?",
        "Explain the difference between eager execution and graph execution in TensorFlow.",
    ],
    "React": [
        "Explain the React component lifecycle. How have hooks changed the way you think about it?",
        "What's the difference between useMemo and useCallback? When would you use each?",
        "How do you manage state in a large React application? What are the tradeoffs of different approaches?",
    ],
    "Node.js": [
        "Explain the Node.js event loop. How does it enable non-blocking I/O?",
        "How would you handle backpressure in a Node.js streaming application?",
    ],
    "Docker": [
        "Explain the difference between a Docker image and a Docker container. Walk me through creating a multi-stage Dockerfile.",
        "How would you handle secrets and environment variables securely in a Docker environment?",
    ],
    "AWS": [
        "Describe how you would architect a highly available, fault-tolerant application on AWS.",
        "Explain the difference between EC2, ECS, and Lambda. When would you use each?",
    ],
    "TypeScript": [
        "What are the benefits of TypeScript over plain JavaScript? What are its limitations?",
        "Explain TypeScript's structural typing system. How does it differ from nominal typing?",
    ],
    "Kubernetes": [
        "Explain the role of a Kubernetes pod, deployment, and service. How do they relate to each other?",
        "How would you implement rolling updates and rollbacks in Kubernetes?",
    ],
    "Deep Learning": [
        "Explain the vanishing gradient problem. What techniques help address it in deep networks?",
        "Compare CNN, RNN, and Transformer architectures. When would you choose each?",
    ],
    "Java": [
        "Explain garbage collection in the JVM. What are the different GC algorithms and their tradeoffs?",
        "What are Java's Stream API and Optional? How do they improve code quality?",
    ],
    "Project Management": [
        "How do you handle scope creep in a project with a fixed budget and deadline?",
        "Explain the critical path method and how you use it to manage schedules.",
        "How do you manage stakeholder expectations when a project is running behind?",
    ],
    "Finance": [
        "What is the difference between cash flow and profit? Why is it important?",
        "How would you assess the creditworthiness of a potential corporate borrower?",
        "Explain the CAPM (Capital Asset Pricing Model) and its practical use.",
    ],
    "Healthcare": [
        "How do you ensure HIPAA compliance and data security in healthcare systems?",
        "Describe a time you had to handle an ethical dilemma in a clinical or medical setting.",
        "What are the emerging trends in digital health that you are most excited about?",
    ],
    "Marketing": [
        "How would you design a go-to-market strategy for a new SaaS product?",
        "Explain the difference between brand awareness and performance marketing.",
        "How do you use data analytics to optimize customer acquisition costs (CAC)?",
    ],
    "Legal": [
        "Describe your experience with contract lifecycle management.",
        "How do you stay updated on changes in corporate regulation or compliance laws?",
        "What is your approach to risk mitigation in major business transactions?",
    ],
    "default": [
        "Describe your experience with version control systems. What's your Git workflow on a team project?",
        "How do you approach debugging a system issue you've never encountered before?",
        "What's your approach to writing clean, maintainable code? Give a concrete example.",
        "How do you stay current with new technologies and industry trends?",
        "Tell me about your experience with code review processes. What makes a great code review?",
    ]
}

CLOSING_QUESTIONS = [
    "We're nearing the end of our conversation. Where do you see yourself professionally in 3-5 years, and how does this role fit into that vision?",
    "Before we wrap up, do you have any questions about the role or the team?",
]

CODING_PROBLEMS = [
    {
        "id": "reverse_linked_list",
        "title": "Reverse a Linked List",
        "difficulty": "Easy",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "examples": "Input: [1,2,3,4,5] → Output: [5,4,3,2,1]",
        "starter_code": {
            "python": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    # Your solution here\n    pass",
            "javascript": "function reverseList(head) {\n    // Your solution here\n}",
            "java": "public ListNode reverseList(ListNode head) {\n    // Your solution here\n}",
            "cpp": "ListNode* reverseList(ListNode* head) {\n    // Your solution here\n}",
            "c": "struct ListNode* reverseList(struct ListNode* head) {\n    // Your solution here\n}",
        }
    },
    {
        "id": "two_sum",
        "title": "Two Sum",
        "difficulty": "Easy",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "examples": "Input: nums=[2,7,11,15], target=9 → Output: [0,1]",
        "starter_code": {
            "python": "def two_sum(nums, target):\n    # Your solution here\n    pass",
            "javascript": "function twoSum(nums, target) {\n    // Your solution here\n}",
            "java": "public int[] twoSum(int[] nums, int target) {\n    // Your solution here\n}",
            "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your solution here\n}",
        }
    },
    {
        "id": "valid_parentheses",
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "examples": "Input: '()[]{}' → Output: true\nInput: '(]' → Output: false",
        "starter_code": {
            "python": "def is_valid(s: str) -> bool:\n    # Your solution here\n    pass",
            "javascript": "function isValid(s) {\n    // Your solution here\n}",
        }
    },
    {
        "id": "fibonacci",
        "title": "Fibonacci with Memoization",
        "difficulty": "Medium",
        "description": "Implement the Fibonacci sequence with memoization to optimize performance. Return the nth Fibonacci number.",
        "examples": "fib(10) → 55, fib(0) → 0, fib(1) → 1",
        "starter_code": {
            "python": "def fib(n: int, memo={}) -> int:\n    # Your optimized solution here\n    pass",
            "javascript": "function fib(n, memo = {}) {\n    // Your optimized solution here\n}",
        }
    },
    {
        "id": "binary_search",
        "title": "Binary Search",
        "difficulty": "Easy",
        "description": "Given a sorted array of integers, implement binary search to find a target value. Return the index if found, else -1.",
        "examples": "nums=[-1,0,3,5,9,12], target=9 → 4",
        "starter_code": {
            "python": "def binary_search(nums, target):\n    # Your solution here\n    pass",
            "javascript": "function binarySearch(nums, target) {\n    // Your solution here\n}",
            "java": "public int binarySearch(int[] nums, int target) {\n    // Your solution here\n}",
            "cpp": "int binarySearch(vector<int>& nums, int target) {\n    // Your solution here\n}",
        }
    },
    {
        "id": "market_entry",
        "title": "Market Entry Strategy Case",
        "difficulty": "Medium",
        "description": "A startup wants to enter the European market with an AI-powered fitness app. Write a 3-step strategy covering targeting, pricing, and distribution.",
        "examples": "Step 1: Localization... Step 2: Tiered Subscription... Step 3: Local Partnerships.",
        "starter_code": {
            "python": "# Use Python to simulate projections if needed\ndef calculate_roi(investment, return_expected):\n    pass",
            "javascript": "// Strategic outline here"
        }
    },
    {
        "id": "ethical_healthcare",
        "title": "Healthcare Policy Ethics",
        "difficulty": "Hard",
        "description": "Draft a policy for prioritizing patients in a resource-constrained environment while ensuring medical equity and legal compliance.",
        "examples": "Focus on: Triage protocols, data transparency, and legal risk mitigation.",
        "starter_code": {
            "python": "# Outline policy as comments\n# 1. Triage:\n# 2. Privacy:",
            "javascript": "// Drafting Policy Section A..."
        }
    }
]

def get_intro_question() -> str:
    return random.choice(INTRO_QUESTIONS)

def generate_questions_for_skills(skills: List[str], count: int = 4) -> List[str]:
    questions = []
    used_skills = set()

    # Pick skill-specific questions
    for skill in skills:
        if skill in TECHNICAL_QUESTIONS_BY_SKILL and skill not in used_skills:
            q = random.choice(TECHNICAL_QUESTIONS_BY_SKILL[skill])
            questions.append(q)
            used_skills.add(skill)
            if len(questions) >= count - 1:
                break

    # Fill with default / behavioral
    while len(questions) < count - 1:
        q = random.choice(TECHNICAL_QUESTIONS_BY_SKILL["default"])
        if q not in questions:
            questions.append(q)

    # Add a behavioral question
    behavioral = random.choice(BEHAVIORAL_QUESTIONS)
    questions.insert(1, behavioral)

    return questions[:count]

def get_follow_up(answer_text: str, current_q_idx: int) -> Optional[str]:
    """Return a follow-up probe if the answer is too short."""
    if len(answer_text.split()) < 20 and current_q_idx < 3:
        return random.choice(COMMUNICATION_PROBES)
    return None

def get_closing_question() -> str:
    return random.choice(CLOSING_QUESTIONS)

def get_coding_problem(skills: List[str]) -> Dict[str, Any]:
    """Select appropriate problem or case study based on skills."""
    skill_lower = [s.lower() for s in skills]
    tech_keywords = ["python", "javascript", "java", "coding", "software", "developer", "engineering"]
    
    is_tech = any(tk in skill_lower for tk in tech_keywords)
    
    if is_tech:
        # Filter for actual coding problems
        tech_probs = [p for p in CODING_PROBLEMS if p["id"] not in ["market_entry", "ethical_healthcare"]]
        return random.choice(tech_probs) if tech_probs else random.choice(CODING_PROBLEMS)
    else:
        # Prioritize case studies
        cases = [p for p in CODING_PROBLEMS if p["id"] in ["market_entry", "ethical_healthcare"]]
        return random.choice(cases) if cases else random.choice(CODING_PROBLEMS)

def evaluate_answer_quality(answer_text: str) -> Dict[str, Any]:
    """
    Evaluate the quality of a candidate's answer.
    Returns scores for various dimensions.
    """
    words = answer_text.split()
    word_count = len(words)
    char_count = len(answer_text)

    # Word count heuristics
    if word_count >= 80:
        depth_score = random.randint(80, 95)
    elif word_count >= 40:
        depth_score = random.randint(65, 80)
    else:
        depth_score = random.randint(40, 65)

    # Keyword presence signals
    technical_keywords = ["implement", "algorithm", "system", "design", "optimize", "scalable", "performance", "architecture", "database", "api"]
    comm_keywords = ["because", "therefore", "however", "result", "impact", "team", "project", "challenge", "solution", "learned"]

    tech_hits = sum(1 for w in technical_keywords if w in answer_text.lower())
    comm_hits = sum(1 for w in comm_keywords if w in answer_text.lower())

    technical_score = min(100, depth_score + tech_hits * 3)
    communication_score = min(100, depth_score + comm_hits * 2)
    confidence_score = random.randint(70, 95) if word_count > 30 else random.randint(45, 70)

    # Hesitation / uncertainty signals
    hesitation_words = ["um", "uh", "basically", "like", "you know", "i mean", "kind of", "sort of"]
    hesitation_count = sum(answer_text.lower().count(h) for h in hesitation_words)
    hesitation_penalty = min(15, hesitation_count * 3)
    communication_score = max(40, communication_score - hesitation_penalty)

    return {
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "word_count": word_count,
        "hesitation_count": hesitation_count,
        "depth_assessment": "detailed" if word_count >= 60 else ("moderate" if word_count >= 30 else "brief"),
        "feedback": _generate_feedback(depth_score, tech_hits, hesitation_count)
    }

def _generate_feedback(depth: int, tech_hits: int, hesitations: int) -> str:
    if depth >= 80 and tech_hits >= 3:
        return "Excellent response demonstrating strong technical depth and clear articulation."
    elif depth >= 65:
        return "Good response with solid technical grounding. Consider providing more specific examples."
    elif hesitations > 3:
        return "Response showed some hesitation. Try to speak more confidently and structure answers using STAR method."
    else:
        return "Response was somewhat brief. Elaborate more on the approach, challenges, and outcomes."
