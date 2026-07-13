import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Lock, Bell, Trash2, Shield, Palette, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const SettingsSection = ({ title, icon: Icon, children }) => (
  <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-glass)' }}>
      <Icon size={18} color="var(--primary-blue)" />
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button onClick={onChange} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', transition: 'background var(--transition-fast)', background: checked ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)', position: 'relative', padding: 0 }}>
    <span style={{ position: 'absolute', top: 3, left: checked ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left var(--transition-fast)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
  </button>
);

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ email: true, reminders: true, tips: false });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) { setPwError('Please fill all password fields.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    setPwLoading(true); setPwError(''); setPwMsg('');
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      setPwMsg('Password changed successfully! ✅');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (e) { setPwError(e.message); }
    finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true); setDeleteError('');
    try {
      await api.delete('/profile');
      // Clear all local data
      localStorage.clear();
      logout();
      navigate('/login');
    } catch (e) {
      setDeleteError('Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 700 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 28 }}>Settings ⚙️</h2>

      {/* Appearance */}
      <SettingsSection title="Appearance" icon={Palette}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {theme === 'dark' ? <Moon size={18} color="var(--text-secondary)" /> : <Sun size={18} color="var(--text-secondary)" />}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Switch between dark and light interface</div>
            </div>
          </div>
          <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          {['dark', 'light'].map(t => (
            <button key={t} onClick={() => t !== theme && toggleTheme()} style={{ flex: 1, padding: '14px', borderRadius: 10, border: `2px solid ${theme === t ? 'var(--primary-blue)' : 'var(--border-glass)'}`, background: t === 'dark' ? '#0a0b10' : '#f3f4f6', cursor: 'pointer', transition: 'all var(--transition-fast)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t === 'dark' ? '#f3f4f6' : '#1f2937', textTransform: 'capitalize' }}>
                {t === 'dark' ? '🌙' : '☀️'} {t.charAt(0).toUpperCase() + t.slice(1)} Mode
              </div>
              {theme === t && <div style={{ fontSize: 11, color: 'var(--primary-blue)', marginTop: 4 }}>Active</div>}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" icon={Bell}>
        {[
          { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
          { key: 'reminders', label: 'Study Reminders', desc: 'Daily study session reminders' },
          { key: 'tips', label: 'AI Study Tips', desc: 'Weekly AI-powered study recommendations' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
            </div>
            <ToggleSwitch checked={notifications[key]} onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))} />
          </div>
        ))}
      </SettingsSection>

      {/* Password */}
      <SettingsSection title="Change Password" icon={Lock}>
        {pwMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '10px 16px', color: '#34d399', marginBottom: 16, fontSize: 13 }}>{pwMsg}</div>}
        {pwError && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 16px', color: '#f87171', marginBottom: 16, fontSize: 13 }}>{pwError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Current Password', key: 'current', placeholder: 'Enter current password' },
            { label: 'New Password', key: 'newPw', placeholder: 'Min. 6 characters' },
            { label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat new password' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{label}</label>
              <input type="password" value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                className="glass-input" style={{ width: '100%' }} />
            </div>
          ))}
        </div>
        <button onClick={handleChangePassword} disabled={pwLoading} className="glass-btn" style={{ padding: '10px 24px' }}>
          <Shield size={15} />{pwLoading ? 'Updating...' : 'Update Password'}
        </button>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="glass-card" style={{ padding: '20px 32px', border: '1px solid rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 8 }}><Trash2 size={15} />Danger Zone</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Permanently delete your account and all data. This action cannot be undone.</div>
          </div>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '10px 20px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#f43f5e', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-family)' }}>
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="glass-card" style={{ maxWidth: 420, width: '100%', padding: 32, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={22} color="#f43f5e" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Delete Account?</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>This action is permanent and cannot be undone.</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 10, padding: '12px 16px' }}>
              ⚠️ All your <strong>notes, tasks, study plans, flashcards, quiz history and progress data</strong> will be permanently deleted from the database.
            </div>
            {deleteError && <div style={{ color: '#f87171', fontSize: 13 }}>{deleteError}</div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} disabled={deleteLoading} className="glass-btn glass-btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{ padding: '10px 20px', background: 'rgba(244,63,94,0.85)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: deleteLoading ? 'not-allowed' : 'pointer', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-family)' }}>
                {deleteLoading ? 'Deleting...' : '🗑️ Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
