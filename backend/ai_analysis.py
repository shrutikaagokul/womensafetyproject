# ai_analysis.py

def analyze_text(description):
    if not description:
        return {"severity": "Low", "reason": "No content"}

    description = description.lower()

    if "kill" in description or "rape" in description:
        return {"severity": "High", "reason": "Severe threat detected"}

    if "threat" in description or "stalk" in description:
        return {"severity": "Medium", "reason": "Harassment detected"}

    return {"severity": "Low", "reason": "No strong indicators"}
    if not description:
        return "Low"

    description = description.lower()

    # Basic keywords
    abusive_words = ["harass", "abuse", "stalk", "threat", "follow", "message"]
    strong_words = ["kill", "attack", "rape", "murder", "kidnap"]

    # Pattern-based detection
    repeated_patterns = ["again and again", "repeatedly", "daily"]

    score = 0

    # Count abusive words
    for word in abusive_words:
        if word in description:
            score += 1

    # Count strong words (higher weight)
    for word in strong_words:
        if word in description:
            score += 2

    # Detect repeated harassment
    for pattern in repeated_patterns:
        if pattern in description:
            score += 1

    # Final classification
    if score >= 4:
        return "High"
    elif score >= 2:
        return "Medium"
    else:
        return "Low"
