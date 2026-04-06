import { Link } from "react-router-dom";

function Navbar() {
    return (
        <div style={{
            padding: "10px",
            background: "#F7D6E0"
        }}>
            <Link to="/">Home</Link> |{" "}
            <Link to="/report">Report</Link> |{" "}
            <Link to="/dashboard">Dashboard</Link> |{" "}
            <Link to="/map">Map</Link> |{" "}
            <Link to="/login">Login</Link>
        </div>
    );
}

export default Navbar;