import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Home from "./components/Home";
import ReportForm from "./components/ReportForm";
import Dashboard from "./components/Dashboard";
import MapView from "./components/MapView";

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/report" element={<ProtectedRoute><ReportForm /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;