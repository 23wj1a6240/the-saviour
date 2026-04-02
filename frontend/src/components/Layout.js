import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../utils/translations';

export default function Layout({ children, lang, setLang, title }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '☀️ Good Morning' : hour < 17 ? '🌤 Good Afternoon' : '🌙 Good Evening';

  return (
    <div className="page-bg" style={{ display: 'flex' }}>
      <Sidebar lang={lang} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content" style={{ flex: 1 }}>
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ display: 'none', border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}
              className="menu-btn">☰</button>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color: 'var(--text-dark)' }}>
                {title || greeting + ', ' + (user?.name?.split(' ')[0] || 'Friend')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Language selector */}
            {setLang && (
              <select
                className="form-input form-select"
                value={lang}
                onChange={e => setLang(e.target.value)}
                style={{ width: 'auto', padding: '8px 32px 8px 12px', fontSize: 13 }}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native}</option>)}
              </select>
            )}

            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#2d6a4f,#40916c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="page-content">{children}</div>
      </div>

      <style>{`
        @media (max-width: 768px) { .menu-btn { display: block !important; } }
      `}</style>
    </div>
  );
}
