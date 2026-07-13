import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AnimatedBackground from './components/AnimatedBackground';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import StudyPlanner from './pages/StudyPlanner';
import AIAssistant from './pages/AIAssistant';
import QuizGenerator from './pages/QuizGenerator';
import Flashcards from './pages/Flashcards';
import AISummarizer from './pages/AISummarizer';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './styles/index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)', gap: 12, fontSize: 15 }}>
      <span className="typing-dots"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span>
      Loading...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <div className="app-container">
      <AnimatedBackground />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-content" style={{ marginLeft: sidebarWidth, transition: 'margin-left var(--transition-normal)' }}>
        <Navbar sidebarCollapsed={collapsed} />
        <div className="page-workspace" style={{ marginTop: 'var(--navbar-height)' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/planner" element={<StudyPlanner />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/quiz" element={<QuizGenerator />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/summarizer" element={<AISummarizer />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
