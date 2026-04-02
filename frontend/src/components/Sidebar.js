import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/translations';

const villagerNav = [
  { path: '/dashboard',      icon: '🏠', key: 'dashboard' },
  { path: '/symptoms',       icon: '🩺', key: 'symptoms' },
  { path: '/health-records', icon: '📋', key: 'healthRecords' },
  { path: '/emergency',      icon: '🚨', key: 'emergency' },
  { path: '/hospitals',      icon: '🏥', key: 'hospitals' },
  { path: '/schemes',        icon: '📜', key: 'schemes' },
  { path: '/chatbot',        icon: '💬', key: 'chatbot' },
  { path: '/reports',        icon: '📄', key: 'reports' },
];

const ashaNav = [
  { path: '/asha',                icon: '🏠', key: 'dashboard' },
  { path: '/asha/register',       icon: '➕', key: 'register', label: 'Register Villager' },
  { path: '/asha/health-records', icon: '📋', key: 'healthRecords' },
  { path: '/asha/emergency',      icon: '🚨', key: 'emergency' },
];

export default function Sidebar({ lang = 'en', open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = user?.role === 'asha_worker' ? ashaNav : villagerNav;

  const handleNav = (path) => { navigate(path); onClose && onClose(); };
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {open && <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:99}} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,background:'linear-gradient(135deg,#2d6a4f,#40916c)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🌿</div>
            <div>
              <div style={{fontFamily:'var(--font-head)',fontWeight:800,fontSize:16,color:'var(--green-900)',lineHeight:1.2}}>The Saviour</div>
              <div style={{fontSize:10,color:'var(--text-light)',fontWeight:600}}>Rural Health AI</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{padding:'14px 16px',margin:'8px 12px',background:'var(--green-50)',borderRadius:'var(--radius-sm)',border:'1px solid var(--green-100)'}}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--green-900)'}}>{user?.name}</div>
          <div style={{fontSize:11,color:'var(--text-light)',marginTop:2}}>{user?.role === 'asha_worker' ? '🏥 ASHA Worker' : '🏡 ' + (user?.village || 'Village User')}</div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {nav.map(item => (
            <button key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{width:'100%',textAlign:'left',background:'none',border:'none',cursor:'pointer'}}
              onClick={() => handleNav(item.path)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label || t(lang, item.key)}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{padding:'16px 12px',borderTop:'1px solid var(--border)'}}>
          <button className="nav-item" onClick={handleLogout} style={{width:'100%',border:'none',background:'none',cursor:'pointer',color:'var(--red-500)'}}>
            <span className="nav-icon">🚪</span>
            <span>{t(lang, 'logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
