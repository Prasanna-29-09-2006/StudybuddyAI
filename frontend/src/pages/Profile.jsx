import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, BookOpen, Hash, Camera, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    university: user?.university || '',
    course: user?.course || '',
    semester: user?.semester || '',
    profilePicture: user?.profilePicture || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleChange('profilePicture', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true); setSuccess(''); setError('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated successfully! ✅');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const fields = [
    { label: 'Full Name', key: 'name', icon: User, type: 'text', placeholder: 'Your full name' },
    { label: 'Email Address', key: 'email', icon: Mail, type: 'email', placeholder: 'your@email.com', disabled: true },
    { label: 'University / College', key: 'university', icon: GraduationCap, type: 'text', placeholder: 'e.g. IIT Madras' },
    { label: 'Course / Department', key: 'course', icon: BookOpen, type: 'text', placeholder: 'e.g. B.Tech - CS' },
    { label: 'Semester', key: 'semester', icon: Hash, type: 'text', placeholder: 'e.g. Semester 5' },
  ];

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="fade-in" style={{ maxWidth: 700 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 28 }}>My Profile 👤</h2>

      {/* Avatar Section */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }} title="Change profile picture">
            {form.profilePicture ? (
              <img src={form.profilePicture} alt="Profile" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: 'white', boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }}>
                {initials}
              </div>
            )}
          </div>
          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePictureChange} style={{ display: 'none' }} />
          <div onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-secondary)' }} title="Change profile picture">
            <Camera size={13} color="white" />
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{form.name || 'Your Name'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{form.email}</p>
          {form.course && <p style={{ color: 'var(--primary-blue)', fontSize: 13, marginTop: 4, fontWeight: 500 }}>{form.course} {form.semester ? `· ${form.semester}` : ''}</p>}
          {form.university && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>🏛️ {form.university}</p>}
        </div>
      </div>

      {/* Form */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Edit Profile Details</h3>
        
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '10px 16px', color: '#34d399', marginBottom: 20, fontSize: 14 }}>{success}</div>}
        {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 16px', color: '#f87171', marginBottom: 20, fontSize: 14 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
          {fields.map(({ label, key, icon: Icon, type, placeholder, disabled }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={type} value={form[key]} onChange={e => handleChange(key, e.target.value)} placeholder={placeholder} disabled={disabled}
                  className="glass-input" style={{ width: '100%', paddingLeft: 40, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text' }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving} className="glass-btn" style={{ padding: '12px 28px' }}>
          <Save size={16} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
