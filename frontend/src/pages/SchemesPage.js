import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const FALLBACK_SCHEMES = [
  { id:1, icon:'🏥', name:'Ayushman Bharat (PM-JAY)', description:'Free health coverage up to ₹5 lakh per year', benefits:'Cashless treatment at empanelled hospitals, 1500+ procedures covered', howToApply:'Visit nearest CSC or government hospital' },
  { id:2, icon:'👶', name:'Janani Suraksha Yojana', description:'Financial assistance for safe delivery', benefits:'₹1400 cash for rural, ₹1000 urban institutional delivery', howToApply:'Register with ASHA worker or ANM' },
  { id:3, icon:'🧒', name:'Rashtriya Bal Swasthya Karyakram', description:'Free health screening for children 0-18 years', benefits:'4D screening for defects, deficiencies, diseases', howToApply:'Available at schools and Anganwadi centers' },
  { id:4, icon:'🤱', name:'PM Surakshit Matritva Abhiyan', description:'Free antenatal care on 9th of every month', benefits:'Free checkups, medicines, and lab tests for pregnant women', howToApply:'Visit government health facility on 9th of each month' },
  { id:5, icon:'💊', name:'National Health Mission', description:'Comprehensive primary healthcare for rural populations', benefits:'Free medicines, diagnostics, and services', howToApply:'Available at all government health centers' },
];

export default function SchemesPage() {
  const { user }     = useAuth();
  const [schemes, setSchemes] = useState(FALLBACK_SCHEMES);
  const [loading, setLoading] = useState(false);
  const [lang, setLang]       = useState(user?.language || 'en');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/schemes');
        if (res.data.schemes?.length) setSchemes(res.data.schemes);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <Layout lang={lang} setLang={setLang} title="📜 Government Schemes">
      <div style={{ maxWidth: 800 }}>
        <div className="card animate-in" style={{ padding: 20, marginBottom: 24, background: 'linear-gradient(135deg,#1d6fa4,#2196f3)', color: '#fff', border: 'none' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏛️</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 20 }}>Government Healthcare Schemes</h2>
          <p style={{ fontSize: 14, opacity: .9, marginTop: 4 }}>Schemes you may be eligible for based on your profile. All services are free at government hospitals.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} /></div>
        ) : schemes.map((s, i) => (
          <div key={s.id || i} className="card animate-in" style={{ padding: 28, marginBottom: 16, animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 40, flexShrink: 0 }}>{s.icon || '📋'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 12 }}>{s.description}</div>

                <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 12, border: '1px solid var(--green-200)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--green-700)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Benefits</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dark)' }}>{s.benefits}</div>
                </div>

                <div style={{ background: 'var(--blue-50)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', border: '1px solid var(--blue-200)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue-700)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>How to Apply</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dark)' }}>{s.howToApply}</div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <span className="badge badge-green">✅ Eligible</span>
                  <span className="badge badge-blue">🆓 Free Service</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
