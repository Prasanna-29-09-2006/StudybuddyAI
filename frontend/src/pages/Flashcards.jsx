import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Shuffle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const Flashcards = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const keyContent = `sb_fc_content_${userId}`;
  const keyData = `sb_fc_data_${userId}`;
  const keyIdx = `sb_fc_idx_${userId}`;

  const [content, setContent] = useState(() => localStorage.getItem(keyContent) || '');
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(keyData);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(() => {
    const saved = localStorage.getItem(keyIdx);
    return saved ? parseInt(saved) : 0;
  });
  const [flipped, setFlipped] = useState(false);

  // Sync state when switching accounts
  useEffect(() => {
    setContent(localStorage.getItem(keyContent) || '');
    
    const savedCards = localStorage.getItem(keyData);
    setCards(savedCards ? JSON.parse(savedCards) : []);

    const savedIdx = localStorage.getItem(keyIdx);
    setCurrentIdx(savedIdx ? parseInt(savedIdx) : 0);
    
    setFlipped(false);
    setError('');
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(keyContent, content);
    localStorage.setItem(keyIdx, currentIdx.toString());
    localStorage.setItem(keyData, JSON.stringify(cards));
  }, [content, currentIdx, cards, userId]);

  const generate = async () => {
    if (!content.trim()) { setError('Please paste your notes content.'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/ai/flashcards', { content });
      const parsed = Array.isArray(r.data) ? r.data : JSON.parse(r.data);
      if (!Array.isArray(parsed)) throw new Error();
      setCards(parsed); setCurrentIdx(0); setFlipped(false);
    } catch {
      setError('Failed to generate flashcards. Please try with more detailed content.');
    } finally { setLoading(false); }
  };

  const shuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled); setCurrentIdx(0); setFlipped(false);
  };

  const prev = () => { setCurrentIdx(i => Math.max(0, i - 1)); setFlipped(false); };
  const next = () => { setCurrentIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' }}>
          <CreditCard size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>AI Flashcards 🃏</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generate flashcards from your notes</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="glass-card" style={{ padding: 32 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>Paste Your Notes / Study Material</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Paste your notes here. Study Buddy AI will generate interactive flashcards to help you memorize key concepts..." rows={10} className="glass-input" style={{ width: '100%', resize: 'vertical', lineHeight: 1.7, marginBottom: 16 }} />
          {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button onClick={generate} disabled={loading} className="glass-btn" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' }}>
            {loading ? <><span className="typing-dots"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span> Generating Flashcards...</> : <><CreditCard size={16} />Generate Flashcards</>}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'stretch', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 8 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Card <strong style={{ color: 'var(--text-primary)' }}>{currentIdx + 1}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{cards.length}</strong></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={shuffle} className="glass-btn glass-btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}><Shuffle size={14} />Shuffle</button>
              <button onClick={() => { setCards([]); setContent(''); setFlipped(false); }} className="glass-btn glass-btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}><RotateCcw size={14} />Reset</button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 4, background: 'var(--border-glass)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentIdx + 1) / cards.length) * 100}%`, background: 'var(--gradient-secondary)', transition: 'width var(--transition-normal)', borderRadius: 2 }} />
          </div>

          {/* Flip Card */}
          <div onClick={() => setFlipped(!flipped)} style={{ width: '100%', maxWidth: 600, minHeight: 280, cursor: 'pointer', perspective: '1000px', position: 'relative' }}>
            <div style={{
              position: 'relative', width: '100%', height: '100%', minHeight: 280,
              transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              {/* Front - Question */}
              <div className="glass-card" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', textAlign: 'center', minHeight: 280 }}>
                <div className="glass-badge glass-badge-blue" style={{ marginBottom: 20 }}>❓ Question</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>{cards[currentIdx]?.question}</div>
                <div style={{ marginTop: 28, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  Click to reveal answer ↓
                </div>
              </div>
              {/* Back - Answer */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.12))', backdropFilter: 'blur(16px)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', minHeight: 280 }}>
                <div className="glass-badge glass-badge-purple" style={{ marginBottom: 20 }}>💡 Answer</div>
                <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.7 }}>{cards[currentIdx]?.answer}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={prev} disabled={currentIdx === 0} className="glass-btn glass-btn-secondary" style={{ padding: '10px 20px', opacity: currentIdx === 0 ? 0.4 : 1 }}><ChevronLeft size={18} />Prev</button>
            <button onClick={next} disabled={currentIdx === cards.length - 1} className="glass-btn" style={{ padding: '10px 20px', opacity: currentIdx === cards.length - 1 ? 0.4 : 1 }}>Next<ChevronRight size={18} /></button>
          </div>

          {/* Cards mini list */}
          <div style={{ width: '100%', display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {cards.map((_, i) => (
              <button key={i} onClick={() => { setCurrentIdx(i); setFlipped(false); }} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-family)', fontWeight: 600, transition: 'all var(--transition-fast)', background: i === currentIdx ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)', color: i === currentIdx ? 'white' : 'var(--text-muted)' }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
