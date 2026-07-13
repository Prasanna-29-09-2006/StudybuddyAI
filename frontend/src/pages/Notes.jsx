import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Save, BookOpen, Tag } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Economics', 'Other'];

const NoteModal = ({ note, onClose, onSave }) => {
  const [subject, setSubject] = useState(note?.subject || '');
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!subject || !title) return;
    setSaving(true);
    try {
      await onSave({ subject, title, content });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 580, padding: 32, animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{note?.id ? 'Edit Note' : 'New Note'}</h3>
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
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." className="glass-input" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note here..." rows={7}
              className="glass-input" style={{ width: '100%', resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="glass-btn glass-btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || !subject || !title} className="glass-btn" style={{ padding: '10px 20px' }}>
              <Save size={15} />{saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [modalNote, setModalNote] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchNotes = async () => {
    try {
      const params = {};
      if (filterSubject) params.subject = filterSubject;
      if (search) params.keyword = search;
      const r = await api.get('/notes', { params });
      setNotes(r.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [search, filterSubject]);

  const handleSave = async (noteData) => {
    if (modalNote?.id) {
      await api.put(`/notes/${modalNote.id}`, noteData);
    } else {
      await api.post('/notes', noteData);
    }
    setShowModal(false);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const subjectColors = { Mathematics: '#3b82f6', Physics: '#8b5cf6', Chemistry: '#10b981', Biology: '#f59e0b', 'Computer Science': '#ec4899', English: '#06b6d4', History: '#f43f5e', Economics: '#a855f7', Other: '#6b7280' };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>My Notes 📝</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{notes.length} notes stored</p>
        </div>
        <button onClick={() => { setModalNote(null); setShowModal(true); }} className="glass-btn">
          <Plus size={16} />Add Note
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="glass-input" style={{ width: '100%', paddingLeft: 38 }} />
        </div>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="glass-input" style={{ minWidth: 180, cursor: 'pointer' }}>
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No notes found. Create your first note!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {notes.map(note => (
            <div key={note.id} className="glass-card glass-card-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${subjectColors[note.subject] || '#6b7280'}18`, color: subjectColors[note.subject] || '#6b7280', border: `1px solid ${subjectColors[note.subject] || '#6b7280'}30`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  <Tag size={10} />{note.subject}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setModalNote(note); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-blue)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{note.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {note.content || 'No content'}
              </p>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 'auto' }}>
                {note.createdAt ? new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NoteModal note={modalNote} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
};

export default Notes;
