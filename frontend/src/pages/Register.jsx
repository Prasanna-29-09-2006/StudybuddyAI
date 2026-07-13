import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { Eye, EyeOff, Mail, Lock, User, BrainCircuit, Sun, Moon } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.includes('@')) return 'Please enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(''); setLoading(true);
    try {
      await register(name, email, password);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <AnimatedBackground />
      <button onClick={toggleTheme} style={{ position: 'fixed', top: 24, right: 24, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '8px', cursor: 'pointer', color: 'var(--text-primary)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{ display: 'flex', width: '100%', maxWidth: 1000, minHeight: 620, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', margin: '0 20px' }}>
        
        {/* Left Panel */}
        <div style={{ flex: 1, background: 'var(--gradient-secondary)', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, left: -40, width: 280, height: 280, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={24} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Study Buddy AI</span>
          </div>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>Start Your AI-Powered Study Journey</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: 15, marginBottom: 32 }}>
              Join thousands of students who use Study Buddy AI to ace their exams and master their subjects.
            </p>
            {['🚀 Personalized Learning Path', '🤖 Gemini AI Integration', '📈 Track Your Progress', '🎯 Smart Quiz Generation'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="glass-card" style={{ flex: 1, padding: '50px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 0 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Create Your Account ✨</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>Fill in the details to get started</p>

          {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', marginBottom: 16, fontSize: 13 }}>{error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '10px 14px', color: '#34d399', marginBottom: 16, fontSize: 13 }}>{success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Full Name', icon: User, type: 'text', value: name, setter: setName, placeholder: 'Prasanna Kumar' },
              { label: 'Email Address', icon: Mail, type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
            ].map(({ label, icon: Icon, type, value, setter, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={type} value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                    className="glass-input" style={{ width: '100%', paddingLeft: 40 }} />
                </div>
              </div>
            ))}

            {[
              { label: 'Password', value: password, setter: setPassword, show: showPassword, toggle: () => setShowPassword(!showPassword), placeholder: 'Min. 6 characters' },
              { label: 'Confirm Password', value: confirm, setter: setConfirm, show: showConfirm, toggle: () => setShowConfirm(!showConfirm), placeholder: 'Re-enter password' },
            ].map(({ label, value, setter, show, toggle, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={show ? 'text' : 'password'} value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                    className="glass-input" style={{ width: '100%', paddingLeft: 40, paddingRight: 40 }} />
                  <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            <button type="submit" className="glass-btn" disabled={loading} style={{ height: 46, fontSize: 15, marginTop: 4, background: 'var(--gradient-secondary)', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' }}>
              {loading ? <><span className="typing-dots"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span></> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
