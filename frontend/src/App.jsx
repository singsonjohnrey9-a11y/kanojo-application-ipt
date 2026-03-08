import React from 'react';
import { Navbar } from './components/Navbar';
import { ProfileList } from './pages/ProfileList';
import { RentRequest } from './pages/RentRequest';
import { AnonymousChat } from './pages/AnonymousChat';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, Sparkles, Mail, MapPin, Gift, Users, Clock, Shield } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminVerification } from './pages/AdminVerification';
import { Inbox } from './pages/Inbox';

/* ─── Home Hero ─── */
const Home = () => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    padding: '5rem 1.5rem 4rem',
  }}>
    <h1 className="animate-fade-in-up" style={{
      fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: '800',
      letterSpacing: '-0.02em', marginBottom: '1rem',
      color: 'var(--text-primary)', lineHeight: 1.15,
    }}>
      Find Your <span style={{ color: 'var(--accent-primary)' }}>Kanojo</span> in Cebu
    </h1>

    <p className="animate-fade-in-up" style={{
      fontSize: '1.05rem', color: 'var(--text-secondary)',
      maxWidth: '520px', marginBottom: '2.5rem', fontWeight: '400',
      animationDelay: '0.1s', lineHeight: 1.7,
    }}>
      Japan's premier rental girlfriend concept, reimagined for Cebu City. Browse verified companions and book your perfect date.
    </p>

    <div className="animate-fade-in-up" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.2s' }}>
      <Link to="/profiles" className="btn btn-primary btn-lg">
        <Sparkles size={18} /> Browse Cast
      </Link>
      <Link to="/chat" className="btn btn-secondary btn-lg">
        <Mail size={18} /> Secret Chat
      </Link>
    </div>

    {/* Stats Strip */}
    <div className="animate-fade-in-up" style={{
      display: 'flex', gap: '2.5rem', marginTop: '4rem',
      animationDelay: '0.35s', flexWrap: 'wrap', justifyContent: 'center',
    }}>
      {[
        { icon: <Users size={20} />, value: '60+', label: 'Cast Members' },
        { icon: <MapPin size={20} />, value: '6', label: 'Cebu Areas' },
        { icon: <Clock size={20} />, value: '24/7', label: 'Availability' },
        { icon: <Shield size={20} />, value: '100%', label: 'Verified' },
      ].map(stat => (
        <div key={stat.label} style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--accent-primary)', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Area Nav ─── */
const areas = ['All Cebu', 'Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City', 'Consolacion'];

const AreaNav = () => (
  <div style={{
    backgroundColor: 'var(--bg-secondary)', padding: '0.6rem 0',
    borderBottom: '1px solid var(--border-color)',
    overflowX: 'auto', WebkitOverflowScrolling: 'touch',
  }}>
    <div className="container" style={{
      display: 'flex', gap: '1.5rem', justifyContent: 'center',
      minWidth: 'max-content', padding: '0 1.5rem',
    }}>
      {areas.map(area => (
        <Link
          key={area}
          to={`/profiles?area=${encodeURIComponent(area)}`}
          style={{
            fontWeight: '600', color: 'var(--text-muted)',
            fontSize: '0.8rem', textTransform: 'uppercase',
            letterSpacing: '0.4px', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.2rem',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <MapPin size={12} /> {area}
        </Link>
      ))}
    </div>
  </div>
);

/* ─── App Root ─── */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <AreaNav />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profiles" element={<ProfileList />} />
            <Route path="/rent/:id" element={<RentRequest />} />
            <Route path="/chat" element={<AnonymousChat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/verifications" element={<AdminVerification />} />
            <Route path="/inbox" element={<Inbox />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)',
          padding: '2.5rem 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem',
        }}>
          <div className="container" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem', marginBottom: '2rem',
          }}>
            <div>
              <div style={{ fontWeight: '800', color: 'var(--accent-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Gift size={20} /> RentCebu
              </div>
              <p style={{ lineHeight: 1.7, fontSize: '0.8rem' }}>
                The premier rental companion platform for Cebu City. Safe, verified, and always available.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/profiles" style={{ fontSize: '0.8rem' }}>Cast List</Link>
                <Link to="/chat" style={{ fontSize: '0.8rem' }}>Anonymous Chat</Link>
                <Link to="/register" style={{ fontSize: '0.8rem' }}>Create Account</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Areas</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Cebu City', 'Mandaue City', 'Lapu-Lapu City'].map(a => (
                  <Link key={a} to={`/profiles?area=${encodeURIComponent(a)}`} style={{ fontSize: '0.8rem' }}>{a}</Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <p>© 2026 RentCebu. All rights reserved. <Heart size={12} style={{ color: 'var(--accent-primary)', verticalAlign: 'middle' }} /></p>
          </div>
        </footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
