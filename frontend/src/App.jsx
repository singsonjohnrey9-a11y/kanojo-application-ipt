import React from 'react';
import { Navbar } from './components/Navbar';
import { ProfileList } from './pages/ProfileList';
import { RentRequest } from './pages/RentRequest';
import { AnonymousChat } from './pages/AnonymousChat';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, Sparkles, Mail, MapPin, Gift } from 'lucide-react';

const Home = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 1.5rem', background: 'radial-gradient(circle at center, #fff 0%, var(--bg-primary) 100%)' }}>
    <h1 style={{ fontSize: '4rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '1.5rem', color: 'var(--text-primary)', textShadow: '0 2px 10px rgba(230,0,126,0.1)' }}>
      Find Your <span style={{ color: 'var(--accent-primary)' }}>Kanojo</span> in Cebu <Heart style={{ display: 'inline', color: 'var(--accent-primary)' }} size={48} />
    </h1>
    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', marginBottom: '3rem', fontWeight: '600' }}>
      Japan's premier rental girlfriend service concept, now in Cebu! Over 15 verified cast members waiting to make your day special.
    </p>

    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to="/profiles" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', boxShadow: '0 8px 20px rgba(230,0,126,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        View Cast List <Sparkles size={20} />
      </Link>
      <Link to="/chat" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Secret Inbox <Mail size={20} />
      </Link>
    </div>
  </div>
);

// Secondary navigation bar for Areas (like the reference site)
const AreaNav = () => (
  <div style={{ backgroundColor: 'var(--accent-light)', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
    <div className="container" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      {['All Cebu', 'Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City', 'Consolacion'].map(area => (
        <Link
          key={area}
          to={`/profiles?area=${encodeURIComponent(area)}`}
          style={{
            fontWeight: '700',
            color: 'var(--accent-primary)',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {area}</span>
        </Link>
      ))}
    </div>
  </div>
);

import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

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
          </Routes>
        </main>

        <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '2px solid var(--border-color)', padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="container">
            <p style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--accent-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Gift size={24} /> RentCebu
            </p>
            <p>© 2026 RentCebu. Over 15 locations active nationwide equivalent.</p>
          </div>
        </footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
