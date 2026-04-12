import React from 'react';

const SkillCard = ({ skill, onDelete, currentUser }) => {
  return (
    <div className="card fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{skill.skill_offered}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> offered by <strong>{skill.user_name}</strong></p>
      </div>
      
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>{skill.description}</p>
        
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Looking for:</p>
          <p style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>{skill.skill_requested}</p>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <p>📍 {skill.location}</p>
          <p>📅 {skill.availability}</p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{skill.contact}</span>
        {skill.user_name === currentUser && (
          <button 
            onClick={() => onDelete(skill.id)}
            className="btn btn-glass"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default SkillCard;
