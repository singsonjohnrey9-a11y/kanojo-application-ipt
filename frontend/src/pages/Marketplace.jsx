import React, { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../api/config';
import { MapPin, Bed, Bath, Users, Home, Building, Building2, DoorOpen, Search, SlidersHorizontal, X, Star, ChevronRight, ChevronLeft, Info, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mapbox public token — replace with your own
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiZHVtbXkifQ.dummy';

const CEBU_CENTER = [123.8854, 10.3157]; // [lng, lat]

const PROPERTY_ICONS = {
    HOUSE: Home,
    APARTMENT: Building,
    CONDO: Building2,
    BOARDING_HOUSE: Building,
    ROOM: DoorOpen,
};

const PROPERTY_COLORS = {
    HOUSE: '#2563eb',
    APARTMENT: '#7c3aed',
    CONDO: '#0891b2',
    BOARDING_HOUSE: '#ea580c',
    ROOM: '#16a34a',
};

const formatPrice = (price) => {
    const num = parseFloat(price);
    if (num >= 1000) return `₱${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    return `₱${num.toLocaleString()}`;
};

const fixImageUrl = (url) => {
    if (!url) return null;

    // If Django prepended /media/ to an absolute URL, strip it
    if (url.includes('/media/http')) {
        return url.split('/media/')[1].replace('https%3A/', 'https://').replace('http%3A/', 'http://');
    }

    // If it's already a clean absolute URL, return it
    if (url.startsWith('http')) return url;

    // Otherwise, prepend the API URL for local dev images
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const Marketplace = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const popupRef = useRef(null);

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [bedrooms, setBedrooms] = useState(0);
    const [hasAmenity, setHasAmenity] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);

    // UX states
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedListingDetail, setSelectedListingDetail] = useState(null);

    // Force Mapbox to redraw its canvas if window resizes
    useEffect(() => {
        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, searchQuery, priceRange, bedrooms, hasAmenity]);

    // Fetch listings
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get('/api/listings/');
                setListings(res.data || []);
            } catch (err) {
                console.error('Failed to fetch listings:', err);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Initialize map
    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: CEBU_CENTER,
            zoom: 12,
            attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }));

        map.on('load', () => setMapLoaded(true));
        map.on('error', (e) => console.error('Mapbox error:', e));

        mapRef.current = map;

        // Force body scroll lock on the map page
        document.body.style.overflow = 'hidden';

        return () => {
            map.remove();
            mapRef.current = null;
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Update markers when listings or filter changes
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const filtered = getFilteredListings();

        filtered.forEach(listing => {
            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'ubecahan-marker';
            el.style.cssText = `
        width: 36px; height: 36px;
        background: ${PROPERTY_COLORS[listing.property_type] || '#1a1a1a'};
        border-radius: 50% 50% 50% 4px;
        transform: rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      `;

            const inner = document.createElement('div');
            inner.style.cssText = `
        transform: rotate(45deg);
        color: white; font-size: 14px; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
      `;
            const pType = listing.property_type || 'PROPERTY';
            inner.textContent = pType.charAt(0);
            el.appendChild(inner);

            // Highlight selected
            if (listing.id === selectedId) {
                el.style.transform = 'rotate(-45deg) scale(1.3)';
                el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
                el.style.zIndex = '10';
            }

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([listing.longitude, listing.latitude])
                .addTo(mapRef.current);

            // Popup
            el.addEventListener('click', () => {
                setSelectedId(listing.id);

                // Auto-paginate to show this listing in the right panel
                const idx = filtered.findIndex(l => l.id === listing.id);
                if (idx !== -1) {
                    const targetPage = Math.floor(idx / 12) + 1; // Assuming ITEMS_PER_PAGE is 12
                    setCurrentPage(targetPage);
                }

                if (popupRef.current) popupRef.current.remove();

                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    maxWidth: '260px',
                }).setHTML(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #1a1a1a;">${listing.title}</div>
            <div style="font-size: 18px; font-weight: 800; color: ${PROPERTY_COLORS[listing.property_type]}; margin-bottom: 6px;">
              ₱${parseFloat(listing.monthly_rent).toLocaleString()}<span style="font-size: 11px; font-weight: 400; color: #888;">/mo</span>
            </div>
            <div style="display: flex; gap: 10px; font-size: 11px; color: #666; margin-bottom: 8px;">
              <span>${listing.bedrooms} BR</span>
              <span>${listing.bathrooms} BA</span>
              <span>${listing.max_occupants} Max</span>
            </div>
            <a href="/listing/${listing.id}" style="
              display: block; text-align: center; padding: 6px;
              background: #1a1a1a; color: white; border-radius: 6px;
              font-size: 12px; font-weight: 600; text-decoration: none;
            ">View Details →</a>
          </div>
        `);

                popup.setLngLat([listing.longitude, listing.latitude]).addTo(mapRef.current);
                popupRef.current = popup;
            });

            markersRef.current.push(marker);
        });
    }, [listings, filterType, searchQuery, selectedId, priceRange, mapLoaded]);

    // Fly to listing
    const flyToListing = useCallback((listing) => {
        if (!mapRef.current) return;
        setSelectedId(listing.id);
        mapRef.current.flyTo({
            center: [listing.longitude, listing.latitude],
            zoom: 15,
            duration: 1200,
            essential: true,
        });
    }, []);

    // Filtered listings and Pagination
    const getFilteredListings = useCallback(() => {
        return listings.filter(l => {
            if (filterType !== 'ALL' && l.property_type !== filterType) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!l.title.toLowerCase().includes(q) &&
                    !l.address.toLowerCase().includes(q) &&
                    !l.location.toLowerCase().includes(q)) return false;
            }
            const rent = parseFloat(l.monthly_rent);
            if (rent < priceRange[0] || rent > priceRange[1]) return false;
            if (bedrooms > 0 && l.bedrooms < bedrooms) return false;
            if (hasAmenity && !l.amenities.toLowerCase().includes(hasAmenity.toLowerCase())) return false;
            return true;
        });
    }, [listings, filterType, searchQuery, priceRange, bedrooms, hasAmenity]);

    const filtered = getFilteredListings();
    const ITEMS_PER_PAGE = 12;
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const paginatedListings = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* ── Map Panel ── */}
            <div style={{ flex: '0 0 38%', position: 'relative' }} className="marketplace-map-panel">
                <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

                {/* Map overlay: result count */}
                <div style={{
                    position: 'absolute', top: 16, left: 16,
                    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                    padding: '8px 16px', borderRadius: 999,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    fontSize: '0.8rem', fontWeight: 700, color: '#1a1a1a',
                    zIndex: 5,
                }}>
                    <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} in Cebu
                </div>
            </div>

            {/* ── Listings Panel ── */}
            <div style={{
                flex: '0 0 62%', display: 'flex', flexDirection: 'column',
                borderLeft: '1px solid var(--border-color)', background: 'var(--bg-primary)',
                overflow: 'hidden',
            }} className="marketplace-listings-panel">

                {/* Search & Filter Bar */}
                <div style={{
                    padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)',
                    background: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    flexShrink: 0,
                }}>
                    {/* Search & Filter Toggle */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={16} style={{
                                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                            }} />
                            <input
                                type="text"
                                className="input"
                                placeholder="Search by title, address, or area..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: 36, fontSize: '0.85rem' }}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: showFilters ? 'var(--accent-primary)' : 'white',
                                color: showFilters ? 'white' : 'var(--text-primary)',
                                border: `1px solid ${showFilters ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <SlidersHorizontal size={16} /> Filters
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div style={{
                            padding: '1rem', background: 'var(--bg-secondary)',
                            borderRadius: '8px', border: '1px solid var(--border-color)',
                            display: 'flex', flexDirection: 'column', gap: '1rem',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                {/* Price Range */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₱</span>
                                            <input type="number" value={priceRange[0]} onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} style={{ width: '90px', padding: '0.4rem 0.4rem 0.4rem 20px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem' }} />
                                        </div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₱</span>
                                            <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])} style={{ width: '90px', padding: '0.4rem 0.4rem 0.4rem 20px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bedrooms */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bedrooms</label>
                                    <select value={bedrooms} onChange={e => setBedrooms(parseInt(e.target.value))} style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'white', minWidth: '100px' }}>
                                        <option value={0}>Any</option>
                                        <option value={1}>1+ Bed</option>
                                        <option value={2}>2+ Beds</option>
                                        <option value={3}>3+ Beds</option>
                                        <option value={4}>4+ Beds</option>
                                    </select>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Must Have</label>
                                    <select value={hasAmenity} onChange={e => setHasAmenity(e.target.value)} style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'white', minWidth: '120px' }}>
                                        <option value="">Any Amenity</option>
                                        <option value="wifi">WiFi</option>
                                        <option value="aircon">Air Conditioning</option>
                                        <option value="parking">Parking</option>
                                        <option value="kitchen">Kitchen</option>
                                        <option value="pool">Pool</option>
                                        <option value="gym">Gym</option>
                                        <option value="security">Security</option>
                                        <option value="pets">Pets Allowed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters & Pagination Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        {/* Property Type Filters */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {[
                                { key: 'ALL', label: 'All' },
                                { key: 'HOUSE', label: 'House' },
                                { key: 'APARTMENT', label: 'Apt' },
                                { key: 'CONDO', label: 'Condo' },
                                { key: 'BOARDING_HOUSE', label: 'Boarding' },
                                { key: 'ROOM', label: 'Room' },
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilterType(f.key)}
                                    style={{
                                        padding: '0.35rem 0.75rem', borderRadius: 999,
                                        fontSize: '0.75rem', fontWeight: 600,
                                        background: filterType === f.key ? '#1a1a1a' : 'var(--bg-muted)',
                                        color: filterType === f.key ? 'white' : 'var(--text-secondary)',
                                        border: filterType === f.key ? 'none' : '1px solid var(--border-color)',
                                        cursor: 'pointer', transition: 'all 0.15s ease',
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Top Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    Pg {currentPage} of {totalPages}
                                </span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        style={{
                                            padding: '0.35rem', borderRadius: 6, border: '1px solid var(--border-color)',
                                            background: currentPage === 1 ? 'var(--bg-muted)' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        style={{
                                            padding: '0.35rem', borderRadius: 6, border: '1px solid var(--border-color)',
                                            background: currentPage === totalPages ? 'var(--bg-muted)' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Listings Grid */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '1rem 1.25rem',
                    minHeight: 0, /* Enables scrolling by allowing flex child to shrink */
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gridAutoRows: 'max-content',
                    gap: '1rem',
                }}>
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="skeleton-card" style={{ borderRadius: 12 }}>
                                <div className="skeleton skeleton-img" style={{ height: 120 }} />
                                <div className="skeleton skeleton-text" style={{ margin: '0.75rem 1rem' }} />
                                <div className="skeleton skeleton-text short" style={{ margin: '0 1rem 0.75rem' }} />
                            </div>
                        ))
                    ) : paginatedListings.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '3rem 1rem', gridColumn: '1 / -1',
                            color: 'var(--text-muted)',
                        }}>
                            <Home size={48} style={{ marginBottom: '1rem', opacity: 0.3, margin: '0 auto' }} />
                            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>No properties found</p>
                            <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        paginatedListings.map((listing, idx) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                isSelected={listing.id === selectedId}
                                onSelect={() => flyToListing(listing)}
                                onShowDetails={() => setSelectedListingDetail(listing)}
                                delay={idx * 0.05}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── Listing Details Modal ── */}
            {selectedListingDetail && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }} onClick={() => setSelectedListingDetail(null)}>
                    <div style={{
                        background: 'white', borderRadius: 16, width: '100%', maxWidth: 650, maxHeight: '90vh',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        animation: 'fadeInUp 0.3s ease forwards'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Header Image & Close */}
                        <div style={{ height: 200, position: 'relative', background: '#3b82f6' }}>
                            <img src={fixImageUrl(selectedListingDetail.image) || 'https://via.placeholder.com/600x300'}
                                alt={selectedListingDetail.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => setSelectedListingDetail(null)} style={{
                                position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: 'white',
                                border: 'none', borderRadius: '50%', padding: 6, cursor: 'pointer', display: 'flex'
                            }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
                                        {selectedListingDetail.property_type.replace('_', ' ')}
                                    </div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>{selectedListingDetail.title}</h2>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <MapPin size={14} /> {selectedListingDetail.address}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                                        ₱{parseFloat(selectedListingDetail.monthly_rent).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per month</div>
                                </div>
                            </div>

                            {/* Key Features */}
                            <div style={{ display: 'flex', gap: 16, padding: '1rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#444' }}><Bed size={16} /> <b>{selectedListingDetail.bedrooms}</b> Beds</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#444' }}><Bath size={16} /> <b>{selectedListingDetail.bathrooms}</b> Baths</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#444' }}><Users size={16} /> <b>{selectedListingDetail.max_occupants}</b> Max</div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Info size={16} /> About this space</h3>
                                <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                                    {selectedListingDetail.description || 'No detailed description provided.'}
                                </p>
                            </div>

                            {/* House Rules */}
                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} /> House Rules & Restrictions</h3>
                                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' }}>
                                    {selectedListingDetail.house_rules ? (
                                        <ul style={{ paddingLeft: 20, margin: 0 }}>
                                            {selectedListingDetail.house_rules.split('.').map((rule, i) => rule.trim() && <li key={i}>{rule.trim()}.</li>)}
                                        </ul>
                                    ) : (
                                        <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.7 }}>No specific house rules mentioned by the landlord.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1rem 2rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#fafafa' }}>
                            <button onClick={() => setSelectedListingDetail(null)} className="btn btn-secondary">Close</button>
                            <Link to={`/listing/${selectedListingDetail.id}`} className="btn btn-primary">Full Details & Contact</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ──── Listing Card Component ──── */
const ListingCard = ({ listing, isSelected, onSelect, onShowDetails, delay }) => {
    const TypeIcon = PROPERTY_ICONS[listing.property_type] || Home;
    const typeColor = PROPERTY_COLORS[listing.property_type] || '#1a1a1a';
    const imgUrl = fixImageUrl(listing.image);

    return (
        <div
            className="animate-fade-in-up"
            onClick={onSelect}
            style={{
                display: 'flex', flexDirection: 'column', gap: '0.85rem',
                padding: '0.85rem',
                borderRadius: 12,
                background: isSelected ? '#f0f7ff' : 'white',
                border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animationDelay: `${delay}s`,
                boxShadow: isSelected ? '0 4px 16px rgba(37,99,235,0.15)' : 'var(--shadow-sm)',
            }}
            onMouseEnter={e => {
                if (!isSelected) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={e => {
                if (!isSelected) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
        >
            {/* Thumbnail */}
            <div style={{
                width: '100%', height: 160,
                borderRadius: 8, overflow: 'hidden',
                background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}11)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
            }}>
                {imgUrl ? (
                    <img src={imgUrl} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <TypeIcon size={32} style={{ color: typeColor, opacity: 0.4 }} />
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    {/* Type tag */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: `${typeColor}15`, color: typeColor,
                        padding: '2px 8px', borderRadius: 4,
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.3px',
                        marginBottom: 4, textTransform: 'uppercase',
                    }}>
                        <TypeIcon size={10} />
                        {listing.property_type.replace('_', ' ')}
                    </div>

                    {/* Title */}
                    <h4 style={{
                        fontSize: '0.88rem', fontWeight: 700, color: '#1a1a1a',
                        marginBottom: 3, lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {listing.title || 'Untitled Property'}
                    </h4>

                    {/* Location */}
                    <div style={{
                        fontSize: '0.72rem', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        <MapPin size={10} style={{ flexShrink: 0 }} />
                        {listing.location || 'Cebu City'}
                    </div>
                </div>

                {/* Bottom row */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 6,
                }}>
                    {/* Specs */}
                    <div style={{ display: 'flex', gap: 8, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Bed size={12} /> {listing.bedrooms || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Bath size={12} /> {listing.bathrooms || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Users size={12} /> {listing.max_occupants || 1}
                        </span>
                    </div>

                    {/* Price & Rating */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{
                            fontSize: '1rem', fontWeight: 800, color: typeColor,
                            whiteSpace: 'nowrap',
                        }}>
                            ₱{listing.monthly_rent ? parseFloat(listing.monthly_rent).toLocaleString() : '0'}
                            <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
                        </div>
                        {listing.review_count > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, marginTop: 2 }}>
                                <Star size={10} fill="#f59e0b" /> {listing.average_rating} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({listing.review_count})</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)'
            }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onShowDetails(); }}
                    style={{
                        padding: '6px 12px', background: `${typeColor}15`, color: typeColor,
                        borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                        transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 4
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${typeColor}25`}
                    onMouseLeave={e => e.currentTarget.style.background = `${typeColor}15`}
                >
                    <Info size={14} /> Quick View
                </button>

                <div style={{
                    display: 'flex', alignItems: 'center',
                    color: isSelected ? '#2563eb' : 'var(--text-muted)',
                }}>
                    <Link to={`/listing/${listing.id}`} onClick={e => e.stopPropagation()}
                        style={{ color: 'inherit', display: 'flex' }}>
                        <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
