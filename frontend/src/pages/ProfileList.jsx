import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { Heart, Sparkles, Globe, Languages, CheckCircle, Star, MapPin } from 'lucide-react';

// Fix image URLs: prepend API base URL for relative paths
// Only force https in production (when window.location is https)
const API_BASE = import.meta.env.VITE_API_URL || '';
const fixImageUrl = (url) => {
    if (!url) return null;
    
    // Support absolute AWS S3 urls
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    if (url.startsWith('/')) {
        url = API_BASE + url;
    }
    if (window.location.protocol === 'https:') {
        url = url.replace(/^http:\/\//, 'https://');
    }
    return url;
};

const RANK_COLORS = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
};

const RANK_LABELS = {
    BRONZE: 'Regular',
    SILVER: 'Regular',
    GOLD: 'Premium',
    PLATINUM: 'Premium',
};

const getInitials = (name) =>
    name.split(/[\s_]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

const getAge = (id) => 20 + (id % 13);

// Star rating based on rank
const RANK_STARS = {
    BRONZE: 3,
    SILVER: 4,
    GOLD: 4,
    PLATINUM: 5,
};

/* Star Rating Component */
const StarRating = ({ count }) => (
    <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
        {Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                size={12}
                fill={i < count ? '#1a1a1a' : 'none'}
                color={i < count ? '#1a1a1a' : '#ccc'}
                strokeWidth={1.5}
            />
        ))}
    </div>
);

/* Skeleton Card for Loading */
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-img" style={{ height: '280px' }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
    </div>
);

export const ProfileList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const selectedArea = searchParams.get('area') || 'All Cebu';

    useEffect(() => {
        api.get('/api/profiles/')
            .then(res => { setProfiles(res.data); setLoading(false); })
            .catch(err => {
                console.error('Failed to fetch profiles:', err);
                setError('Failed to load cast list. Please try again.');
                setLoading(false);
            });
    }, []);

    const displayedProfiles = selectedArea === 'All Cebu'
        ? profiles
        : profiles.filter(p => p.location.includes(selectedArea));

    if (error) {
        return (
            <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--danger)' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
            {/* Page Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    fontSize: '1.75rem', marginBottom: '0.35rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <Sparkles size={24} color="var(--accent-primary)" />
                    {selectedArea === 'All Cebu' ? 'All Active Cast' : selectedArea}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {loading ? 'Loading...' : `${displayedProfiles.length} companions available`}
                </p>
            </div>

            {/* Loading Skeleton */}
            {loading && (
                <div className="profile-grid">
                    {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {/* Empty State */}
            {!loading && displayedProfiles.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <Heart size={48} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        No cast members in {selectedArea}
                    </p>
                    <p style={{ fontSize: '0.85rem' }}>Check back soon or browse another area!</p>
                </div>
            )}

            {/* Profile Cards */}
            {!loading && displayedProfiles.length > 0 && (
                <div className="profile-grid">
                    {displayedProfiles.map((profile, index) => {
                        const ribbonClass = RANK_COLORS[profile.rank] || 'bronze';
                        const ribbonLabel = RANK_LABELS[profile.rank] || 'Regular';
                        const firstName = profile.user?.first_name || '';
                        const lastName = profile.user?.last_name || '';
                        const displayName = firstName
                            ? `${firstName} ${lastName}`.trim()
                            : profile.user?.username || 'Unknown';
                        const age = getAge(profile.id);
                        const city = profile.location.split(',')[0];
                        const starCount = RANK_STARS[profile.rank] || 3;

                        return (
                            <div
                                key={profile.id}
                                className={`card animate-fade-in-up stagger-${(index % 5) + 1}`}
                                style={{ padding: 0, cursor: 'pointer' }}
                                onClick={() => navigate(`/rent/${profile.id}`)}
                            >
                                {/* Top-Left Ribbon */}
                                <div className="ribbon-wrapper">
                                    <div className={`ribbon ${ribbonClass}`}>{ribbonLabel}</div>
                                </div>

                                {/* Photo — portrait showcase */}
                                <div className="profile-card-photo">
                                    {profile.image ? (
                                        <img
                                            src={fixImageUrl(profile.image)}
                                            alt={displayName}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <span style={{
                                                fontSize: '2.5rem', fontWeight: '800',
                                                color: 'rgba(255,255,255,0.9)',
                                            }}>
                                                {getInitials(displayName)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="profile-card-info">
                                    {/* Name with age — like rent-kano style */}
                                    <div className="profile-card-name">
                                        {firstName}({age})
                                    </div>

                                    {/* NEW badge */}
                                    <div className="profile-badges">
                                        <span className="new-badge">NEW</span>
                                    </div>

                                    {/* Bio */}
                                    <div className="profile-card-bio">
                                        {profile.bio || 'No bio available.'}
                                    </div>

                                    {/* Star Rating + Icons — desktop only */}
                                    <div className="profile-card-icons">
                                        <StarRating count={starCount} />
                                        <span style={{
                                            marginLeft: 'auto',
                                            display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                            fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)',
                                        }}>
                                            <MapPin size={11} /> {city}
                                        </span>
                                    </div>

                                    {/* Star Rating — mobile only (icons row hidden, this shows) */}
                                    <div className="profile-card-stars-mobile">
                                        <StarRating count={starCount} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
