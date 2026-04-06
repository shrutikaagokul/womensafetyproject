import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    return (
        <div className="page">

            {/* BACKGROUND SVG */}
            <svg className="bg-canvas" viewBox="0 0 800 680">
                <circle cx="120" cy="130" r="72" fill="rgba(224,122,170,0.13)" />
                <circle cx="680" cy="520" r="90" fill="rgba(184,151,245,0.14)" />
                <circle cx="720" cy="100" r="55" fill="rgba(139,196,248,0.15)" />
            </svg>

            {/* CARD */}
            <div className="card-wrap">
                <div className="glass-card">

                    <div className="brand-row">
                        <div className="brand-name">S.P.E.A.K</div>
                    </div>

                    <div className="welcome-text">
                        Welcome back — sign in to access your dashboard
                    </div>

                    <input
                        className="field-input"
                        type="email"
                        placeholder="Email"
                    />

                    <input
                        className="field-input"
                        type="password"
                        placeholder="Password"
                    />

                    <button className="sign-btn" onClick={() => navigate("/dashboard")}>
                        Sign in to S.P.E.A.K
                    </button>

                </div>
            </div>

        </div>
    );
}

export default Login;