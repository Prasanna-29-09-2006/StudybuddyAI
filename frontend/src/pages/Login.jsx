import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { Eye, EyeOff, Mail, Lock, BrainCircuit, Sun, Moon, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <AnimatedBackground />
      
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ position: 'fixed', top: 24, right: 24, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '8px', cursor: 'pointer', color: 'var(--text-primary)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{ display: 'flex', width: '100%', maxWidth: 1000, minHeight: 580, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', margin: '0 20px' }}>
        
        {/* Left Panel - Illustration */}
        <div style={{ flex: 1, background: 'var(--gradient-primary)', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={24} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>Study Buddy AI</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Sparkles size={20} color="rgba(255,255,255,0.8)" />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>AI-Powered Learning</span>
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>Unlock Your Learning Potential</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: 15 }}>
              Your personal AI tutor, quiz generator, flashcard creator, and study planner — all in one premium platform.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              {['📝 Smart Notes', '🎯 AI Quizzes', '🃏 Flashcards', '📊 Progress'].map(f => (
                <div key={f} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 12, fontWeight: 500 }}>{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="glass-card" style={{ flex: 1, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 0 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Welcome Back 👋</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontSize: 15 }}>Sign in to continue your learning journey</p>

          {error && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="glass-input" style={{ width: '100%', paddingLeft: 42 }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                  className="glass-input" style={{ width: '100%', paddingLeft: 42, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="glass-btn" disabled={loading} style={{ marginTop: 8, height: 48, fontSize: 15 }}>
              {loading ? <><span className="typing-dots"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span></> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24, fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
