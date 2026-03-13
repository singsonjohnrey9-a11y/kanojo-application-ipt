import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ListingForm } from '../components/ListingForm';
import api from '../api/config';
import { ArrowLeft } from 'lucide-react';

export const EditListing = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [listingData, setListingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchListing = async () => {
            try {
                const res = await api.get(`/api/listings/${id}/`);
                // Ensure only the owner can edit
                if (res.data.user.id !== user.id) {
                    setError('You do not have permission to edit this listing.');
                } else {
                    setListingData(res.data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load listing details.');
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, user, navigate]);

    if (!user) return null;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
            <button 
                onClick={() => navigate('/dashboard')} 
                className="btn btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '2rem', padding: '0.5rem 1rem' }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Edit Property</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Update your listings details, price, or availability.</p>
            </div>
            
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>Loading property details...</div>
            ) : error ? (
                <div style={{ padding: '2rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 12 }}>{error}</div>
            ) : (
                <ListingForm initialData={listingData} isEdit={true} />
            )}
        </div>
    );
};
