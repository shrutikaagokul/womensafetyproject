import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import ReportForm from "./components/ReportForm";
import Dashboard from "./components/Dashboard";
import MapView from "./components/MapView";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<MapView />} />
            </Routes>
        </Router>
    );
}

export default App;