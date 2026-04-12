import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillService } from '../services/api';
import SkillForm from '../components/SkillForm';
import Toast from '../components/Toast';

const RequestSkill = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleCreate = async (formData) => {
    try {
      await skillService.createSkillListing(formData);
      setToast({ message: 'Skill request published successfully!', type: 'success' });
      setTimeout(() => navigate('/browse'), 1500);
    } catch (err) {
      setToast({ message: `Failed to post request. ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <SkillForm 
        title="Find an Expert" 
        onSubmit={handleCreate} 
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.6 }}>
        <p style={{ fontSize: '0.9rem' }}>
          Define what you need specifically to attract the right barter partners.
        </p>
      </div>
    </div>
  );
};

export default RequestSkill;

