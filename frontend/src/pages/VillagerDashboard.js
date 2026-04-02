import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { icon: '🩺', label: 'Check Symptoms',   path: '/symptoms',       color: '#d8f3dc', border: '#b7e4c7' },
  { icon: '📋', label: 'Health Records',   path: '/health-records', color: '#e8f4fd', border: '#b3d9f7' },
  { icon: '🏥', label: 'Find Hospital',    path: '/hospitals',      color: '#fff3cd', border: '#fde68a' },
  { icon: '📜', label: 'Govt. Schemes',    path: '/schemes',        color: '#ede9fe', border: '#c4b5fd' },
  { icon: '💬', label: 'Health Chatbot',   path: '/chatbot',        color: '#fce7f3', border: '#fbcfe8' },
  { icon: '📄', label: 'Download Report',  path: '/reports',        color: '#d1fae5', border: '#a7f3d0' },
];

const TIPS = [
  { icon: '💧', tip: 'Drink 8 glasses of water daily' },
  { icon: '🥗', tip: 'Eat seasonal vegetables & fruits' },
  { icon: '🚶', tip: 'Walk 30 minutes every day' },
  { icon: '😴', tip: '7-8 hours of sleep for immunity' },
  { icon: '🧼', tip: 'Wash hands before every meal' },
  { icon: '🌿', tip: 'Turmeric & ginger boost immunity' },
  { icon: '👶', tip: 'Pregnant? Take iron supplements daily' },
];

export default function VillagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState(user?.language || 'en');
  const [tips, setTips]   = useState([]);
  const [tip, setTip]     = useState(null);

  useEffect(() => {
    const today = new Date().getDay();
    setTip(TIPS[today % TIPS.length]);
    // Optionally fetch tips from API
  }, []);

  return (
    <Layout lang={lang} setLang={setLang}>
      {/* Emergency Banner */}
      <div style={{ marginBottom: 28 }} className="animate-in">
        <button className="emergency-btn" onClick={() => navigate('/emergency')}>
          🚨 EMERGENCY ALERT — Press for Immediate Help
        </button>
      </div>

      {/* Welcome card */}
      <div className="card animate-in animate-delay-1" style={{ padding: 28, marginBottom: 24, background: 'linear-gradient(135deg,#1b4332,#2d6a4f)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Welcome back 👋</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26 }}>{user?.name}</h2>
            <div style={{ fontSize: 14, opacity: .85, marginTop: 6 }}>
              📍 {user?.village || 'Your Village'} • {user?.district || 'District'}
            </div>
          </div>
          <div style={{ fontSize: 56, opacity: .9 }}>🌱</div>
        </div>
        {tip && (
          <div style={{ marginTop: 20, background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>
            {tip.icon} <strong>Today's Tip:</strong> {tip.tip}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--text-dark)' }} className="animate-in animate-delay-2">
        Quick Actions
      </h3>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {QUICK_ACTIONS.map((a, i) => (
          <button key={a.path}
            className={`card animate-in animate-delay-${Math.min(i + 1, 3)}`}
            onClick={() => navigate(a.path)}
            style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', border: `1.5px solid ${a.border}`, background: a.color, transition: 'transform .18s', textAlign: 'center' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 36 }}>{a.icon}</div>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-dark)' }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Health Tips section */}
      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--text-dark)' }} className="animate-in">
        Daily Health Tips 🌿
      </h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }} className="animate-in animate-delay-1">
        {TIPS.map((t, i) => (
          <div key={i} className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ color: 'var(--text-mid)', fontWeight: 600 }}>{t.tip}</span>
          </div>
        ))}
      </div>

      {/* Info cards */}
      <div className="grid-2" style={{ marginTop: 28 }}>
        <div className="card animate-in" style={{ padding: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 8 }}>Your Health Records</h3>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 16 }}>View your complete medical history, vaccinations, and prescriptions</p>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/health-records')}>View Records →</button>
        </div>
        <div className="card animate-in animate-delay-1" style={{ padding: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📜</div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 8 }}>Government Schemes</h3>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 16 }}>Check eligibility for Ayushman Bharat, JSY and other healthcare schemes</p>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/schemes')}>Check Eligibility →</button>
        </div>
      </div>
    </Layout>
  );
}
