import React, { useState } from 'react';
import { FiActivity, FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

const AuthView = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      if (!isLogin) {
        // Authentic API Signup Call
        const res = await fetch("http://localhost:8000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: name, email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Signup failed securely");
        
        setSignupSuccess(true);
        setIsLogin(true);
        setPassword('');
        setTimeout(() => setSignupSuccess(false), 4000); 
        
      } else {
        // Authentic API Login Call retaining History memory via SQLite
        const res = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login credentials unauthorized");
        
        // Emits 'data' up to App.jsx containing genuine python dict of {name, user_id, has_history, metrics[]}
        onLogin(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', minHeight: '100vh', width: '100vw' }}>
      <div className="glass-card animate-slide-up" style={{ width: '420px', padding: '3rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <FiActivity className="text-teal" size={48} style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(20, 184, 166, 0.5))' }} />
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
            {isLogin ? 'Log in to view your ClassPulse insights' : 'Sign up to start analyzing your lectures'}
          </p>
          
          {signupSuccess && (
            <div className="animate-slide-up" style={{ padding: '0.75rem', marginTop: '1rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              Account successfully created! Please log in below.
            </div>
          )}
          {errorMsg && (
            <div className="animate-slide-up" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '0.75rem', marginTop: '1rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <FiAlertCircle /> {errorMsg}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} className="auth-input" />
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
            <input type="email" placeholder="University Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" />
          </div>

          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '1rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? (
              <>
                <svg className="animate-spin" style={{ height: '20px', width: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"></path>
                </svg>
                Authenticating...
              </>
            ) : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <span className="text-secondary">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setSignupSuccess(false); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--brand-purple)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Input styles moved to index.css as .auth-input class

export default AuthView;
