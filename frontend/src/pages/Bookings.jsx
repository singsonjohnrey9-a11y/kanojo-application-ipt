import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import { AuthContext } from '../context/AuthContext';
import { CalendarRange, CheckCircle2, XCircle, Clock, Home, Building2, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const Bookings = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/bookings/');
            // Sort by most recent first
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setBookings(sorted);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        try {
            await api.post(`/api/bookings/${id}/${action}/`);
            // Update local state without refetching to be fast
            setBookings(bookings.map(b => {
                if (b.id === id) {
                    return { ...b, status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' };
                }
                return b;
            }));
        } catch (err) {
            console.error(`Failed to ${action} booking`, err);
            alert(`Failed to ${action}. Only owners can do this.`);
        }
    };

    // Separate into incoming (I am landlord) and outgoing (I am tenant)
    const incomingBookings = bookings.filter(b => b.listing_info.landlord_id === user?.user_id);
    const outgoingBookings = bookings.filter(b => b.tenant === user?.user_id);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Pending</span>;
            case 'ACCEPTED': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Accepted</span>;
            case 'DECLINED': return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> Declined</span>;
            default: return <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>{status}</span>;
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading bookings...</div>;

    const displayList = filter === 'ALL' ? bookings : filter === 'INCOMING' ? incomingBookings : outgoingBookings;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Bookings & Inquiries</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track your rental applications and manage incoming tenant requests.</p>
                </div>

                <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button onClick={() => setFilter('ALL')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === 'ALL' ? 'white' : 'transparent', color: filter === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: filter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>All ({bookings.length})</button>
                    {user?.is_landlord && (
                        <button onClick={() => setFilter('INCOMING')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === 'INCOMING' ? 'white' : 'transparent', color: filter === 'INCOMING' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: filter === 'INCOMING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Incoming Requests ({incomingBookings.length})</button>
                    )}
                    <button onClick={() => setFilter('OUTGOING')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === 'OUTGOING' ? 'white' : 'transparent', color: filter === 'OUTGOING' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: filter === 'OUTGOING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>My Applications ({outgoingBookings.length})</button>
                </div>
            </div>

            {displayList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-muted)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <CalendarRange size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No bookings found</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {filter === 'INCOMING' ? "You don't have any rental requests for your properties yet." : "You haven't sent any property inquiries yet."}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {displayList.map(b => {
                        const isIncoming = b.listing_info.landlord_id === user?.user_id;

                        return (
                            <div key={b.id} style={{
                                border: '1px solid var(--border-color)', borderRadius: '12px', background: 'white',
                                display: 'flex', flexDirection: 'column', overflow: 'hidden'
                            }}>
                                {/* Header / Listing Info */}
                                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/listing/${b.listing_info.id}`)}>
                                    {b.listing_info.image ? (
                                        <img src={b.listing_info.image.startsWith('/') ? API_BASE + b.listing_info.image : b.listing_info.image} alt="Property" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 80, height: 80, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Building2 color="var(--text-muted)" />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: 2 }}>
                                                    {isIncoming ? 'Incoming Request' : 'My Application'}
                                                </div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{b.listing_info.title}</h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{b.listing_info.location}</p>
                                            </div>
                                            {getStatusBadge(b.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Body / Request Details */}
                                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)' }}>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        {/* User Info */}
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{isIncoming ? 'Tenant Details' : 'Landlord Details'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                                                    {isIncoming ? (b.tenant_info?.first_name || 'T')[0].toUpperCase() : (b.listing_info.landlord_name || 'L')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{isIncoming ? `${b.tenant_info?.first_name} ${b.tenant_info?.last_name}` : b.listing_info.landlord_name}</p>
                                                    {isIncoming && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>@{b.tenant_info?.username}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Info */}
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Request Details</p>
                                            <p style={{ fontSize: '0.85rem', margin: '0 0 2px 0' }}><strong>Occupants:</strong> {b.occupants}</p>
                                            <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>Move-in:</strong> {b.move_in_date || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    {b.message && (
                                        <div style={{ padding: '1rem', background: 'white', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                            "{b.message}"
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {isIncoming && b.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button onClick={() => handleAction(b.id, 'accept')} className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                                                <CheckCircle2 size={16} /> Accept
                                            </button>
                                            <button onClick={() => handleAction(b.id, 'decline')} className="btn btn-danger" style={{ flex: 1, padding: '0.6rem', background: 'white', color: '#ef4444', border: '1px solid #fca5a5', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                                                <XCircle size={16} /> Decline
                                            </button>
                                        </div>
                                    )}
                                    {isIncoming && b.status === 'ACCEPTED' && (
                                        <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, background: '#dcfce7', padding: '0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle2 size={16} /> You have accepted this request. Please contact the tenant to arrange signing and payment.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
