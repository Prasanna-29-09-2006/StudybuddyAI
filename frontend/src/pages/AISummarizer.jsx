import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, List, BookOpen, Tag, RotateCcw } from 'lucide-react';

const AISummarizer = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const keyContent = `sb_sum_content_${userId}`;
  const keyResult = `sb_sum_result_${userId}`;

  const [content, setContent] = useState(() => localStorage.getItem(keyContent) || '');
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem(keyResult);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state when switching accounts
  useEffect(() => {
    setContent(localStorage.getItem(keyContent) || '');
    
    const savedResult = localStorage.getItem(keyResult);
    setResult(savedResult ? JSON.parse(savedResult) : null);
    
    setError('');
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(keyContent, content);
    if (result) {
      localStorage.setItem(keyResult, JSON.stringify(result));
    } else {
      localStorage.removeItem(keyResult);
    }
  }, [content, result, userId]);

  const summarize = async () => {
    if (content.trim().length < 50) { setError('Please paste at least 50 characters of content.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await api.post('/ai/summarize', { content });
      const parsed = (r.data && typeof r.data === 'object') ? r.data : JSON.parse(r.data);
      setResult(parsed);
    } catch {
      setError('Failed to summarize. Please try with different content or check Gemini API configuration.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#ec4899,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(236,72,153,0.4)' }}>
          <Sparkles size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>AI Summarizer ✨</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Transform long notes into concise summaries</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Input */}
        <div className="glass-card" style={{ padding: 28 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>📄 Paste Your Notes Here</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Paste your lengthy notes, textbook paragraphs, or any study material here. The AI will summarize it, extract key points, and identify important definitions..." rows={14} className="glass-input" style={{ width: '100%', resize: 'vertical', lineHeight: 1.7, marginBottom: 16 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{content.length} characters</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {result && <button onClick={() => { setResult(null); setContent(''); }} className="glass-btn glass-btn-secondary" style={{ padding: '10px 16px', fontSize: 13 }}><RotateCcw size={13} />Clear</button>}
              <button onClick={summarize} disabled={loading || content.length < 50} className="glass-btn" style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#ec4899,#db2777)', boxShadow: '0 4px 14px rgba(236,72,153,0.4)', opacity: content.length < 50 ? 0.6 : 1 }}>
                {loading ? <><span className="typing-dots"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span> Summarizing...</> : <><Sparkles size={15} />Summarize</>}
              </button>
            </div>
          </div>
          {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', marginTop: 12, fontSize: 13 }}>{error}</div>}
        </div>

        {/* Output */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Summary */}
            <div className="glass-card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236,72,153,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(236,72,153,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <BookOpen size={18} color="#ec4899" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Summary</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14 }}>{result.summary}</p>
            </div>

            {/* Key Points */}
            {result.keyPoints?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <List size={18} color="#3b82f6" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Key Points</h3>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.keyPoints.map((point, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Definitions */}
            {result.definitions?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Tag size={18} color="#8b5cf6" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Important Definitions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.definitions.map((def, i) => (
                    <div key={i} style={{ padding: '14px 16px', background: 'rgba(139,92,246,0.07)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.15)' }}>
                      <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: 13, marginBottom: 6 }}>📌 {def.term}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{def.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummarizer;
