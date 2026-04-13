# app.py — S.P.E.A.K. Backend API
# Run: python app.py
# Requires: pip install flask flask-cors

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from datetime import datetime, timezone

from ai_analysis import analyze_text, get_severity_reason
from mapping import prepare_map_data

app = Flask(__name__)

# ── CORS: allow your React dev server ─────────────────────────────────────────
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]}})


# ── Upload folder ──────────────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── In-memory store (replace with a DB in production) ─────────────────────────
reports = []


# ─── Utility ──────────────────────────────────────────────────────────────────
def time_ago(iso_str):
    """Convert ISO timestamp to human-readable 'X min ago' string."""
    try:
        created = datetime.fromisoformat(iso_str)
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        delta = datetime.now(timezone.utc) - created
        minutes = int(delta.total_seconds() // 60)
        if minutes < 1:
            return "just now"
        if minutes < 60:
            return f"{minutes} min ago"
        hours = minutes // 60
        if hours < 24:
            return f"{hours} hr ago"
        return f"{hours // 24} day(s) ago"
    except Exception:
        return "Recently"


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"status": "S.P.E.A.K. backend running 🚀", "reports": len(reports)})


# ── POST /report ───────────────────────────────────────────────────────────────
# Accepts JSON (from ReportForm.jsx fetch) OR multipart/form-data
@app.route("/report", methods=["POST"])
def submit_report():
    # ── Parse body (JSON preferred, form-data fallback) ───────────────────────
    if request.is_json:
        data          = request.get_json(force=True)
        description   = data.get("description", "")
        location      = data.get("location", "")
        latitude      = data.get("latitude", "")
        longitude     = data.get("longitude", "")
        incident_types = data.get("incident_types", [])   # list of strings
        anonymous     = data.get("anonymous", True)
        file_path     = None
    else:
        description    = request.form.get("description", "")
        location       = request.form.get("location", "")
        latitude       = request.form.get("latitude", "")
        longitude      = request.form.get("longitude", "")
        incident_types = request.form.getlist("incident_types")
        anonymous      = request.form.get("anonymous", "true").lower() == "true"
        file_path      = None

        # Handle file upload
        file = request.files.get("file")
        if file and file.filename:
            ext      = os.path.splitext(file.filename)[1]
            filename = str(uuid.uuid4()) + ext
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)

    # ── Validate ───────────────────────────────────────────────────────────────
    if not description or len(description.strip()) < 5:
        return jsonify({"error": "Description too short"}), 400

    # ── AI Analysis ───────────────────────────────────────────────────────────
    severity = analyze_text(description)
    reason   = get_severity_reason(description, severity)

    # ── Build report object ───────────────────────────────────────────────────
    report_id  = "SPK-" + str(uuid.uuid4())[:6].upper()
    timestamp  = datetime.now(timezone.utc).isoformat()

    report = {
        "id":             report_id,
        "description":    description,
        "location":       location,
        "latitude":       latitude,
        "longitude":      longitude,
        "incident_types": incident_types,
        "anonymous":      anonymous,
        "severity":       severity,        # "high" | "medium" | "low"
        "ai_reason":      reason,
        "file_path":      file_path,
        "timestamp":      timestamp,
        "time_ago":       "just now",
    }
    reports.append(report)

    return jsonify({
        "message":   "Report submitted successfully",
        "report_id": report_id,
        "severity":  severity,
        "ai_reason": reason,
    }), 201


# ── GET /reports ───────────────────────────────────────────────────────────────
@app.route("/reports", methods=["GET"])
def get_reports():
    # Refresh time_ago before returning
    enriched = []
    for r in reports:
        entry = dict(r)
        entry["time_ago"] = time_ago(r["timestamp"])
        enriched.append(entry)
    return jsonify(enriched)


# ── GET /map-data ──────────────────────────────────────────────────────────────
# Called by MapView.jsx every 30 seconds
@app.route("/map-data", methods=["GET"])
def map_data():
    # Refresh time_ago before mapping
    for r in reports:
        r["time_ago"] = time_ago(r["timestamp"])
    data = prepare_map_data(reports)
    return jsonify(data)


# ── GET /dashboard-stats ───────────────────────────────────────────────────────
# Called by Dashboard.jsx for KPI cards
@app.route("/dashboard-stats", methods=["GET"])
def dashboard_stats():
    total    = len(reports)
    high     = sum(1 for r in reports if r.get("severity") == "high")
    medium   = sum(1 for r in reports if r.get("severity") == "medium")
    low      = sum(1 for r in reports if r.get("severity") == "low")
    resolved = max(0, total - high - medium)   # demo logic

    # Recent 5 for the live feed
    recent = []
    for r in reversed(reports[-5:]):
        recent.append({
            "id":       r["id"],
            "type":     "danger" if r["severity"] == "high" else ("warning" if r["severity"] == "medium" else "safe"),
            "icon":     "🔴" if r["severity"] == "high" else ("🟡" if r["severity"] == "medium" else "🟢"),
            "location": r.get("location", "Unknown"),
            "desc":     r.get("description", "")[:80],
            "time":     time_ago(r["timestamp"]),
            "status":   "Active" if r["severity"] == "high" else ("Reviewing" if r["severity"] == "medium" else "Resolved"),
        })

    return jsonify({
        "total":      total,
        "active":     high + medium,
        "resolved":   resolved,
        "safe_zones": 14,          # static for now; replace with DB query later
        "high":       high,
        "medium":     medium,
        "low":        low,
        "recent_feed": recent,
    })


# ▶️ Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)