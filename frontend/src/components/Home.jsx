// Home.jsx — S.P.E.A.K. Homepage
// Make sure to add this to your index.html <head> (or index.css @import):
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Home.css';


// ─── Ticker data ───────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
    'Anonymous & Secure',
    'AI-Powered Analysis',
    'Real-time Safety Map',
    'Privacy First Always',
    '24/7 Emergency Access',
];

// ─── Stats data ────────────────────────────────────────────────────────────────
const STATS = [
    { type: 'danger', icon: '🔴', number: 5, label: 'High Risk Areas Detected', tag: 'High Risk' },
    { type: 'warning', icon: '🟡', number: 3, label: 'Medium Risk Cases Open', tag: 'Moderate' },
    { type: 'safe', icon: '🟢', number: 2, label: 'Verified Safe Zones Near You', tag: 'Clear' },
];

// ─── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
    {
        num: '01 —',
        icon: '🔐',
        title: 'Anonymous Reporting',
        desc: 'Submit incidents without ever revealing your identity. Zero metadata, zero traces — your safety is our design principle.',
    },
    {
        num: '02 —',
        icon: '🧠',
        title: 'AI Analysis Engine',
        desc: 'Our model classifies incident severity instantly, detecting patterns and flagging critical situations before they escalate.',
    },
    {
        num: '03 —',
        icon: '🗺️',
        title: 'Safety Mapping',
        desc: 'Real-time heat maps surface unsafe corridors and protect your community through collective, anonymous awareness.',
    },
];

// ─── Map legend ────────────────────────────────────────────────────────────────
const MAP_LEGEND = [
    { color: '#f0578e', label: 'High-risk reported zones' },
    { color: 'var(--lavender-400)', label: 'Active patrol areas' },
    { color: '#34c889', label: 'Verified safe zones' },
];

export default function Home() {
    // ── State ──────────────────────────────────────────────────────────────────
    const navigate = useNavigate();
    const [dark, setDark] = useState(false);
    const [sosOpen, setSosOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [toast, setToast] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    // ── Refs ───────────────────────────────────────────────────────────────────
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const rafRef = useRef(null);
    const mx = useRef(0), my = useRef(0);
    const rx = useRef(0), ry = useRef(0);

    // ── Dark mode toggle ───────────────────────────────────────────────────────
    useEffect(() => {
        document.body.classList.toggle('dark', dark);
    }, [dark]);

    // ── Custom cursor ──────────────────────────────────────────────────────────
    useEffect(() => {
        const onMove = (e) => {
            mx.current = e.clientX;
            my.current = e.clientY;
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

    // ── Cursor hover scale ─────────────────────────────────────────────────────
    const onCursorEnter = () => {
        if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1.8)';
        if (ringRef.current) ringRef.current.style.transform = 'translate(-50%,-50%) scale(0.5)';
    };
    const onCursorLeave = () => {
        if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
        if (ringRef.current) ringRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
    };

    // ── Scroll reveal ──────────────────────────────────────────────────────────
    useEffect(() => {
        const els = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e, i) => {
                    if (e.isIntersecting) {
                        setTimeout(() => e.target.classList.add('visible'), i * 80);
                        observer.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = (msg) => {
        setToast(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2800);
    };

    // ── Close profile when clicking outside ───────────────────────────────────
    useEffect(() => {
        const close = () => setProfileOpen(false);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    // ── Shared hover props for interactive elements ────────────────────────────
    const hoverCursor = { onMouseEnter: onCursorEnter, onMouseLeave: onCursorLeave };

    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            {/* Custom cursor */}
            <div className="cursor" ref={cursorRef} />
            <div className="cursor-ring" ref={ringRef} />

            {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
            <nav className="navbar">
                <a href="#" className="nav-logo" {...hoverCursor}>S.P.E.A.K.</a>

                <ul className="nav-links">
                    {['Home', 'Report', 'Dashboard', 'Map'].map((item) => (
                        <li key={item}>
                            <a href="#" {...hoverCursor}>{item}</a>
                        </li>
                    ))}
                </ul>

                <div className="nav-right">
                    {/* Dark mode */}
                    <button
                        className="nav-icon-btn"
                        onClick={() => setDark((d) => !d)}
                        {...hoverCursor}
                    >
                        {dark ? '☀️' : '🌙'}
                    </button>

                    {/* Notifications */}
                    <button className="nav-icon-btn" {...hoverCursor}>
                        🔔
                        <span className="notif-dot" />
                    </button>

                    {/* Profile dropdown */}
                    <div className="profile-btn-wrap">
                        <button
                            className="nav-icon-btn"
                            onClick={(e) => { e.stopPropagation(); setProfileOpen((o) => !o); }}
                            {...hoverCursor}
                        >
                            👤
                        </button>
                        <div className={`profile-dropdown ${profileOpen ? 'open' : ''}`}>
                            <Link to="/dashboard" {...hoverCursor}> My Reports</Link>
                            <Link to="/settings" {...hoverCursor}> Settings</Link>
                            <div className="dropdown-divider" />
                            <Link to="/" style={{ color: "#f0578e" }} {...hoverCursor}> Logout</Link>
                        </div>

                        {/* Quick exit */}
                        <button
                            className="quick-exit"
                            onClick={() => (window.location.href = 'https://google.com')}
                            {...hoverCursor}
                        >
                            ⚡ Quick Exit
                        </button>
                    </div>
            </nav>

            {/* ── TICKER ──────────────────────────────────────────────────────── */}
            <div className="ticker-strip">
                <div className="ticker-track">
                    {/* Doubled for seamless loop */}
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span className="ticker-item" key={i}>
                            <span className="ticker-dot" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── HERO ────────────────────────────────────────────────────────── */}
            <section className="hero">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
                <div className="hero-ring" />

                <div className="hero-visual">
                    <div className="shield-glyph">🛡️</div>
                </div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-dot" />
                        Privacy-First Platform · Active Now
                    </div>

                    <h1 className="hero-title">
                        Report <em>Safely.</em><br />
                        Stay <em>Protected.</em>
                    </h1>

                    <p className="hero-sub">
                        Your anonymous, AI-powered platform for incident reporting and community
                        safety awareness. Speak up without fear.
                    </p>

                    <div className="hero-buttons">
                        <button
                            className="btn-primary"
                            onClick={() => showToast('Opening report form...')}
                            {...hoverCursor}
                        >
                            <span>🔴</span><span>Report Incident</span>
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() =>
                                document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })
                            }
                            {...hoverCursor}
                        >
                            <span>🗺️</span><span>View Safety Map</span>
                        </button>
                    </div>
                </div>

                <div className="hero-scroll">
                    <div className="scroll-line" />
                    <span className="scroll-text">Explore</span>
                </div>
            </section>

            {/* ── STATS ───────────────────────────────────────────────────────── */}
            <section className="stats-section">
                <div className="stats-inner">
                    <div className="stats-header reveal">
                        <div className="section-label">Live Data</div>
                        <h2 className="section-title">Safety at a Glance</h2>
                        <p className="section-sub">
                            Real-time incident data from your city, powered by our analysis engine.
                        </p>
                    </div>

                    <div className="stats-grid">
                        {STATS.map((s) => (
                            <div className={`stat-card ${s.type} reveal`} key={s.type}>
                                <span className="stat-tag">{s.tag}</span>
                                <div className="stat-icon-wrap">{s.icon}</div>
                                <div className="stat-number">{s.number}</div>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-bar">
                                    <div className="stat-fill" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MAP ─────────────────────────────────────────────────────────── */}
            <section className="map-section" id="map-section">
                <div className="map-section-inner">
                    {/* Left: info */}
                    <div className="reveal">
                        <div className="section-label">Nearby Zones</div>
                        <h2 className="section-title">Your Safety Map</h2>
                        <p className="section-sub">
                            Explore nearby safety zones, reported incidents, and safe corridors in real time.
                        </p>

                        <div className="map-legend">
                            {MAP_LEGEND.map((l) => (
                                <div className="legend-item" key={l.label}>
                                    <div className="legend-dot" style={{ background: l.color }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <button
                                className="btn-primary"
                                onClick={() => showToast('Launching full map...')}
                                {...hoverCursor}
                            >
                                <span>🗺️</span><span>Open Full Map</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: map preview */}
                    <div className="map-visual reveal">
                        <div className="map-placeholder">
                            <div className="map-grid-lines" />
                            <div className="map-dot map-dot-1">🔴</div>
                            <div className="map-dot map-dot-2">🔵</div>
                            <div className="map-dot map-dot-3">🟢</div>
                            <div className="map-center-label">📍 Tap any marker for details</div>
                            <button className="map-btn" {...hoverCursor}>🔍 Explore</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ────────────────────────────────────────────────────── */}
            <section className="features-section">
                <div className="features-inner">
                    <div className="features-header reveal">
                        <div className="section-label">Why S.P.E.A.K.</div>
                        <h2 className="section-title">Built for your protection</h2>
                        <p className="section-sub">
                            Every feature designed with safety, privacy, and community awareness at its core.
                        </p>
                    </div>

                    <div className="features-grid">
                        {FEATURES.map((f) => (
                            <div className="feature-card reveal" key={f.num}>
                                <div className="feature-number">{f.num}</div>
                                <div className="feature-icon-area">{f.icon}</div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                                <a href="#" className="feature-link" {...hoverCursor}>
                                    Learn more <span className="feature-link-arrow">→</span>
                                </a>
                                <div className="feature-bg-glyph">{f.icon}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <button onClick={() => navigate("/report")}>
                Report Incident
            </button>
            {/* ── FOOTER ──────────────────────────────────────────────────────── */}
            <footer>
                <div className="footer-inner">
                    <div className="footer-logo">S.P.E.A.K.</div>
                    <ul className="footer-links">
                        {['Home', 'Report', 'Dashboard', 'Safety Map', 'Privacy Policy'].map((l) => (
                            <li key={l}><a href="#" {...hoverCursor}>{l}</a></li>
                        ))}
                    </ul>
                </div>
                <div className="footer-inner footer-copy">
                    <span>© 2025 S.P.E.A.K. Platform. All rights reserved.</span>
                    <span className="footer-made">
                        Made with <span className="heart">♥</span> for safer communities
                    </span>
                </div>
            </footer>

            {/* ── SOS FLOATING BUTTON ─────────────────────────────────────────── */}
            <div className="sos-wrapper">
                <button
                    className="sos-btn"
                    onClick={() => setSosOpen(true)}
                    {...hoverCursor}
                >
                    <div className="sos-ring" />
                    SOS
                </button>
                <span className="sos-label">Emergency</span>
            </div>

            {/* ── SOS MODAL ───────────────────────────────────────────────────── */}
            <div
                className={`sos-modal-overlay ${sosOpen ? 'open' : ''}`}
                onClick={(e) => { if (e.target === e.currentTarget) setSosOpen(false); }}
            >
                <div className="sos-modal">
                    <h2>🚨 Emergency SOS</h2>
                    <p>
                        You're about to trigger an emergency alert. Please choose an action below
                        or dismiss if this was accidental.
                    </p>
                    <div className="sos-actions">
                        <button
                            className="sos-call-btn"
                            onClick={() => { showToast('📞 Calling emergency services...'); setSosOpen(false); }}
                            {...hoverCursor}
                        >
                            📞 Call Emergency Services
                        </button>
                        <button
                            className="sos-call-btn lavender"
                            onClick={() => { showToast('🔔 Alert sent to responders!'); setSosOpen(false); }}
                            {...hoverCursor}
                        >
                            🔔 Send Silent Alert
                        </button>
                        <button
                            className="sos-close-btn"
                            onClick={() => setSosOpen(false)}
                            {...hoverCursor}
                        >
                            Dismiss — I'm safe
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TOAST ───────────────────────────────────────────────────────── */}
            <div className={`toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
        </>
    );
}