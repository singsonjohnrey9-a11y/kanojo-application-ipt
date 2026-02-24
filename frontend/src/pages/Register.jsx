import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, EyeOff, Star, Lock, Mail, Sparkles } from 'lucide-react';

export const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState('');
    const { registerUser } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await registerUser(formData);
        if (!success) {
            setError(<>Error creating account. That username might be taken! <EyeOff size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></>);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Join RentCebu <Heart size={28} />
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Create an account to start booking dates!
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>Username <Star size={16} color="var(--accent-primary)" /></label>
                        <input type="text" name="username" className="input-field" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>Password <Lock size={16} color="var(--text-secondary)" /></label>
                        <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>Email <Mail size={16} color="var(--text-secondary)" /></label>
                        <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>First Name</label>
                            <input type="text" name="first_name" className="input-field" value={formData.first_name} onChange={handleChange} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>Last Name</label>
                            <input type="text" name="last_name" className="input-field" value={formData.last_name} onChange={handleChange} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        Create Account <Sparkles size={18} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};
