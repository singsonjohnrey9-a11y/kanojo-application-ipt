import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Gift, Heart, MessageCircle, Mail, X, LogOut } from 'lucide-react';
import api from '../api/config';

export const Navbar = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close drawer on route change
    useEffect(() => { setDrawerOpen(false); }, [location]);

    // Poll unread DM count
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('access');
        const fetchUnread = () => {
            api.get('/api/messages/unread/', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setUnreadCount(res.data.unread_count || 0))
                .catch(() => { });
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/profiles', label: 'Cast List', icon: <Heart size={15} /> },
        { to: '/chat', label: 'Chat', icon: <MessageCircle size={15} /> },
        { to: '/inbox', label: 'Messages', icon: <Mail size={15} />, badge: unreadCount },
    ];

    return (
        <>
            <nav className={`glass-panel${scrolled ? ' scrolled' : ''}`} style={{ padding: '0.625rem 0' }}>
                <div className="container flex-between">
                    {/* Logo */}
                    <Link to="/" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Gift size={22} /> RentCebu
                    </Link>

                    {/* Desktop Nav */}
                    <div className="nav-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} style={{
                                fontSize: '0.875rem', fontWeight: '600',
                                color: isActive(link.to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                borderBottom: isActive(link.to) ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                paddingBottom: '2px',
                                transition: 'all 150ms ease',
                                position: 'relative',
                            }}>
                                {link.icon} {link.label}
                                {link.badge > 0 && (
                                    <span style={{
                                        background: '#c42b2b', color: '#fff',
                                        borderRadius: '50%', minWidth: '16px', height: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.55rem', fontWeight: '700',
                                    }}>
                                        {link.badge}
                                    </span>
                                )}
                            </Link>
                        ))}

                        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

                        {user ? (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1a1a1a, #555555)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '0.7rem', fontWeight: '700',
                                }}>
                                    {(user.username || 'U')[0].toUpperCase()}
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={logoutUser} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Hamburger */}
                    <div className="hamburger" onClick={() => setDrawerOpen(true)}>
                        <span /><span /><span />
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Overlay */}
            <div className={`mobile-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

            {/* Mobile Drawer */}
            <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontWeight: '800', color: 'var(--accent-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Gift size={20} /> RentCebu
                    </span>
                    <button onClick={() => setDrawerOpen(false)} style={{ color: 'var(--text-muted)' }}>
                        <X size={22} />
                    </button>
                </div>

                {navLinks.map(link => (
                    <Link key={link.to} to={link.to}>
                        {link.icon} {link.label}
                    </Link>
                ))}

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    {user ? (
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={logoutUser}>
                            <LogOut size={16} /> Logout
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
