import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/config';
import { ArrowLeft, Minus, Plus, CheckCircle, MapPin, Clock, Star } from 'lucide-react';

const GRADIENT_COLORS = [
    ['#e0e0e0', '#c0c0c0'],
    ['#d0d0d0', '#b0b0b0'],
    ['#c8c8c8', '#a8a8a8'],
];

export const RentRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [hours, setHours] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/api/profiles/${id}/`)
            .then(res => { setProfile(res.data); setLoading(false); })
            .catch(() => { setError('Profile not found.'); setLoading(false); });
    }, [id]);

    const rate = profile ? parseFloat(profile.hourly_rate) : 0;
    const totalCost = rate * hours;

    const getDisplayName = () => {
        if (!profile) return '';
        if (profile.user?.first_name) return `${profile.user.first_name} ${profile.user.last_name || ''}`.trim();
        return profile.user?.username || 'Unknown';
    };

    const getInitials = (name) => name.split(/[\s_]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post('/api/requests/', { profile_id: profile.id, hours });
            setSubmitted(true);
            setTimeout(() => navigate('/profiles'), 2500);
        } catch {
            alert('Failed to submit request. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container flex-center" style={{ padding: '6rem 1.5rem' }}>
                <div className="spinner" style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--danger)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>{error}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/profiles')}>Back to Cast</button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Login Required</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    You need to be logged in to book {getDisplayName()}.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Continue</button>
            </div>
        );
    }

    // Success State
    if (submitted) {
        return (
            <div className="container flex-center animate-bounce-in" style={{ padding: '6rem 1.5rem', flexDirection: 'column', gap: '1rem' }}>
                <CheckCircle size={56} color="var(--success)" />
                <h2 style={{ fontSize: '1.5rem' }}>Request Sent!</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    ₱{totalCost.toLocaleString()} • {hours} hour{hours > 1 ? 's' : ''} with {getDisplayName()}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Redirecting...</p>
            </div>
        );
    }

    const gradient = GRADIENT_COLORS[parseInt(id) % GRADIENT_COLORS.length];

    return (
        <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem', maxWidth: '560px' }}>
            {/* Back */}
            <button
                className="btn btn-ghost"
                style={{ marginBottom: '1.5rem', padding: 0, gap: '0.3rem', fontSize: '0.85rem' }}
                onClick={() => navigate('/profiles')}
            >
                <ArrowLeft size={16} /> Back to Cast
            </button>

            {/* Profile Header */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
                <div style={{
                    height: '140px',
                    background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {profile.image ? (
                        <img src={profile.image} alt={getDisplayName()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '3rem', fontWeight: '800', color: 'rgba(255,255,255,0.9)' }}>
                            {getInitials(getDisplayName())}
                        </span>
                    )}
                </div>
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{getDisplayName()}</h2>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={12} /> {profile.location}
                            </span>
                        </div>
                        <span className="badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>
                            <Star size={10} /> {profile.rank}
                        </span>
                    </div>
                    {profile.bio && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                            {profile.bio}
                        </p>
                    )}
                </div>
            </div>

            {/* Hour Selector */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1rem', display: 'block' }}>
                    <Clock size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
                    Duration
                </label>

                <div className="hour-selector" style={{ justifyContent: 'center' }}>
                    <button
                        className="hour-btn"
                        onClick={() => setHours(h => Math.max(1, h - 1))}
                        disabled={hours <= 1}
                    >
                        <Minus size={18} />
                    </button>
                    <div className="hour-display">
                        {hours}<span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>hr{hours > 1 ? 's' : ''}</span>
                    </div>
                    <button
                        className="hour-btn"
                        onClick={() => setHours(h => Math.min(24, h + 1))}
                        disabled={hours >= 24}
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* Cost Summary */}
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-muted)' }}>
                <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Rate</span>
                    <span>₱{rate.toLocaleString()} × {hours}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />
                <div className="flex-between" style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent-primary)' }}>
                        ₱{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Submit */}
            <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <><div className="spinner" /> Sending...</>
                ) : (
                    'Confirm Request'
                )}
            </button>
        </div>
    );
};
