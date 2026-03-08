import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    UserPlus, Eye, EyeOff, AlertCircle, ChevronRight, ChevronLeft,
    Calendar, Shield, Upload, Camera, CheckCircle, FileText, Loader2,
    Scale, Lock, User, Mail, Sparkles, Gift,
} from 'lucide-react';
import api from '../api/config';

const STEPS = [
    { label: 'Basic Info', icon: User },
    { label: 'Birthdate', icon: Calendar },
    { label: 'Safety Acts', icon: Shield },
    { label: 'ID Verify', icon: Upload },
];

export const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Step 1
    const [form, setForm] = useState({
        username: '', password: '', email: '',
        first_name: '', last_name: '',
    });
    // Step 2
    const [dob, setDob] = useState('');
    // Step 3
    const [safetyActs, setSafetyActs] = useState([]);
    const [acceptedActs, setAcceptedActs] = useState({});
    // Step 4
    const [idFront, setIdFront] = useState(null);
    const [idFrontPreview, setIdFrontPreview] = useState(null);
    const [ocrResult, setOcrResult] = useState(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [registeredToken, setRegisteredToken] = useState(null);

    useEffect(() => {
        api.get('/api/safety-acts/')
            .then(res => setSafetyActs(res.data))
            .catch(() => { });
    }, []);

    const handleInput = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    /* ── Validation ── */
    const validateStep1 = () => {
        const { username, password, email, first_name, last_name } = form;
        if (!first_name || !last_name) return 'First and last name are required.';
        if (!username) return 'Username is required.';
        if (!email) return 'Email is required.';
        if (password.length < 8) return 'Password must be at least 8 characters.';
        return null;
    };
    const validateStep2 = () => {
        if (!dob) return 'Date of birth is required.';
        const bd = new Date(dob), today = new Date();
        let age = today.getFullYear() - bd.getFullYear();
        const m = today.getMonth() - bd.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
        if (age < 20) return 'You must be at least 20 years old to register.';
        return null;
    };
    const validateStep3 = () => {
        if (!safetyActs.every(a => acceptedActs[a.code]))
            return 'You must accept all safety acts to continue.';
        return null;
    };

    const goNext = () => {
        let err = null;
        if (step === 0) err = validateStep1();
        if (step === 1) err = validateStep2();
        if (step === 2) err = validateStep3();
        if (err) { setError(err); return; }
        setError('');
        setStep(s => s + 1);
    };
    const goBack = () => { setError(''); setStep(s => s - 1); };

    /* ── Register ── */
    const handleRegister = async () => {
        setLoading(true); setError('');
        try {
            const payload = {
                ...form, date_of_birth: dob,
                accepted_acts: Object.keys(acceptedActs).filter(k => acceptedActs[k]),
            };
            const res = await api.post('/api/register/', payload);
            setRegisteredToken(res.data.token);
            setStep(3);
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                const msgs = [];
                Object.values(data).forEach(v => {
                    if (Array.isArray(v)) msgs.push(...v);
                    else if (typeof v === 'string') msgs.push(v);
                    else if (typeof v === 'object') Object.values(v).forEach(inner => {
                        if (Array.isArray(inner)) msgs.push(...inner);
                        else msgs.push(String(inner));
                    });
                });
                setError(msgs.join(' '));
            } else setError('Registration failed.');
        } finally { setLoading(false); }
    };

    /* ── OCR + ID Upload ── */
    const handleIdSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIdFront(file);
        setIdFrontPreview(URL.createObjectURL(file));
        setOcrResult(null);
    };
    const runOCR = async () => {
        if (!idFront) return;
        setOcrLoading(true);
        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng');
            const { data } = await worker.recognize(idFront);
            setOcrResult({ text: data.text, confidence: data.confidence });
            await worker.terminate();
        } catch { setOcrResult({ text: 'OCR failed.', confidence: 0 }); }
        finally { setOcrLoading(false); }
    };
    const handleIdUpload = async () => {
        if (!idFront) { setError('Please select your ID.'); return; }
        setLoading(true); setError('');
        try {
            const fd = new FormData();
            fd.append('id_front', idFront);
            if (ocrResult) {
                fd.append('ocr_extracted_name', ocrResult.text?.slice(0, 255) || '');
                fd.append('ocr_confidence', ocrResult.confidence || 0);
            }
            await api.post('/api/upload-id/', fd, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Token ${registeredToken}` },
            });
            navigate('/login');
        } catch { setError('Upload failed. Try again after logging in.'); }
        finally { setLoading(false); }
    };
    const skipIdUpload = () => navigate('/login');

    const toggleAct = (code) => { setAcceptedActs(p => ({ ...p, [code]: !p[code] })); setError(''); };

    /* ── Shared styles ── */
    const labelStyle = {
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem',
        color: 'var(--text-secondary)',
    };

    return (
        <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card animate-fade-in-up" style={{
                width: '100%', maxWidth: step === 2 ? '520px' : '400px',
                padding: '2rem', transition: 'max-width 0.3s',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 0.75rem',
                    }}>
                        {step < 3
                            ? <Gift size={22} color="var(--accent-primary)" />
                            : <Lock size={22} color="var(--accent-primary)" />
                        }
                    </div>
                    <h1 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>
                        {step < 3 ? 'Create Account' : 'Verify Identity'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {step === 0 && 'Fill in your details to get started'}
                        {step === 1 && 'Confirm your age (must be 20+)'}
                        {step === 2 && 'Accept Philippine safety laws'}
                        {step === 3 && 'Upload your government ID'}
                    </p>
                </div>

                {/* Progress */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '0.75rem',
                    marginBottom: '1.5rem',
                }}>
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const active = i === step, done = i < step;
                        return (
                            <div key={i} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: '0.25rem', opacity: active ? 1 : done ? 0.7 : 0.3,
                            }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: active ? '#1a1a1a' : done ? '#555' : '#ddd',
                                    color: active || done ? '#fff' : '#999',
                                }}>
                                    {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                                </div>
                                <span style={{
                                    fontSize: '0.55rem', fontWeight: '600',
                                    color: active ? '#1a1a1a' : '#999',
                                }}>{s.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2', color: 'var(--danger)',
                        padding: '0.625rem', borderRadius: 'var(--border-radius-sm)',
                        marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}>
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                {/* ── Step 1: Basic Info ── */}
                {step === 0 && (
                    <form onSubmit={e => { e.preventDefault(); goNext(); }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                            <label style={labelStyle}><User size={14} /> First Name</label>
                            <input type="text" className="input-field" value={form.first_name}
                                onChange={e => handleInput('first_name', e.target.value)}
                                placeholder="Juan" required />
                        </div>
                        <div>
                            <label style={labelStyle}><User size={14} /> Last Name</label>
                            <input type="text" className="input-field" value={form.last_name}
                                onChange={e => handleInput('last_name', e.target.value)}
                                placeholder="Dela Cruz" required />
                        </div>
                        <div>
                            <label style={labelStyle}><User size={14} /> Username</label>
                            <input type="text" className="input-field" value={form.username}
                                onChange={e => handleInput('username', e.target.value)}
                                placeholder="juandelacruz" required />
                        </div>
                        <div>
                            <label style={labelStyle}><Mail size={14} /> Email</label>
                            <input type="email" className="input-field" value={form.email}
                                onChange={e => handleInput('email', e.target.value)}
                                placeholder="juan@email.com" required />
                        </div>
                        <div>
                            <label style={labelStyle}><Lock size={14} /> Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    value={form.password}
                                    onChange={e => handleInput('password', e.target.value)}
                                    placeholder="At least 8 characters"
                                    style={{ paddingRight: '2.5rem' }}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '0.75rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        padding: '0.25rem', display: 'flex', alignItems: 'center',
                                    }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.25rem', padding: '0.75rem' }}>
                            Continue <ChevronRight size={16} />
                        </button>
                    </form>
                )}

                {/* ── Step 2: Birthdate ── */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            textAlign: 'center', padding: '0.75rem 0', color: 'var(--text-secondary)',
                            fontSize: '0.82rem', lineHeight: '1.6',
                        }}>
                            <Shield size={36} color="#1a1a1a" style={{ marginBottom: '0.4rem' }} />
                            <p>
                                Under <strong>RA 7610</strong> (Special Protection of Children Against Abuse),
                                all users must be at least <strong>20 years of age</strong>.
                            </p>
                        </div>
                        <div>
                            <label style={labelStyle}><Calendar size={14} /> Date of Birth</label>
                            <input type="date" className="input-field" value={dob}
                                onChange={e => { setDob(e.target.value); setError(''); }}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 20))
                                    .toISOString().split('T')[0]}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-ghost" style={{ flex: 1, padding: '0.7rem' }} onClick={goBack}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button className="btn btn-primary" style={{ flex: 2, padding: '0.7rem' }} onClick={goNext}>
                                Continue <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Safety Acts ── */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{
                            textAlign: 'center', fontSize: '0.8rem',
                            color: 'var(--text-secondary)', marginBottom: '0.25rem',
                        }}>
                            <Scale size={22} style={{ marginBottom: '0.2rem' }} />
                            <p>Acknowledge the following Philippine safety laws:</p>
                        </div>

                        <div style={{
                            maxHeight: '300px', overflowY: 'auto',
                            border: '1px solid var(--border-color)', borderRadius: '8px',
                        }}>
                            {safetyActs.map(act => (
                                <div key={act.code} style={{
                                    display: 'flex', gap: '0.5rem', padding: '0.6rem 0.75rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    cursor: 'pointer', alignItems: 'flex-start',
                                    transition: 'background 0.15s',
                                    background: acceptedActs[act.code] ? 'rgba(0,0,0,0.02)' : 'transparent',
                                }}
                                    onClick={() => toggleAct(act.code)}
                                >
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '4px',
                                        border: `2px solid ${acceptedActs[act.code] ? '#1a1a1a' : '#ccc'}`,
                                        background: acceptedActs[act.code] ? '#1a1a1a' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, marginTop: '2px', transition: 'all 0.2s',
                                    }}>
                                        {acceptedActs[act.code] && <CheckCircle size={10} color="#fff" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.72rem', marginBottom: '0.1rem' }}>
                                            {act.code} — {act.title}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                            {act.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button className="btn btn-ghost" style={{ flex: 1, padding: '0.7rem' }} onClick={goBack}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button className="btn btn-primary" style={{ flex: 2, padding: '0.7rem' }}
                                onClick={() => { const e = validateStep3(); if (e) { setError(e); return; } handleRegister(); }}
                                disabled={loading}>
                                {loading
                                    ? <><Loader2 size={16} className="spin" /> Registering...</>
                                    : <><Sparkles size={16} /> Register</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: ID Upload + OCR ── */}
                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <p>Upload a valid government-issued ID for verification.</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                Under <strong>RA 10173</strong>, your data is encrypted and confidential.
                            </p>
                        </div>

                        <div
                            style={{
                                border: '2px dashed var(--border-color)', borderRadius: '12px',
                                padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                                background: idFrontPreview ? 'transparent' : 'var(--bg-secondary)',
                                transition: 'border-color 0.3s',
                            }}
                            onClick={() => document.getElementById('id-upload-input').click()}
                        >
                            {idFrontPreview ? (
                                <img src={idFrontPreview} alt="ID Preview"
                                    style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }} />
                            ) : (
                                <>
                                    <Camera size={28} color="var(--text-muted)" />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                        Tap to select or take a photo of your ID
                                    </p>
                                </>
                            )}
                            <input id="id-upload-input" type="file" accept="image/*"
                                style={{ display: 'none' }} onChange={handleIdSelect} />
                        </div>

                        {idFront && !ocrResult && (
                            <button className="btn btn-ghost" style={{ padding: '0.6rem' }}
                                onClick={runOCR} disabled={ocrLoading}>
                                {ocrLoading
                                    ? <><Loader2 size={16} className="spin" /> Scanning...</>
                                    : <><FileText size={16} /> Scan ID with OCR</>
                                }
                            </button>
                        )}

                        {ocrResult && (
                            <div style={{
                                padding: '0.6rem', background: 'var(--bg-secondary)',
                                borderRadius: '8px', border: '1px solid var(--border-color)',
                            }}>
                                <div style={{
                                    fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.2rem',
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    color: 'var(--success)',
                                }}>
                                    <CheckCircle size={14} /> OCR Complete ({ocrResult.confidence.toFixed(1)}%)
                                </div>
                                <pre style={{
                                    fontSize: '0.6rem', color: 'var(--text-muted)',
                                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                    maxHeight: '80px', overflowY: 'auto', margin: 0,
                                }}>
                                    {ocrResult.text}
                                </pre>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-ghost" style={{ flex: 1, padding: '0.7rem' }}
                                onClick={skipIdUpload}>
                                Skip for Now
                            </button>
                            <button className="btn btn-primary" style={{ flex: 2, padding: '0.7rem' }}
                                onClick={handleIdUpload} disabled={loading || !idFront}>
                                {loading
                                    ? <><Loader2 size={16} className="spin" /> Uploading...</>
                                    : <><Upload size={16} /> Submit ID</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {step < 3 && (
                    <p style={{
                        textAlign: 'center', marginTop: '1.5rem',
                        fontSize: '0.82rem', color: 'var(--text-muted)',
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                            Log in
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};
