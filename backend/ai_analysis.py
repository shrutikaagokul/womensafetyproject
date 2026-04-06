# ai_analysis.py

def analyze_text(description):
    if not description:
        return "Low"

    description = description.lower()

    # Keywords
    abusive_words = ["harass", "abuse", "stalk", "threat", "follow", "message"]
    strong_words = ["kill", "attack", "rape", "murder", "kidnap"]

    score = 0

    # Count abusive words
    for word in abusive_words:
        if word in description:
            score += 1

    # Count strong words (higher weight)
    for word in strong_words:
        if word in description:
            score += 2

    # Decide severity
    if score >= 3:
        return "High"
    elif score >= 1:
        return "Medium"
    else:
        return "Low"