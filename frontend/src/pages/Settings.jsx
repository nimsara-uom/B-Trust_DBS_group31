import React, { useState } from 'react';
import { Bell, Lock, User, Globe, Save } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>System Settings</h2>
          <p>Configure system preferences and application settings.</p>
        </div>
      </div>
      
      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ padding: '10px 15px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={18} /> General
            </li>
            <li style={{ padding: '10px 15px', color: '#4B5563', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} /> Security
            </li>
            <li style={{ padding: '10px 15px', color: '#4B5563', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={18} /> Notifications
            </li>
            <li style={{ padding: '10px 15px', color: '#4B5563', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={18} /> Regional
            </li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header" style={{ padding: '1.5rem 1.5rem 0', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
            <h3>General Settings</h3>
          </div>
          
          <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>System Name</label>
                <input type="text" defaultValue="B-Trust Core Banking" style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Support Email</label>
                <input type="email" defaultValue="admin@b-trust.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Default Currency</label>
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: 'white' }}>
                  <option>LKR (Sri Lankan Rupee)</option>
                  <option>USD (US Dollar)</option>
                  <option>EUR (Euro)</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Timezone</label>
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: 'white' }}>
                  <option>Asia/Colombo (GMT+5:30)</option>
                  <option>UTC</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                {saved && <span style={{ color: '#10B981', fontWeight: 500 }}>✓ Settings saved successfully</span>}
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
