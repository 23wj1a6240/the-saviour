import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const STAT_CARDS = [
  { icon: '👥', label: 'Registered Villagers', key: 'totalVillagers', color: '#d8f3dc', border: '#b7e4c7', iconBg: '#40916c' },
  { icon: '📋', label: 'Health Records',       key: 'totalRecords',   color: '#e8f4fd', border: '#b3d9f7', iconBg: '#2196f3' },
  { icon: '💉', label: 'Vaccinations Done',    key: 'vaccinationsDone', color: '#ede9fe', border: '#c4b5fd', iconBg: '#7c3aed' },
  { icon: '🚨', label: 'Active Emergencies',   key: 'activeEmergencies', color: '#fee2e2', border: '#fca5a5', iconBg: '#ef4444' },
];

export default function AshaWorkerDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [lang, setLang]     = useState(user?.language || 'en');
  const [stats, setStats]   = useState({ totalVillagers: 0, totalRecords: 0, vaccinationsDone: 0, activeEmergencies: 0 });
  const [villagers, setVillagers]     = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, villagersRes, emergencyRes] = await Promise.allSettled([
        api.get('/asha/stats'),
        api.get('/asha/my-villagers'),
        api.get('/emergency/active'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats || {});
      if (villagersRes.status === 'fulfilled') setVillagers(villagersRes.value.data.villagers || []);
      if (emergencyRes.status === 'fulfilled') setEmergencies(emergencyRes.value.data.emergencies || []);
    } catch {}
    setLoading(false);
  };

  const resolveEmergency = async (id) => {
    try {
      await api.put(`/emergency/${id}/resolve`);
      setEmergencies(prev => prev.filter(e => e._id !== id));
    } catch {}
  };

  // Chart data
  const diseaseData = {
    labels: Object.keys(stats.diseaseDist || { Malaria: 12, Fever: 18, Dengue: 8, Typhoid: 5, Cold: 22 }),
    datasets: [{
      label: 'Cases',
      data: Object.values(stats.diseaseDist || { Malaria: 12, Fever: 18, Dengue: 8, Typhoid: 5, Cold: 22 }),
      backgroundColor: ['#40916c','#52b788','#74c69d','#95d5b2','#b7e4c7'],
      borderRadius: 6,
    }]
  };

  const ageGroupData = {
    labels: ['0-18', '19-40', '41-60', '60+'],
    datasets: [{
      data: [28, 35, 22, 15],
      backgroundColor: ['#2196f3','#40916c','#f59e0b','#ef4444'],
      borderWidth: 0,
    }]
  };

  const vaccinationData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [stats.vaccinationStats?.completed || 68, stats.vaccinationStats?.pending || 32],
      backgroundColor: ['#40916c', '#e5e7eb'],
      borderWidth: 0,
    }]
  };

  const chartOpts = { responsive: true, plugins: { legend: { position: 'bottom' } } };

  return (
    <Layout lang={lang} setLang={setLang}>
      {/* Welcome banner */}
      <div className="card animate-in" style={{ padding: 28, marginBottom: 28, background: 'linear-gradient(135deg,#1b4332,#2d6a4f)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: .8 }}>ASHA Worker Dashboard</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26, marginTop: 4 }}>Welcome, {user?.name} 🌿</h2>
            <div style={{ opacity: .85, fontSize: 14, marginTop: 6 }}>📍 {user?.village || 'Village'} • {user?.district || 'District'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 42 }}>👩‍⚕️</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>ASHA Worker</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn" onClick={() => navigate('/asha/register')} style={{ background: 'rgba(255,255,255,.2)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            ➕ Register Villager
          </button>
          <button className="btn" onClick={() => navigate('/asha/health-records')} style={{ background: 'rgba(255,255,255,.2)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            📋 Health Records
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {STAT_CARDS.map((c, i) => (
          <div key={c.key} className={`stat-card animate-in animate-delay-${i + 1}`} style={{ background: c.color, border: `1px solid ${c.border}` }}>
            <div className="stat-icon" style={{ background: c.iconBg, color: '#fff' }}>{c.icon}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 28, color: 'var(--text-dark)' }}>
              {loading ? '—' : (stats[c.key] ?? 0)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {/* Disease distribution */}
        <div className="card animate-in" style={{ padding: 24, gridColumn: 'span 1' }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🦠 Disease Distribution</h3>
          <Bar data={diseaseData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } }} />
        </div>

        {/* Age groups */}
        <div className="card animate-in animate-delay-1" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>👥 Patient Age Groups</h3>
          <Pie data={ageGroupData} options={chartOpts} />
        </div>

        {/* Vaccination progress */}
        <div className="card animate-in animate-delay-2" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>💉 Vaccination Progress</h3>
          <Doughnut data={vaccinationData} options={chartOpts} />
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-light)' }}>
            {stats.vaccinationStats?.completed || 68}% completed this month
          </div>
        </div>
      </div>

      {/* Active emergencies */}
      {emergencies.length > 0 && (
        <div className="card animate-in" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--red-500)' }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: 'var(--red-500)', marginBottom: 16 }}>
            🚨 Active Emergencies ({emergencies.length})
          </h3>
          {emergencies.map(em => (
            <div key={em._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--red-100)', borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{em.userId?.name || 'Unknown'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                  📍 {em.userId?.village || '—'} • 🕐 {new Date(em.createdAt).toLocaleTimeString()}
                </div>
                {em.description && <div style={{ fontSize: 12, color: '#991b1b', marginTop: 4 }}>{em.description}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:${em.userId?.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>📞 Call</a>
                <button className="btn btn-primary btn-sm" onClick={() => resolveEmergency(em._id)}>✅ Resolve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registered villagers */}
      <div className="card animate-in" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>👥 My Registered Villagers</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/asha/register')}>➕ Register New</button>
        </div>
        {villagers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-light)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <p>No villagers registered yet. Click "Register New" to add villagers.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th><th>Phone</th><th>Age</th><th>Village</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {villagers.slice(0, 10).map(v => (
                  <tr key={v._id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.phone}</td>
                    <td>{v.age || '—'}</td>
                    <td>{v.village || '—'}</td>
                    <td>
                      <a href={`tel:${v.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', marginRight: 6 }}>📞</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
