import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { Heart, MapPin, Sparkles } from 'lucide-react';

// Fix image URLs: prepend API base URL for relative paths, ensure https
const API_BASE = import.meta.env.VITE_API_URL || '';
const fixImageUrl = (url) => {
    if (!url) return null;
    // If relative path (starts with /), prepend the API base URL
    if (url.startsWith('/')) {
        url = API_BASE + url;
    }
    // Ensure https in production
    return url.replace(/^http:\/\//, 'https://');
};

const RANK_COLORS = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
};

const getInitials = (name) =>
    name.split(/[\s_]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

const GRADIENT_COLORS = [
    ['#fbc2eb', '#a6c1ee'],
    ['#a1c4fd', '#c2e9fb'],
    ['#ffecd2', '#fcb69f'],
    ['#fdcbf1', '#e6dee9'],
    ['#ff9a9e', '#fecfef'],
    ['#d4fc79', '#96e6a1'],
];

/* Skeleton Card for Loading */
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-img" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
        <div className="skeleton skeleton-btn" />
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

    const groupedProfiles = displayedProfiles.reduce((acc, profile) => {
        const loc = profile.location;
        if (!acc[loc]) acc[loc] = [];
        acc[loc].push(profile);
        return acc;
    }, {});

    if (error) {
        return (
            <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--danger)' }}>{error}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
            {/* Page Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '2rem' }}>
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
                    {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
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
            {!loading && Object.entries(groupedProfiles).map(([location, locProfiles]) => (
                <div key={location} style={{ marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '1.1rem', fontWeight: '700',
                        borderBottom: '2px solid var(--border-color)',
                        paddingBottom: '0.5rem', marginBottom: '1.25rem',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <MapPin size={18} color="var(--accent-primary)" /> {location}
                    </h2>

                    <div className="profile-grid">
                        {locProfiles.map((profile, index) => {
                            const ribbonClass = RANK_COLORS[profile.rank] || 'bronze';
                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                            const displayName = profile.user?.first_name
                                ? `${profile.user.first_name} ${profile.user.last_name || ''}`.trim()
                                : profile.user?.username || 'Unknown';

                            return (
                                <div
                                    key={profile.id}
                                    className={`card animate-fade-in-up stagger-${(index % 5) + 1}`}
                                    style={{ padding: 0, cursor: 'pointer' }}
                                    onClick={() => navigate(`/rent/${profile.id}`)}
                                >
                                    {/* Ribbon */}
                                    <div className="ribbon-wrapper">
                                        <div className={`ribbon ${ribbonClass}`}>{profile.rank}</div>
                                    </div>

                                    {/* Avatar */}
                                    <div style={{
                                        height: '180px',
                                        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', overflow: 'hidden',
                                    }}>
                                        {profile.image ? (
                                            <img
                                                src={fixImageUrl(profile.image)}
                                                alt={displayName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ) : (
                                            <span style={{
                                                fontSize: '2.5rem', fontWeight: '800',
                                                color: 'rgba(255,255,255,0.9)',
                                            }}>
                                                {getInitials(displayName)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: '1rem' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                                            {displayName}
                                        </h3>
                                        <p style={{
                                            color: 'var(--text-muted)', fontSize: '0.78rem',
                                            marginBottom: '0.75rem', lineHeight: 1.5,
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {profile.bio || 'No bio available.'}
                                        </p>

                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', fontSize: '0.78rem',
                                        }}>
                                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <MapPin size={12} /> {profile.location.split(',')[0]}
                                            </span>
                                            <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
                                                ₱{parseFloat(profile.hourly_rate).toLocaleString()}<span style={{ fontWeight: '400', fontSize: '0.65rem' }}>/hr</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
