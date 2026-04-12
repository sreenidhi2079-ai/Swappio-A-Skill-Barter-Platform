import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Signup = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.signup({ user_name: userName, email, password });
      // Redirect to login after successful signup
      const loginRes = await authService.login({ email, password });
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      localStorage.setItem('userName', loginRes.data.user.user_name);
      navigate('/');
      window.location.reload();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) 
        ? detail[0]?.msg || 'Validation error' 
        : detail || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(129, 140, 248, 0.1)', color: 'var(--accent-secondary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(129, 140, 248, 0.2)', letterSpacing: '2px' }}>
          NEW IDENTITY
        </div>
        <h2 className="premium-title text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Join Platform</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Create your barter identity instantly</p>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
            <input type="text" className="form-input" placeholder="Alex Rivera" value={userName} onChange={(e) => setUserName(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
            <input type="email" className="form-input" placeholder="alex@skill.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
            <input type="password" className="form-input" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '1rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

