import React from 'react';
import { Navbar } from './components/Navbar';
import { Marketplace } from './pages/Marketplace';
import { ListingDetail } from './pages/ListingDetail';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, MapPin, Building2, Shield } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminVerification } from './pages/AdminVerification';
import { Inbox } from './pages/Inbox';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { CreateListing } from './pages/CreateListing';
import { EditListing } from './pages/EditListing';

import { useLocation } from 'react-router-dom';

/* ─── App Content Wrapper ─── */
function AppContent() {
  const location = useLocation();
  const isMarketplace = location.pathname === '/';

  return (
    <>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/verifications" element={<AdminVerification />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/bookings" element={<Bookings />} />
          <Route path="/dashboard/create" element={<CreateListing />} />
          <Route path="/dashboard/edit/:id" element={<EditListing />} />
        </Routes>
      </main>

      {/* Footer - hidden on Marketplace to maximize map view */}
      {!isMarketplace && (
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
                <Building2 size={20} /> Ubecahan
              </div>
              <p style={{ lineHeight: 1.7, fontSize: '0.8rem' }}>
                The premier house and boarding house rental platform for Cebu City. Find your next home today.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/" style={{ fontSize: '0.8rem' }}>Browse Listings</Link>
                <Link to="/register" style={{ fontSize: '0.8rem' }}>Create Account</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Areas</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Cebu City', 'Mandaue City', 'Lapu-Lapu City', 'Talisay City', 'Consolacion'].map(a => (
                  <Link key={a} to="/" style={{ fontSize: '0.8rem' }}>{a}</Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <p>© 2026 Ubecahan. All rights reserved. <Home size={12} style={{ color: 'var(--accent-primary)', verticalAlign: 'middle' }} /></p>
          </div>
        </footer>
      )}
    </>
  );
}

/* ─── App Root ─── */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
