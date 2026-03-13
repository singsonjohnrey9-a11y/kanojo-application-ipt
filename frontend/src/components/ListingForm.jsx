import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import api from '../api/config';
import { MapPin, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';

const CEBU_CENTER = [123.8854, 10.3157];

export const ListingForm = ({ initialData, isEdit }) => {
    const navigate = useNavigate();
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_type: 'HOUSE',
        monthly_rent: '',
        bedrooms: 1,
        bathrooms: 1,
        area_sqm: '',
        max_occupants: 1,
        address: '',
        location: 'Cebu City',
        latitude: CEBU_CENTER[1],
        longitude: CEBU_CENTER[0],
        amenities: '',
        house_rules: '',
        is_available: true,
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                latitude: initialData.latitude || CEBU_CENTER[1],
                longitude: initialData.longitude || CEBU_CENTER[0],
            });
            if (initialData.image) {
                const img = initialData.image.startsWith('http') ? initialData.image : `${import.meta.env.VITE_API_URL}${initialData.image}`;
                setImagePreview(img);
            }
        }
    }, [initialData]);

    // Initialize Mapbox for picking location
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const lng = formData.longitude || CEBU_CENTER[0];
        const lat = formData.latitude || CEBU_CENTER[1];

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: 14,
            attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

        // Draggable marker
        const marker = new mapboxgl.Marker({ draggable: true, color: '#2563eb' })
            .setLngLat([lng, lat])
            .addTo(map);

        marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            setFormData(prev => ({ ...prev, longitude: lngLat.lng, latitude: lngLat.lat }));
        });

        // Click map to move marker
        map.on('click', (e) => {
            marker.setLngLat(e.lngLat);
            setFormData(prev => ({ ...prev, longitude: e.lngLat.lng, latitude: e.lngLat.lat }));
        });

        mapRef.current = map;
        markerRef.current = marker;

        return () => map.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount, update marker manually if needed

    // Update marker if formData lat/lng changes externally (e.g., initialData load)
    useEffect(() => {
        if (markerRef.current && mapRef.current) {
            markerRef.current.setLngLat([formData.longitude, formData.latitude]);
            mapRef.current.flyTo({ center: [formData.longitude, formData.latitude], zoom: 14, duration: 0 });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                // Don't send image string if it's just the old url, only send if new file
                if (key !== 'image') {
                    data.append(key, formData[key]);
                }
            }
        });
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEdit) {
                await api.patch(`/api/listings/${initialData.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/api/listings/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/dashboard');
        } catch (err) {
            console.error('Save failed', err.response?.data);
            setError(err.response?.data?.detail || 'Failed to save listing. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {error && <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 8 }}>{error}</div>}

            {/* Basic Info */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Basic Details</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Listing Title</label>
                        <input type="text" name="title" className="input" value={formData.title} onChange={handleChange} required placeholder="e.g., Cozy Studio near IT Park" />
                    </div>
                    
                    <div>
                        <label className="label">Property Type</label>
                        <select name="property_type" className="input" value={formData.property_type} onChange={handleChange}>
                            <option value="HOUSE">House</option>
                            <option value="APARTMENT">Apartment</option>
                            <option value="BOARDING_HOUSE">Boarding House</option>
                            <option value="CONDO">Condo</option>
                            <option value="ROOM">Room for Rent</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Monthly Rent (₱)</label>
                        <input type="number" name="monthly_rent" className="input" value={formData.monthly_rent} onChange={handleChange} required min="0" />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Description</label>
                        <textarea name="description" className="input" value={formData.description} onChange={handleChange} required rows={4} />
                    </div>
                </div>
            </div>

            {/* Specifications */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Specifications</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    <div>
                        <label className="label">Bedrooms</label>
                        <input type="number" name="bedrooms" className="input" value={formData.bedrooms} onChange={handleChange} required min="0" />
                    </div>
                    <div>
                        <label className="label">Bathrooms</label>
                        <input type="number" name="bathrooms" className="input" value={formData.bathrooms} onChange={handleChange} required min="0" />
                    </div>
                    <div>
                        <label className="label">Area (sqm)</label>
                        <input type="number" name="area_sqm" className="input" value={formData.area_sqm} onChange={handleChange} required min="1" />
                    </div>
                    <div>
                        <label className="label">Max Occupants</label>
                        <input type="number" name="max_occupants" className="input" value={formData.max_occupants} onChange={handleChange} required min="1" />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <label className="label">Amenities (Comma separated)</label>
                    <input type="text" name="amenities" className="input" value={formData.amenities} onChange={handleChange} placeholder="WiFi, Aircon, Parking, Pool" />
                </div>
                
                <div style={{ marginTop: '1.5rem' }}>
                    <label className="label">House Rules</label>
                    <textarea name="house_rules" className="input" value={formData.house_rules} onChange={handleChange} rows={3} placeholder="No pets, No visitors after 10PM..." />
                </div>
            </div>

            {/* Location */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Location</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label className="label">Street Address</label>
                        <input type="text" name="address" className="input" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="label">Area / Neighborhood</label>
                        <input type="text" name="location" className="input" value={formData.location} onChange={handleChange} required placeholder="e.g., Lahug, Cebu City" />
                    </div>
                </div>

                <label className="label"><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }}/> Pinpoint on Map</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Drag the marker or click on the map to set the exact property coordinates.</p>
                <div ref={mapContainerRef} style={{ width: '100%', height: 350, borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }} />
                
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div><strong>Lat:</strong> {formData.latitude.toFixed(6)}</div>
                    <div><strong>Lng:</strong> {formData.longitude.toFixed(6)}</div>
                </div>
            </div>

            {/* Image */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Featured Image</h3>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <label className="label">Upload Property Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="input" style={{ padding: '0.5rem' }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            A high-quality image increases your chances of getting inquiries.
                        </p>
                    </div>
                    
                    <div style={{ width: 200, height: 150, borderRadius: 8, border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f8fafc' }}>
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                <ImageIcon size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                                <div style={{ fontSize: '0.75rem' }}>No image chosen</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Visibility & Actions */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} style={{ width: 18, height: 18 }} />
                    Listing is currently available (visible to renters)
                </label>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {loading ? 'Saving...' : <><Save size={16}/> {isEdit ? 'Update Property' : 'List Property'}</>}
                    </button>
                </div>
            </div>
            
            <div style={{ paddingBottom: '4rem' }} />
        </form>
    );
};
