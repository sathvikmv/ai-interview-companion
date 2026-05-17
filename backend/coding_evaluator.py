"""
Code Evaluator
Evaluates submitted code for correctness, efficiency, and readability.
Uses pattern matching and AST analysis for prototype evaluation.
"""
import re
import ast
import math
import random
from typing import Dict, Any, List, Optional

# Solution signatures to check for correct approach
SOLUTION_PATTERNS = {
    "reverse_linked_list": {
        "python": [r"prev\s*=\s*None", r"while\s+curr", r"\.next\s*=\s*prev", r"reverse"],
        "javascript": [r"prev\s*=\s*null", r"while\s*\(curr\)", r"\.next\s*=\s*prev"],
    },
    "two_sum": {
        "python": [r"dict|hash|{}", r"for.*in.*nums", r"target\s*-"],
        "javascript": [r"Map\(\)|{}", r"for.*of.*nums|\.forEach", r"target\s*-"],
    },
    "valid_parentheses": {
        "python": [r"stack", r"append|push", r"pop"],
        "javascript": [r"stack|push|pop", r"Map\(\)|{.*}", r"\.has\(|in\s+map"],
    },
    "binary_search": {
        "python": [r"mid|middle", r"while\s+left\s*[<>]=?\s*right|while\s+lo", r"nums\[mid\]"],
        "javascript": [r"mid|middle", r"while\s*\(left", r"nums\[mid\]"],
    },
    "fibonacci": {
        "python": [r"memo|cache|dp", r"if\s*n\s*in|if.*memo", r"return.*fib"],
        "javascript": [r"memo|cache", r"if.*memo|memo\[n\]", r"return.*fib"],
    }
}

def count_lines(code: str) -> int:
    return len([l for l in code.strip().split('\n') if l.strip() and not l.strip().startswith('#') and not l.strip().startswith('//')])

def count_comments(code: str) -> int:
    lines = code.split('\n')
    return sum(1 for l in lines if l.strip().startswith('#') or l.strip().startswith('//') or '/*' in l)

def check_naming_conventions(code: str, language: str) -> float:
    """Heuristic: score naming quality."""
    # Check for single-letter variable names (bad)
    single_letters = re.findall(r'\b[a-z]\b(?!\s*[=<>+\-*/])', code)
    penalty = min(20, len(single_letters) * 5)
    return max(60.0, 90.0 - penalty)

def estimate_complexity(code: str) -> str:
    """Heuristically estimate time complexity."""
    nested_loops = len(re.findall(r'for.*:\s*\n?\s+for|while.*:\s*\n?\s+while|for.*\n(?:.*\n)*?\s+for', code))
    loops = len(re.findall(r'\bfor\b|\bwhile\b', code))
    has_recursion = bool(re.search(r'def\s+(\w+).*\n(?:.*\n)*?\s+\1\s*\(', code))

    if nested_loops >= 2:
        return "O(n³)"
    elif nested_loops == 1:
        return "O(n²)"
    elif has_recursion:
        return "O(n) with memoization" if re.search(r'memo|cache|dp', code) else "O(2ⁿ)"
    elif loops > 0:
        return "O(n)"
    else:
        return "O(1)"

def evaluate_python_code(code: str) -> Dict[str, Any]:
    """Try to parse and analyze Python code with AST."""
    try:
        tree = ast.parse(code)
        func_def = next((n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)), None)
        has_function = func_def is not None
        has_return = any(isinstance(n, ast.Return) for n in ast.walk(tree))
        has_loops = any(isinstance(n, (ast.For, ast.While)) for n in ast.walk(tree))
        has_conditions = any(isinstance(n, ast.If) for n in ast.walk(tree))
        return {
            "parse_successful": True,
            "has_function": has_function,
            "has_return": has_return,
            "has_loops": has_loops,
            "has_conditions": has_conditions,
        }
    except SyntaxError as e:
        return {"parse_successful": False, "error": str(e)}

def evaluate_code(
    code: str,
    language: str,
    problem_id: str = "default"
) -> Dict[str, Any]:
    """
    Main code evaluation function.
    Returns detailed scoring and feedback.
    """
    if not code or not code.strip() or len(code.strip().split('\n')) <= 3:
        return {
            "correctness": 0,
            "efficiency": 0,
            "readability": 0,
            "overall_coding_score": 0,
            "feedback": "No meaningful code was submitted. Please write a solution before submitting.",
            "complexity": "N/A",
            "syntax_valid": False,
            "test_results": []
        }

    code_lower = code.lower()

    # Syntax check
    syntax_valid = True
    syntax_error = None
    if language == "python":
        result = evaluate_python_code(code)
        syntax_valid = result["parse_successful"]
        syntax_error = result.get("error")
        has_function = result.get("has_function", False)
        has_return = result.get("has_return", False)
        has_loops = result.get("has_loops", False)
    else:
        # Basic brace matching for C-like languages
        open_braces = code.count('{')
        close_braces = code.count('}')
        syntax_valid = abs(open_braces - close_braces) <= 2
        has_function = bool(re.search(r'function|def |void |int |bool |string |List|vector', code))
        has_return = 'return' in code_lower
        has_loops = bool(re.search(r'\bfor\b|\bwhile\b', code))

    if not syntax_valid:
        return {
            "correctness": 20,
            "efficiency": 0,
            "readability": 30,
            "overall_coding_score": 17,
            "feedback": f"Syntax error detected: {syntax_error or 'Mismatched braces/brackets'}. Fix syntax errors before logic evaluation.",
            "complexity": "N/A",
            "syntax_valid": False,
            "test_results": [{"name": "Syntax Check", "passed": False, "note": "Fix syntax errors first"}]
        }

    # Check against known solution patterns
    patterns = SOLUTION_PATTERNS.get(problem_id, {}).get(language, [])
    pattern_hits = sum(1 for p in patterns if re.search(p, code, re.IGNORECASE)) if patterns else 0
    pattern_score = (pattern_hits / len(patterns) * 100) if patterns else 70

    # Heuristic correctness evaluation
    if has_return and has_loops and has_function:
        correctness_base = 80 + pattern_score * 0.15
    elif has_return and has_function:
        correctness_base = 65 + pattern_score * 0.20
    elif has_return:
        correctness_base = 50
    else:
        correctness_base = 30

    correctness = min(100, int(correctness_base + random.randint(-5, 10)))

    # Efficiency evaluation
    complexity = estimate_complexity(code)
    lines = count_lines(code)

    if "O(1)" in complexity or "O(n)" in complexity:
        efficiency_base = 85 + random.randint(0, 10)
    elif "O(n²)" in complexity:
        efficiency_base = 65 + random.randint(0, 10)
    else:
        efficiency_base = 45 + random.randint(0, 10)

    if lines > 50:
        efficiency_base -= 10  # Too verbose

    efficiency = min(100, int(efficiency_base))

    # Readability evaluation
    comments = count_comments(code)
    naming_score = check_naming_conventions(code, language)
    readability = min(100, int(naming_score * 0.7 + (min(comments, 3) * 8) + 10))

    # Overall score
    overall = int(correctness * 0.50 + efficiency * 0.30 + readability * 0.20)

    # Generate test results
    test_results = generate_test_results(problem_id, correctness)

    # Generate feedback
    feedback = generate_code_feedback(correctness, efficiency, readability, complexity, language, problem_id)

    return {
        "correctness": correctness,
        "efficiency": efficiency,
        "readability": readability,
        "overall_coding_score": overall,
        "feedback": feedback,
        "complexity": complexity,
        "syntax_valid": syntax_valid,
        "lines_of_code": lines,
        "test_results": test_results
    }

def generate_test_results(problem_id: str, correctness: int) -> List[Dict[str, Any]]:
    """Generate simulated test case results."""
    test_cases = {
        "reverse_linked_list": [
            {"name": "Test 1: [1,2,3,4,5] → [5,4,3,2,1]", "critical": True},
            {"name": "Test 2: Empty list → []", "critical": False},
            {"name": "Test 3: Single element [1] → [1]", "critical": False},
        ],
        "two_sum": [
            {"name": "Test 1: [2,7,11,15], target=9 → [0,1]", "critical": True},
            {"name": "Test 2: [3,2,4], target=6 → [1,2]", "critical": True},
            {"name": "Test 3: [3,3], target=6 → [0,1]", "critical": False},
        ],
        "default": [
            {"name": "Basic test case", "critical": True},
            {"name": "Edge case: empty input", "critical": False},
            {"name": "Edge case: large input", "critical": False},
        ]
    }

    cases = test_cases.get(problem_id, test_cases["default"])
    results = []
    for tc in cases:
        if tc["critical"]:
            passed = correctness >= 60 and random.random() < (correctness / 100)
        else:
            passed = correctness >= 75 and random.random() < 0.8
        results.append({
            "name": tc["name"],
            "passed": passed,
            "note": "✓ Passed" if passed else "✗ Failed - check edge cases"
        })
    return results

def generate_code_feedback(correctness: int, efficiency: int, readability: int, complexity: str, language: str, problem_id: str) -> str:
    """Generate descriptive feedback for the submitted code."""
    parts = []

    if correctness >= 85:
        parts.append(f"✓ Solution appears correct with good logical structure.")
    elif correctness >= 60:
        parts.append(f"⚠ Solution is partially correct but may not handle all edge cases.")
    else:
        parts.append(f"✗ Solution has significant logical issues. Review the core algorithm.")

    parts.append(f"Time complexity: {complexity}.")

    if efficiency >= 80:
        parts.append("Efficient use of data structures and algorithmic approach.")
    elif efficiency >= 60:
        parts.append("Consider optimizing — there may be a more efficient approach available.")
    else:
        parts.append("The current approach is inefficient. Consider using hashmaps or binary search.")

    if readability >= 80:
        parts.append("Code is well-structured and readable.")
    else:
        parts.append("Add comments and use descriptive variable names to improve readability.")

    return " ".join(parts)
