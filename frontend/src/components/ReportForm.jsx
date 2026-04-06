import React, { useState } from "react";
import "./ReportForm.css";

function ReportForm() {
    const [formData, setFormData] = useState({
        description: "",
        location: "",
        latitude: "",
        longitude: ""
    });

    const [file, setFile] = useState(null);

    // Handle input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 📍 Get Location
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            });
        } else {
            alert("Geolocation not supported");
        }
    };

    // 🎤 Voice to text
    const startVoice = () => {
        if (!window.webkitSpeechRecognition) {
            alert("Voice not supported in this browser");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.onresult = (event) => {
            setFormData({
                ...formData,
                description: event.results[0][0].transcript
            });
        };
        recognition.start();
    };

    // 🚀 Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append("description", formData.description);
        form.append("location", formData.location);
        form.append("latitude", formData.latitude);
        form.append("longitude", formData.longitude);

        if (file) {
            form.append("file", file);
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/report", {
                method: "POST",
                body: form
            });

            const data = await response.json();
            alert(data.message);

            // reset
            setFormData({
                description: "",
                location: "",
                latitude: "",
                longitude: ""
            });
            setFile(null);

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="form-container">

            {/* Quick Exit */}
            <button className="quick-exit" onClick={() => window.location.href = "https://google.com"}>
                🔐 Exit
            </button>

            <form className="report-form" onSubmit={handleSubmit}>

                <h2 className="title">S.P.E.A.K.</h2>
                <p className="subtitle">Secure Platform for Evidence & Analysis</p>

                {/* Description */}
                <div className="input-group">
                    <label>Description</label>
                    <div className="textarea-wrapper">
                        <textarea
                            name="description"
                            placeholder="Describe the incident..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                        <span className="mic" onClick={startVoice}>🎤</span>
                    </div>
                </div>

                {/* AI Feedback */}
                <div className="ai-indicator">
                    <span className="pulse"></span>
                    <span>AI analyzing...</span>
                </div>

                {/* Location Group */}
                <div className="location-box">
                    <label>Location Details</label>

                    <input
                        type="text"
                        name="location"
                        placeholder="Enter location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />

                    <button type="button" className="location-btn" onClick={getLocation}>
                        📍 Detect My Location
                    </button>

                    <div className="coords">
                        <input
                            type="text"
                            name="latitude"
                            placeholder="Latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="longitude"
                            placeholder="Longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div className="upload-box">
                    <label>Upload Evidence</label>

                    <div className="drop-zone">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <p>📁 Drag & Drop or Click to Upload</p>
                    </div>

                    {file && <p className="file-name">Selected: {file.name}</p>}
                </div>

                <button className="submit-btn" type="submit">
                    Submit Report
                </button>

            </form>
        </div>
    );
}

export default ReportForm;