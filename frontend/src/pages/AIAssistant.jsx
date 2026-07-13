import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Trash2, Bot, User, Sparkles } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
      {!isUser && (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={18} color="white" />
        </div>
      )}
      <div style={{
        maxWidth: '72%', padding: '14px 18px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'var(--gradient-primary)' : 'var(--bg-glass)', backdropFilter: 'blur(12px)',
        border: isUser ? 'none' : '1px solid var(--border-glass)',
        color: isUser ? 'white' : 'var(--text-primary)',
        boxShadow: isUser ? '0 4px 14px rgba(59,130,246,0.3)' : 'var(--shadow-sm)',
        fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {message.content}
      </div>
      {isUser && (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={18} color="white" />
        </div>
      )}
    </div>
  );
};

const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Bot size={18} color="white" />
    </div>
    <div style={{ padding: '14px 18px', borderRadius: '18px 18px 18px 4px', background: 'var(--bg-glass)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-glass)' }}>
      <span className="typing-dots"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></span>
    </div>
  </div>
);

const AIAssistant = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const chatKey = `studybuddy_ai_chat_${userId}`;

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(chatKey);
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: '👋 Hi! I\'m Study Buddy AI, powered by Google Gemini. Ask me anything about your studies — explanations, concepts, problem-solving, or exam tips!' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Sync messages when user changes (e.g. logging out & logging in with another account)
  useEffect(() => {
    const saved = localStorage.getItem(chatKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: 'assistant', content: '👋 Hi! I\'m Study Buddy AI, powered by Google Gemini. Ask me anything about your studies — explanations, concepts, problem-solving, or exam tips!' }
      ]);
    }
  }, [chatKey]);

  useEffect(() => {
    localStorage.setItem(chatKey, JSON.stringify(messages));
  }, [messages, chatKey]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const r = await api.post('/ai/ask', { question: input });
      setMessages(prev => [...prev, { role: 'assistant', content: r.data.response || 'I could not generate a response. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Sorry, I encountered an error. Please check the backend and Gemini API key configuration.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const suggestions = ['Explain Newton\'s laws of motion', 'What is machine learning?', 'Summarize the French Revolution', 'Help me with quadratic equations'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>AI Study Assistant</h2>
            <div style={{ fontSize: 12, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />Powered by Gemini
            </div>
          </div>
        </div>
        <button onClick={() => {
          const defaultMsg = [{ role: 'assistant', content: '👋 Hi! I\'m Study Buddy AI. How can I help you today?' }];
          setMessages(defaultMsg);
          localStorage.setItem(chatKey, JSON.stringify(defaultMsg));
        }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, cursor: 'pointer', color: '#f43f5e', fontSize: 13, fontFamily: 'var(--font-family)', fontWeight: 500 }}>
          <Trash2 size={13} />Clear
        </button>
      </div>

      {/* Chat Window */}
      <div className="glass-card" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', minHeight: 0 }}>
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => { setInput(s); }} style={{ padding: '7px 14px', background: 'var(--bg-glass)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-glass)', borderRadius: 20, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-family)', transition: 'all var(--transition-fast)', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid var(--primary-blue)'; e.currentTarget.style.color = 'var(--primary-blue)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <Sparkles size={11} />{s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'flex-end', gap: 12, padding: '14px 16px', marginTop: 12 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything about your studies... (Enter to send)" rows={1}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-family)', resize: 'none', lineHeight: 1.6, maxHeight: 120, overflowY: 'auto' }} />
        <button onClick={sendMessage} disabled={!input.trim() || loading} className="glass-btn" style={{ padding: '10px 14px', borderRadius: 10, flexShrink: 0, opacity: !input.trim() || loading ? 0.5 : 1 }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
