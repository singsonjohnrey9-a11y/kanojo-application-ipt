import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

export const RentRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [hours, setHours] = useState(1);
    const [totalCost, setTotalCost] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/profiles/${id}/`)
            .then(res => {
                setProfile(res.data);
                setTotalCost(parseFloat(res.data.hourly_rate) * hours);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch profile:', err);
                setError('Profile not found.');
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (profile) {
            setTotalCost(parseFloat(profile.hourly_rate) * hours);
        }
    }, [hours, profile]);

    const getDisplayName = () => {
        if (!profile) return '';
        if (profile.user?.first_name) {
            return `${profile.user.first_name} ${profile.user.last_name || ''}`.trim();
        }
        return profile.user?.username || 'Unknown';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/requests/', {
                profile_id: profile.id,
                hours: hours
            });
            alert(`Success! Request sent to ${getDisplayName()} for ₱${totalCost.toLocaleString()}`);
            navigate('/profiles');
        } catch (err) {
            console.error('Failed to submit request:', err);
            alert('Failed to submit request. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', color: '#ef4444' }}>{error}</div>
                <Button variant="secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/profiles')}>
                    Back to Profiles
                </Button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Login Required</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    You must be logged in to book {getDisplayName()}.
                </p>
                <Button variant="primary" onClick={() => navigate('/login')}>Login to Continue</Button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px' }}>
            <button
                className="btn"
                style={{ marginBottom: '1.5rem', padding: '0', color: 'var(--text-secondary)' }}
                onClick={() => navigate('/profiles')}
            >
                &larr; Back to Profiles
            </button>

            <Card>
                <CardHeader>
                    <h1 style={{ fontSize: '1.5rem' }}>Rent Request: {getDisplayName()}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {profile.rank} Rank • ₱{parseFloat(profile.hourly_rate).toLocaleString()}/hr
                    </p>
                </CardHeader>

                <CardBody>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Input
                                type="number"
                                label="Duration (Hours)"
                                value={hours}
                                onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                max="24"
                                required
                            />
                        </div>

                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <div className="flex-between" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <span>Rate</span>
                                <span>₱{parseFloat(profile.hourly_rate).toLocaleString()} × {hours} hr(s)</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>
                            <div className="flex-between" style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                                <span>Total Cost</span>
                                <span style={{ color: 'var(--accent-primary)' }}>₱{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" style={{ width: '100%' }}>
                            Confirm Request
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};
