import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/dashboard");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Admin Login</h2>

            <input placeholder="Username" />
            <br /><br />

            <input type="password" placeholder="Password" />
            <br /><br />

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;