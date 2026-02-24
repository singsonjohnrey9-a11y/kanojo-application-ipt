import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Gift, Frown, Sparkles, Lock, User } from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await loginUser(username, password);
        if (!success) {
            setError(<>Invalid username or password. Please try again. <Frown size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></>);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Welcome Back <Gift size={28} />
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Login to view cast schedules and secret chats!
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            Username <User size={16} color="var(--accent-primary)" />
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            Password <Lock size={16} />
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        Login <Sparkles size={18} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};
