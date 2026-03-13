import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ListingForm } from '../components/ListingForm';
import { ArrowLeft } from 'lucide-react';

export const CreateListing = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

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
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>List a New Property</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fill out the details below to publish a new house, apartment, or boarding house.</p>
            </div>
            
            <ListingForm isEdit={false} />
        </div>
    );
};
