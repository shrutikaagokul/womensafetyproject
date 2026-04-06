from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid

# 🔗 Import modules
from ai_analysis import analyze_text
from mapping import prepare_map_data

app = Flask(__name__)
CORS(app)

# 📁 Upload folder
UPLOAD_FOLDER = "../uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 🧠 Temporary storage (acts like database)
reports = []


# 🏠 Home route
@app.route('/')
def home():
    return "Backend is running 🚀"


# 🧪 Test form (temporary frontend)
@app.route('/test')
def test():
    return '''
    <form action="/report" method="post" enctype="multipart/form-data">
        Description: <input name="description"><br><br>
        Location: <input name="location"><br><br>
        Latitude: <input name="latitude"><br><br>
        Longitude: <input name="longitude"><br><br>
        Upload File: <input type="file" name="file"><br><br>
        <button type="submit">Submit</button>
    </form>
    '''


# 📤 Report submission API
@app.route('/report', methods=['POST'])
def report():
    description = request.form.get("description")
    location = request.form.get("location")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    file = request.files.get("file")

    # 🧠 AI Analysis
    severity = analyze_text(description)

    # 📁 File handling with unique name
    file_path = None
    if file:
        filename = str(uuid.uuid4()) + "_" + file.filename
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

    # 📦 Store data
    report_data = {
        "description": description,
        "location": location,
        "latitude": latitude,
        "longitude": longitude,
        "severity": severity,
        "file_path": file_path
    }

    reports.append(report_data)

    return jsonify({"message": "Report submitted successfully"})


# 📥 Get all reports
@app.route('/reports', methods=['GET'])
def get_reports():
    return jsonify(reports)


# 🗺️ Map data API
@app.route('/map-data', methods=['GET'])
def map_data():
    data = prepare_map_data(reports)
    return jsonify(data)


# ▶️ Run server
if __name__ == "__main__":
    app.run(debug=True)