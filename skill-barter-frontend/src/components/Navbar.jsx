import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [credits, setCredits] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.credits || 50;
    } catch { return 50; }
  });

  const fetchCredits = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      const userId = user.id || user._id; // Handle both id formats
      if (!userId) return;

      const res = await api.get(`/auth/user/${userId}`);
      if (res.data && typeof res.data.credits === 'number') {
        setCredits(res.data.credits);
        // Sync local storage
        localStorage.setItem('user', JSON.stringify({ ...user, credits: res.data.credits }));
      }
    } catch (err) {
      console.error("Sync credits failed", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    if (userName) fetchCredits();

    const handleSync = () => {
      setUserName(localStorage.getItem('userName'));
      // Immediate UI update from local storage
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.credits) setCredits(user.credits);
      } catch (e) {}
      
      // Verify with backend after a short delay
      setTimeout(fetchCredits, 800); 
    };

    window.addEventListener('creditsUpdated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('creditsUpdated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [userName]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { name: 'Browse', path: '/browse' },
    { name: 'Matches', path: '/matches' },
    { name: 'Offer/Request', path: '/offer' },
  ];

  return (
    <nav className="navbar" style={{
      background: 'rgba(2, 6, 23, 0.8)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.8rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
          Swaaaappio
        </Link>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {links.map((link) => (
              <Link key={link.path} to={link.path} style={{
                textDecoration: 'none',
                fontSize: '0.95rem',
                color: isActive(link.path) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive(link.path) ? '700' : '500',
                transition: 'var(--transition-smooth)'
              }}>
                {link.name}
              </Link>
            ))}
          </div>

          <div style={{ height: '20px', width: '1px', background: 'var(--glass-border)' }}></div>

          {userName ? (
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
              <div className="credit-pill" style={{ 
                background: 'rgba(56, 189, 248, 0.1)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '20px', 
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: '#fbbf24' }}>🪙</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {credits}
                </span>
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Hi, <strong style={{ color: 'var(--accent-primary)' }}>{userName}</strong></span>
              <button onClick={handleLogout} className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn btn-glass" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Join Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
