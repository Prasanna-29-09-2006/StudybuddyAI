import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell } from 'lucide-react';
import ReminderPanel from './ReminderPanel';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/notes': 'Notes',
  '/tasks': 'Tasks',
  '/planner': 'Study Planner',
  '/ai-assistant': 'AI Assistant',
  '/quiz': 'Quiz Generator',
  '/flashcards': 'Flashcards',
  '/summarizer': 'AI Summarizer',
  '/progress': 'Progress Tracker',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

const Navbar = ({ sidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || 'Study Buddy AI';
  const sidebarWidth = sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <header className="glass-navbar" style={{
      position: 'fixed',
      top: 0,
      left: sidebarWidth,
      right: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      transition: 'left var(--transition-normal)',
    }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{pageTitle}</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="glass-card" style={{
          padding: '8px', border: 'none', cursor: 'pointer', background: 'var(--bg-glass)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', transition: 'all var(--transition-fast)',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell + ReminderPanel */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="glass-card" style={{
            padding: '8px', border: 'none', cursor: 'pointer', background: 'var(--bg-glass)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'all var(--transition-fast)',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <Bell size={18} />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: '#f43f5e', borderRadius: '50%', border: '2px solid var(--bg-secondary)' }}></span>
          </button>

          {showNotifications && (
            <ReminderPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="User Avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'User'}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.course || 'Student'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
