import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const QuizGenerator = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const keySubject = `sb_quiz_subject_${userId}`;
  const keyDiff = `sb_quiz_diff_${userId}`;
  const keyNumq = `sb_quiz_numq_${userId}`;
  const keyData = `sb_quiz_data_${userId}`;
  const keyAnswers = `sb_quiz_answers_${userId}`;
  const keySubmitted = `sb_quiz_submitted_${userId}`;

  const [subject, setSubject] = useState(() => localStorage.getItem(keySubject) || '');
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem(keyDiff) || 'Medium');
  const [numQ, setNumQ] = useState(() => {
    const v = localStorage.getItem(keyNumq);
    return v ? parseInt(v) : 5;
  });
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(() => {
    const saved = localStorage.getItem(keyData);
    return saved ? JSON.parse(saved) : null;
  });
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(keyAnswers);
    return saved ? JSON.parse(saved) : {};
  });
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(keySubmitted) === 'true');
  const [error, setError] = useState('');

  // Sync state when switching accounts
  useEffect(() => {
    setSubject(localStorage.getItem(keySubject) || '');
    setDifficulty(localStorage.getItem(keyDiff) || 'Medium');
    
    const v = localStorage.getItem(keyNumq);
    setNumQ(v ? parseInt(v) : 5);

    const savedQuiz = localStorage.getItem(keyData);
    setQuiz(savedQuiz ? JSON.parse(savedQuiz) : null);

    const savedAnswers = localStorage.getItem(keyAnswers);
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});

    setSubmitted(localStorage.getItem(keySubmitted) === 'true');
    setError('');
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(keySubject, subject);
    localStorage.setItem(keyDiff, difficulty);
    localStorage.setItem(keyNumq, numQ.toString());
    localStorage.setItem(keySubmitted, submitted ? 'true' : 'false');
    localStorage.setItem(keyAnswers, JSON.stringify(answers));
    if (quiz) {
      localStorage.setItem(keyData, JSON.stringify(quiz));
    } else {
      localStorage.removeItem(keyData);
    }
  }, [subject, difficulty, numQ, quiz, answers, submitted, userId]);

  const generateQuiz = async () => {
    if (!subject.trim()) { setError('Please enter a subject.'); return; }
    setLoading(true); setError(''); setSubmitted(false); setAnswers({});
    try {
      const r = await api.post('/ai/quiz', { subject, difficulty, numQuestions: numQ });
      const parsed = Array.isArray(r.data) ? r.data : JSON.parse(r.data);
      if (!Array.isArray(parsed)) throw new Error('Invalid format');
      setQuiz(parsed);
    } catch {
      setError('Failed to generate quiz. Please try again with a different subject.');
      setQuiz(null);
    } finally { setLoading(false); }
  };

  const selectAnswer = (qIdx, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const score = quiz ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;

  const getOptionStyle = (qIdx, option) => {
    const selected = answers[qIdx] === option;
    const correct = quiz[qIdx]?.answer === option;
    if (!submitted) return { background: selected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected ? '#3b82f6' : 'var(--border-glass)'}`, color: selected ? '#60a5fa' : 'var(--text-secondary)' };
    if (correct) return { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' };
    if (selected && !correct) return { background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.4)', color: '#f87171' };
    return { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)' };
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
          <BrainCircuit size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>AI Quiz Generator 🎯</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generate intelligent quizzes on any subject</p>
        </div>
      </div>

      {/* Config Panel */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Subject / Topic</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Photosynthesis, Newton's Laws..." className="glass-input" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="glass-input" style={{ width: '100%', cursor: 'pointer' }}>
              {['Easy', 'Medium', 'Hard', 'Expert'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Questions: <strong style={{ color: 'var(--primary-blue)' }}>{numQ}</strong></label>
            <input type="range" min={3} max={15} value={numQ} onChange={e => setNumQ(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary-blue)', marginTop: 10 }} />
          </div>
        </div>
        {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <button onClick={generateQuiz} disabled={loading} className="glass-btn" style={{ padding: '12px 28px' }}>
          {loading ? <><span className="typing-dots"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span> Generating Quiz...</> : <><Play size={16} />Generate Quiz</>}
        </button>
      </div>

      {/* Quiz Display */}
      {quiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {submitted && (
            <div className="glass-card" style={{ padding: '20px 28px', background: score >= quiz.length * 0.7 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${score >= quiz.length * 0.7 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {score >= quiz.length * 0.7 ? '🎉' : '📚'} Score: {score}/{quiz.length} ({Math.round((score / quiz.length) * 100)}%)
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                  {score === quiz.length ? 'Perfect score! Excellent!' : score >= quiz.length * 0.7 ? 'Great job! Keep it up!' : 'Keep practicing to improve!'}
                </div>
              </div>
              <button onClick={() => { setQuiz(null); setAnswers({}); setSubmitted(false); }} className="glass-btn glass-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px' }}>
                <RotateCcw size={14} />New Quiz
              </button>
            </div>
          )}
          {quiz.map((q, qIdx) => (
            <div key={qIdx} className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className="glass-badge glass-badge-blue" style={{ marginTop: 2, flexShrink: 0 }}>Q{qIdx + 1}</span>
                {q.question}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options?.map((opt, oIdx) => (
                  <button key={oIdx} onClick={() => selectAnswer(qIdx, opt)} style={{ padding: '12px 16px', borderRadius: 10, cursor: submitted ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'var(--font-family)', fontSize: 14, transition: 'all var(--transition-fast)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...getOptionStyle(qIdx, opt) }}>
                    <span><strong style={{ marginRight: 8 }}>{String.fromCharCode(65 + oIdx)}.</strong>{opt}</span>
                    {submitted && (q.answer === opt ? <CheckCircle size={16} color="#10b981" /> : answers[qIdx] === opt ? <XCircle size={16} color="#f43f5e" /> : null)}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!submitted && (
            <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < quiz.length} className="glass-btn" style={{ alignSelf: 'flex-start', padding: '12px 28px', opacity: Object.keys(answers).length < quiz.length ? 0.5 : 1 }}>
              Submit Quiz ({Object.keys(answers).length}/{quiz.length} answered)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
