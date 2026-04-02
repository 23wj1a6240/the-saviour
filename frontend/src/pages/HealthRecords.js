import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function HealthRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lang, setLang] = useState(user?.language || 'en');
  const [form, setForm] = useState({ symptoms: '', diagnosis: '', prescription: '', temperature: '', bloodPressure: '', weight: '', height: '', doctorNotes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/health/${user.id}`);
      setRecords(res.data.records || []);
    } catch {
      // Demo: show empty
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/health', {
        ...form,
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
      });
      toast.success('Health record saved!');
      setShowForm(false);
      setForm({ symptoms: '', diagnosis: '', prescription: '', temperature: '', bloodPressure: '', weight: '', height: '', doctorNotes: '' });
      fetchRecords();
    } catch {
      toast.error('Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout lang={lang} setLang={setLang} title="📋 Health Records">
      <div style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 22 }}>Your Medical History</h2>
            <p style={{ color: 'var(--text-light)', fontSize: 14, marginTop: 4 }}>Encrypted and secure health records</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Record'}
          </button>
        </div>

        {/* Add record form */}
        {showForm && (
          <div className="card animate-in" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 20 }}>New Health Record</h3>
            <form onSubmit={saveRecord}>
              <div className="form-group">
                <label className="form-label">🤒 Symptoms (comma separated)</label>
                <input className="form-input" placeholder="e.g. Fever, Cough, Headache" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">🔬 Diagnosis</label>
                <input className="form-input" placeholder="Diagnosed condition" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">💊 Prescription</label>
                <textarea className="form-input" rows={2} placeholder="Medicines prescribed" value={form.prescription} onChange={e => setForm({ ...form, prescription: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">🌡 Temperature (°F)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="98.6" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">❤️ Blood Pressure</label>
                  <input className="form-input" placeholder="120/80" value={form.bloodPressure} onChange={e => setForm({ ...form, bloodPressure: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">⚖️ Weight (kg)</label>
                  <input className="form-input" type="number" placeholder="60" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">📏 Height (cm)</label>
                  <input className="form-input" type="number" placeholder="165" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">📝 Doctor Notes</label>
                <textarea className="form-input" rows={2} placeholder="Additional notes" value={form.doctorNotes} onChange={e => setForm({ ...form, doctorNotes: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Record'}
              </button>
            </form>
          </div>
        )}

        {/* Records list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
        ) : records.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>No Health Records Yet</h3>
            <p style={{ marginTop: 8, fontSize: 14 }}>Start adding your health records by clicking "Add Record" above.</p>
          </div>
        ) : records.map((r, i) => (
          <div key={r._id || i} className="card animate-in" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>{r.diagnosis || 'General Checkup'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                  📅 {new Date(r.visitDate || r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <span className="badge badge-green">🔐 Encrypted</span>
            </div>
            {r.symptoms?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Symptoms</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {r.symptoms.map((s, j) => <span key={j} className="badge badge-amber">{s}</span>)}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, fontSize: 13, color: 'var(--text-mid)' }}>
              {r.temperature && <span>🌡 {r.temperature}°F</span>}
              {r.bloodPressure && <span>❤️ {r.bloodPressure} mmHg</span>}
              {r.weight && <span>⚖️ {r.weight} kg</span>}
              {r.height && <span>📏 {r.height} cm</span>}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
