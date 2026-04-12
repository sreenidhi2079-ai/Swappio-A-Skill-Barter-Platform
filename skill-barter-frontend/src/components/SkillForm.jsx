import React, { useState } from 'react';

const SkillForm = ({ onSubmit, title, initialData = {} }) => {
  const loggedInName = localStorage.getItem('userName') || '';
  
  const [formData, setFormData] = useState({
    user_name: loggedInName,
    skill_offered: initialData.skill_offered || '',
    skill_requested: initialData.skill_requested || '',
    description: initialData.description || '',
    location: initialData.location || '',
    contact: initialData.contact || '',
    availability: initialData.availability || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const labelStyle = { 
    display: 'block', 
    marginBottom: '0.6rem', 
    fontSize: '0.8rem', 
    color: 'var(--text-muted)', 
    textTransform: 'uppercase', 
    letterSpacing: '1px',
    fontWeight: '600'
  };

  return (
    <div className="card fade-in" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <h2 className="text-gradient" style={{ marginBottom: '2.5rem', textAlign: 'center', fontSize: '2rem' }}>{title}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <label style={labelStyle}>Primary Contact (Email/Phone)*</label>
          <input
            type="text"
            name="contact"
            required
            className="input-field"
            value={formData.contact}
            onChange={handleChange}
            placeholder="How should partners reach you?"
            style={{ marginBottom: 0 }}
          />
        </div>

        <div className="grid-2">
          <div>
            <label style={labelStyle}>Skill Offering*</label>
            <input
              type="text"
              name="skill_offered"
              required
              className="input-field"
              value={formData.skill_offered}
              onChange={handleChange}
              placeholder="e.g. Master UI Design"
              style={{ marginBottom: 0 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Skill Seeking*</label>
            <input
              type="text"
              name="skill_requested"
              required
              className="input-field"
              value={formData.skill_requested}
              onChange={handleChange}
              placeholder="e.g. Python Backend"
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Professional Description</label>
          <textarea
            name="description"
            className="input-field"
            style={{ height: '120px', resize: 'vertical', marginBottom: 0 }}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your expertise and what you're hoping to achieve through this barter..."
          />
        </div>

        <div className="grid-2">
          <div>
            <label style={labelStyle}>Location / Timezone</label>
            <input
              type="text"
              name="location"
              className="input-field"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote / IST"
              style={{ marginBottom: 0 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Availability</label>
            <input
              type="text"
              name="availability"
              className="input-field"
              value={formData.availability}
              onChange={handleChange}
              placeholder="e.g. 5hrs/week"
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
          Publish Listing 🚀
        </button>
      </form>
    </div>
  );
};

export default SkillForm;
