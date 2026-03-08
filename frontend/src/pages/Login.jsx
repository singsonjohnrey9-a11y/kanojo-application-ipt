import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Gift, AlertCircle, Sparkles, Lock, User, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await loginUser(username, password);
        if (!success) {
            setError('Invalid username or password.');
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: '380px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                    }}>
                        <Gift size={24} color="var(--accent-primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Login to view schedules and chat!
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2', color: 'var(--danger)',
                        padding: '0.625rem', borderRadius: 'var(--border-radius-sm)',
                        marginBottom: '1.25rem', fontSize: '0.82rem', textAlign: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}>
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <User size={14} /> Username
                        </label>
                        <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter your username" />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <Lock size={14} /> Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '0.75rem', top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-muted)', padding: '0.25rem',
                                    display: 'flex', alignItems: 'center',
                                }}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
                        {loading ? <><div className="spinner" /> Logging in...</> : <><Sparkles size={16} /> Login</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};
