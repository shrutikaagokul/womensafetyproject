// AdminLogin.jsx — S.P.E.A.K. Admin Command Access
// Place: src/components/AdminLogin.jsx
// Route: /admin-login  (add to App.jsx)

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

// ─── Role display config ──────────────────────────────────────────────────────
const ROLE_META = {
    "System Admin": { icon: "🧑‍💻", color: "#f5a623", desc: "Full platform control" },
    "Authority Admin": { icon: "👮‍♀️", color: "#e05c5c", desc: "Reports & field response" },
    "Emergency Handler": { icon: "🚨", color: "#5ce0a0", desc: "SOS alerts only" },
};

// ─── Scan-line grid rows (decorative) ────────────────────────────────────────
const GRID_ROWS = 18;

export default function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [phase, setPhase] = useState("idle"); // idle | scanning | granted | denied
    const [roleInfo, setRoleInfo] = useState(null);
    const [typedRole, setTypedRole] = useState("");
    const [glitch, setGlitch] = useState(false);

    // ── Cursor refs ────────────────────────────────────────────────────────────
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const rafRef = useRef(null);
    const mx = useRef(0), my = useRef(0);
    const rx = useRef(0), ry = useRef(0);

    // ── Custom cursor ──────────────────────────────────────────────────────────
    useEffect(() => {
        const onMove = (e) => {
            mx.current = e.clientX; my.current = e.clientY;
            if (cursorRef.current) {
                cursorRef.current.style.left = e.clientX + "px";
                cursorRef.current.style.top = e.clientY + "px";
            }
        };
        document.addEventListener("mousemove", onMove);
        const animRing = () => {
            rx.current += (mx.current - rx.current) * 0.10;
            ry.current += (my.current - ry.current) * 0.10;
            if (ringRef.current) {
                ringRef.current.style.left = rx.current + "px";
                ringRef.current.style.top = ry.current + "px";
            }
            rafRef.current = requestAnimationFrame(animRing);
        };
        rafRef.current = requestAnimationFrame(animRing);
        return () => {
            document.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const onCE = () => {
        if (cursorRef.current) cursorRef.current.style.transform = "translate(-50%,-50%) scale(2)";
        if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(0.4)";
    };
    const onCL = () => {
        if (cursorRef.current) cursorRef.current.style.transform = "translate(-50%,-50%) scale(1)";
        if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(1)";
    };
    const hc = { onMouseEnter: onCE, onMouseLeave: onCL };

    // ── Typewriter effect for role name ───────────────────────────────────────
    const typeRole = (roleName) => {
        setTypedRole("");
        let i = 0;
        const id = setInterval(() => {
            setTypedRole(roleName.slice(0, i + 1));
            i++;
            if (i >= roleName.length) clearInterval(id);
        }, 55);
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("All fields required."); return;
        }

        setPhase("scanning");
        setLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:5000/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setPhase("denied");
                setGlitch(true);
                setError(data.error || "Access denied.");
                setTimeout(() => { setPhase("idle"); setGlitch(false); setLoading(false); }, 1800);
                return;
            }

            // ── Access granted ─────────────────────────────────────────────────
            setPhase("granted");
            const meta = ROLE_META[data.role] || ROLE_META["System Admin"];
            setRoleInfo({ ...data, ...meta });
            typeRole(data.role);

            // Store admin session
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("adminRole", data.role);
            localStorage.setItem("adminEmail", data.email);

            // Navigate after "granted" animation plays out
            setTimeout(() => navigate("/admin/dashboard"), 2200);

        } catch {
            setPhase("denied");
            setGlitch(true);
            setError("Cannot reach server. Is app.py running?");
            setTimeout(() => { setPhase("idle"); setGlitch(false); setLoading(false); }, 1800);
        }
    };

    const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className={`al-root ${glitch ? "al-glitch" : ""}`}>
            {/* Custom cursor */}
            <div className="al-cursor" ref={cursorRef} />
            <div className="al-cursor-ring" ref={ringRef} />

            {/* ── Background grid ──────────────────────────────────────────── */}
            <div className="al-grid-bg">
                {Array.from({ length: GRID_ROWS }).map((_, i) => (
                    <div className="al-grid-row" key={i} />
                ))}
            </div>

            {/* ── Scan line overlay ─────────────────────────────────────────── */}
            <div className="al-scanline" />

            {/* ── Corner brackets ───────────────────────────────────────────── */}
            <div className="al-corner al-corner-tl" />
            <div className="al-corner al-corner-tr" />
            <div className="al-corner al-corner-bl" />
            <div className="al-corner al-corner-br" />

            {/* ── System status bar ─────────────────────────────────────────── */}
            <div className="al-statusbar">
                <span className="al-status-item">
                    <span className="al-status-dot al-dot-green" />
                    SYSTEM ONLINE
                </span>
                <span className="al-status-item al-status-center">
                    S.P.E.A.K. SECURE TERMINAL v2.0
                </span>
                <span className="al-status-item">
                    <span className="al-status-dot al-dot-amber" />
                    RESTRICTED ACCESS
                </span>
            </div>

            {/* ── Main card ─────────────────────────────────────────────────── */}
            <div className="al-wrap">
                <div className={`al-card ${phase === "granted" ? "al-card-granted" : ""} ${phase === "denied" ? "al-card-denied" : ""}`}>

                    {/* ── Phase: GRANTED ──────────────────────────────────── */}
                    {phase === "granted" && roleInfo && (
                        <div className="al-granted-screen">
                            <div className="al-granted-icon">{roleInfo.icon}</div>
                            <div className="al-granted-label">ACCESS GRANTED</div>
                            <div className="al-granted-role" style={{ color: roleInfo.color }}>
                                {typedRole}<span className="al-cursor-blink">_</span>
                            </div>
                            <div className="al-granted-desc">{roleInfo.desc}</div>
                            <div className="al-granted-bar">
                                <div className="al-granted-bar-fill" />
                            </div>
                            <div className="al-granted-sub">Initialising admin panel…</div>
                        </div>
                    )}

                    {/* ── Phase: SCANNING / IDLE / DENIED ─────────────────── */}
                    {phase !== "granted" && (
                        <>
                            {/* Header */}
                            <div className="al-header">
                                <div className="al-shield-wrap">
                                    <div className="al-shield">🛡️</div>
                                    <div className="al-shield-ring" />
                                </div>
                                <div className="al-brand">S.P.E.A.K.</div>
                                <div className="al-brand-sub">ADMIN COMMAND CENTRE</div>
                                <div className="al-divider-line" />
                                <div className="al-warning-strip">
                                    ⚠ &nbsp; AUTHORISED PERSONNEL ONLY &nbsp; ⚠
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="al-fields">
                                <div className="al-field-group">
                                    <label className="al-label">OPERATOR ID</label>
                                    <div className="al-input-wrap">
                                        <span className="al-input-prefix">▶</span>
                                        <input
                                            className="al-input"
                                            type="email"
                                            placeholder="admin@speak.ai"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyDown={handleKey}
                                            autoComplete="email"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>

                                <div className="al-field-group">
                                    <label className="al-label">SECURITY KEY</label>
                                    <div className="al-input-wrap">
                                        <span className="al-input-prefix">▶</span>
                                        <input
                                            className="al-input"
                                            type={showPass ? "text" : "password"}
                                            placeholder="••••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            onKeyDown={handleKey}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            className="al-eye"
                                            onClick={() => setShowPass(s => !s)}
                                            tabIndex={-1}
                                            {...hc}
                                        >
                                            {showPass ? "◉" : "◎"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="al-error">
                                    <span className="al-error-icon">✕</span>
                                    {error}
                                </div>
                            )}

                            {/* Scanning bar */}
                            {phase === "scanning" && (
                                <div className="al-scan-wrap">
                                    <div className="al-scan-label">VERIFYING CREDENTIALS…</div>
                                    <div className="al-scan-track">
                                        <div className="al-scan-beam" />
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            {phase !== "scanning" && (
                                <button
                                    className="al-submit"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    {...hc}
                                >
                                    <span className="al-submit-bracket">[</span>
                                    <span>AUTHENTICATE &amp; ENTER</span>
                                    <span className="al-submit-bracket">]</span>
                                </button>
                            )}

                            {/* Role hint */}
                            <div className="al-role-hints">
                                <div className="al-role-hint-label">AVAILABLE ACCESS LEVELS</div>
                                <div className="al-role-pills">
                                    {Object.entries(ROLE_META).map(([role, meta]) => (
                                        <div className="al-role-pill" key={role} style={{ borderColor: meta.color + "44" }}>
                                            <span>{meta.icon}</span>
                                            <span style={{ color: meta.color }}>{role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="al-footer">
                                <span>All access attempts are logged and monitored.</span>
                                <button
                                    className="al-back-link"
                                    onClick={() => navigate("/")}
                                    {...hc}
                                >
                                    ← Return to public site
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}