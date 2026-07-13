import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Save, CheckSquare, Clock, AlertCircle } from 'lucide-react';

const TaskModal = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'Pending');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);
    try { await onSave({ title, description, status, dueDate: dueDate || null }); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: 32, animation: 'fadeIn 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{task?.id ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Task Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter task title..." className="glass-input" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." rows={4} className="glass-input" style={{ width: '100%', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="glass-input" style={{ width: '100%', cursor: 'pointer' }}>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="glass-input" style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} className="glass-btn glass-btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || !title} className="glass-btn" style={{ padding: '10px 20px' }}>
              <Save size={15} />{saving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalTask, setModalTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.keyword = search;
      const r = await api.get('/tasks', { params });
      setTasks(r.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [search, filterStatus]);

  const handleSave = async (taskData) => {
    if (modalTask?.id) {
      await api.put(`/tasks/${modalTask.id}`, taskData);
    } else {
      await api.post('/tasks', taskData);
    }
    setShowModal(false);
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const isOverdue = (task) => task.dueDate && task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Task Manager ✅</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            {tasks.filter(t => t.status === 'Completed').length} / {tasks.length} tasks completed
          </p>
        </div>
        <button onClick={() => { setModalTask(null); setShowModal(true); }} className="glass-btn"><Plus size={16} />Add Task</button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="glass-input" style={{ width: '100%', paddingLeft: 38 }} />
        </div>
        {['', 'Pending', 'Completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 14, fontWeight: 500, transition: 'all var(--transition-fast)', background: filterStatus === s ? 'var(--gradient-primary)' : 'var(--bg-glass)', backdropFilter: 'blur(12px)', color: filterStatus === s ? 'white' : 'var(--text-secondary)' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <CheckSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No tasks found. Add your first task!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map(task => (
            <div key={task.id} className="glass-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, opacity: task.status === 'Completed' ? 0.7 : 1, transition: 'all var(--transition-fast)' }}>
              {/* Checkbox */}
              <button onClick={() => toggleComplete(task)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.status === 'Completed' ? '#10b981' : 'var(--text-muted)'}`, background: task.status === 'Completed' ? '#10b981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition-fast)' }}>
                {task.status === 'Completed' && <CheckSquare size={12} color="white" />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', marginBottom: 4 }}>{task.title}</div>
                {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {task.dueDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isOverdue(task) ? '#f43f5e' : 'var(--text-muted)' }}>
                    {isOverdue(task) ? <AlertCircle size={12} /> : <Clock size={12} />}
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                <span className={`glass-badge ${task.status === 'Completed' ? 'glass-badge-emerald' : 'glass-badge-amber'}`}>
                  {task.status}
                </span>
                <button onClick={() => { setModalTask(task); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-blue)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }} onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <TaskModal task={modalTask} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
};

export default Tasks;
