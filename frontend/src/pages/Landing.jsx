import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import hero3dScene from '../assets/hero-3d-scene.png';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActionClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(emailOrUsername, password);
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className="landing-navbar">
        <div className="nav-brand">
          <div className="nav-logo-icon">🏦</div>
          <div className="nav-brand-text">
            <h2>B-Trust</h2>
            <p>Microbanking & Interest Management System</p>
          </div>
        </div>

        <nav className="nav-actions">
          {isAuthenticated ? (
            <button className="btn-portal" onClick={() => navigate('/dashboard')}>
              Go to Dashboard →
            </button>
          ) : (
            <button className="btn-login-trigger" onClick={() => setShowLoginModal(true)}>
              Sign In to Portal
            </button>
          )}
        </nav>
      </header>

      {/* Main Full-Window Hero Layout */}
      <main className="landing-hero-container">
        {/* Dynamic Ambient Background Elements */}
        <div className="ambient-blob blob-1"></div>
        <div className="ambient-blob blob-2"></div>
        <div className="ambient-blob blob-3"></div>

        <div className="hero-split-grid">
          {/* Left Column: Brand & Action */}
          <div className="hero-left-col">
            <div className="hero-brand-card-badge">
              <div className="brand-logo-gem">
                <span className="gem-icon">🏦</span>
              </div>
              <div className="brand-meta">
                <div className="brand-title-row">
                  <span className="brand-main-name">B-Trust</span>
                  <span className="brand-verified-pill">Official Portal</span>
                </div>
                <span className="brand-sub-tag">Microbanking & Interest Management System</span>
              </div>
            </div>

            <h1 className="hero-main-title">
              Smarter Banking.<br />
              <span className="hero-gradient-headline">Greater Trust.</span>
            </h1>

            <p className="hero-main-desc">
              Experience the next generation of banking operations with <strong className="brand-inline-highlight">B-Trust</strong>. Track customers,
              monitor balances, handle instant transactions, and ensure secure, transparent
              financial services — all in one modern platform.
            </p>

            <div className="hero-cta-group">
              <button className="hero-primary-btn" onClick={handleActionClick}>
                <span className="btn-icon-symbol">🗂️</span>
                <span>Go to Dashboard</span>
                <span className="btn-arrow-symbol">→</span>
              </button>

              <div className="cta-support-tag">
                <span className="tag-check">✓</span>
                <span>Protected Financial Ledger</span>
              </div>
            </div>

            {/* Micro Feature Quick Counters */}
            <div className="hero-quick-counters">
              <div className="counter-box">
                <span className="counter-num">100%</span>
                <span className="counter-sub">Automated Interest</span>
              </div>
              <div className="counter-divider"></div>
              <div className="counter-box">
                <span className="counter-num">24/7</span>
                <span className="counter-sub">Real-time Ledgers</span>
              </div>
              <div className="counter-divider"></div>
              <div className="counter-box">
                <span className="counter-num">Multi</span>
                <span className="counter-sub">Branch & Agent</span>
              </div>
            </div>
          </div>

          {/* Right Column: Large 3D Banking Showcase */}
          <div className="hero-right-col">
            <div className="hero-showcase-stage">
              {/* Floating Stat Badges */}
              <div className="floating-metric-card badge-growth">
                <span className="metric-icon">📈</span>
                <div className="metric-details">
                  <small>Active Plans</small>
                  <strong>+14.2% Growth</strong>
                </div>
              </div>

              <div className="floating-metric-card badge-security">
                <span className="metric-icon">🛡️</span>
                <div className="metric-details">
                  <small>Security Shield</small>
                  <strong>Verified</strong>
                </div>
              </div>

              {/* The Cropped 3D Stage Image Filling the Right Section */}
              <div className="stage-image-container">
                <img 
                  src={hero3dScene} 
                  alt="B-Trust Microbanking 3D Platform" 
                  className="hero-large-3d-img"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Authentication Modal */}
      {showLoginModal && (
        <div className="auth-modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-logo">🏦</div>
              <h3>Sign In to B-Trust</h3>
              <p>Enter your management credentials to access the banking portal</p>
            </div>

            {error && <div className="modal-error-alert">{error}</div>}

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address / Username</label>
                <input 
                  type="text" 
                  value={emailOrUsername} 
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="admin@btrust.com or admin"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="demo-credentials-hint">
                <span>Sign in with <strong>admin@btrust.com</strong> (or <strong>admin</strong>) / password: <strong>admin</strong></span>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
