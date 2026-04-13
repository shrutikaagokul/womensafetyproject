# ai_analysis.py — S.P.E.A.K. AI Severity Engine

def analyze_text(description):
    """
    Analyzes incident description and returns severity level.
    Returns: "high", "medium", or "low" (lowercase, consistent with frontend)
    """
    if not description:
        return "low"

    text = description.lower()

    # ── Tier 1: Critical / High severity keywords ──────────────────────────────
    high_keywords = [
        "kill", "killed", "murder", "rape", "raped", "assault", "assaulted",
        "attack", "attacked", "knife", "gun", "weapon", "stab", "stabbed",
        "kidnap", "kidnapped", "abduct", "abducted", "threaten", "threatened",
        "death threat", "beat", "beaten", "choke", "choked", "burn", "acid"
    ]

    # ── Tier 2: Moderate / Medium severity keywords ────────────────────────────
    medium_keywords = [
        "stalk", "stalking", "stalked", "follow", "following", "followed",
        "harass", "harassment", "harassed", "touch", "grope", "groped",
        "shout", "yell", "scream", "scare", "scared", "uncomfortable",
        "grab", "grabbed", "push", "pushed", "intimidate", "intimidated",
        "spy", "spying", "photograph", "record", "watch", "watching",
        "repeatedly", "again and again", "every day", "daily", "won't stop"
    ]

    # ── Tier 3: Low severity patterns ─────────────────────────────────────────
    low_keywords = [
        "unsafe", "dark", "lighting", "suspicious", "uncomfortable area",
        "broken light", "no cctv", "isolated", "deserted", "sketchy"
    ]

    score = 0

    # High-weight scoring
    for word in high_keywords:
        if word in text:
            score += 3

    # Medium-weight scoring
    for word in medium_keywords:
        if word in text:
            score += 1

    # Description length adds context weight
    if len(text) > 200:
        score += 1

    # ── Final classification ───────────────────────────────────────────────────
    if score >= 4:
        return "high"
    elif score >= 2:
        return "medium"
    else:
        return "low"


def get_severity_reason(description, severity):
    """Returns a human-readable reason for the severity classification."""
    reasons = {
        "high":   "Critical threat indicators detected — immediate attention required.",
        "medium": "Harassment or stalking patterns detected — review recommended.",
        "low":    "Environmental safety concern — logged for community awareness."
    }
    return reasons.get(severity, "Analyzed and classified.")