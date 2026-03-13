import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/config';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit3, Trash2, Home, CalendarRange } from 'lucide-react';

export const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyListings();
    }, [user]);

    const fetchMyListings = async () => {
        try {
            const res = await api.get(`/api/listings/?user_id=${user.id}`);
            setListings(res.data || []);
        } catch (err) {
            console.error('Failed to fetch dashboard listings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await api.delete(`/api/listings/${id}/`);
            setListings(listings.filter(l => l.id !== id));
        } catch (err) {
            console.error('Failed to delete listing', err);
            alert('Could not delete listing.');
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading dashboard...</div>;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>My Properties</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your listings and inquiries.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => navigate('/dashboard/bookings')}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <CalendarRange size={16} /> My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/create')}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <Plus size={16} /> Add New Property
                    </button>
                </div>
            </div>

            {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-muted)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <Home size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No properties yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Start by adding your first house, apartment, or boarding house to the platform.
                    </p>
                    <button onClick={() => navigate('/dashboard/create')} className="btn btn-primary">
                        Add New Property
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {listings.map(l => (
                        <div key={l.id} style={{
                            border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden',
                            display: 'flex', flexDirection: 'column', background: 'white'
                        }}>
                            <div style={{ width: '100%', height: 160, background: '#eee', position: 'relative' }}>
                                {l.image && (
                                    <img src={l.image.startsWith('http') ? l.image : `${import.meta.env.VITE_API_URL}${l.image}`}
                                        alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                                <div style={{
                                    position: 'absolute', top: 12, right: 12,
                                    background: l.is_available ? 'var(--success)' : 'var(--text-muted)',
                                    color: 'white', padding: '4px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600
                                }}>
                                    {l.is_available ? 'Active' : 'Hidden'}
                                </div>
                            </div>

                            <div style={{ padding: '1rem', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                                    {l.property_type.replace('_', ' ')}
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>{l.title}</h3>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                                    ₱{parseFloat(l.monthly_rent).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => navigate(`/dashboard/edit/${l.id}`)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.4rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: 6 }}
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(l.id)}
                                        className="btn btn-danger"
                                        style={{
                                            padding: '0.4rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: 6,
                                            background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5'
                                        }}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
