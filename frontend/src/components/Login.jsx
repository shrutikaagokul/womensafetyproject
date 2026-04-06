import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/dashboard");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Admin Login 🔐</h2>

                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />

                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default Login;