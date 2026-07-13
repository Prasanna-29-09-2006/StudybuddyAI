import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FileText, CheckSquare, Clock, Calendar, Bot, TrendingUp, BookOpen, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className="glass-card glass-card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'default' }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: gradient || 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 18px ${color || 'rgba(59,130,246,0.35)'}` }}>
      <Icon size={24} color="white" />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const completionRate = data ? Math.round(((data.completedTasks || 0) / Math.max(data.totalTasks || 1, 1)) * 100) : 0;

  const chartData = {
    labels: data?.weeklyHours?.map(d => d.day) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Hours',
      data: data?.weeklyHours?.map(d => d.hours) || [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(59,130,246,0.35)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(19,21,32,0.9)', titleColor: '#f3f4f6', bodyColor: '#9ca3af', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', font: { family: 'Outfit' } } },
      x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { family: 'Outfit' } } },
    },
  };

  const activityIcons = { note: '📝', task: '✅', plan: '📅' };

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 28, background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {loading ? 'Loading your data...' : (data?.quote || 'Keep pushing your limits — greatness is just ahead!')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="glass-badge glass-badge-blue">🔥 Keep it up!</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        <StatCard icon={FileText} label="Total Notes" value={data?.totalNotes} gradient="linear-gradient(135deg,#3b82f6,#2563eb)" color="rgba(59,130,246,0.4)" />
        <StatCard icon={CheckSquare} label="Completed Tasks" value={data?.completedTasks} gradient="linear-gradient(135deg,#10b981,#059669)" color="rgba(16,185,129,0.4)" />
        <StatCard icon={Clock} label="Pending Tasks" value={data?.pendingTasks} gradient="linear-gradient(135deg,#f59e0b,#d97706)" color="rgba(245,158,11,0.4)" />
        <StatCard icon={Calendar} label="Study Plans" value={data?.totalPlans} gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" color="rgba(139,92,246,0.4)" />
        <StatCard icon={TrendingUp} label="Weekly Hours" value={`${data?.totalWeeklyHours ?? 0}h`} gradient="linear-gradient(135deg,#ec4899,#db2777)" color="rgba(236,72,153,0.4)" />
        <StatCard icon={Zap} label="Total Tasks" value={data?.totalTasks} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" color="rgba(6,182,212,0.4)" />
      </div>

      {/* Charts + Progress Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Bar Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>📊 Weekly Study Hours</h3>
          <div style={{ height: 220 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        {/* Progress Ring */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', alignSelf: 'flex-start' }}>🎯 Task Completion</h3>
          <ProgressRing radius={72} stroke={10} progress={completionRate} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
            {data?.completedTasks || 0} of {data?.totalTasks || 0} tasks completed
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>🕐 Recent Activity</h3>
        {!data?.recentActivities?.length ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No recent activity. Start adding notes or tasks!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recentActivities.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: 20 }}>{activityIcons[act.type] || '📌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{act.description}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{act.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
