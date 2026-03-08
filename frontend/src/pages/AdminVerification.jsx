import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, CheckCircle, XCircle, Eye, User, Calendar,
    FileText, AlertCircle, Loader2, ChevronLeft,
} from 'lucide-react';
import api from '../api/config';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fixUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/')) url = API_BASE + url;
    if (window.location.protocol === 'https:') {
        url = url.replace(/^http:\/\//, 'https://');
    }
    return url;
};

export const AdminVerification = () => {
    const navigate = useNavigate();
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [reviewNote, setReviewNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const token = localStorage.getItem('access');

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/verifications/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPending(res.data);
        } catch (err) {
            setError('Failed to load verifications. Make sure you are logged in as admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (userId, action) => {
        setActionLoading(true);
        try {
            await api.post(`/api/admin/verifications/${userId}/review/`, {
                action,
                note: reviewNote,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Remove from list
            setPending(prev => prev.filter(u => u.id !== userId));
            setSelectedUser(null);
            setReviewNote('');
        } catch (err) {
            setError('Review failed. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <Loader2 size={32} className="spin" color="var(--text-muted)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading verifications...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <button className="btn-secondary" onClick={() => navigate('/')}
                    style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
                    <ChevronLeft size={14} /> Back
                </button>
                <h1 style={{
                    fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <Shield size={24} /> ID Verification Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {pending.length} pending verification{pending.length !== 1 ? 's' : ''}
                </p>
            </div>

            {error && (
                <div className="auth-error">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {pending.length === 0 && !error && (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    <CheckCircle size={48} style={{ marginBottom: '1rem', color: '#ccc' }} />
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>All clear!</p>
                    <p style={{ fontSize: '0.85rem' }}>No pending verifications at this time.</p>
                </div>
            )}

            {/* Pending List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pending.map(user => (
                    <div key={user.id} className="card" style={{
                        padding: '1rem', cursor: 'pointer',
                        border: selectedUser?.id === user.id ? '2px solid #1a1a1a' : undefined,
                    }}
                        onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    >
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div>
                                <div style={{
                                    fontWeight: '700', fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                }}>
                                    <User size={16} />
                                    {user.first_name} {user.last_name}
                                    <span style={{
                                        fontSize: '0.65rem', color: 'var(--text-muted)',
                                        fontWeight: '400',
                                    }}>
                                        @{user.username}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem',
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                }}>
                                    <Calendar size={12} />
                                    DOB: {user.date_of_birth || 'Not provided'}
                                    <span style={{ margin: '0 0.3rem' }}>|</span>
                                    OCR Confidence: {(user.ocr_confidence || 0).toFixed(1)}%
                                </div>
                            </div>
                            <Eye size={18} color="var(--text-muted)" />
                        </div>

                        {/* Expanded details */}
                        {selectedUser?.id === user.id && (
                            <div className="animate-fade-in-up" style={{ marginTop: '1rem' }}>
                                {/* OCR Data */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                                    marginBottom: '1rem',
                                }}>
                                    <div style={{
                                        padding: '0.75rem', background: 'var(--bg-secondary)',
                                        borderRadius: '8px', border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{
                                            fontSize: '0.65rem', fontWeight: '700',
                                            color: 'var(--text-muted)', marginBottom: '0.25rem',
                                        }}>
                                            <FileText size={12} /> OCR EXTRACTED NAME
                                        </div>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            {user.ocr_extracted_name || 'N/A'}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.75rem', background: 'var(--bg-secondary)',
                                        borderRadius: '8px', border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{
                                            fontSize: '0.65rem', fontWeight: '700',
                                            color: 'var(--text-muted)', marginBottom: '0.25rem',
                                        }}>
                                            <Calendar size={12} /> OCR EXTRACTED DOB
                                        </div>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            {user.ocr_extracted_dob || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* ID Document Images */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                                    marginBottom: '1rem',
                                }}>
                                    {user.id_document_url && (
                                        <div>
                                            <p style={{
                                                fontSize: '0.7rem', fontWeight: '700',
                                                marginBottom: '0.3rem', color: 'var(--text-muted)',
                                            }}>
                                                ID FRONT
                                            </p>
                                            <img src={fixUrl(user.id_document_url)} alt="ID Front"
                                                style={{
                                                    width: '100%', borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                }}
                                            />
                                        </div>
                                    )}
                                    {user.id_document_back_url && (
                                        <div>
                                            <p style={{
                                                fontSize: '0.7rem', fontWeight: '700',
                                                marginBottom: '0.3rem', color: 'var(--text-muted)',
                                            }}>
                                                ID BACK
                                            </p>
                                            <img src={fixUrl(user.id_document_back_url)} alt="ID Back"
                                                style={{
                                                    width: '100%', borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Admin Note */}
                                <div className="auth-field" style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.7rem' }}>
                                        <FileText size={12} /> Admin Note (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={reviewNote}
                                        onChange={e => setReviewNote(e.target.value)}
                                        placeholder="Reason for approval or rejection..."
                                        onClick={e => e.stopPropagation()}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}
                                    onClick={e => e.stopPropagation()}>
                                    <button
                                        className="btn-primary"
                                        style={{
                                            flex: 1, background: '#1a8c1a',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '0.3rem',
                                        }}
                                        disabled={actionLoading}
                                        onClick={() => handleReview(user.id, 'approve')}
                                    >
                                        {actionLoading ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                                        Approve
                                    </button>
                                    <button
                                        className="btn-primary"
                                        style={{
                                            flex: 1, background: '#c42b2b',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '0.3rem',
                                        }}
                                        disabled={actionLoading}
                                        onClick={() => handleReview(user.id, 'reject')}
                                    >
                                        {actionLoading ? <Loader2 size={14} className="spin" /> : <XCircle size={14} />}
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
