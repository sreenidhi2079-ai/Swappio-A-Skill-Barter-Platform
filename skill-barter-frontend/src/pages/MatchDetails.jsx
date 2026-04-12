import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getWsUrl } from '../services/api';
import Toast from '../components/Toast';

const MatchDetails = () => {
  const { matchId: rawMatchId } = useParams();
  const matchId = rawMatchId ? rawMatchId.replace(/ /g, '-') : '';

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName] = useState(localStorage.getItem('userName') || 'Guest');
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const ws = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    fetchStatus();

    const wsUrl = getWsUrl(`/ws/chat/${matchId}`);
    
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (e) { console.error("WS error:", e); }
    };

    const statusInterval = setInterval(fetchStatus, 5000);
    return () => {
      if (ws.current) ws.current.close();
      clearInterval(statusInterval);
    };
  }, [matchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/collaboration/chat/${matchId}`);
      setMessages(response.data);
    } catch (err) { console.error('History error:', err); }
  };

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/collaboration/exchange/${matchId}`);
      
      // Trigger credit sync if status changed to COMPLETED
      if (response.data.status === 'COMPLETED' && exchange?.status !== 'COMPLETED') {
        window.dispatchEvent(new Event('creditsUpdated'));
      }

      setExchange(response.data);
      setError(null);
    } catch (err) { 
        setError("Establishing secure connection failed. Ensure backend is active.");
    } finally { setLoading(false); }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ sender: userName, content: newMessage }));
    setNewMessage('');
  };

  const markTrainingDone = async () => {
    try {
      const res = await api.patch(`/collaboration/exchange/${matchId}/training`, null, { params: { user_id: userName } });
      if (res.data.rewarded) {
        setToast({ message: '🏆 Barter Complete! +10 Credits Added to your account!', type: 'success' });
        
        // Update local user data and trigger Navbar update
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.credits = (user.credits || 50) + 10;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Dispatch custom event to notify Navbar
        window.dispatchEvent(new Event('creditsUpdated'));
      } else {
        setToast({ message: 'Verification recorded. Awaiting partner...', type: 'success' });
      }
      fetchStatus();
    } catch (err) { 
        setToast({ message: 'Error updating status', type: 'error' }); 
    }
  };

  // Removed Phase 2 File Upload logic

  if (error) return (
    <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <div className="card" style={{ border: '1px solid #ef4444', maxWidth: '500px', margin: '0 auto' }}>
        <h3 style={{ color: '#ef4444' }}>⚠️ Connection Error</h3>
        <p style={{ marginTop: '1rem', opacity: 0.8 }}>{error}</p>
        <Link to="/matches" className="btn btn-glass" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Return to Matches</Link>
      </div>
    </div>
  );

  if (loading && !exchange) return (
    <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <div className="fade-in">
        <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
        <p style={{ opacity: 0.6 }}>Establishing Secure Hub Connection...</p>
      </div>
    </div>
  );

  return (
    <div className="fade-in container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/matches" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>← Exit Hub</Link>
          <h2 className="text-gradient" style={{ marginTop: '0.5rem' }}>Collaboration Hub</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SESSION: </span>
          <strong style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{userName}</strong>
        </div>
      </div>

      <div className="grid collaboration-grid">
        {/* Chat Section */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(24px)', 
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)', 
          borderRadius: '1.5rem', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          height: '500px', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}>
          <div style={{ padding: '0 1.5rem', height: '65px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              Secure Channel <span className="online-indicator"></span>
            </h3>
          </div>
          
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
            {messages.length === 0 && <p style={{ textAlign: 'center', opacity: 0.3, marginTop: '3rem', fontStyle: 'italic' }}>Establish contact by sending a message...</p>}
            {messages.map((msg, idx) => {
              const isMe = msg.sender_name === userName;
              return (
                <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{
                    background: isMe ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,0.08)',
                    color: isMe ? 'white' : 'var(--text-primary)',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '16px',
                    borderBottomRightRadius: isMe ? '4px' : '16px',
                    borderBottomLeftRadius: isMe ? '16px' : '4px',
                  }}>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{msg.content}</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: isMe ? 'right' : 'left' }}>
                    {msg.sender_name} • Just now
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.5rem' }}>
            <form onSubmit={sendMessage} style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
              <input type="text" className="input-field" placeholder="Share a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ margin: 0, borderRadius: '12px', flex: 1, padding: '0.7rem 1rem' }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', flexShrink: 0 }}>Send</button>
            </form>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="workflow-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800' }}>Process Status</p>
            <h4 style={{ color: 'var(--accent-secondary)', marginTop: '0.5rem', fontSize: '1.2rem' }}>{exchange?.status || 'INITIALIZING'}</h4>
          </div>
          <div className="card" style={{ padding: '1.8rem' }}>
            <h4 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>Phase 1: Training ✅</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pro A:</span>
                <span style={{ color: exchange?.userA_training_done ? '#10b981' : 'var(--text-muted)', fontWeight: 'bold' }}>{exchange?.userA_training_done ? '✓ VERIFIED' : '○ WAITING'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pro B:</span>
                <span style={{ color: exchange?.userB_training_done ? '#10b981' : 'var(--text-muted)', fontWeight: 'bold' }}>{exchange?.userB_training_done ? '✓ VERIFIED' : '○ WAITING'}</span>
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={markTrainingDone} 
              disabled={exchange?.status === 'COMPLETED' || (userName === exchange?.userA_id ? exchange?.userA_training_done : exchange?.userB_training_done)} 
              style={{ width: '100%', borderRadius: '12px' }}
            >
              { exchange?.status === 'COMPLETED' ? 'Training Verified ✓' : (userName === exchange?.userA_id ? exchange?.userA_training_done : exchange?.userB_training_done) ? 'Waiting for Partner...' : 'Verify My Training'}
            </button>
          </div>

          <div className="card" style={{ 
            padding: '1.8rem', 
            background: exchange?.status === 'COMPLETED' ? 'linear-gradient(135deg, rgba(81, 140, 248, 0.1), rgba(16, 185, 129, 0.1))' : 'var(--bg-card)',
            borderColor: exchange?.status === 'COMPLETED' ? '#10b981' : 'var(--glass-border)'
          }}>
            <h4 style={{ marginBottom: '1.2rem', color: exchange?.status === 'COMPLETED' ? '#10b981' : 'var(--text-primary)' }}>
              {exchange?.status === 'COMPLETED' ? 'Barter Completed! 🏆' : 'Professional Reward 💎'}
            </h4>
            
            {exchange?.status === 'COMPLETED' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Successful Skill Exchange!
                </p>
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  fontWeight: 'bold'
                }}>
                  +10 CREDITS EARNED
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Once both experts verify the training, **+10 Credits** will be automatically transferred to your professional accounts.
              </p>
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MatchDetails;

