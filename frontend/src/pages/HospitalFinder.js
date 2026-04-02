import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const DEMO_HOSPITALS = [
  { name: 'Primary Health Centre', type: 'Government', distance: '2.3 km', phone: '04023456789', open: true, rating: 4.2 },
  { name: 'Community Health Centre', type: 'Government', distance: '5.1 km', phone: '04023456790', open: true, rating: 4.0 },
  { name: 'District Hospital', type: 'Government', distance: '8.7 km', phone: '04023456791', open: true, rating: 4.5 },
  { name: 'Ayushman Hospital', type: 'Private (Empanelled)', distance: '3.9 km', phone: '04023456792', open: false, rating: 4.3 },
  { name: 'AIIMS Rural Outreach', type: 'Government', distance: '12.4 km', phone: '04023456793', open: true, rating: 4.8 },
];

export default function HospitalFinder() {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [search, setSearch]     = useState('');
  const [lang, setLang]         = useState(user?.language || 'en');
  const [hospitals, setHospitals] = useState(DEMO_HOSPITALS);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.type.toLowerCase().includes(search.toLowerCase())
  );

  const openMaps = (name) => {
    const q = encodeURIComponent(name + ' hospital');
    if (location) {
      window.open(`https://www.google.com/maps/search/${q}/@${location.lat},${location.lng},14z`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/${q}`, '_blank');
    }
  };

  return (
    <Layout lang={lang} setLang={setLang} title="🏥 Nearby Hospitals">
      <div style={{ maxWidth: 800 }}>
        {/* Location Status */}
        <div className="card animate-in" style={{ padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, background: location ? 'var(--green-50)' : '#fff3cd', border: `1px solid ${location ? 'var(--green-200)' : '#fde68a'}` }}>
          <span style={{ fontSize: 28 }}>{location ? '📍' : '📌'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {location ? `Location detected` : 'Location not available'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} — Showing nearby hospitals` : 'Enable location for accurate results'}
            </div>
          </div>
          {!location && (
            <button className="btn btn-primary btn-sm" onClick={() => navigator.geolocation?.getCurrentPosition(p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }))}>
              Enable Location
            </button>
          )}
        </div>

        {/* Search */}
        <div className="form-group animate-in animate-delay-1">
          <input className="form-input" placeholder="🔍 Search hospitals by name or type..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Map embed (Google Maps iframe for demonstration) */}
        <div className="card animate-in animate-delay-1" style={{ marginBottom: 20, overflow: 'hidden', border: 'none' }}>
          <iframe
            title="Nearby Hospitals Map"
            width="100%" height="280"
            style={{ border: 'none', display: 'block' }}
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/search?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY || 'AIzaSyD-Demo'}&q=hospitals+near+${location ? `${location.lat},${location.lng}` : 'rural+india'}`}
          />
        </div>

        {/* Hospital cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((h, i) => (
            <div key={i} className="card animate-in" style={{ padding: 20, animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16 }}>{h.name}</div>
                    <span className={`badge ${h.open ? 'badge-green' : 'badge-red'}`}>{h.open ? '● Open' : '● Closed'}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 8 }}>
                    🏷 {h.type} &nbsp;•&nbsp; 📍 {h.distance} &nbsp;•&nbsp; ⭐ {h.rating}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`tel:${h.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                      📞 Call
                    </a>
                    <button className="btn btn-primary btn-sm" onClick={() => openMaps(h.name)}>
                      🗺 Directions
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 40, opacity: .6 }}>🏥</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--blue-50)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--blue-700)', border: '1px solid var(--blue-200)' }}>
          💡 <strong>Note:</strong> Add your Google Maps API key in <code>.env</code> for live hospital data. Demo data shown above.
        </div>
      </div>
    </Layout>
  );
}
