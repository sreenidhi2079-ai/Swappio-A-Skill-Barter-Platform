import React, { useEffect, useState } from 'react';
import { skillService } from '../services/api';
import MatchCard from '../components/MatchCard';

const SkillMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const userName = localStorage.getItem('userName');
      const response = await skillService.getMatches(userName || '');
      setMatches(response.data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(`Matches fetch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Mutual Barter Matches</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Our engine automatically detects users who want what you have, AND have what you want.
        </p>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Analyzing barter opportunities...</p>}
      
      {error && (
        <div className="card" style={{ borderColor: '#ef4444', textAlign: 'center', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ fontSize: '1.5rem', opacity: 0.5 }}>No perfect matches found yet. Keep listing!</p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Tip: A match happens when User A offers "Coding" and wants "Cooking", while User B offers "Cooking" and wants "Coding".
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {matches.map((match, index) => (
          <MatchCard key={index} match={match} />
        ))}
      </div>
    </div>
  );
};

export default SkillMatches;
