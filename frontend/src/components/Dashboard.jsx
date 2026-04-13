// Dashboard.jsx — S.P.E.A.K. Safety Dashboard
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "./Dashboard.css";

const API_BASE = '/api';

// ─── Fallback mock data (used when backend is offline) ───────────────────────
const MOCK_FEED = [
    { id: 1, type: "danger", icon: "🔴", location: "Anna Nagar", desc: "Harassment reported near bus stop", time: "2 min ago", status: "Active" },
    { id: 2, type: "warning", icon: "🟡", location: "T. Nagar", desc: "Suspicious activity near park", time: "11 min ago", status: "Reviewing" },
    { id: 3, type: "safe", icon: "🟢", location: "Adyar", desc: "Safe zone verified by responders", time: "18 min ago", status: "Resolved" },
    { id: 4, type: "danger", icon: "🔴", location: "Velachery", desc: "Stalking incident flagged by AI", time: "34 min ago", status: "Active" },
    { id: 5, type: "warning", icon: "🟡", location: "Kodambakkam", desc: "Unsafe lighting reported on road", time: "52 min ago", status: "Reviewing" },
];

const ZONE_DATA = [
    { zone: "Anna Nagar", risk: 82, color: "#f0578e" },
    { zone: "T. Nagar", risk: 61, color: "#c8a8f0" },
    { zone: "Adyar", risk: 28, color: "#34c889" },
    { zone: "Velachery", risk: 74, color: "#f0578e" },
    { zone: "Kodambakkam", risk: 55, color: "#f0c070" },
];

const TICKER_ITEMS = [
    "Anonymous & Secure",
    "AI-Powered Analysis",
    "Real-time Safety Map",
    "Privacy First Always",
    "24/7 Emergency Access",
];

// ─── Incident type icon map ───────────────────────────────────────────────────
const TYPE_COLORS = {
    danger: { border: "#f0578e", bg: "rgba(240,87,142,0.08)", badge: "#f0578e" },
    warning: { border: "#f0c070", bg: "rgba(240,192,112,0.08)", badge: "#c89820" },
    safe: { border: "#34c889", bg: "rgba(52,200,137,0.08)", badge: "#34c889" },
};

export default function Dashboard() {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────────────────────────
    const [dark, setDark] = useState(false);
    const [clock, setClock] = useState("");
    const [date, setDate] = useState("");
    const [sosOpen, setSosOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [feed, setFeed] = useState(MOCK_FEED);
    const [filter, setFilter] = useState("all");
    const [kpis, setKpis] = useState({ total: 0, active: 0, resolved: 0, safeZones: 14 });
    const [pulse, setPulse] = useState(false);
    const [backendOnline, setBackendOnline] = useState(false);

    // ── Chart refs ─────────────────────────────────────────────────────────────
    const lineRef = useRef(null);
    const donutRef = useRef(null);
    const lineChart = useRef(null);
    const donutChart = useRef(null);

    // ── Cursor refs ────────────────────────────────────────────────────────────
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const rafRef = useRef(null);
    const mx = useRef(0), my = useRef(0);
    const rx = useRef(0), ry = useRef(0);

    // ── Dark mode ──────────────────────────────────────────────────────────────
    useEffect(() => {
        document.body.classList.toggle("dark", dark);
    }, [dark]);

    // ── Clock ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setClock(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
            setDate(now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // ── Simulated real-time pulse every 12s ───────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => {
            setPulse(true);
            setTimeout(() => setPulse(false), 1200);
        }, 12000);
        return () => clearInterval(id);
    }, []);

    // ── Fetch live data from backend ──────────────────────────────────────────
    const fetchDashboard = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/dashboard-stats`);
            if (!res.ok) throw new Error('bad response');
            const data = await res.json();
            setKpis({
                total:     data.total     ?? 0,
                active:    data.active    ?? 0,
                resolved:  data.resolved  ?? 0,
                safeZones: data.safe_zones ?? 14,
            });
            if (data.recent_feed && data.recent_feed.length > 0) {
                setFeed(data.recent_feed);
            } else if (!backendOnline) {
                setFeed(MOCK_FEED);
            }
            setBackendOnline(true);
            setPulse(true);
            setTimeout(() => setPulse(false), 1200);
        } catch {
            // backend offline — keep mock data
            if (!backendOnline) setFeed(MOCK_FEED);
        }
    }, [backendOnline]);

    useEffect(() => {
        fetchDashboard();
        const id = setInterval(fetchDashboard, 15000);
        return () => clearInterval(id);
    }, [fetchDashboard]);

    // ── Charts ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const textColor = dark ? "#c8b8f0" : "#6b548a";
        const gridColor = dark ? "rgba(168,132,240,0.1)" : "rgba(168,132,240,0.12)";

        // Line chart — incidents over week
        lineChart.current = new Chart(lineRef.current, {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Reported",
                        data: [18, 25, 14, 30, 22, 12, 8],
                        borderColor: "#f0578e",
                        backgroundColor: "rgba(240,87,142,0.10)",
                        tension: 0.45,
                        fill: true,
                        pointBackgroundColor: "#f0578e",
                        pointRadius: 5,
                        pointHoverRadius: 8,
                    },
                    {
                        label: "Resolved",
                        data: [14, 20, 12, 24, 19, 10, 6],
                        borderColor: "#a892f0",
                        backgroundColor: "rgba(168,146,240,0.08)",
                        tension: 0.45,
                        fill: true,
                        pointBackgroundColor: "#a892f0",
                        pointRadius: 5,
                        pointHoverRadius: 8,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { labels: { color: textColor, font: { family: "DM Sans", size: 12 } } },
                    tooltip: { backgroundColor: dark ? "#1a0e2e" : "#fff", titleColor: "#f0578e", bodyColor: textColor, borderColor: "#a892f0", borderWidth: 1 },
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor }, grid: { color: gridColor } },
                },
            },
        });

        // Donut — incident categories
        donutChart.current = new Chart(donutRef.current, {
            type: "doughnut",
            data: {
                labels: ["Harassment", "Stalking", "Unsafe Area", "Lighting", "Other"],
                datasets: [{
                    data: [38, 22, 18, 14, 8],
                    backgroundColor: ["#f0578e", "#a892f0", "#7ad0e0", "#f0c070", "#34c889"],
                    borderWidth: 0,
                    hoverOffset: 10,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: textColor, font: { family: "DM Sans", size: 11 }, padding: 14, usePointStyle: true },
                    },
                    tooltip: { backgroundColor: dark ? "#1a0e2e" : "#fff", titleColor: "#f0578e", bodyColor: textColor, borderColor: "#a892f0", borderWidth: 1 },
                },
            },
        });

        return () => {
            lineChart.current?.destroy();
            donutChart.current?.destroy();
        };
    }, [dark]);

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
            rx.current += (mx.current - rx.current) * 0.14;
            ry.current += (my.current - ry.current) * 0.14;
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

    const onCursorEnter = () => {
        if (cursorRef.current) cursorRef.current.style.transform = "translate(-50%,-50%) scale(1.8)";
        if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(0.5)";
    };
    const onCursorLeave = () => {
        if (cursorRef.current) cursorRef.current.style.transform = "translate(-50%,-50%) scale(1)";
        if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(1)";
    };
    const hoverCursor = { onMouseEnter: onCursorEnter, onMouseLeave: onCursorLeave };

    // ── Toast ──────────────────────────────────────────────────────────────────
    const showToast = useCallback((msg) => {
        setToast(msg); setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2800);
    }, []);

    // ── Profile click-outside ──────────────────────────────────────────────────
    useEffect(() => {
        const close = () => setProfileOpen(false);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, []);

    // ── Filtered feed ─────────────────────────────────────────────────────────
    const filtered = filter === "all" ? feed : feed.filter(f => f.type === filter);

    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            {/* Custom cursor */}
            <div className="cursor" ref={cursorRef} />
            <div className="cursor-ring" ref={ringRef} />

            {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
            <nav className="navbar">
                <a href="#" className="nav-logo" {...hoverCursor}>S.P.E.A.K.</a>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/report">Report</Link></li>
                    <li><Link to="/dashboard" className="nav-active">Dashboard</Link></li>
                    <li><Link to="/map">Map</Link></li>
                </ul>
                <div className="nav-right">
                    <button className="nav-icon-btn" onClick={() => setDark(d => !d)} {...hoverCursor}>
                        {dark ? "☀️" : "🌙"}
                    </button>
                    <button className="nav-icon-btn" onClick={() => showToast("No new alerts")} {...hoverCursor}>
                        🔔<span className="notif-dot" />
                    </button>
                    <div className="profile-btn-wrap">
                        <button className="nav-icon-btn" onClick={(e) => { e.stopPropagation(); setProfileOpen(o => !o); }} {...hoverCursor}>
                            👤
                        </button>
                        <div className={`profile-dropdown ${profileOpen ? "open" : ""}`}>
                            <Link to="/dashboard" {...hoverCursor}> My Reports</Link>
                            <Link to="/settings" {...hoverCursor}> Settings</Link>
                            <div className="dropdown-divider" />
                            <Link to="/" style={{ color: "#f0578e" }} {...hoverCursor}> Logout</Link>
                        </div>
                    </div>
                    <button className="quick-exit" onClick={() => (window.location.href = "https://google.com")} {...hoverCursor}>
                        ⚡ Quick Exit
                    </button>
                </div>
            </nav>

            {/* ── TICKER ──────────────────────────────────────────────────────────── */}
            <div className="ticker-strip">
                <div className="ticker-track">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span className="ticker-item" key={i}>
                            <span className="ticker-dot" />{item}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── DASHBOARD BODY ──────────────────────────────────────────────────── */}
            <main className="dash-main">

                {/* Page header */}
                <div className="dash-header">
                    <div>
                        <div className="dash-eyebrow">
                            <span className={`live-dot ${pulse ? "pulse-now" : ""}`} />
                            Live Safety Feed
                        </div>
                        <h1 className="dash-title">Safety Dashboard</h1>
                        <p className="dash-date">{date}</p>
                    </div>
                    <div className="dash-clock-wrap">
                        <div className="dash-clock">{clock}</div>
                        <button className="btn-primary btn-sm" onClick={() => navigate("/report")} {...hoverCursor}>
                            <span>🔴</span><span>New Report</span>
                        </button>
                    </div>
                </div>

                {/* ── KPI CARDS ─────────────────────────────────────────────────────── */}
                <div className="kpi-grid">
                    <div className="kpi-card kpi-total">
                        <div className="kpi-icon">📋</div>
                        <div className="kpi-info">
                            <div className="kpi-label">Total Reports</div>
                            <div className="kpi-value">{kpis.total}</div>
                            <div className="kpi-sub">+3 this week</div>
                        </div>
                    </div>
                    <div className="kpi-card kpi-active">
                        <div className="kpi-icon">🔴</div>
                        <div className="kpi-info">
                            <div className="kpi-label">Active Incidents</div>
                            <div className="kpi-value">{kpis.active}</div>
                            <div className="kpi-sub">Needs attention</div>
                        </div>
                    </div>
                    <div className="kpi-card kpi-resolved">
                        <div className="kpi-icon">✅</div>
                        <div className="kpi-info">
                            <div className="kpi-label">Resolved</div>
                            <div className="kpi-value">{kpis.resolved}</div>
                            <div className="kpi-sub">77% resolution rate</div>
                        </div>
                    </div>
                    <div className="kpi-card kpi-safe">
                        <div className="kpi-icon">🛡️</div>
                        <div className="kpi-info">
                            <div className="kpi-label">Safe Zones</div>
                            <div className="kpi-value">{kpis.safeZones}</div>
                            <div className="kpi-sub">Verified nearby</div>
                        </div>
                    </div>
                </div>

                {/* ── CHARTS ROW ────────────────────────────────────────────────────── */}
                <div className="charts-row">
                    <div className="chart-card chart-line">
                        <div className="chart-card-header">
                            <h3 className="chart-title">Weekly Incident Trend</h3>
                            <span className="chart-badge">This Week</span>
                        </div>
                        <div className="chart-canvas-wrap">
                            <canvas ref={lineRef} />
                        </div>
                    </div>

                    <div className="chart-card chart-donut">
                        <div className="chart-card-header">
                            <h3 className="chart-title">Incident Types</h3>
                            <span className="chart-badge">All Time</span>
                        </div>
                        <div className="chart-canvas-wrap">
                            <canvas ref={donutRef} />
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM ROW ────────────────────────────────────────────────────── */}
                <div className="bottom-row">

                    {/* Live incident feed */}
                    <div className="feed-card">
                        <div className="feed-header">
                            <h3 className="chart-title">
                                <span className={`live-dot ${pulse ? "pulse-now" : ""}`} />
                                Live Incident Feed
                            </h3>
                            <div className="feed-filters">
                                {["all", "danger", "warning", "safe"].map(f => (
                                    <button
                                        key={f}
                                        className={`filter-pill ${filter === f ? "active" : ""}`}
                                        onClick={() => setFilter(f)}
                                        {...hoverCursor}
                                    >
                                        {f === "all" ? "All" : f === "danger" ? "🔴 High" : f === "warning" ? "🟡 Medium" : "🟢 Safe"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="feed-list">
                            {filtered.map(item => (
                                <div
                                    key={item.id}
                                    className={`feed-item feed-${item.type}`}
                                    style={{ borderLeftColor: TYPE_COLORS[item.type].border, background: TYPE_COLORS[item.type].bg }}
                                >
                                    <span className="feed-icon">{item.icon}</span>
                                    <div className="feed-body">
                                        <div className="feed-location">{item.location}</div>
                                        <div className="feed-desc">{item.desc}</div>
                                        <div className="feed-meta">{item.time}</div>
                                    </div>
                                    <span
                                        className="feed-status"
                                        style={{ color: TYPE_COLORS[item.type].badge, borderColor: TYPE_COLORS[item.type].border }}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="feed-empty">No incidents in this category.</div>
                            )}
                        </div>
                    </div>

                    {/* Zone risk meter */}
                    <div className="zone-card">
                        <div className="chart-card-header">
                            <h3 className="chart-title">Zone Risk Index</h3>
                            <span className="chart-badge">Nearby</span>
                        </div>
                        <div className="zone-list">
                            {ZONE_DATA.map(z => (
                                <div className="zone-item" key={z.zone}>
                                    <div className="zone-top">
                                        <span className="zone-name">{z.zone}</span>
                                        <span className="zone-score" style={{ color: z.color }}>{z.risk}%</span>
                                    </div>
                                    <div className="zone-bar-track">
                                        <div
                                            className="zone-bar-fill"
                                            style={{ width: z.risk + "%", background: z.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="zone-legend">
                            <span className="zl-item"><span style={{ background: "#f0578e" }} />High Risk</span>
                            <span className="zl-item"><span style={{ background: "#f0c070" }} />Moderate</span>
                            <span className="zl-item"><span style={{ background: "#34c889" }} />Safe</span>
                        </div>

                        <button className="btn-secondary btn-full" onClick={() => navigate("/map")} {...hoverCursor}>
                            <span>🗺️</span><span>Open Full Map</span>
                        </button>
                    </div>

                </div>
            </main>

            {/* ── SOS BUTTON ────────────────────────────────────────────────────────── */}
            <div className="sos-wrapper">
                <button className="sos-btn" onClick={() => setSosOpen(true)} {...hoverCursor}>
                    <div className="sos-ring" />SOS
                </button>
                <span className="sos-label">Emergency</span>
            </div>

            {/* ── SOS MODAL ─────────────────────────────────────────────────────────── */}
            <div
                className={`sos-modal-overlay ${sosOpen ? "open" : ""}`}
                onClick={e => { if (e.target === e.currentTarget) setSosOpen(false); }}
            >
                <div className="sos-modal">
                    <h2>🚨 Emergency SOS</h2>
                    <p>You're about to trigger an emergency alert. Please choose an action below or dismiss if this was accidental.</p>
                    <div className="sos-actions">
                        <button className="sos-call-btn" onClick={() => { showToast("📞 Calling emergency services..."); setSosOpen(false); }} {...hoverCursor}>
                            📞 Call Emergency Services
                        </button>
                        <button className="sos-call-btn lavender" onClick={() => { showToast("🔔 Alert sent to responders!"); setSosOpen(false); }} {...hoverCursor}>
                            🔔 Send Silent Alert
                        </button>
                        <button className="sos-close-btn" onClick={() => setSosOpen(false)} {...hoverCursor}>
                            Dismiss — I'm safe
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TOAST ─────────────────────────────────────────────────────────────── */}
            <div className={`toast ${toastVisible ? "show" : ""}`}>{toast}</div>
        </>
    );
}