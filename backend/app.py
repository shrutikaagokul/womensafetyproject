from flask import Flask, request, jsonify
from ai_analysis import analyze_text
from mapping import prepare_map_data

app = Flask(__name__)

# Temporary storage
reports = []

# POST: Submit report
@app.route("/report", methods=["POST"])
def create_report():
    description = request.form.get("description")
    location = request.form.get("location")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")

    # 🔥 YOUR AI HERE
    severity = analyze_text(description)

    report = {
        "description": description,
        "location": location,
        "latitude": latitude,
        "longitude": longitude,
        "severity": severity
    }

    reports.append(report)

    return jsonify({"message": "Report submitted", "severity": severity})


# GET: All reports
@app.route("/reports", methods=["GET"])
def get_reports():
    return jsonify(reports)


# OPTIONAL: Map API
@app.route("/map-data", methods=["GET"])
def map_data():
    return jsonify(prepare_map_data(reports))


if __name__ == "__main__":
    app.run(debug=True)