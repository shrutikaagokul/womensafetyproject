import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReportForm from "./components/ReportForm";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MapView from "./components/MapView";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ReportForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<MapView />} />
            </Routes>
        </Router>
    );
}

export default App;