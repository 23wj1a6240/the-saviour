import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', password: '', role: 'villager',
    age: '', gender: '', village: '', district: '', state: '', income: '', language: 'en'
  });

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Registration successful! Welcome, ' + user.name);
      navigate(user.role === 'asha_worker' ? '/asha' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }} className="animate-in">
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#1b4332,#40916c)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 12px', boxShadow: '0 6px 18px rgba(45,106,79,.3)' }}>🌿</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26, color: 'var(--green-900)' }}>Join The Saviour</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Create your health profile</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? 'var(--green-500)' : 'var(--border)', transition: 'background .3s' }} />
          ))}
        </div>

        <div className="card animate-in animate-delay-1" style={{ padding: 32 }}>
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>

            {step === 1 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Basic Information</h2>
                <div className="form-group">
                  <label className="form-label">👤 Full Name</label>
                  <input className="form-input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">📱 Phone Number</label>
                  <input className="form-input" type="tel" placeholder="10-digit phone number" value={form.phone} onChange={set('phone')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">🔒 Password</label>
                  <input className="form-input" type="password" placeholder="Create password" value={form.password} onChange={set('password')} required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">🎭 Role</label>
                  <select className="form-input form-select" value={form.role} onChange={set('role')}>
                    <option value="villager">🏡 Village User</option>
                    <option value="asha_worker">🏥 ASHA Worker</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">🌐 Language</label>
                  <select className="form-input form-select" value={form.language} onChange={set('language')}>
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="te">తెలుగు</option>
                    <option value="ta">தமிழ்</option>
                    <option value="kn">ಕನ್ನಡ</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-lg btn-block" type="submit">Next →</button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Health & Location</h2>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">🎂 Age</label>
                    <input className="form-input" type="number" placeholder="Age" value={form.age} onChange={set('age')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">⚧ Gender</label>
                    <select className="form-input form-select" value={form.gender} onChange={set('gender')}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">🏡 Village</label>
                  <input className="form-input" placeholder="Village name" value={form.village} onChange={set('village')} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">🗺 District</label>
                    <input className="form-input" placeholder="District" value={form.district} onChange={set('district')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">📍 State</label>
                    <input className="form-input" placeholder="State" value={form.state} onChange={set('state')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">💰 Annual Income (₹)</label>
                  <input className="form-input" type="number" placeholder="Annual income in rupees" value={form.income} onChange={set('income')} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                    {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Registering...</> : '✅ Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--green-700)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
