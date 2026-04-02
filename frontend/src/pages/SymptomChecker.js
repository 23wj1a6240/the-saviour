import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ALL_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Diarrhea', 'Vomiting',
  'Chest Pain', 'Fatigue', 'Skin Rash', 'Stomach Pain', 'Joint Pain',
  'Sore Throat', 'Runny Nose', 'Body Ache', 'Loss of Appetite',
  'Dizziness', 'Shortness of Breath', 'Nausea', 'Chills', 'Sweating', 'Weakness'
];

export default function SymptomChecker() {
  const { user } = useAuth();
  const [selected, setSelected]   = useState([]);
  const [custom, setCustom]       = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang]           = useState(user?.language || 'en');

  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim())) {
      setSelected(prev => [...prev, custom.trim()]);
      setCustom('');
    }
  };

  const analyze = async () => {
    if (selected.length === 0) return toast.error('Please select at least one symptom');
    setLoading(true);
    try {
      const res = await api.post('/symptoms/analyze', {
        symptoms: selected,
        age: user?.age,
        gender: user?.gender,
        income: user?.income
      });
      setResult(res.data.analysis);
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return toast.error('Voice input not supported in your browser');
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : lang === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.start();
    setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setCustom(transcript);
      setListening(false);
      toast.success('Voice captured: ' + transcript);
    };
    recognition.onerror = () => { setListening(false); toast.error('Voice input failed'); };
    recognition.onend   = () => setListening(false);
  };

  const speakResult = () => {
    if (!result) return;
    const text = `Possible conditions: ${result.possibleDiseases.map(d => d.disease).join(', ')}. Precautions: ${result.precautions.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const severityColor = (s) => s === 'high' ? 'var(--red-500)' : s === 'medium' ? 'var(--amber-500)' : 'var(--green-500)';

  return (
    <Layout lang={lang} setLang={setLang} title="🩺 Symptom Checker">
      <div style={{ maxWidth: 800 }}>

        {/* Voice Input */}
        <div className="card animate-in" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, background: listening ? '#fff5f5' : '#fff', border: listening ? '1.5px solid var(--red-500)' : '1px solid var(--border)' }}>
          <button onClick={startVoice} style={{ width: 52, height: 52, borderRadius: '50%', background: listening ? 'var(--red-500)' : 'var(--green-700)', border: 'none', cursor: 'pointer', fontSize: 22, color: '#fff', flexShrink: 0, animation: listening ? 'pulse-red 1.5s infinite' : 'none' }}>
            {listening ? '🔴' : '🎤'}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{listening ? 'Listening...' : 'Voice Input'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>Tap mic and speak your symptoms. Works in Hindi, Telugu, Tamil & English.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="Or type symptom..." style={{ width: 200 }}
              onKeyDown={e => e.key === 'Enter' && addCustom()} />
            <button className="btn btn-secondary btn-sm" onClick={addCustom}>Add</button>
          </div>
        </div>

        {/* Symptom Grid */}
        <div className="card animate-in animate-delay-1" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>Select Your Symptoms</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ALL_SYMPTOMS.map(s => (
              <button key={s} className={`symptom-tag ${selected.includes(s) ? 'selected' : ''}`} onClick={() => toggle(s)}>
                {selected.includes(s) ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>

          {selected.length > 0 && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-200)' }}>
              <strong>Selected ({selected.length}):</strong> {selected.join(' • ')}
            </div>
          )}
        </div>

        {/* Analyze button */}
        <button className="btn btn-primary btn-lg btn-block animate-in animate-delay-2" onClick={analyze} disabled={loading || selected.length === 0}>
          {loading ? <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Analyzing with AI...</> : '🔍 Analyze Symptoms'}
        </button>

        {/* Results */}
        {result && (
          <div style={{ marginTop: 28 }}>
            {result.isEmergency && (
              <div style={{ background: 'var(--red-100)', border: '2px solid var(--red-500)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>🚨</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--red-500)', marginTop: 8 }}>SEEK IMMEDIATE MEDICAL ATTENTION</div>
                <div style={{ fontSize: 14, color: '#7f1d1d', marginTop: 4 }}>Your symptoms indicate an emergency. Go to the nearest hospital immediately.</div>
              </div>
            )}

            {/* Possible diseases */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>🔬 Possible Conditions</h3>
                <button className="btn btn-secondary btn-sm" onClick={speakResult}>🔊 Read Aloud</button>
              </div>
              {result.possibleDiseases.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{d.disease}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>Confidence: {d.confidence}%</div>
                  </div>
                  <span className={`badge badge-${d.severity === 'high' ? 'red' : d.severity === 'medium' ? 'amber' : 'green'}`}>
                    {d.severity.toUpperCase()}
                  </span>
                  <div style={{ width: 80 }}>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                      <div style={{ width: d.confidence + '%', height: '100%', background: severityColor(d.severity), borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Precautions */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>💊 Precautions & Care</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.precautions.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: 'var(--green-700)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14 }}>{p}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--blue-50)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--blue-700)' }}>
                ℹ️ <strong>Recommendation:</strong> {result.recommendation}
              </div>
            </div>

            {/* Applicable schemes */}
            {result.applicableSchemes?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 16 }}>📜 Applicable Government Schemes</h3>
                {result.applicableSchemes.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 24 }}>🏛</span>
                    <div><div style={{ fontWeight: 700 }}>{s.name}</div><div style={{ fontSize: 13, color: 'var(--text-light)' }}>{s.description}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
