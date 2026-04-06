import { Link } from "react-router-dom";

function Home() {
    return (
        <div style={{ padding: "20px" }}>
            <h1>Women Safety Platform 💜</h1>

            <p>
                This platform allows users to report incidents, view safety insights,
                and analyze unsafe areas.
            </p>

            <br />

            <Link to="/">
                <button>Report Incident</button>
            </Link>

            <br /><br />

            <Link to="/dashboard">
                <button>View Dashboard</button>
            </Link>

            <br /><br />

            <Link to="/map">
                <button>View Map</button>
            </Link>
        </div>
    );
}

export default Home;