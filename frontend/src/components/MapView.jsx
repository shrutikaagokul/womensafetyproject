// MapView.jsx — S.P.E.A.K. Real-Time Safety Map
// Requires: Map.css, react-leaflet, leaflet
// npm install react-leaflet leaflet

import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// ─── Fix default leaflet marker icons ─────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
    high: { color: "#f0578e", glow: "rgba(240,87,142,0.35)", label: "High Risk", emoji: "🔴", circleColor: "#f0578e" },
    medium: { color: "#f5c842", glow: "rgba(245,200,66,0.35)", label: "Moderate", emoji: "🟡", circleColor: "#f5c842" },
    low: { color: "#34c889", glow: "rgba(52,200,137,0.35)", label: "Safe Zone", emoji: "🟢", circleColor: "#34c889" },
};

// ─── Custom SVG marker factory ────────────────────────────────────────────────
const makeIcon = (severity) => {
    const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
    const svg = `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-${severity}">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <ellipse cx="18" cy="40" rx="6" ry="3" fill="rgba(0,0,0,0.25)"/>
      <circle cx="18" cy="17" r="15" fill="${cfg.color}" filter="url(#glow-${severity})" opacity="0.25"/>
      <circle cx="18" cy="17" r="11" fill="${cfg.color}"/>
      <circle cx="18" cy="17" r="5" fill="white" opacity="0.9"/>
      <line x1="18" y1="28" x2="18" y2="40" stroke="${cfg.color}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
    return new L.DivIcon({
        html: svg,
        className: "",
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
    });
};

const userIcon = new L.DivIcon({
    html: `<div class="map-user-marker"><div class="map-user-pulse"/><div class="map-user-dot"/></div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
});

// ─── Seed data — mirrors ReportForm incident types & severity logic ────────────
// In production replace with: fetch('/api/reports') returning same shape
const SEED_INCIDENTS = [
    { id: "SPK-A1B2C3", lat: 13.0827, lng: 80.2707, severity: "high", types: ["Assault"], description: "Physical altercation reported near the junction.", time: "2 min ago", address: "Anna Salai, Chennai" },
    { id: "SPK-D4E5F6", lat: 13.0750, lng: 80.2600, severity: "high", types: ["Stalking"], description: "Individual followed for several blocks.", time: "11 min ago", address: "T. Nagar, Chennai" },
    { id: "SPK-G7H8I9", lat: 13.0900, lng: 80.2800, severity: "medium", types: ["Harassment"], description: "Verbal harassment near bus stop.", time: "34 min ago", address: "Egmore, Chennai" },
    { id: "SPK-J1K2L3", lat: 13.0680, lng: 80.2750, severity: "medium", types: ["Theft / Robbery"], description: "Chain snatching incident reported.", time: "1 hr ago", address: "Mylapore, Chennai" },
    { id: "SPK-M4N5O6", lat: 13.0950, lng: 80.2650, severity: "low", types: ["Unsafe Area"], description: "Poor lighting on this stretch after 9 PM.", time: "2 hr ago", address: "Kilpauk, Chennai" },
    { id: "SPK-P7Q8R9", lat: 13.0800, lng: 80.2900, severity: "low", types: ["Other"], description: "Suspicious activity near parking lot.", time: "3 hr ago", address: "Triplicane, Chennai" },
];

// ─── Utility: format time ago ──────────────────────────────────────────────────
const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    return `${Math.floor(m / 60)} hr ago`;
};

// ─── Map recenter helper ──────────────────────────────────────────────────────
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => { if (center) map.flyTo(center, 14, { duration: 1.2 }); }, [center]);
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MapView() {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────────────────────────
    const [incidents, setIncidents] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [filter, setFilter] = useState("all");   // all | high | medium | low
    const [selectedId, setSelectedId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [dark, setDark] = useState(false);
    const [liveCount, setLiveCount] = useState(0);
    const [recenterTarget, setRecenterTarget] = useState(null);

    // ── Refs ───────────────────────────────────────────────────────────────────
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const rafRef = useRef(null);
    const mx = useRef(0), my = useRef(0);
    const rx = useRef(0), ry = useRef(0);
    const mapRef = useRef(null);

    // ── Dark mode ──────────────────────────────────────────────────────────────
    useEffect(() => { document.body.classList.toggle("dark", dark); }, [dark]);

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
        return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
    }, []);

    const onCursorEnter = () => {
        if (cursorRef.current) cursorRef.current.style.transform = "translate(-50%,-50%) scale(1.8)";
        if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(0.5)";
    };
    const onCursorLeave = () => {
        if (cursorRef.current) cursorRef.current.style.transform = "translate(-50%,-50%) scale(1)";
        if (ringRef.current) ringRef.current.style.transform = "translate(-50%,-50%) scale(1)";
    };
    const hc = { onMouseEnter: onCursorEnter, onMouseLeave: onCursorLeave };

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = useCallback((msg) => {
        setToast(msg); setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2800);
    }, []);

    // ── Load incidents (backend or seed) ──────────────────────────────────────
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/map-data");
                if (!res.ok) throw new Error("No backend");
                const raw = await res.json();
                // Normalize backend shape → internal shape
                const normalized = raw.map((r, i) => ({
                    id: r.id || `SPK-${i}`,
                    lat: r.lat,
                    lng: r.lng,
                    severity: (r.severity || "low").toLowerCase(),
                    types: r.types || [r.type || "Incident"],
                    description: r.description || "No details provided.",
                    time: r.time || (r.timestamp ? timeAgo(new Date(r.timestamp).getTime()) : "Recently"),
                    address: r.address || "Unknown location",
                }));
                setIncidents(normalized);
            } catch {
                // Fall back to seed data with staggered "live" arrival
                const enriched = SEED_INCIDENTS.map((s, i) => ({
                    ...s,
                    _ts: Date.now() - i * 4 * 60000,
                }));
                // Simulate real-time: add incidents one by one
                enriched.forEach((inc, i) => {
                    setTimeout(() => {
                        setIncidents(prev => {
                            if (prev.find(p => p.id === inc.id)) return prev;
                            return [...prev, inc];
                        });
                        setLiveCount(c => c + 1);
                    }, i * 600);
                });
            } finally {
                setTimeout(() => setLoading(false), 800);
            }
        };
        loadData();

        // Poll every 10 s for near-real-time updates
        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/map-data");
                if (!res.ok) return;
                const raw = await res.json();
                const normalized = raw.map((r, i) => ({
                    id: r.id || `SPK-${i}`,
                    lat: r.lat,
                    lng: r.lng,
                    severity: (r.severity || "low").toLowerCase(),
                    types: r.types || [r.type || "Incident"],
                    description: r.description || "No details provided.",
                    time: r.time || "Recently",
                    address: r.address || "Unknown location",
                }));
                setIncidents(prev => {
                    // Show live toast when new incidents arrive
                    const newOnes = normalized.filter(n => !prev.find(p => p.id === n.id));
                    if (newOnes.length > 0) setLiveCount(c => c + newOnes.length);
                    return normalized;
                });
            } catch { /* backend offline — keep current data */ }
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // ── Get user location ──────────────────────────────────────────────────────
    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => { }
        );
    }, []);

    // ── Derived data ───────────────────────────────────────────────────────────
    const filtered = incidents.filter(i => filter === "all" || i.severity === filter);
    const counts = { high: 0, medium: 0, low: 0 };
    incidents.forEach(i => counts[i.severity] = (counts[i.severity] || 0) + 1);
    const selectedInc = incidents.find(i => i.id === selectedId);
    const mapCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [13.0827, 80.2707];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="mp-root">
            {/* Custom cursor */}
            <div className="cursor" ref={cursorRef} />
            <div className="cursor-ring" ref={ringRef} />

            {/* ── NAVBAR ──────────────────────────────────────────────────── */}
            <nav className="mp-navbar">
                <div className="mp-nav-left">
                    <Link to="/" className="mp-back-btn" {...hc}>←</Link>
                    <Link to="/" className="mp-nav-logo" {...hc}>S.P.E.A.K.</Link>
                    <div className="mp-live-badge">
                        <span className="mp-live-dot" />
                        Live
                    </div>
                </div>

                <div className="mp-nav-center">
                    <span className="mp-nav-title">Safety Map</span>
                </div>

                <div className="mp-nav-right">
                    <button className="mp-nav-icon-btn" onClick={() => setDark(d => !d)} {...hc}>
                        {dark ? "☀️" : "🌙"}
                    </button>
                    <button
                        className="mp-nav-icon-btn"
                        onClick={() => { if (userLocation) setRecenterTarget([userLocation.lat, userLocation.lng]); else showToast("📍 Location not available"); }}
                        title="Center on me"
                        {...hc}
                    >
                        📍
                    </button>
                    <button
                        className="mp-nav-icon-btn"
                        onClick={() => setSidebarOpen(o => !o)}
                        title="Toggle incident list"
                        {...hc}
                    >
                        {sidebarOpen ? "◀" : "▶"}
                    </button>
                    <button
                        className="mp-quick-exit"
                        onClick={() => (window.location.href = "https://google.com")}
                        {...hc}
                    >
                        ⚡ Quick Exit
                    </button>
                </div>
            </nav>

            {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
            <div className="mp-layout">

                {/* ── SIDEBAR ─────────────────────────────────────────────── */}
                <aside className={`mp-sidebar ${sidebarOpen ? "open" : "closed"}`}>

                    {/* Stats row */}
                    <div className="mp-stats-row">
                        {["high", "medium", "low"].map(s => (
                            <button
                                key={s}
                                className={`mp-stat-chip ${s} ${filter === s ? "active" : ""}`}
                                onClick={() => setFilter(f => f === s ? "all" : s)}
                                {...hc}
                            >
                                <span className="mp-stat-num">{counts[s] || 0}</span>
                                <span className="mp-stat-label">{SEVERITY_CONFIG[s].label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Filter bar */}
                    <div className="mp-filter-bar">
                        <span className="mp-filter-label">Filter:</span>
                        {["all", "high", "medium", "low"].map(f => (
                            <button
                                key={f}
                                className={`mp-filter-btn ${filter === f ? "active" : ""}`}
                                onClick={() => setFilter(f)}
                                {...hc}
                            >
                                {f === "all" ? "All" : SEVERITY_CONFIG[f].label}
                            </button>
                        ))}
                    </div>

                    {/* Incident list */}
                    <div className="mp-incident-list">
                        {loading ? (
                            <div className="mp-loading">
                                <div className="mp-spinner" />
                                <span>Loading incidents…</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="mp-empty">
                                <div className="mp-empty-icon">🟢</div>
                                <div className="mp-empty-title">All Clear</div>
                                <div className="mp-empty-sub">No incidents match this filter.</div>
                            </div>
                        ) : (
                            filtered.map(inc => (
                                <div
                                    key={inc.id}
                                    className={`mp-incident-card ${inc.severity} ${selectedId === inc.id ? "selected" : ""}`}
                                    onClick={() => {
                                        setSelectedId(inc.id);
                                        setRecenterTarget([inc.lat, inc.lng]);
                                    }}
                                    {...hc}
                                >
                                    <div className="mp-inc-header">
                                        <div className="mp-inc-dot" style={{ background: SEVERITY_CONFIG[inc.severity].color }} />
                                        <div className="mp-inc-types">
                                            {(inc.types || []).join(", ")}
                                        </div>
                                        <div className="mp-inc-time">{inc.time}</div>
                                    </div>
                                    <div className="mp-inc-address">📍 {inc.address}</div>
                                    <div className="mp-inc-desc">{inc.description}</div>
                                    <div className="mp-inc-footer">
                                        <span className={`mp-sev-pill ${inc.severity}`}>
                                            {SEVERITY_CONFIG[inc.severity].emoji} {SEVERITY_CONFIG[inc.severity].label}
                                        </span>
                                        <span className="mp-inc-id">{inc.id}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Report CTA */}
                    <div className="mp-sidebar-cta">
                        <button
                            className="mp-report-cta-btn"
                            onClick={() => navigate("/report")}
                            {...hc}
                        >
                            <span>🔴</span> Report New Incident
                        </button>
                    </div>
                </aside>

                {/* ── MAP AREA ─────────────────────────────────────────────── */}
                <div className="mp-map-area">
                    {loading && (
                        <div className="mp-map-overlay">
                            <div className="mp-map-loading">
                                <div className="mp-spinner large" />
                                <span>Fetching incidents…</span>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        className="mp-leaflet"
                        style={{ height: "100%", width: "100%" }}
                        ref={mapRef}
                        zoomControl={false}
                    >
                        {/* Tile layer — dark/light aware */}
                        <TileLayer
                            url={dark
                                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />

                        {/* Recentering helper */}
                        {recenterTarget && <RecenterMap center={recenterTarget} />}

                        {/* Incident markers */}
                        {filtered.map(inc => (
                            <Marker
                                key={inc.id}
                                position={[inc.lat, inc.lng]}
                                icon={makeIcon(inc.severity)}
                                eventHandlers={{ click: () => setSelectedId(inc.id) }}
                            >
                                {/* Radius zone */}
                                <Circle
                                    center={[inc.lat, inc.lng]}
                                    radius={180}
                                    pathOptions={{
                                        color: SEVERITY_CONFIG[inc.severity].circleColor,
                                        fillColor: SEVERITY_CONFIG[inc.severity].circleColor,
                                        fillOpacity: 0.10,
                                        weight: 1.5,
                                        dashArray: "4 4",
                                    }}
                                />
                                <Popup className="mp-popup">
                                    <div className="mp-popup-inner">
                                        <div className="mp-popup-header" style={{ borderColor: SEVERITY_CONFIG[inc.severity].color }}>
                                            <span className="mp-popup-sev" style={{ color: SEVERITY_CONFIG[inc.severity].color }}>
                                                {SEVERITY_CONFIG[inc.severity].emoji} {SEVERITY_CONFIG[inc.severity].label}
                                            </span>
                                            <span className="mp-popup-time">{inc.time}</span>
                                        </div>
                                        <div className="mp-popup-types">{(inc.types || []).join(" · ")}</div>
                                        <div className="mp-popup-desc">{inc.description}</div>
                                        <div className="mp-popup-addr">📍 {inc.address}</div>
                                        <div className="mp-popup-id">Report {inc.id}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        
                        {/* User location marker */}
                        {userLocation && (
                            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                                <Popup className="mp-popup">
                                    <div className="mp-popup-inner">
                                        <div className="mp-popup-types">📍 You are here</div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {/* ── Map legend overlay ──────────────────────────────── */}
                    <div className="mp-legend">
                        <div className="mp-legend-title">Risk Levels</div>
                        {["high", "medium", "low"].map(s => (
                            <div className="mp-legend-item" key={s}>
                                <div className="mp-legend-dot" style={{ background: SEVERITY_CONFIG[s].color }} />
                                <span>{SEVERITY_CONFIG[s].label}</span>
                            </div>
                        ))}
                        <div className="mp-legend-item">
                            <div className="mp-legend-dot user" />
                            <span>Your Location</span>
                        </div>
                    </div>

                    {/* ── Zoom controls ───────────────────────────────────── */}
                    <div className="mp-zoom-controls">
                        <button className="mp-zoom-btn" onClick={() => mapRef.current?.zoomIn()} {...hc}>+</button>
                        <button className="mp-zoom-btn" onClick={() => mapRef.current?.zoomOut()} {...hc}>−</button>
                    </div>

                    {/* ── Selected incident detail banner ─────────────────── */}
                    {selectedInc && (
                        <div className={`mp-detail-banner ${selectedInc.severity}`}>
                            <div className="mp-detail-left">
                                <span className="mp-detail-sev" style={{ color: SEVERITY_CONFIG[selectedInc.severity].color }}>
                                    {SEVERITY_CONFIG[selectedInc.severity].emoji} {SEVERITY_CONFIG[selectedInc.severity].label}
                                </span>
                                <span className="mp-detail-types">{(selectedInc.types || []).join(", ")}</span>
                                <span className="mp-detail-addr">📍 {selectedInc.address}</span>
                            </div>
                            <button className="mp-detail-close" onClick={() => setSelectedId(null)} {...hc}>✕</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── SOS FLOATING BUTTON ─────────────────────────────────────── */}
            <div className="sos-wrapper">
                <button
                    className="sos-btn"
                    onClick={() => showToast("📞 Connecting to emergency services...")}
                    {...hc}
                >
                    <div className="sos-ring" />
                    SOS
                </button>
                <span className="sos-label">Emergency</span>
            </div>

            {/* ── TOAST ───────────────────────────────────────────────────── */}
            <div className={`toast ${toastVisible ? "show" : ""}`}>{toast}</div>
        </div>
    );
}