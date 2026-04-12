import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillService } from '../services/api';
import SkillForm from '../components/SkillForm';
import Toast from '../components/Toast';

const OfferSkill = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleCreate = async (formData) => {
    try {
      await skillService.createSkillListing(formData);
      setToast({ message: 'Skill listing published successfully!', type: 'success' });
      setTimeout(() => navigate('/browse'), 1500);
    } catch (err) {
      setToast({ message: `Failed to post listing. ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <SkillForm 
        title="Post an Expertise" 
        onSubmit={handleCreate} 
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.6 }}>
        <p style={{ fontSize: '0.9rem' }}>
          Your listing will be visible to thousands of experts looking to barter.
        </p>
      </div>
    </div>
  );
};

export default OfferSkill;
