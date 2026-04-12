import React from 'react';
import { Link } from 'react-router-dom';

const MatchCard = ({ match }) => {
  return (
    <div className="card fade-in" style={{ 
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
      border: '1px solid var(--accent-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative accent */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        width: '50px',
        height: '50px',
        background: 'var(--accent-primary)',
        filter: 'blur(30px)',
        opacity: 0.5
      }} />

      <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Perfect Match! 🤝</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <h4 style={{ color: 'var(--accent-secondary)' }}>{match.userA_name}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Offers: {match.userA_offer}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wants: {match.userA_wants}</p>
        </div>

        <div style={{ fontSize: '1.5rem' }}>↔️</div>

        <div style={{ textAlign: 'left' }}>
          <h4 style={{ color: 'var(--accent-secondary)' }}>{match.userB_name}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Offers: {match.userB_offer}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wants: {match.userB_wants}</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to={`/collaboration/${match.match_id}`} className="btn" style={{ 
          display: 'inline-block',
          background: 'var(--accent-primary)',
          color: 'white',
          fontWeight: 'bold',
          padding: '0.8rem 1.5rem'
        }}>
          Start Collaboration 🤝
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;
