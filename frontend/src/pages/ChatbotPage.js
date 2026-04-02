import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const QUICK_QUESTIONS = [
  'What is malaria?', 'How to treat fever?', 'Ayushman Bharat scheme',
  'Pregnancy care tips', 'Vaccination schedule', 'How to prevent dengue?',
  'What is diabetes?', 'Blood pressure tips'
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const [lang, setLang] = useState(user?.language || 'en');
  const [messages, setMessages] = useState([
    { role: 'bot', text: '🌿 Namaste! I am your AI Health Assistant. How can I help you today? You can ask me about symptoms, diseases, medicines, or government schemes.' }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (msg) => {
    const text = msg || input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await api.post('/chatbot/message', { message: text, language: lang });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I could not connect. Please check your internet and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.start(); setListening(true);
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
  };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(u);
  };

  return (
    <Layout lang={lang} setLang={setLang} title="💬 Health Assistant">
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: 500 }}>

        {/* Quick questions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="badge badge-green"
              style={{ cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: 13 }}>
              {q}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="card" style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'bot' && <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 4, marginLeft: 4 }}>🤖 Health AI</div>}
              <div className={`chat-bubble ${m.role}`}>{m.text}</div>
              {m.role === 'bot' && (
                <button onClick={() => speak(m.text)} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-light)', cursor: 'pointer', marginTop: 4 }}>
                  🔊 Read aloud
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="chat-bubble bot" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="card" style={{ padding: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={startVoice}
            style={{ width: 44, height: 44, borderRadius: '50%', background: listening ? 'var(--red-500)' : 'var(--green-50)', border: '1.5px solid var(--green-200)', cursor: 'pointer', fontSize: 20, flexShrink: 0, color: listening ? '#fff' : 'var(--green-700)' }}>
            🎤
          </button>
          <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask a health question..."
            onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            Send →
          </button>
        </div>
      </div>
    </Layout>
  );
}
