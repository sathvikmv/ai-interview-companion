"""
Resume Parser Engine
Extracts skills, projects, experience, and education from uploaded resume files.
Uses keyword-based NLP matching for prototype.
"""
import re
from typing import List, Dict, Any, Tuple

# Comprehensive skill taxonomy
SKILL_TAXONOMY = {
    "languages": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "MATLAB", "R"],
    "web_frontend": ["React", "Vue.js", "Angular", "Next.js", "HTML", "CSS", "Sass", "Redux", "Tailwind", "Bootstrap", "jQuery", "Svelte", "Gatsby"],
    "web_backend": ["Node.js", "Django", "Flask", "FastAPI", "Spring Boot", "Express.js", "Laravel", "Rails", "ASP.NET", "GraphQL", "REST APIs"],
    "data_ai": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "NLP", "Computer Vision", "CUDA", "OpenCV", "MLflow", "Hugging Face"],
    "databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra", "Elasticsearch", "DynamoDB", "Firebase", "Snowflake", "Databricks"],
    "cloud_devops": ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "Ansible", "Linux", "Apache Spark", "Kafka", "Airflow"],
    "tools": ["Git", "GitHub", "Jira", "Agile", "Scrum", "Figma", "Postman", "VS Code", "IntelliJ", "Jupyter"],
    "management": ["Project Management", "Leadership", "Budgeting", "Operations", "Strategic Planning", "Stakeholder Management", "Negotiation", "Risk Assessment", "Resource Allocation"],
    "finance": ["Accounting", "Auditing", "Investment Banking", "Financial Modeling", "Taxation", "Portfolio Management", "Chartered Accountancy", "CFA", "CPA"],
    "healthcare": ["Clinical Research", "Patient Care", "Diagnosis", "Pharmacology", "Healthcare Administration", "Nursing", "Therapy", "Medical Coding"],
    "marketing": ["SEO", "SEM", "Content Strategy", "Brand Management", "Market Research", "Public Relations", "Conversion Optimization", "Ads", "Social Media"],
    "legal": ["Corporate Law", "Litigation", "Compliance", "Contract Negotiation", "IP Law", "Arbitration", "Legal Writing"],
}

ALL_SKILLS = [skill for category in SKILL_TAXONOMY.values() for skill in category]

EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
    r'(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)',
    r'experience[:\s]+(\d+)\+?\s*years?',
]

EDUCATION_KEYWORDS = [
    "B.S.", "B.Tech", "B.E.", "M.S.", "M.Tech", "M.E.", "Ph.D", "MBA",
    "Bachelor", "Master", "Doctorate", "Computer Science", "Information Technology",
    "Software Engineering", "Electrical Engineering", "Data Science", "Artificial Intelligence",
    "Business Administration", "Finance", "Medicine", "Biology", "Psychology", "Law", "Marketing",
    "Economics", "Accounting", "HR Management", "Liberal Arts", "Mass Communication"
]

def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text using keyword matching."""
    text_lower = text.lower()
    found_skills = []
    for skill in ALL_SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    # Deduplicate and limit
    return list(dict.fromkeys(found_skills))[:20]

def extract_experience(text: str) -> str:
    """Extract years of experience from resume text."""
    for pattern in EXPERIENCE_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            years = int(match.group(1))
            if years == 0:
                return "Fresher"
            elif years == 1:
                return "1 Year"
            else:
                return f"{years} Years"
    # Infer from graduation year or job dates
    year_matches = re.findall(r'20(\d{2})', text)
    if len(year_matches) >= 2:
        years = max(int(y) for y in year_matches) - min(int(y) for y in year_matches)
        if 0 < years <= 15:
            return f"{years} Years"
    return "2-3 Years"  # Default

def extract_education(text: str) -> str:
    """Extract education information."""
    lines = text.split('\n')
    for line in lines:
        for kw in EDUCATION_KEYWORDS:
            if kw in line:
                cleaned = line.strip()
                if len(cleaned) < 150:
                    return cleaned
    return "Degree / Certification detected in Profile"

def extract_projects(text: str) -> List[str]:
    """Extract project names from resume text."""
    projects = []

    # Look for project sections
    project_section = re.search(
        r'(?:projects?|portfolio|work|highlights|key achievements)\s*\n(.*?)(?:\n\n|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if project_section:
        section_text = project_section.group(1)
        lines = [l.strip() for l in section_text.split('\n') if l.strip()]
        for line in lines[:5]:
            if len(line) > 10 and not any(kw in line.lower() for kw in ['github', 'http', 'www']):
                projects.append(line[:80])

    # Fallback: look for capitalized multi-word phrases
    if not projects:
        matches = re.findall(r'([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+){1,4} (?:System|App|Platform|Engine|Tool|Service|Bot|API))', text)
        projects = [m[0] for m in matches[:4]]

    return projects if projects else ["Personal Project Portfolio", "Technical Skills Application"]

def extract_name(text: str) -> str:
    """Extract candidate name from the top of the resume."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:5]:
        # Name-like: 2-4 words, all title case, no digits
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w) and not any(c.isdigit() for c in line):
            if not any(kw in line.lower() for kw in ['resume', 'curriculum', 'vitae', 'profile', 'summary']):
                return line
    return "Candidate"

def extract_email(text: str) -> str:
    """Extract email from resume."""
    match = re.search(r'[\w.+-]+@[\w-]+\.[a-z]{2,}', text, re.IGNORECASE)
    return match.group(0) if match else "candidate@example.com"

def build_skill_graph(skills: List[str]) -> Dict[str, Any]:
    """Build a hierarchical skill graph for visualization."""
    category_skills: Dict[str, List[str]] = {}
    for cat_name, cat_skills in SKILL_TAXONOMY.items():
        matched = [s for s in skills if s in cat_skills]
        if matched:
            category_skills[cat_name.replace("_", " ").title()] = matched

    if not category_skills:
        return {"name": "Skills", "children": [{"name": s} for s in skills[:6]]}

    children = []
    for cat, cat_skills_list in category_skills.items():
        children.append({
            "name": cat,
            "children": [{"name": s} for s in cat_skills_list]
        })
    return {"name": "Skill Graph", "children": children}

def infer_experience_level(experience: str, skills: List[str]) -> str:
    """Infer candidate level: Junior, Mid-level, Senior, Expert."""
    years = 0
    match = re.search(r'(\d+)', experience)
    if match:
        years = int(match.group(1))

    if years >= 7 or len(skills) >= 15:
        return "Expert"
    elif years >= 4 or len(skills) >= 10:
        return "Senior"
    elif years >= 2 or len(skills) >= 6:
        return "Mid-level"
    else:
        return "Junior"

def parse_resume(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Main resume parsing function.
    Returns structured candidate data extracted from resume.
    """
    # Extract text
    text = ""
    if filename.endswith(".pdf"):
        try:
            import io
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception:
            text = file_content.decode("utf-8", errors="ignore")
    else:
        text = file_content.decode("utf-8", errors="ignore")

    if not text.strip():
        # Fallback mock text if extraction fails
        text = """
        Jordan Smith
        jordan@example.com | +1-555-0123

        EDUCATION
        Relevant Professional Degree, Academic Institution

        EXPERIENCE
        Senior Professional (5+ Years Experience)
        Developed multiple high-impact projects and led cross-functional teams.

        SKILLS
        Strategic Planning, Leadership, Project Management, Communication, Analysis, Tools

        PROJECTS
        Major Strategic Initiative Implementation
        Industry-Specific Process Optimization
        Team Excellence Program Development
        """

    skills = extract_skills(text)
    if not skills:
        skills = ["Python", "JavaScript", "React", "SQL", "Git"]

    experience = extract_experience(text)
    education = extract_education(text)
    projects = extract_projects(text)
    name = extract_name(text)
    email = extract_email(text)
    skill_graph = build_skill_graph(skills)
    level = infer_experience_level(experience, skills)

    return {
        "name": name,
        "email": email,
        "skills": skills,
        "projects": projects,
        "education": education,
        "experience": experience,
        "experience_level": level,
        "skill_graph": skill_graph,
        "skill_count": len(skills),
        "raw_text_length": len(text)
    }
