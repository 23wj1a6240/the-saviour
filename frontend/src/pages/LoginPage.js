import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      toast.success('Welcome back, ' + user.name + '!');
      navigate(user.role === 'asha_worker' ? '/asha' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(64,145,108,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(33,150,243,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }} className="animate-in">
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#1b4332,#40916c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(45,106,79,.3)' }}>🌿</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 32, color: 'var(--green-900)', letterSpacing: -1 }}>The Saviour</h1>
          <p style={{ color: 'var(--text-light)', marginTop: 6, fontSize: 14 }}>AI Smart Rural Health Assistant</p>
        </div>

        <div className="card animate-in animate-delay-1" style={{ padding: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 22, marginBottom: 8, color: 'var(--text-dark)' }}>Welcome back 👋</h2>
          <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 28 }}>Sign in to access your health dashboard</p>

          <form onSubmit={handle}>
            <div className="form-group">
              <label className="form-label">📱 Phone Number</label>
              <input className="form-input" type="tel" placeholder="Enter your phone number"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">🔒 Password</label>
              <input className="form-input" type="password" placeholder="Enter your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {/* Demo credentials hint */}
            <div style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--blue-700)' }}>
              💡 <strong>Demo:</strong> Register first, then login. ASHA workers select "ASHA Worker" role during registration.
            </div>

            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Signing in...</> : '🚀 Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-light)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--green-700)', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-light)' }}>
          🔐 Secure • 🌿 Trusted • 💚 Free for Rural Communities
        </p>
      </div>
    </div>
  );
}
