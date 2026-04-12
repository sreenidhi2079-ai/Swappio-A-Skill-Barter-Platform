import React, { useEffect, useState } from 'react';
import { skillService } from '../services/api';
import SkillCard from '../components/SkillCard';
import Toast from '../components/Toast';

const BrowseSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [userName] = useState(localStorage.getItem('userName') || '');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await skillService.getAllSkills();
      setSkills(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(`Marketplace connection failed. Ensure backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this professional listing?')) {
      try {
        await skillService.deleteSkill(id);
        setSkills(skills.filter(s => s.id !== id));
        setToast({ message: 'Listing removed successfully', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to delete listing.', type: 'error' });
      }
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h1 className="premium-title text-gradient" style={{ fontSize: '3rem' }}>Skill Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Explore expertise from around the globe.</p>
        </div>
        <button className="btn btn-glass" onClick={fetchSkills} style={{ padding: '0.8rem 1.5rem' }}>Refresh Feed</button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ opacity: 0.6 }}>Loading expert listings...</p>
        </div>
      )}
      
      {error && (
        <div className="card" style={{ border: '1px solid #ef4444', textAlign: 'center', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && skills.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '5rem', opacity: 0.8 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏜️</div>
          <h3>The Marketplace is Quiet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Be the first professional to post an offering or request!</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onDelete={handleDelete} currentUser={userName} />
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BrowseSkills;
