import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { user }        = useAuth();
  const [loading, setLoading] = useState(false);
  const [lang, setLang]       = useState(user?.language || 'en');

  const downloadReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saviour_token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/reports/generate/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `health_report_${user.name?.replace(' ', '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout lang={lang} setLang={setLang} title="📄 Download Report">
      <div style={{ maxWidth: 640 }}>
        {/* Header card */}
        <div className="card animate-in" style={{ padding: 32, marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg,#1b4332,#2d6a4f)', color: '#fff', border: 'none' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24 }}>Health Report</h2>
          <p style={{ opacity: .85, fontSize: 14, marginTop: 8 }}>Generate and download your complete health report as a PDF. Share it with doctors even without internet.</p>
        </div>

        {/* Report details */}
        <div className="card animate-in animate-delay-1" style={{ padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>📝 Report Contents</h3>
          {[
            ['👤 Patient Information', 'Name, age, gender, village, district'],
            ['🤒 Symptom History', 'All recorded symptoms with dates'],
            ['🔬 Diagnoses', 'Medical diagnoses and conditions'],
            ['💊 Prescriptions', 'Medicines prescribed by doctors'],
            ['💉 Vaccinations', 'Vaccination records and due dates'],
            ['📊 Vitals', 'Temperature, BP, weight, height history'],
          ].map(([label, desc]) => (
            <div key={label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 16 }}>{label.split(' ')[0]}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{label.substring(label.indexOf(' ') + 1)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Patient summary */}
        <div className="card animate-in animate-delay-2" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>👤 Patient Summary</h3>
          <div className="grid-2">
            {[
              ['Name', user?.name],
              ['Phone', user?.phone],
              ['Age', user?.age ? `${user.age} years` : 'Not set'],
              ['Gender', user?.gender || 'Not set'],
              ['Village', user?.village || 'Not set'],
              ['District', user?.district || 'Not set'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '10px 14px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-100)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg btn-block animate-in" onClick={downloadReport} disabled={loading}>
          {loading
            ? <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Generating PDF...</>
            : '⬇️ Download Health Report (PDF)'}
        </button>

        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--green-700)', border: '1px solid var(--green-200)', textAlign: 'center' }}>
          💡 <strong>Offline Use:</strong> Download and print this PDF to carry to hospitals even without internet.
        </div>
      </div>
    </Layout>
  );
}
