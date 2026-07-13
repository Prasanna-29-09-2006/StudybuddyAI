import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  Bell, X, Send, Save, Trash2, Edit2, Clock, Calendar,
  Mail, CheckCircle, AlertCircle, Loader, Plus
} from 'lucide-react';

// ── Toast Notification ─────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 10000,
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 20px', borderRadius: 12, maxWidth: 380,
    background: type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'slideInRight 0.3s ease-out',
    color: 'white', fontSize: 14, fontWeight: 500,
  }}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span style={{ flex: 1 }}>{message}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 0 }}>
      <X size={16} />
    </button>
  </div>
);

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span style={{
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: status === 'SENT' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
    color: status === 'SENT' ? '#10b981' : '#f59e0b',
    border: `1px solid ${status === 'SENT' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  }}>
    {status === 'SENT' ? '✓ Sent' : '⏳ Pending'}
  </span>
);

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
    <Bell size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
    <p style={{ margin: 0, fontSize: 13 }}>No reminders yet.</p>
    <p style={{ margin: '4px 0 0', fontSize: 12 }}>Create one using the form above.</p>
  </div>
);

// ── Default Form State ─────────────────────────────────────────────────────────
const defaultForm = {
  userEmail: '', subject: '', reminderMessage: '',
  reminderDate: '', reminderTime: '',
};

// ── Helper: today's date as yyyy-MM-dd ─────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

// ── Helper: current HH:MM + 1 min (to ensure future time by default) ──────────
const nowPlusOneMin = () => {
  const d = new Date(Date.now() + 60000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ReminderPanel = ({ onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ ...defaultForm, reminderDate: todayStr(), reminderTime: nowPlusOneMin() });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [savingForm, setSavingForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Show a toast message
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch reminders from the backend
  const fetchReminders = useCallback(async () => {
    try {
      setLoadingFetch(true);
      const res = await api.get('/reminders');
      setReminders(res.data);
    } catch {
      showToast('Failed to load reminders.', 'error');
    } finally {
      setLoadingFetch(false);
    }
  }, [showToast]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  // Handle form field change
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  // Frontend validation (mirrors backend validation)
  const validateForm = () => {
    const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!form.userEmail.trim()) return 'Recipient email is required.';
    if (!emailRe.test(form.userEmail.trim())) return 'Invalid email address format.';
    if (!form.subject.trim()) return 'Subject is required.';
    if (!form.reminderMessage.trim()) return 'Reminder message is required.';
    if (!form.reminderDate) return 'Reminder date is required.';
    if (!form.reminderTime) return 'Reminder time is required.';

    const now = new Date();
    const selectedDT = new Date(`${form.reminderDate}T${form.reminderTime}`);
    if (selectedDT <= now) return 'Reminder date & time must be in the future.';

    return null;
  };

  // Save (create or update) reminder
  const handleSave = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }

    try {
      setSavingForm(true);
      const payload = {
        userEmail: form.userEmail.trim(),
        subject: form.subject.trim(),
        reminderMessage: form.reminderMessage.trim(),
        reminderDate: form.reminderDate,
        reminderTime: form.reminderTime + ':00', // ensure HH:mm:ss
      };

      if (editingId) {
        await api.put(`/reminders/${editingId}`, payload);
        showToast('Reminder updated successfully.');
      } else {
        await api.post('/reminders', payload);
        showToast('Reminder saved successfully.');
      }

      setForm({ ...defaultForm, reminderDate: todayStr(), reminderTime: nowPlusOneMin() });
      setEditingId(null);
      setShowForm(false);
      fetchReminders();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save reminder.';
      setFormError(msg);
    } finally {
      setSavingForm(false);
    }
  };

  // Send a reminder immediately
  const handleSendNow = async (id) => {
    try {
      setSendingId(id);
      await api.post(`/reminders/${id}/send`);
      showToast('Reminder email sent successfully! 📬');
      fetchReminders();
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to send reminder email.';
      showToast(msg, 'error');
    } finally {
      setSendingId(null);
    }
  };

  // Delete reminder
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      showToast('Reminder deleted.');
      fetchReminders();
    } catch {
      showToast('Failed to delete reminder.', 'error');
    }
  };

  // Populate form for editing
  const handleEdit = (r) => {
    setForm({
      userEmail: r.userEmail,
      subject: r.subject,
      reminderMessage: r.reminderMessage,
      reminderDate: r.reminderDate,
      reminderTime: r.reminderTime ? r.reminderTime.slice(0, 5) : '',
    });
    setEditingId(r.id);
    setFormError('');
    setShowForm(true);
  };

  const cancelEdit = () => {
    setForm({ ...defaultForm, reminderDate: todayStr(), reminderTime: nowPlusOneMin() });
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)',
    borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
    fontFamily: 'var(--font-family)', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block',
  };

  return (
    <>
      {/* Panel */}
      <div style={{
        position: 'absolute', top: 'calc(100% + 12px)', right: 0,
        width: 420, maxHeight: '80vh', overflowY: 'auto',
        zIndex: 200,
        background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.12))',
          position: 'sticky', top: 0, zIndex: 10,
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            }}>
              <Bell size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Study Reminders</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{reminders.length} reminder{reminders.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => { setShowForm(!showForm); if (editingId) cancelEdit(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: showForm ? 'rgba(244,63,94,0.15)' : 'var(--gradient-primary)',
                border: showForm ? '1px solid rgba(244,63,94,0.3)' : 'none',
                color: showForm ? '#f43f5e' : 'white',
                cursor: 'pointer', fontFamily: 'var(--font-family)',
              }}>
              {showForm ? <><X size={13} />Cancel</> : <><Plus size={13} />New</>}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              {editingId ? '✏️ Edit Reminder' : '➕ New Reminder'}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}><Mail size={10} style={{ marginRight: 4 }} />Recipient Email</label>
              <input type="email" value={form.userEmail}
                onChange={e => handleChange('userEmail', e.target.value)}
                placeholder="recipient@gmail.com, @outlook.com, etc."
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
              />
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Subject</label>
              <input type="text" value={form.subject}
                onChange={e => handleChange('subject', e.target.value)}
                placeholder="e.g. Java Revision"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Reminder Message</label>
              <textarea value={form.reminderMessage}
                onChange={e => handleChange('reminderMessage', e.target.value)}
                placeholder="e.g. Complete Spring Boot chapter today."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                onFocus={e => e.target.style.borderColor = 'var(--primary-blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
              />
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}><Calendar size={10} style={{ marginRight: 4 }} />Date</label>
                <input type="date" value={form.reminderDate}
                  min={todayStr()}
                  onChange={e => handleChange('reminderDate', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
                />
              </div>
              <div>
                <label style={labelStyle}><Clock size={10} style={{ marginRight: 4 }} />Time</label>
                <input type="time" value={form.reminderTime}
                  onChange={e => handleChange('reminderTime', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
                />
              </div>
            </div>

            {/* Validation Error */}
            {formError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', borderRadius: 8, marginBottom: 10,
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                color: '#f43f5e', fontSize: 12,
              }}>
                <AlertCircle size={13} />{formError}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} disabled={savingForm}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px', borderRadius: 9, border: 'none', cursor: savingForm ? 'not-allowed' : 'pointer',
                  background: 'var(--gradient-primary)', color: 'white',
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-family)',
                  opacity: savingForm ? 0.7 : 1,
                }}>
                {savingForm ? <Loader size={14} className="spin" /> : <Save size={14} />}
                {editingId ? 'Update' : 'Save Reminder'}
              </button>
              {editingId && (
                <button onClick={cancelEdit}
                  style={{
                    padding: '9px 14px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)',
                    color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                  }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reminder List */}
        <div style={{ padding: '12px 16px' }}>
          {loadingFetch ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : reminders.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reminders.map(r => (
                <div key={r.id} style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${r.status === 'SENT' ? 'rgba(16,185,129,0.15)' : 'var(--border-glass)'}`,
                  transition: 'border-color 0.2s',
                }}>
                  {/* Row 1: subject + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', flex: 1, marginRight: 8, wordBreak: 'break-word' }}>
                      {r.subject}
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  {/* Row 2: email + date/time */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                      <Mail size={10} />{r.userEmail}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                      <Calendar size={10} />{r.reminderDate}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                      <Clock size={10} />{r.reminderTime ? r.reminderTime.slice(0, 5) : ''}
                    </span>
                  </div>

                  {/* Row 3: message preview */}
                  <p style={{
                    margin: '0 0 10px', fontSize: 12, color: 'var(--text-secondary)',
                    lineHeight: 1.5, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {r.reminderMessage}
                  </p>

                  {/* Row 4: actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleSendNow(r.id)} disabled={sendingId === r.id}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '7px', borderRadius: 8, border: 'none', cursor: sendingId === r.id ? 'not-allowed' : 'pointer',
                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white',
                        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-family)',
                        opacity: sendingId === r.id ? 0.7 : 1,
                      }}>
                      {sendingId === r.id ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={12} />}
                      Send Now
                    </button>
                    <button onClick={() => handleEdit(r)}
                      style={{
                        padding: '7px 12px', borderRadius: 8,
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                        color: '#3b82f6', cursor: 'pointer', fontSize: 12,
                      }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      style={{
                        padding: '7px 12px', borderRadius: 8,
                        background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                        color: '#f43f5e', cursor: 'pointer', fontSize: 12,
                      }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled auto-send notice */}
        <div style={{
          margin: '0 16px 16px', padding: '10px 14px', borderRadius: 10,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Clock size={13} color="#10b981" />
          <span style={{ fontSize: 11, color: '#6ee7b7', lineHeight: 1.4 }}>
            Auto-send checks every minute. Pending reminders are sent automatically when their time arrives.
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default ReminderPanel;
