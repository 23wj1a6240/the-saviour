import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AshaRegisterVillager() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [lang, setLang]     = useState(user?.language || 'en');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [form, setForm]       = useState({
    name: '', phone: '', age: '', gender: '',
    village: user?.village || '', district: user?.district || '',
    income: '', medicalHistory: ''
  });

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/asha/register-villager', form);
      setSuccess(res.data);
      toast.success('Villager registered successfully!');
      setForm({ name: '', phone: '', age: '', gender: '', village: user?.village || '', district: user?.district || '', income: '', medicalHistory: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout lang={lang} setLang={setLang} title="➕ Register Villager">
      <div style={{ maxWidth: 600 }}>
        {/* Header */}
        <div className="card animate-in" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg,#1b4332,#40916c)', color: '#fff', border: 'none' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22 }}>Register a Villager</h2>
          <p style={{ opacity: .85, fontSize: 14, marginTop: 4 }}>Register villagers who don't have smartphones. Default password will be their phone number.</p>
        </div>

        {success && (
          <div className="animate-in" style={{ padding: 20, background: 'var(--green-50)', border: '2px solid var(--green-500)', borderRadius: 'var(--radius-md)', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color: 'var(--green-700)' }}>Registered Successfully!</div>
            <div style={{ fontSize: 14, color: 'var(--text-mid)', marginTop: 6 }}>
              {success.villager?.name} has been added to your care.<br/>
              Default login password: their phone number
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/asha')}>← Back to Dashboard</button>
          </div>
        )}

        <div className="card animate-in animate-delay-1" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">👤 Full Name *</label>
              <input className="form-input" placeholder="Villager's full name" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">📱 Phone Number *</label>
              <input className="form-input" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">🎂 Age</label>
                <input className="form-input" type="number" placeholder="Age in years" value={form.age} onChange={set('age')} />
              </div>
              <div className="form-group">
                <label className="form-label">⚧ Gender</label>
                <select className="form-input form-select" value={form.gender} onChange={set('gender')}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">🏡 Village</label>
                <input className="form-input" placeholder="Village name" value={form.village} onChange={set('village')} />
              </div>
              <div className="form-group">
                <label className="form-label">🗺 District</label>
                <input className="form-input" placeholder="District" value={form.district} onChange={set('district')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">💰 Annual Income (₹)</label>
              <input className="form-input" type="number" placeholder="Annual household income" value={form.income} onChange={set('income')} />
            </div>
            <div className="form-group">
              <label className="form-label">🏥 Known Medical History</label>
              <textarea className="form-input" rows={3} placeholder="Any known conditions, allergies, chronic illnesses..." value={form.medicalHistory} onChange={set('medicalHistory')} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/asha')}>← Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Registering...</> : '✅ Register Villager'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
