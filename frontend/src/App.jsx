import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./components/Home";
import ReportForm from "./components/ReportForm";
import Dashboard from "./components/Dashboard";
import MapView from "./components/MapView";
import Login from "./components/Login"; // optional

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* 🏠 Home */}
                <Route path="/" element={<Home />} />

                {/* 🚨 Report */}
                <Route path="/report" element={<ReportForm />} />

                {/* 📊 Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* 🗺️ Map */}
                <Route path="/map" element={<MapView />} />

                {/* 🔐 Login (optional) */}
                <Route path="/login" element={<Login />} />

                {/* ❌ Fallback */}
                <Route path="*" element={<Home />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;