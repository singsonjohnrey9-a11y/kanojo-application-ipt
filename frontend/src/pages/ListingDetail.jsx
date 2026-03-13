import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../api/config';
import { AuthContext } from '../context/AuthContext';
import {
    MapPin, Bed, Bath, Users, Home, Building, Building2, DoorOpen,
    Star, ArrowLeft, MessageCircle, Calendar, CheckCircle, Maximize,
    Shirt, Send, Wifi, Car, Shield, Waves, Dumbbell, Wind, ChefHat
} from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiZHVtbXkifQ.dummy';

const PROPERTY_COLORS = {
    HOUSE: '#2563eb',
    APARTMENT: '#7c3aed',
    CONDO: '#0891b2',
    BOARDING_HOUSE: '#ea580c',
    ROOM: '#16a34a',
};

const PROPERTY_ICONS = {
    HOUSE: Home, APARTMENT: Building, CONDO: Building2, BOARDING_HOUSE: Building, ROOM: DoorOpen,
};

const AMENITY_ICONS = {
    'WiFi': Wifi, 'Parking': Car, 'Security': Shield, 'Pool': Waves,
    'Gym': Dumbbell, 'Aircon': Wind, 'Kitchen': ChefHat, 'Laundry': Shirt,
};

const fixImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const mapContainerRef = useRef(null);

    const [listing, setListing] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingMsg, setBookingMsg] = useState('');
    const [bookingMoveIn, setBookingMoveIn] = useState('');
    const [bookingOccupants, setBookingOccupants] = useState(1);
    const [bookingSent, setBookingSent] = useState(false);
    const [bookingError, setBookingError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listingRes, reviewsRes] = await Promise.all([
                    api.get(`/api/listings/${id}/`),
                    api.get(`/api/listings/${id}/reviews/`).catch(() => ({ data: [] })),
                ]);
                setListing(listingRes.data);
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Mini map
    useEffect(() => {
        if (!listing || !mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [listing.longitude, listing.latitude],
            zoom: 15,
            interactive: true,
            attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

        new mapboxgl.Marker({ color: PROPERTY_COLORS[listing.property_type] || '#1a1a1a' })
            .setLngLat([listing.longitude, listing.latitude])
            .addTo(map);

        return () => map.remove();
    }, [listing]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingError('');
        try {
            await api.post('/api/bookings/', {
                listing: listing.id,
                message: bookingMsg,
                move_in_date: bookingDate || null,
                occupants: bookingOccupants,
            });
            setBookingSent(true);
        } catch (err) {
            setBookingError(err.response?.data?.detail || 'Failed to send inquiry.');
        }
    };

    const handleStartConversation = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const res = await api.post('/api/conversations/start/', { user_id: listing.user.id, listing_id: listing.id });
            navigate(`/inbox?conversation=${res.data.id}`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReviewSubmit = async () => {
        if (!newReviewText.trim() || newReviewRating < 1 || newReviewRating > 5) return;
        setSubmittingReview(true);
        try {
            const res = await api.post(`/api/listings/${id}/reviews/create/`, {
                rating: newReviewRating,
                comment: newReviewText,
            });
            // Update local state to show the new review instantly
            setReviews([res.data, ...reviews]);
            setNewReviewText('');
            setNewReviewRating(5);
        } catch (err) {
            console.error("Failed to submit review", err);
            alert(err.response?.data?.detail || "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{
                    width: 32, height: 32,
                    border: '3px solid var(--border-color)',
                    borderTopColor: '#1a1a1a', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                }} />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
                <h2>Listing not found</h2>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Home</Link>
            </div>
        );
    }

    const TypeIcon = PROPERTY_ICONS[listing.property_type] || Home;
    const typeColor = PROPERTY_COLORS[listing.property_type] || '#1a1a1a';
    const amenities = listing.amenities ? listing.amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
    const imgUrl = fixImageUrl(listing.image);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem' }}>
            {/* Back button */}
            <button onClick={() => navigate(-1)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.85rem', color: 'var(--text-secondary)',
                marginBottom: '1rem', padding: '0.4rem 0',
                background: 'none', border: 'none', cursor: 'pointer',
            }}>
                <ArrowLeft size={16} /> Back to listings
            </button>

            {/* Header Image / Placeholder */}
            <div style={{
                width: '100%', height: 320, borderRadius: 16, overflow: 'hidden',
                background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}11)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', position: 'relative',
            }}>
                {imgUrl ? (
                    <img src={imgUrl} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <TypeIcon size={80} style={{ color: typeColor, opacity: 0.2 }} />
                )}
                {/* Property type badge */}
                <div style={{
                    position: 'absolute', top: 16, left: 16,
                    background: typeColor, color: 'white',
                    padding: '6px 14px', borderRadius: 8,
                    fontSize: '0.75rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                    <TypeIcon size={14} />
                    {listing.property_type.replace('_', ' ')}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
                {/* Left column — details */}
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6, lineHeight: 1.2 }}>
                        {listing.title}
                    </h1>

                    <div style={{
                        fontSize: '0.85rem', color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: 4, marginBottom: '1rem',
                    }}>
                        <MapPin size={14} />
                        {listing.address}
                    </div>

                    {/* Price + specs strip */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '2rem',
                        padding: '1rem 0', borderTop: '1px solid var(--border-color)',
                        borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem',
                    }}>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: typeColor }}>
                                ₱{parseFloat(listing.monthly_rent).toLocaleString()}
                                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            {[
                                { icon: Bed, val: listing.bedrooms, label: 'Beds' },
                                { icon: Bath, val: listing.bathrooms, label: 'Baths' },
                                { icon: Maximize, val: `${listing.area_sqm}m²`, label: 'Area' },
                                { icon: Users, val: listing.max_occupants, label: 'Max' },
                            ].map(s => (
                                <div key={s.label} style={{ textAlign: 'center' }}>
                                    <s.icon size={18} style={{ color: 'var(--text-muted)', marginBottom: 2 }} />
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.val}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>About this property</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        {listing.description}
                    </p>

                    {/* Amenities */}
                    {amenities.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Amenities</h3>
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.5rem', marginBottom: '1.5rem',
                            }}>
                                {amenities.map(a => {
                                    const Icon = AMENITY_ICONS[a] || CheckCircle;
                                    return (
                                        <div key={a} style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            fontSize: '0.82rem', color: 'var(--text-secondary)',
                                            padding: '6px 0',
                                        }}>
                                            <Icon size={16} style={{ color: typeColor, flexShrink: 0 }} />
                                            {a}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Location Map */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Location</h3>
                    <div ref={mapContainerRef} style={{
                        width: '100%', height: 250, borderRadius: 12,
                        border: '1px solid var(--border-color)', marginBottom: '1.5rem',
                    }} />

                    {/* Reviews */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        Reviews {listing.review_count > 0 && `(${listing.review_count})`}
                    </h3>
                    {reviews.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            No reviews yet. Be the first to review this property!
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {reviews.map(r => (
                                <div key={r.id} style={{
                                    padding: '0.75rem', borderRadius: 8,
                                    border: '1px solid var(--border-color)', background: 'var(--bg-muted)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.reviewer.first_name}</span>
                                        <div style={{ display: 'flex', gap: 1 }}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} size={12} fill={i < r.rating ? '#f59e0b' : 'none'} color={i < r.rating ? '#f59e0b' : '#ddd'} />
                                            ))}
                                        </div>
                                    </div>
                                    {r.comment && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.comment}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Review Form */}
                    {user && !user.is_landlord && (
                        <div style={{
                            background: '#f8fafc', padding: '1.25rem', borderRadius: 12,
                            border: '1px solid #e2e8f0', marginTop: '1rem',
                        }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1a1a1a' }}>Write a Review</h4>
                            <div style={{ display: 'flex', gap: 4, marginBottom: '0.75rem' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        size={20}
                                        fill={star <= newReviewRating ? '#f59e0b' : 'none'}
                                        color={star <= newReviewRating ? '#f59e0b' : '#cbd5e1'}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setNewReviewRating(star)}
                                    />
                                ))}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="Share your experience with this property..."
                                    value={newReviewText}
                                    onChange={e => setNewReviewText(e.target.value)}
                                    style={{ paddingRight: '3rem', resize: 'vertical' }}
                                />
                                <button
                                    onClick={handleReviewSubmit}
                                    disabled={submittingReview || !newReviewText.trim()}
                                    className="btn btn-primary"
                                    style={{
                                        position: 'absolute', bottom: 8, right: 8, padding: '0.4rem',
                                        opacity: (!newReviewText.trim() || submittingReview) ? 0.5 : 1,
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column — booking card */}
                <div>
                    <div style={{
                        position: 'sticky', top: 80,
                        background: 'white', borderRadius: 16,
                        border: '1px solid var(--border-color)',
                        padding: '1.5rem', boxShadow: 'var(--shadow-md)',
                    }}>
                        {bookingSent ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Inquiry Sent!</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    The landlord will review your request. You can also message them directly.
                                </p>
                                <button onClick={handleStartConversation} className="btn btn-primary" style={{ width: '100%' }}>
                                    <MessageCircle size={16} /> Message Landlord
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                                    Interested in this property?
                                </h3>

                                {/* Enhanced Landlord Profile Card */}
                                <div style={{
                                    background: '#f8fafc', padding: '1.25rem', borderRadius: 12,
                                    border: '1px solid #e2e8f0', marginBottom: '1.5rem',
                                    display: 'flex', flexDirection: 'column', gap: '1rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${typeColor}, #1a1a1a)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '1.2rem', fontWeight: 800,
                                        }}>
                                            {listing.user.first_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '1.1rem' }}>
                                                {listing.user.first_name} {listing.user.last_name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Property Owner
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleStartConversation}
                                        className="btn btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.75rem' }}
                                    >
                                        <MessageCircle size={18} /> Message Landlord
                                    </button>

                                    {/* Quick Inquiry Templates */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Quick Inquiries:</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {["Is this still available?", "Can I schedule a viewing?", "Are pets allowed?"].map(template => (
                                                <button
                                                    key={template}
                                                    onClick={() => {
                                                        // Pre-fill the specific chat box message (simulated for now, passing state via navigation later)
                                                        navigate('/inbox', { state: { prefillMsg: template, landlordId: listing.user.id, listingId: listing.id } });
                                                    }}
                                                    style={{
                                                        padding: '4px 10px', background: 'white', border: '1px solid #cbd5e1',
                                                        borderRadius: 16, fontSize: '0.75rem', color: '#334155', cursor: 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                                >
                                                    {template}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#1a1a1a' }}>Send a Formal Booking Request</h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                                                    Expected Move-in
                                                </label>
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={bookingMoveIn}
                                                    onChange={e => setBookingMoveIn(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                                                    Occupants
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    value={bookingOccupants}
                                                    onChange={e => setBookingOccupants(parseInt(e.target.value) || 1)}
                                                    min={1}
                                                    max={listing.max_occupants}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                                                Message to Landlord
                                            </label>
                                            <textarea
                                                className="input"
                                                rows={3}
                                                placeholder="Tell the landlord about yourself..."
                                                value={bookingMsg}
                                                onChange={e => setBookingMsg(e.target.value)}
                                                style={{ resize: 'vertical' }}
                                            />
                                        </div>
                                    </div>

                                    {bookingError && (
                                        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{bookingError}</p>
                                    )}

                                    <button
                                        onClick={handleBooking}
                                        className="btn btn-secondary"
                                        style={{ width: '100%', marginTop: '1rem', padding: '0.6rem' }}
                                    >
                                        Apply for Rental
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
