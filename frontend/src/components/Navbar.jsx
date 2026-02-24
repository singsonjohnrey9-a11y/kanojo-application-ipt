import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Gift, Heart, MessageCircle, Sparkles } from 'lucide-react';

export const Navbar = () => {
    const { user, logoutUser } = useContext(AuthContext);

    return (
        <nav className="glass-panel" style={{ padding: '0.75rem 0' }}>
            <div className="container flex-between">
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Gift color="var(--accent-primary)" size={24} /> RentCebu
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/profiles" style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Cast List <Heart size={16} /></Link>
                    <Link to="/chat" style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Secret Chat <MessageCircle size={16} /></Link>

                    <div style={{ width: '2px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>

                    {user ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Hi, {user.username || 'User'} <Sparkles size={16} color="var(--accent-primary)" /></span>
                            <button className="btn btn-secondary" onClick={logoutUser}>Logout</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link to="/login" style={{ padding: '0.5rem 1rem', fontWeight: '700', color: 'var(--accent-primary)' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
