import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const userName = localStorage.getItem('userName');

  return (
    <div className="fade-in" style={{ padding: '4rem 0' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '8rem', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '-100px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '600px', 
          height: '600px', 
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          zIndex: -1 
        }} />
        
        <h1 className="premium-title text-gradient" style={{ marginBottom: '1.5rem' }}>
          Swap Skills.<br />Build Futures.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 3rem auto', lineHeight: 1.8 }}>
          Welcome to the world's most advanced skill-barter platform. Connect with experts, exchange high-value services, and accelerate your growth—without the need for currency.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {userName ? (
            <Link to="/browse" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
              Explore Marketplace
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                Join Swaaaappio Free
              </Link>
              <Link to="/browse" className="btn btn-glass" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                Browse Listings
              </Link>
            </>
          )}
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '6rem', opacity: 0.8 }}>
          <div>
            <h4 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>2.4k+</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Swappers</p>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <div>
            <h4 style={{ color: 'var(--accent-secondary)', fontSize: '1.5rem' }}>150+</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expert Skills</p>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <div>
            <h4 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>$0</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid-3">
        <div className="card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🎯</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Precision Matching</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Our algorithm identifies perfect barter opportunities based on mutual value and geographic proximity.</p>
        </div>
        
        <div className="card" style={{ transform: 'translateY(-20px)', borderColor: 'var(--accent-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🛡️</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }}>Secure Exchange</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>A professional collaboration workflow ensures both parties fulfill their commitments with integrated chat and file sharing.</p>
        </div>

        <div className="card">
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>💎</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Expert Curation</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Connect with high-caliber professionals ranging from software engineers to master chefs and creative directors.</p>
        </div>
      </div>

      {/* Trust Footer */}
      <div style={{ marginTop: '10rem', textAlign: 'center', opacity: 0.4, fontSize: '0.85rem', letterSpacing: '1px' }}>
        TRUSTED BY THOUSANDS OF PROFESSIONALS GLOBALLY
      </div>
    </div>
  );
};

export default Home;

