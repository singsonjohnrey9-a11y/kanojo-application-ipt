import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, EyeOff, Star, Lock, Mail, Sparkles } from 'lucide-react';

export const Register = () => {
    const [formData, setFormData] = useState({
        username: '', password: '', email: '',
        first_name: '', last_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { registerUser } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await registerUser(formData);
        if (!success) {
            setError('Error creating account. That username might be taken!');
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                    }}>
                        <Heart size={24} color="var(--accent-primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Join RentCebu</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Create an account to start booking dates!
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2', color: 'var(--danger)',
                        padding: '0.625rem', borderRadius: 'var(--border-radius-sm)',
                        marginBottom: '1.25rem', fontSize: '0.82rem', textAlign: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}>
                        <EyeOff size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <Star size={14} color="var(--accent-primary)" /> Username
                        </label>
                        <input type="text" name="username" className="input-field" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <Lock size={14} /> Password
                        </label>
                        <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <Mail size={14} /> Email
                        </label>
                        <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>First Name</label>
                            <input type="text" name="first_name" className="input-field" value={formData.first_name} onChange={handleChange} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Last Name</label>
                            <input type="text" name="last_name" className="input-field" value={formData.last_name} onChange={handleChange} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
                        {loading ? <><div className="spinner" /> Creating...</> : <><Sparkles size={16} /> Create Account</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};
