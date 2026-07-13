import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: 'rgba(19,21,32,0.9)', titleColor: '#f3f4f6', bodyColor: '#9ca3af', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7280', font: { family: 'Outfit' } } },
    x: { grid: { display: false }, ticks: { color: '#6b7280', font: { family: 'Outfit' } } },
  },
};

const Progress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60 }}>Loading progress data...</div>;

  const labels = data?.weeklyHours?.map(d => d.day) || [];
  const hoursData = data?.weeklyHours?.map(d => d.hours) || [];
  const total = data?.completedTasks + data?.pendingTasks || 1;

  const barData = { labels, datasets: [{ label: 'Study Hours', data: hoursData, backgroundColor: 'rgba(59,130,246,0.4)', borderColor: '#3b82f6', borderWidth: 2, borderRadius: 8, borderSkipped: false }] };

  const lineData = {
    labels,
    datasets: [{
      label: 'Study Hours Trend',
      data: hoursData,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#8b5cf6',
      pointRadius: 5,
    }],
  };

  const donutData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [data?.completedTasks || 0, data?.pendingTasks || 0],
      backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)'],
      borderColor: ['#10b981', '#f59e0b'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const donutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: 'Outfit', size: 12 }, boxWidth: 12, padding: 16 } },
      tooltip: { backgroundColor: 'rgba(19,21,32,0.9)', titleColor: '#f3f4f6', bodyColor: '#9ca3af', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
    },
  };

  const statItems = [
    { label: 'Total Notes', value: data?.totalNotes || 0, color: '#3b82f6', icon: '📝' },
    { label: 'Completed Tasks', value: data?.completedTasks || 0, color: '#10b981', icon: '✅' },
    { label: 'Weekly Study Hours', value: `${(data?.totalWeeklyHours || 0).toFixed(1)}h`, color: '#8b5cf6', icon: '⏱️' },
    { label: 'Study Plans', value: data?.totalPlans || 0, color: '#f59e0b', icon: '📅' },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>
          <TrendingUp size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Progress Tracker 📈</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Visualize your learning journey</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statItems.map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '20px 24px', display: 'flex', align: 'center', gap: 16 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>📊 Weekly Study Hours (Bar)</h3>
          <div style={{ height: 220 }}><Bar data={barData} options={chartOpts} /></div>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>📉 Study Trend (Line)</h3>
          <div style={{ height: 220 }}><Line data={lineData} options={chartOpts} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>🎯 Task Distribution</h3>
          <div style={{ height: 220 }}><Doughnut data={donutData} options={donutOpts} /></div>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>📅 Weekly Activity Log</h3>
          {labels.map((day, i) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 40, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{day}</div>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${hoursData[i] > 0 ? Math.min((hoursData[i] / Math.max(...hoursData, 1)) * 100, 100) : 0}%`, background: 'var(--gradient-primary)', borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ width: 50, fontSize: 13, color: 'var(--text-primary)', textAlign: 'right', fontWeight: 600 }}>{hoursData[i].toFixed(1)}h</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;
