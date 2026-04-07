// Login.jsx — S.P.E.A.K. Login / Sign Up Page
// Place in: src/components/Login.jsx
// Route in App.jsx: <Route path="/login" element={<Login />} />

import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

// ─── Password strength scorer ──────────────────────────────────────────────────
const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '', width: '0%' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: 'Too weak', color: '#f0578e', width: '20%' },
        { label: 'Weak', color: '#ff9060', width: '35%' },
        { label: 'Fair', color: '#e0a020', width: '55%' },
        { label: 'Good', color: '#60c8a0', width: '75%' },
        { label: 'Strong', color: '#34c889', width: '100%' },
    ];
    return { score, ...map[Math.min(score, 4)] };
};

export default function Login() {
    const navigate = useNavigate();

    // ── Mode: 'signin' | 'signup' ──────────────────────────────────────────────
    const [mode, setMode] = useState('signin');

    // ── Form fields ────────────────────────────────────────────────────────────
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [agreed, setAgreed] = useState(false);

    // ── UI state ───────────────────────────────────────────────────────────────
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    // ── Cursor refs ────────────────────────────────────────────────────────────
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const rafRef = useRef(null);
    const mx = useRef(0), my = useRef(0);
    const rx = useRef(0), ry = useRef(0);

    // ─────────────────────────────────────────────────────────────────────────
    // Custom cursor
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const onMove = (e) => {
            mx.current = e.clientX; my.current = e.clientY;
            if (cursorRef.current) {
                cursorRef.current.style.left = e.clientX + 'px';
                cursorRef.current.style.top = e.clientY + 'px';
            }
        };
        document.addEventListener('mousemove', onMove);
        const animRing = () => {
            rx.current += (mx.current - rx.current) * 0.14;
            ry.current += (my.current - ry.current) * 0.14;
            if (ringRef.current) {
                ringRef.current.style.left = rx.current + 'px';
                ringRef.current.style.top = ry.current + 'px';
            }
            rafRef.current = requestAnimationFrame(animRing);
        };
        rafRef.current = requestAnimationFrame(animRing);
        return () => {
            document.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const onCursorEnter = () => {
        if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1.8)';
        if (ringRef.current) ringRef.current.style.transform = 'translate(-50%,-50%) scale(0.5)';
    };
    const onCursorLeave = () => {
        if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
        if (ringRef.current) ringRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
    };
    const hc = { onMouseEnter: onCursorEnter, onMouseLeave: onCursorLeave };

    // ─────────────────────────────────────────────────────────────────────────
    // Toast
    // ─────────────────────────────────────────────────────────────────────────
    const showToast = (msg) => {
        setToast(msg); setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2800);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Reset form when mode switches
    // ─────────────────────────────────────────────────────────────────────────
    const switchMode = (m) => {
        setMode(m);
        setErrors({});
        setName(''); setEmail(''); setPassword('');
        setAgreed(false); setShowPw(false);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (mode === 'signup' && !name.trim())
            errs.name = 'Full name is required.';
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
            errs.email = 'A valid email is required.';
        if (!password || password.length < 8)
            errs.password = 'Password must be at least 8 characters.';
        if (mode === 'signup' && !agreed)
            errs.agreed = 'You must agree to the terms to continue.';
        return errs;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1600));
        localStorage.setItem('isAuthenticated', 'true');
        if (mode === 'signup') localStorage.setItem('userName', name.split(' ')[0]);
        setLoading(false);
        showToast(mode === 'signup' ? '🎉 Account created! Welcome to S.P.E.A.K.' : '✅ Signed in successfully!');
        setTimeout(() => navigate('/'), 900);
    };

    // ─────────────────────────────────────────────────────────────────────────
    const strength = getStrength(password);
    const isSignUp = mode === 'signup';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="login-page">
            {/* ── Cursor ──────────────────────────────────────────── */}
            <div className="lg-cursor" ref={cursorRef} />
            <div className="lg-cursor-ring" ref={ringRef} />

            {/* ── Background ──────────────────────────────────────── */}
            <div className="lg-blob lg-blob-1" />
            <div className="lg-blob lg-blob-2" />
            <div className="lg-blob lg-blob-3" />
            <div className="lg-ring lg-ring-1" />
            <div className="lg-ring lg-ring-2" />

            {/* ── Quick exit ──────────────────────────────────────── */}
            <button
                className="lg-quick-exit"
                onClick={() => (window.location.href = 'https://google.com')}
                {...hc}
            >
                🚪 <span>Quick Exit</span>
            </button>

            {/* ── Card ────────────────────────────────────────────── */}
            <div className="lg-card-wrap">
                <div className="lg-card">

                    {/* Brand */}
                    <div className="lg-brand">
                        <span className="lg-logo">S.P.E.A.K.</span>
                        <div className="lg-tagline">Secure Platform for Evidence & Awareness</div>
                    </div>

                    {/* Mode tabs */}
                    <div className="lg-tabs">
                        <button
                            className={`lg-tab ${!isSignUp ? 'active' : ''}`}
                            onClick={() => switchMode('signin')}
                            {...hc}
                        >
                            Sign In
                        </button>
                        <button
                            className={`lg-tab ${isSignUp ? 'active' : ''}`}
                            onClick={() => switchMode('signup')}
                            {...hc}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Welcome copy */}
                    <p className="lg-welcome">
                        {isSignUp
                            ? 'Join our secure community. Your identity stays protected — always.'
                            : 'Welcome back — sign in to access your safety dashboard.'}
                    </p>

                    {/* ── Name field (signup only) ─────────────────────── */}
                    {isSignUp && (
                        <div className="lg-field">
                            <div className="lg-field-label">
                                <span>👤</span> Full Name
                            </div>
                            <input
                                className={`lg-input ${errors.name ? 'error' : ''}`}
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                            />
                            <span className="lg-input-icon">✏️</span>
                            {errors.name && <div className="lg-error-text">⚠️ {errors.name}</div>}
                        </div>
                    )}

                    {/* ── Email ────────────────────────────────────────── */}
                    <div className="lg-field">
                        <div className="lg-field-label">
                            <span></span> Email Address
                        </div>
                        <input
                            className={`lg-input ${errors.email ? 'error' : ''}`}
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                        <span className="lg-input-icon">@</span>
                        {errors.email && <div className="lg-error-text">⚠️ {errors.email}</div>}
                    </div>

                    {/* ── Password ─────────────────────────────────────── */}
                    <div className="lg-field">
                        <div className="lg-field-label">
                            <span></span> Password
                        </div>
                        <input
                            className={`lg-input ${errors.password ? 'error' : ''}`}
                            type={showPw ? 'text' : 'password'}
                            placeholder={isSignUp ? 'Min 8 characters' : 'Enter your password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        />
                        <button
                            className="lg-pw-toggle"
                            onClick={() => setShowPw(s => !s)}
                            tabIndex={-1}
                            {...hc}
                        >
                            {showPw ? '🙈' : '👁️'}
                        </button>
                        {errors.password && <div className="lg-error-text">⚠️ {errors.password}</div>}

                        {/* Strength bar — signup only */}
                        {isSignUp && password.length > 0 && (
                            <div className="lg-strength-wrap">
                                <div className="lg-strength-track">
                                    <div
                                        className="lg-strength-fill"
                                        style={{ width: strength.width, background: strength.color }}
                                    />
                                </div>
                                <span className="lg-strength-label" style={{ color: strength.color }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── Forgot password (signin only) ────────────────── */}
                    {!isSignUp && (
                        <div className="lg-forgot">
                            <a href="#" {...hc}>Forgot password?</a>
                        </div>
                    )}

                    {/* ── Terms checkbox (signup only) ─────────────────── */}
                    {isSignUp && (
                        <div className="lg-terms" onClick={() => setAgreed(a => !a)} {...hc}>
                            <div className={`lg-checkbox ${agreed ? 'checked' : ''}`}>
                                <span className="lg-checkbox-tick">✓</span>
                            </div>
                            <div className="lg-terms-text">
                                I agree to the{' '}
                                <a href="#" onClick={e => e.stopPropagation()} {...hc}>Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" onClick={e => e.stopPropagation()} {...hc}>Privacy Policy</a>.
                                I understand my data is handled anonymously.
                            </div>
                        </div>
                    )}
                    {errors.agreed && <div className="lg-error-text" style={{ marginBottom: 12 }}>⚠️ {errors.agreed}</div>}

                    {/* ── Submit CTA ───────────────────────────────────── */}
                    <button
                        className="lg-submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                        {...hc}
                    >
                        {loading ? (
                            <><div className="lg-spinner" /><span>Please wait…</span></>
                        ) : isSignUp ? (
                            <><span>🛡️</span><span>Create My Account</span></>
                        ) : (
                            <><span></span><span>Sign in to S.P.E.A.K.</span></>
                        )}
                    </button>

                    {/* ── Divider + OAuth ──────────────────────────────── */}
                    <div className="lg-divider">
                        <div className="lg-divider-line" />
                        <span className="lg-divider-text">or continue with</span>
                        <div className="lg-divider-line" />
                    </div>

                    <div className="lg-oauth-row">
                        <button
                            className="lg-oauth-btn"
                            onClick={() => showToast('🔗 Google OAuth coming soon')}
                            {...hc}
                        >
                            <span className="lg-oauth-icon"></span> Google
                        </button>
                        <button
                            className="lg-oauth-btn"
                            onClick={() => showToast('🔗 Apple OAuth coming soon')}
                            {...hc}
                        >
                            <span className="lg-oauth-icon"></span> Apple
                        </button>
                    </div>

                    {/* ── Privacy note ─────────────────────────────────── */}
                    <div className="lg-privacy">
                        <span className="lg-privacy-icon">🔒</span>
                        <span className="lg-privacy-text">
                            <strong>Your privacy is our priority.</strong>{' '}
                            All connections are encrypted. We never sell or share personal data.
                            Anonymous reporting is always available.
                        </span>
                    </div>

                    {/* ── Switch mode ──────────────────────────────────── */}
                    <div className="lg-switch">
                        {isSignUp
                            ? <>Already have an account?<button onClick={() => switchMode('signin')} {...hc}>Sign in</button></>
                            : <>Don't have an account?<button onClick={() => switchMode('signup')} {...hc}>Create one</button></>
                        }
                    </div>

                </div>
            </div>

            {/* ── Toast ───────────────────────────────────────────── */}
            <div className={`lg-toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
        </div>
    );
}