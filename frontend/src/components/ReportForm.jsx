// ReportForm.jsx — S.P.E.A.K. Report Incident Page
// Place in: src/components/ReportForm.jsx
// Requires: ReportForm.css in same folder, React Router v6, Home.css vars in scope

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ReportForm.css';

// ─── Incident type chips ───────────────────────────────────────────────────────
const INCIDENT_TYPES = [
    { id: 'harassment', label: 'Harassment', emoji: '⚠️' },
    { id: 'stalking', label: 'Stalking', emoji: '👁️' },
    { id: 'assault', label: 'Assault', emoji: '🚨' },
    { id: 'theft', label: 'Theft / Robbery', emoji: '🔓' },
    { id: 'unsafe_area', label: 'Unsafe Area', emoji: '📍' },
    { id: 'other', label: 'Other', emoji: '📝' },
];

// ─── Severity levels (derived from description length/keywords for demo) ───────
const getSeverity = (text) => {
    if (!text || text.length < 20) return null;
    const high = ['assault', 'attack', 'hit', 'knife', 'gun', 'weapon', 'rape', 'kidnap', 'threaten', 'stab'];
    const med = ['follow', 'stalk', 'harass', 'shout', 'grab', 'uncomfortable', 'scared', 'threat'];
    const t = text.toLowerCase();
    if (high.some(w => t.includes(w))) return 'high';
    if (med.some(w => t.includes(w))) return 'medium';
    return 'low';
};

// ─── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
    { num: '01', label: 'Step 1 of 3', name: 'Incident Details' },
    { num: '02', label: 'Step 2 of 3', name: 'Location & Evidence' },
    { num: '03', label: 'Step 3 of 3', name: 'Review & Submit' },
];

// ─── Generate a fake report ID ─────────────────────────────────────────────────
const genId = () => 'SPK-' + Math.random().toString(36).slice(2, 8).toUpperCase();

export default function ReportForm() {
    const navigate = useNavigate();

    // ── Multi-step state ─────────────────────────────────────────────────────────
    const [step, setStep] = useState(0); // 0,1,2 → success
    const [submitted, setSubmitted] = useState(false);
    const [reportId] = useState(genId);

    // ── Form fields ──────────────────────────────────────────────────────────────
    const [description, setDescription] = useState('');
    const [incidentTypes, setIncidentTypes] = useState([]);
    const [location, setLocation] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [anonymous, setAnonymous] = useState(true);
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);

    // ── AI analysis state ────────────────────────────────────────────────────────
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [severity, setSeverity] = useState(null);
    const aiTimerRef = useRef(null);

    // ── Validation errors ────────────────────────────────────────────────────────
    const [errors, setErrors] = useState({});

    // ── Location detecting ───────────────────────────────────────────────────────
    const [detectingLoc, setDetectingLoc] = useState(false);

    // ── Cursor refs ──────────────────────────────────────────────────────────────
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const rafRef = useRef(null);
    const mx = useRef(0), my = useRef(0);
    const rx = useRef(0), ry = useRef(0);

    // ── Toast ─────────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    // ── Submitting ────────────────────────────────────────────────────────────────
    const [submitting, setSubmitting] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────────
    // Custom cursor
    // ─────────────────────────────────────────────────────────────────────────────
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
        return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current); };
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

    // ─────────────────────────────────────────────────────────────────────────────
    // Toast helper
    // ─────────────────────────────────────────────────────────────────────────────
    const showToast = (msg) => {
        setToast(msg); setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2800);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // AI analysis — debounced on description change
    // ─────────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!description.trim()) { setSeverity(null); setAiAnalyzing(false); return; }
        setAiAnalyzing(true);
        setSeverity(null);
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = setTimeout(() => {
            setSeverity(getSeverity(description));
            setAiAnalyzing(false);
        }, 1200);
        return () => clearTimeout(aiTimerRef.current);
    }, [description]);

    // ─────────────────────────────────────────────────────────────────────────────
    // Toggle incident type chip
    // ─────────────────────────────────────────────────────────────────────────────
    const toggleType = (id) => {
        setIncidentTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Geolocation
    // ─────────────────────────────────────────────────────────────────────────────
    const detectLocation = () => {
        if (!navigator.geolocation) { showToast('❌ Geolocation not supported'); return; }
        setDetectingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude.toFixed(6));
                setLng(pos.coords.longitude.toFixed(6));
                setLocation('Auto-detected location');
                setDetectingLoc(false);
                showToast('📍 Location detected!');
            },
            () => { showToast('❌ Could not detect location'); setDetectingLoc(false); }
        );
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // File handling
    // ─────────────────────────────────────────────────────────────────────────────
    const addFiles = useCallback((incoming) => {
        const arr = Array.from(incoming).slice(0, 5 - files.length);
        setFiles(prev => [...prev, ...arr]);
    }, [files.length]);

    const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    const onDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Validation per step
    // ─────────────────────────────────────────────────────────────────────────────
    const validate = (s) => {
        const errs = {};
        if (s === 0) {
            if (!description.trim() || description.trim().length < 20)
                errs.description = 'Please describe the incident in at least 20 characters.';
            if (incidentTypes.length === 0)
                errs.incidentTypes = 'Please select at least one incident type.';
        }
        if (s === 1) {
            if (!location.trim())
                errs.location = 'Please enter a location or use auto-detect.';
        }
        return errs;
    };

    const goNext = () => {
        const errs = validate(step);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setStep(s => s + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => { setErrors({}); setStep(s => s - 1); };

    // ─────────────────────────────────────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setSubmitting(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1800));
        setSubmitting(false);
        setSubmitted(true);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Progress %
    // ─────────────────────────────────────────────────────────────────────────────
    const progress = submitted ? 100 : ((step / 3) * 100);

    // ─────────────────────────────────────────────────────────────────────────────
    const severityLabel = severity === 'high' ? '🔴 High' : severity === 'medium' ? '🟡 Medium' : severity === 'low' ? '🟢 Low' : null;

    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div className="report-page">
            {/* ── Custom cursor ─────────────────────────────────────── */}
            <div className="rp-cursor" ref={cursorRef} />
            <div className="rp-cursor-ring" ref={ringRef} />

            {/* ── Background blobs ──────────────────────────────────── */}
            <div className="rp-blob rp-blob-1" />
            <div className="rp-blob rp-blob-2" />
            <div className="rp-blob rp-blob-3" />

            {/* ── NAVBAR ────────────────────────────────────────────── */}
            <nav className="rp-navbar">
                <div className="rp-nav-left">
                    <Link to="/" className="rp-back-btn" {...hc}>←</Link>
                    <Link to="/" className="rp-nav-logo" {...hc}>S.P.E.A.K.</Link>
                </div>

                {/* Step progress pips */}
                {!submitted && (
                    <div className="rp-nav-step-indicator">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`rp-step-pip ${i === step ? 'active' : i < step ? 'done' : ''}`}
                            />
                        ))}
                    </div>
                )}

                <button
                    className="rp-quick-exit"
                    onClick={() => (window.location.href = 'https://google.com')}
                    {...hc}
                >
                    🚪 <span>Quick Exit</span>
                </button>
            </nav>

            {/* ── Main content ──────────────────────────────────────── */}
            <main className="rp-content">
                <div className="rp-card">

                    {/* Progress bar */}
                    <div className="rp-progress-track">
                        <div className="rp-progress-fill" style={{ width: `${progress}%` }} />
                    </div>

                    {/* ─── SUCCESS SCREEN ──────────────────────────────── */}
                    {submitted ? (
                        <div className="rp-success">
                            <div className="rp-success-ring">✅</div>
                            <h2 className="rp-success-title">Report <em>Submitted!</em></h2>
                            <p className="rp-success-sub">
                                Your report has been securely received and is being reviewed by our AI analysis engine.
                                {anonymous ? ' Your identity remains fully protected.' : ''}
                            </p>
                            <div className="rp-report-id">🔒 Report ID: {reportId}</div>
                            <div className="rp-success-actions">
                                <button className="rp-success-primary" onClick={() => navigate('/dashboard')} {...hc}>
                                    📊 View Dashboard
                                </button>
                                <button className="rp-success-secondary" onClick={() => { setSubmitted(false); setStep(0); setDescription(''); setIncidentTypes([]); setLocation(''); setLat(''); setLng(''); setFiles([]); }} {...hc}>
                                    ➕ New Report
                                </button>
                                <button className="rp-success-secondary" onClick={() => navigate('/')} {...hc}>
                                    🏠 Home
                                </button>
                            </div>
                        </div>

                    ) : (
                        <>
                            {/* ── Card header (shown on step 0 only) ───────── */}
                            {step === 0 && (
                                <div className="rp-header">
                                    <div className="rp-header-badge">
                                        <span className="rp-badge-dot" />
                                        Secure · Anonymous · Encrypted
                                    </div>
                                    <h1 className="rp-title">File a <em>Report</em></h1>
                                    <p className="rp-subtitle">
                                        Your submission is encrypted end-to-end. No personal data is stored unless you choose.
                                    </p>
                                </div>
                            )}

                            {/* ── Step header ───────────────────────────────── */}
                            {step > 0 && (
                                <div className="rp-step-header">
                                    <div className="rp-step-num">{STEPS[step].num}</div>
                                    <div className="rp-step-info">
                                        <div className="rp-step-label">{STEPS[step].label}</div>
                                        <div className="rp-step-name">{STEPS[step].name}</div>
                                    </div>
                                </div>
                            )}

                            {/* ══════════════════════════════════════════════
                  STEP 0 — Incident Details
              ══════════════════════════════════════════════ */}
                            {step === 0 && (
                                <>
                                    {/* Step header inline for step 0 */}
                                    <div className="rp-step-header" style={{ marginBottom: 24 }}>
                                        <div className="rp-step-num">01</div>
                                        <div className="rp-step-info">
                                            <div className="rp-step-label">Step 1 of 3</div>
                                            <div className="rp-step-name">Incident Details</div>
                                        </div>
                                    </div>

                                    {/* Incident type chips */}
                                    <div className="rp-field">
                                        <div className="rp-label">
                                            <span className="rp-label-icon">🏷️</span>
                                            Incident Type
                                        </div>
                                        <div className="rp-chips">
                                            {INCIDENT_TYPES.map(t => (
                                                <button
                                                    key={t.id}
                                                    className={`rp-chip ${incidentTypes.includes(t.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleType(t.id)}
                                                    {...hc}
                                                >
                                                    {t.emoji} {t.label}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.incidentTypes && (
                                            <div className="rp-error-text">⚠️ {errors.incidentTypes}</div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="rp-field">
                                        <div className="rp-label">
                                            <span className="rp-label-icon">📝</span>
                                            Description
                                        </div>
                                        <div className="rp-textarea-wrap">
                                            <textarea
                                                className={`rp-textarea ${errors.description ? 'error' : ''}`}
                                                placeholder="Describe the incident in detail — what happened, when, and any relevant context..."
                                                value={description}
                                                maxLength={1000}
                                                onChange={e => setDescription(e.target.value)}
                                            />
                                            <span className="rp-ai-icon">🤖</span>
                                        </div>

                                        {/* Char counter */}
                                        <div className={`rp-char-count ${description.length > 900 ? 'limit' : description.length > 700 ? 'warn' : ''}`}>
                                            {description.length} / 1000
                                        </div>

                                        {errors.description && (
                                            <div className="rp-error-text">⚠️ {errors.description}</div>
                                        )}

                                        {/* AI bar */}
                                        {(aiAnalyzing || severity) && (
                                            <div className="rp-ai-bar">
                                                {aiAnalyzing ? (
                                                    <>
                                                        <div className="rp-ai-spinner" />
                                                        <span>AI is analyzing severity...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🤖 AI Analysis Complete</span>
                                                        <div className={`rp-severity-pill ${severity}`}>
                                                            {severityLabel} Severity
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Anonymous toggle */}
                                    <div className="rp-field">
                                        <div className="rp-label">
                                            <span className="rp-label-icon">🔒</span>
                                            Privacy
                                        </div>
                                        <div className="rp-anon-toggle" onClick={() => setAnonymous(a => !a)} {...hc}>
                                            <div className={`rp-toggle-switch ${anonymous ? 'on' : ''}`}>
                                                <div className="rp-toggle-thumb" />
                                            </div>
                                            <div className="rp-anon-text">
                                                <div className="rp-anon-title">
                                                    {anonymous ? '🕵️ Anonymous Mode — ON' : '👤 Identified Mode — ON'}
                                                </div>
                                                <div className="rp-anon-sub">
                                                    {anonymous
                                                        ? 'Your identity is completely hidden. No personal data collected.'
                                                        : 'Your account info may be attached to this report.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ══════════════════════════════════════════════
                  STEP 1 — Location & Evidence
              ══════════════════════════════════════════════ */}
                            {step === 1 && (
                                <>
                                    {/* Location */}
                                    <div className="rp-field">
                                        <div className="rp-label">
                                            <span className="rp-label-icon">📍</span>
                                            Location
                                        </div>
                                        <div className="rp-location-row">
                                            <input
                                                className={`rp-input ${errors.location ? 'error' : ''}`}
                                                placeholder="Enter location or area..."
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                            />
                                            <button
                                                className={`rp-detect-btn ${detectingLoc ? 'loading' : ''}`}
                                                onClick={detectLocation}
                                                {...hc}
                                            >
                                                {detectingLoc ? <><div className="rp-ai-spinner" /> Detecting…</> : <>📡 Detect</>}
                                            </button>
                                        </div>

                                        {errors.location && (
                                            <div className="rp-error-text">⚠️ {errors.location}</div>
                                        )}

                                        {/* Lat/Lng */}
                                        <div className="rp-coords-row">
                                            <input
                                                className="rp-input"
                                                placeholder="Latitude"
                                                value={lat}
                                                onChange={e => setLat(e.target.value)}
                                            />
                                            <input
                                                className="rp-input"
                                                placeholder="Longitude"
                                                value={lng}
                                                onChange={e => setLng(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Evidence upload */}
                                    <div className="rp-field">
                                        <div className="rp-label">
                                            <span className="rp-label-icon">📎</span>
                                            Upload Evidence
                                            <span className="rp-label-optional">Optional — max 5 files</span>
                                        </div>

                                        <div
                                            className={`rp-dropzone ${dragOver ? 'drag-over' : ''}`}
                                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={onDrop}
                                            onClick={() => document.getElementById('rp-file-input').click()}
                                            {...hc}
                                        >
                                            <input
                                                id="rp-file-input"
                                                type="file"
                                                multiple
                                                accept="image/*,video/*,.pdf"
                                                onChange={e => addFiles(e.target.files)}
                                                style={{ display: 'none' }}
                                            />
                                            <div className="rp-drop-icon">📁</div>
                                            <div className="rp-drop-title">
                                                {dragOver ? 'Drop files here!' : 'Drag & Drop or Click to Upload'}
                                            </div>
                                            <div className="rp-drop-sub">Photos, videos, or documents related to the incident</div>
                                            <div className="rp-drop-types">
                                                <span className="rp-drop-type">JPG</span>
                                                <span className="rp-drop-type">PNG</span>
                                                <span className="rp-drop-type">MP4</span>
                                                <span className="rp-drop-type">PDF</span>
                                            </div>
                                        </div>

                                        {files.length > 0 && (
                                            <div className="rp-file-list">
                                                {files.map((f, i) => (
                                                    <div className="rp-file-chip" key={i}>
                                                        📄 {f.name}
                                                        <button
                                                            className="rp-file-chip-remove"
                                                            onClick={e => { e.stopPropagation(); removeFile(i); }}
                                                            {...hc}
                                                        >×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* ══════════════════════════════════════════════
                  STEP 2 — Review & Submit
              ══════════════════════════════════════════════ */}
                            {step === 2 && (
                                <>
                                    {/* Review summary */}
                                    <div className="rp-field">
                                        <div className="rp-label"><span className="rp-label-icon">🏷️</span>Incident Types</div>
                                        <div className="rp-chips" style={{ pointerEvents: 'none' }}>
                                            {incidentTypes.length
                                                ? INCIDENT_TYPES.filter(t => incidentTypes.includes(t.id)).map(t => (
                                                    <div className="rp-chip selected" key={t.id}>
                                                        {t.emoji} {t.label}
                                                    </div>
                                                ))
                                                : <span style={{ color: 'var(--text-soft)', fontSize: '0.88rem' }}>None selected</span>
                                            }
                                        </div>
                                    </div>

                                    <div className="rp-field">
                                        <div className="rp-label"><span className="rp-label-icon">📝</span>Description</div>
                                        <div className="rp-textarea-wrap">
                                            <textarea
                                                className="rp-textarea"
                                                readOnly
                                                value={description}
                                                style={{ minHeight: 90, background: 'rgba(243,238,255,0.4)', cursor: 'default' }}
                                            />
                                        </div>
                                        {severity && (
                                            <div className="rp-ai-bar" style={{ marginTop: 8 }}>
                                                <span>🤖 AI Severity Assessment</span>
                                                <div className={`rp-severity-pill ${severity}`}>{severityLabel}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rp-field">
                                        <div className="rp-label"><span className="rp-label-icon">📍</span>Location</div>
                                        <input
                                            className="rp-input"
                                            readOnly
                                            value={location || 'Not specified'}
                                            style={{ background: 'rgba(243,238,255,0.4)', cursor: 'default' }}
                                        />
                                        {(lat || lng) && (
                                            <div className="rp-coords-row">
                                                <input className="rp-input" readOnly value={lat ? `Lat: ${lat}` : '—'} style={{ background: 'rgba(243,238,255,0.4)' }} />
                                                <input className="rp-input" readOnly value={lng ? `Lng: ${lng}` : '—'} style={{ background: 'rgba(243,238,255,0.4)' }} />
                                            </div>
                                        )}
                                    </div>

                                    {files.length > 0 && (
                                        <div className="rp-field">
                                            <div className="rp-label"><span className="rp-label-icon">📎</span>Evidence Files</div>
                                            <div className="rp-file-list">
                                                {files.map((f, i) => (
                                                    <div className="rp-file-chip" key={i}>📄 {f.name}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="rp-field">
                                        <div className="rp-label"><span className="rp-label-icon">🔒</span>Privacy Mode</div>
                                        <div className="rp-anon-toggle" style={{ cursor: 'default', pointerEvents: 'none' }}>
                                            <div className={`rp-toggle-switch ${anonymous ? 'on' : ''}`}>
                                                <div className="rp-toggle-thumb" />
                                            </div>
                                            <div className="rp-anon-text">
                                                <div className="rp-anon-title">
                                                    {anonymous ? '🕵️ Anonymous Mode — ON' : '👤 Identified Mode — ON'}
                                                </div>
                                                <div className="rp-anon-sub">
                                                    {anonymous ? 'Identity fully protected.' : 'Account info attached.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Navigation buttons ──────────────────────── */}
                            <div className="rp-nav-btns">
                                {step > 0 && (
                                    <button className="rp-btn-back" onClick={goBack} {...hc}>
                                        ← Back
                                    </button>
                                )}

                                {step < 2 ? (
                                    <button className="rp-btn-next" onClick={goNext} {...hc}>
                                        <span>Continue</span>
                                        <span>→</span>
                                    </button>
                                ) : (
                                    <button
                                        className="rp-btn-submit"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        {...hc}
                                    >
                                        {submitting ? (
                                            <><div className="rp-ai-spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                                        ) : (
                                            <><span>🔒</span><span>Submit Report Securely</span></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </main>

            {/* ── SOS floating button ───────────────────────────────── */}
            <div className="rp-sos-wrapper">
                <button className="rp-sos-btn" onClick={() => showToast('📞 Connecting to emergency services...')} {...hc}>
                    <div className="rp-sos-ring" />
                    SOS
                </button>
                <span className="rp-sos-label">Emergency</span>
            </div>

            {/* ── Toast ─────────────────────────────────────────────── */}
            <div className={`rp-toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
        </div>
    );
}