import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save, Calendar, Clock } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Economics', 'Other'];

const PlanModal = ({ plan, onClose, onSave }) => {
  const [subject, setSubject] = useState(plan?.subject || '');
  const [studyDate, setStudyDate] = useState(plan?.studyDate || '');
  const [duration, setDuration] = useState(plan?.duration || 60);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!subject || !studyDate || !duration) return;
    setSaving(true);
    try { await onSave({ subject, studyDate, duration: parseInt(duration) }); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 32, animation: 'fadeIn 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{plan?.id ? 'Edit Plan' : 'New Study Plan'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="glass-input" style={{ width: '100%', cursor: 'pointer' }}>
              <option value="">Select Subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Study Date</label>
            <input type="date" value={studyDate} onChange={e => setStudyDate(e.target.value)} className="glass-input" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Duration: <strong style={{ color: 'var(--primary-blue)' }}>{duration} min ({(duration / 60).toFixed(1)}h)</strong></label>
            <input type="range" min={15} max={480} step={15} value={duration} onChange={e => setDuration(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary-blue)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              <span>15 min</span><span>8 hours</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} className="glass-btn glass-btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || !subject || !studyDate} className="glass-btn" style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' }}>
              <Save size={15} />{saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPlan, setModalPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPlans = async () => {
    try {
      const r = await api.get('/studyplans');
      setPlans(r.data.sort((a, b) => new Date(a.studyDate) - new Date(b.studyDate)));
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = async (planData) => {
    if (modalPlan?.id) {
      await api.put(`/studyplans/${modalPlan.id}`, planData);
    } else {
      await api.post('/studyplans', planData);
    }
    setShowModal(false);
    fetchPlans();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study plan?')) return;
    await api.delete(`/studyplans/${id}`);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  // Group by date for calendar view
  const grouped = plans.reduce((acc, plan) => {
    const date = plan.studyDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(plan);
    return acc;
  }, {});

  const subjectColors = { Mathematics: '#3b82f6', Physics: '#8b5cf6', Chemistry: '#10b981', Biology: '#f59e0b', 'Computer Science': '#ec4899', English: '#06b6d4', History: '#f43f5e', Economics: '#a855f7', Other: '#6b7280' };

  const totalHours = plans.reduce((sum, p) => sum + (p.duration || 0), 0) / 60;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Study Planner 📅</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{plans.length} plans · {totalHours.toFixed(1)} total hours</p>
        </div>
        <button onClick={() => { setModalPlan(null); setShowModal(true); }} className="glass-btn" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' }}>
          <Plus size={16} />Add Plan
        </button>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>Loading plans...</p> : (
        Object.keys(grouped).length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No study plans yet. Schedule your first session!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(grouped).map(([date, dayPlans]) => {
              const isToday = date === new Date().toISOString().split('T')[0];
              const isPast = new Date(date) < new Date(new Date().toDateString());
              return (
                <div key={date}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: isToday ? 'var(--gradient-primary)' : isPast ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? 'white' : 'var(--text-primary)' }}>{new Date(date + 'T00:00:00').getDate()}</div>
                      <div style={{ fontSize: 9, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{new Date(date + 'T00:00:00').toLocaleString('en-US', { month: 'short' })}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        {isToday && <span className="glass-badge glass-badge-blue" style={{ marginLeft: 10 }}>Today</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dayPlans.reduce((s, p) => s + p.duration, 0)} min total</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 60 }}>
                    {dayPlans.map(plan => (
                      <div key={plan.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `3px solid ${subjectColors[plan.subject] || '#6b7280'}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{plan.subject}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <Clock size={11} />{plan.duration} min ({(plan.duration / 60).toFixed(1)}h)
                          </div>
                        </div>
                        <button onClick={() => { setModalPlan(plan); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-blue)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(plan.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }} onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
      {showModal && <PlanModal plan={modalPlan} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
};

export default StudyPlanner;
