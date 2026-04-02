import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function EmergencyPage() {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [location, setLocation] = useState(null);
  const [sent, setSent]         = useState(false);
  const [desc, setDesc]         = useState('');
  const [contacts, setContacts] = useState([
    { name: '', phone: '', relation: '' }
  ]);
  const [lang, setLang] = useState(user?.language || 'en');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => toast('📍 Location access denied. Alert will be sent without location.')
      );
    }
  }, []);

  const sendAlert = async () => {
    setLoading(true);
    try {
      const res = await api.post('/emergency/alert', {
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: `${user?.village || ''}, ${user?.district || ''}`,
        description: desc || 'Emergency! Immediate help needed.'
      });
      setSent(true);
      toast.success('Emergency alert sent! Help is on the way.');
    } catch (err) {
      toast.error('Failed to send alert. Please call 108 directly.');
    } finally {
      setLoading(false);
    }
  };

  const callEmergency = (num) => { window.location.href = `tel:${num}`; };

  return (
    <Layout lang={lang} setLang={setLang} title="🚨 Emergency">
      <div style={{ maxWidth: 680 }}>

        {/* Main Emergency Button */}
        {!sent ? (
          <div className="animate-in">
            <div className="card" style={{ padding: 32, marginBottom: 24, textAlign: 'center', border: '2px solid var(--red-500)' }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>🆘</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, marginBottom: 8, color: 'var(--red-500)' }}>Emergency Alert System</h2>
              <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24 }}>
                Press the button below to immediately alert your family members, ASHA worker, and nearby hospitals.
              </p>

              <div className="form-group">
                <label className="form-label">📝 Describe the emergency (optional)</label>
                <textarea className="form-input" rows={3} placeholder="e.g. Chest pain, difficulty breathing, accident..."
                  value={desc} onChange={e => setDesc(e.target.value)} />
              </div>

              {location && (
                <div style={{ padding: '10px 14px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-200)', marginBottom: 20, fontSize: 13, color: 'var(--green-700)' }}>
                  📍 Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </div>
              )}

              <button className="emergency-btn" onClick={sendAlert} disabled={loading} style={{ fontSize: 22, padding: '24px 32px' }}>
                {loading ? '⏳ Sending Alert...' : '🚨 SEND EMERGENCY ALERT NOW'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card animate-in" style={{ padding: 32, marginBottom: 24, textAlign: 'center', border: '2px solid var(--green-500)', background: 'var(--green-50)' }}>
            <div style={{ fontSize: 64 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, color: 'var(--green-700)', marginTop: 12 }}>Alert Sent Successfully!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-mid)', marginTop: 8 }}>Your emergency contacts and ASHA worker have been notified. Stay calm — help is on the way.</p>
            <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => setSent(false)}>Send Another Alert</button>
          </div>
        )}

        {/* Emergency numbers */}
        <div className="card animate-in animate-delay-1" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>📞 Emergency Helplines</h3>
          <div className="grid-2">
            {[
              { label: 'Ambulance', number: '108', icon: '🚑', color: '#fee2e2' },
              { label: 'Police', number: '100', icon: '👮', color: '#e0f2fe' },
              { label: 'Women Helpline', number: '1091', icon: '👩', color: '#fce7f3' },
              { label: 'Child Helpline', number: '1098', icon: '🧒', color: '#d1fae5' },
              { label: 'Health Helpline', number: '104', icon: '🏥', color: '#ede9fe' },
              { label: 'Fire Service', number: '101', icon: '🔥', color: '#fff3cd' },
            ].map(n => (
              <button key={n.number} onClick={() => callEmergency(n.number)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: n.color, border: '1px solid rgba(0,0,0,.06)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'transform .15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <span style={{ fontSize: 28 }}>{n.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-dark)' }}>{n.number}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{n.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safety tips */}
        <div className="card animate-in animate-delay-2" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>🛡️ While Waiting for Help</h3>
          {['Stay calm and keep the patient still', 'Do not give food or water if unconscious', 'Keep patient warm with a blanket', 'Do not move injured person unless necessary', 'Keep airway clear — tilt head back if unconscious', 'Apply pressure to bleeding wounds with clean cloth'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--green-700)', fontWeight: 800 }}>{i + 1}.</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
