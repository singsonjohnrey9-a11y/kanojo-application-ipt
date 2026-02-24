import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { Heart, Sparkles, MapPin } from 'lucide-react';

const RANK_COLORS = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
};

const getInitials = (username) => {
    return username
        .split('_')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Softer, kawaii gradients
const GRADIENT_COLORS = [
    ['#ff9a9e', '#fecfef'],
    ['#fbc2eb', '#a6c1ee'],
    ['#fdcbf1', '#e6dee9'],
    ['#a1c4fd', '#c2e9fb'],
    ['#ffecd2', '#fcb69f'],
    ['#cfd9df', '#e2ebf0'],
];

export const ProfileList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const selectedArea = searchParams.get('area') || 'All Cebu';

    useEffect(() => {
        axios.get('/api/profiles/')
            .then(res => {
                setProfiles(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch profiles:', err);
                setError('Failed to load cast list. Please try again.');
                setLoading(false);
            });
    }, []);

    // Filter logic
    const displayedProfiles = selectedArea === 'All Cebu'
        ? profiles
        : profiles.filter(p => p.location.includes(selectedArea));

    // Grouping by location if 'All Cebu' is selected
    const groupedProfiles = displayedProfiles.reduce((acc, profile) => {
        const loc = profile.location;
        if (!acc[loc]) acc[loc] = [];
        acc[loc].push(profile);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Fetching Cast List... <Heart size={24} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', color: '#ef4444' }}>{error}</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={36} color="var(--accent-primary)" /> {selectedArea === 'All Cebu' ? 'All Active Cast Members' : `Cast List: ${selectedArea}`}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Browse our verified companions. Find the perfect match for your day!
            </p>

            {displayedProfiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>No cast members available in {selectedArea} right now.</p>
                    <p>Please check back soon!</p>
                </div>
            ) : Object.entries(groupedProfiles).map(([location, locProfiles]) => (
                <div key={location} style={{ marginBottom: '4rem' }}>
                    <h2 style={{
                        fontSize: '1.75rem',
                        borderBottom: '3px solid var(--border-color)',
                        paddingBottom: '0.5rem',
                        marginBottom: '1.5rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <MapPin size={28} color="var(--accent-primary)" /> {location}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {locProfiles.map((profile, index) => {
                            const ribbonClass = RANK_COLORS[profile.rank] || 'bronze';
                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                            const displayName = profile.user?.first_name
                                ? `${profile.user.first_name} ${profile.user.last_name || ''}`.trim()
                                : profile.user?.username || 'Unknown';

                            return (
                                <Card key={profile.id}>
                                    {/* Ribbon */}
                                    <div className="ribbon-wrapper">
                                        <div className={`ribbon ${ribbonClass}`}>{profile.rank}</div>
                                    </div>

                                    {/* Avatar Header */}
                                    <div style={{
                                        height: '240px',
                                        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
                                        margin: '-1.5rem -1.5rem 1rem -1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.05)'
                                    }}>
                                        {profile.image ? (
                                            <img
                                                src={profile.image}
                                                alt={displayName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{
                                                fontSize: '4rem',
                                                fontWeight: '800',
                                                color: 'rgba(255,255,255,0.95)',
                                                textShadow: '0 4px 12px rgba(230,0,126,0.2)',
                                            }}>
                                                {getInitials(displayName)}
                                            </span>
                                        )}
                                    </div>

                                    <CardBody style={{ padding: '0' }}>
                                        <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                                            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>{displayName}</h2>
                                        </div>

                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            marginBottom: '1rem',
                                            minHeight: '60px',
                                            lineHeight: '1.6',
                                            paddingRight: '0.5rem',
                                        }}>
                                            {profile.bio || 'No bio available.'}
                                        </p>

                                        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> Area</span>
                                                <span style={{ fontWeight: '700' }}>{profile.location.split(',')[0]}</span>
                                            </div>
                                            <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Heart size={14} color="var(--accent-primary)" /> Rate</span>
                                                <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                                                    ₱{parseFloat(profile.hourly_rate).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>/ hr</span>
                                                </span>
                                            </div>
                                        </div>
                                    </CardBody>

                                    <CardFooter style={{ marginTop: '0', paddingTop: '0', borderTop: 'none' }}>
                                        <Button variant="primary" style={{ width: '100%' }} onClick={() => navigate(`/rent/${profile.id}`)}>
                                            Select & Rent
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
