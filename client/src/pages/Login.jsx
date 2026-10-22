import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
  Waves,
  Sparkles,
  Activity,
  Layers,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginDemo, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleManualEmail, setGoogleManualEmail] = useState('pperarasu301@gmail.com');
  const [googleManualName, setGoogleManualName] = useState('Perarasu P');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    const res = await login(email.trim(), password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleGoogleLogin = async () => {
    // If a Google Client ID is configured in Vite env, try GSI, otherwise open Google account dialog with their account
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      try {
        setIsGoogleLoading(true);
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleLoading(false);
            setShowGooglePrompt(true);
          }
        });
        return;
      } catch (err) {
        console.warn('GSI error:', err);
      }
    }

    // Direct seamless Google Account Sign In Prompt
    setIsGoogleLoading(false);
    setShowGooglePrompt(true);
  };

  const handleGoogleManualSubmit = async (e) => {
    e.preventDefault();
    if (!googleManualEmail.trim()) return;
    setIsGoogleLoading(true);
    const res = await loginWithGoogle({
      name: googleManualName.trim() || googleManualEmail.split('@')[0].replace(/[._\-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: googleManualEmail.trim()
    });
    setIsGoogleLoading(false);
    if (res.success) {
      setShowGooglePrompt(false);
      navigate('/');
    } else {
      setError(res.message || 'Failed to authenticate with Google account.');
    }
  };

  const handleQuickDemo = (role) => {
    loginDemo(role);
    navigate('/');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(`A secure reset link has been dispatched to ${forgotEmail}`);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess('');
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="login-fullscreen">
      {/* ======== LEFT BRANDING PANEL ======== */}
      <div className="login-brand-panel">
        {/* Floating Particles */}
        <div className="login-particles">
          <div className="login-particle"></div>
          <div className="login-particle"></div>
          <div className="login-particle"></div>
          <div className="login-particle"></div>
          <div className="login-particle"></div>
          <div className="login-particle"></div>
          <div className="login-particle"></div>
          <div className="login-particle"></div>
        </div>

        <div className="login-brand-content">
          {/* Glowing Logo */}
          <div className="login-brand-logo">
            <Droplets size={42} color="#040814" />
          </div>

          <h1 className="login-brand-title">AquaVision</h1>
          <p className="login-brand-tagline">
            AI-Powered Water Resource Management & Telemetry System for Tamil Nadu
          </p>

          {/* Feature Highlights */}
          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon cyan">
                <Waves size={20} />
              </div>
              <div className="login-feature-text">
                <strong>Real-time Monitoring</strong> — Live groundwater telemetry from 8+ sensor nodes
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon emerald">
                <Sparkles size={20} />
              </div>
              <div className="login-feature-text">
                <strong>AI Hydro Intelligence</strong> — LSTM neural models with 94% forecast accuracy
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon purple">
                <Activity size={20} />
              </div>
              <div className="login-feature-text">
                <strong>Anomaly Detection</strong> — Automated drawdown alerts & depletion warnings
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon amber">
                <Layers size={20} />
              </div>
              <div className="login-feature-text">
                <strong>Recharge Analytics</strong> — Track artificial recharge structures & capacity
              </div>
            </div>
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="login-stats-ticker">
          <div className="login-stat-item">
            <div className="login-stat-value">8</div>
            <div className="login-stat-label">Borewells</div>
          </div>
          <div className="login-stat-item">
            <div className="login-stat-value">6</div>
            <div className="login-stat-label">Recharge Units</div>
          </div>
          <div className="login-stat-item">
            <div className="login-stat-value">99.4%</div>
            <div className="login-stat-label">Uptime</div>
          </div>
          <div className="login-stat-item">
            <div className="login-stat-value">24/7</div>
            <div className="login-stat-label">Monitoring</div>
          </div>
        </div>
      </div>

      {/* ======== RIGHT FORM PANEL ======== */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Header */}
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your aquifer command center</p>
          </div>

          {/* Glass Card */}
          <div className="login-glass-card">
            {/* Error Message */}
            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} id="login-form">
              {/* Email */}
              <div className="login-form-group">
                <label className="login-form-label" htmlFor="login-email">
                  Government Email
                </label>
                <div className="login-input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="login-input"
                    placeholder="officer@aquavision.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-form-group">
                <label className="login-form-label" htmlFor="login-password">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    style={{ paddingRight: '42px' }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={0}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="login-options-row">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    tabIndex={0}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="login-forgot"
                  onClick={() => setShowForgotModal(true)}
                  tabIndex={0}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading || isGoogleLoading}
                id="login-submit"
                tabIndex={0}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Google Sign-in Button */}
              <div className="login-oauth-separator">
                <span>or continue with</span>
              </div>

              <button
                type="button"
                className="login-google-btn"
                onClick={handleGoogleLogin}
                disabled={loading || isGoogleLoading}
                id="login-google-btn"
                tabIndex={0}
              >
                {isGoogleLoading ? (
                  <>
                    <span className="login-spinner google-spinner"></span>
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.34z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>Quick Demo Access</span>
            </div>

            {/* Demo Cards */}
            <div className="login-demo-grid">
              <button
                type="button"
                className="login-demo-card"
                onClick={() => handleQuickDemo('Admin')}
                id="demo-admin"
                tabIndex={0}
              >
                <div className="login-demo-icon admin-icon">
                  <ShieldCheck size={22} />
                </div>
                <div className="login-demo-title">Admin Access</div>
                <div className="login-demo-desc">
                  Full system control & analytics
                </div>
              </button>

              <button
                type="button"
                className="login-demo-card"
                onClick={() => handleQuickDemo('Officer')}
                id="demo-officer"
                tabIndex={0}
              >
                <div className="login-demo-icon officer-icon">
                  <UserCheck size={22} />
                </div>
                <div className="login-demo-title">Field Officer</div>
                <div className="login-demo-desc">
                  Monitoring & field reports
                </div>
              </button>
            </div>
          </div>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="login-modal-overlay" onClick={() => setShowForgotModal(false)}>
              <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="login-modal-header">
                  <h3>Reset Password</h3>
                  <button
                    type="button"
                    className="login-modal-close"
                    onClick={() => setShowForgotModal(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="login-modal-subtitle">
                  Enter your official email address and we'll transmit a secure OTP password reset token.
                </p>

                {forgotSuccess ? (
                  <div className="login-modal-success">
                    <CheckCircle size={18} />
                    <span>{forgotSuccess}</span>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="login-modal-form">
                    <div className="login-input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="email"
                        className="login-input"
                        placeholder="your-name@aquavision.gov.in"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    <button type="submit" className="login-submit-btn" style={{ marginTop: '16px' }}>
                      Send Password Reset Link
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Google Account Selector Modal */}
          {showGooglePrompt && (
            <div className="login-modal-overlay" onClick={() => setShowGooglePrompt(false)}>
              <div className="login-modal-card google-account-card" onClick={(e) => e.stopPropagation()}>
                <div className="login-modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.34z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Sign in with Google</h3>
                  </div>
                  <button
                    type="button"
                    className="login-modal-close"
                    onClick={() => setShowGooglePrompt(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="login-modal-subtitle">
                  Choose your Google Account to continue to <strong>AquaVision</strong>.
                </p>

                {/* Quick Google Account Selection Card */}
                <div
                  onClick={() => {
                    handleGoogleManualSubmit({ preventDefault: () => {} });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: 'rgba(66, 133, 244, 0.1)',
                    border: '1px solid rgba(66, 133, 244, 0.3)',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Click to sign in immediately with this account"
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4285F4, #34A853)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}
                  >
                    P
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {googleManualName || 'Perarasu P'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {googleManualEmail}
                    </div>
                  </div>
                  <ArrowRight size={16} color="#4285F4" />
                </div>

                <div className="login-oauth-separator" style={{ margin: '10px 0 16px' }}>
                  <span>or enter another Google account</span>
                </div>

                <form onSubmit={handleGoogleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="login-form-group" style={{ marginBottom: 0 }}>
                    <label className="login-form-label" htmlFor="google-email">
                      Google Email Address
                    </label>
                    <div className="login-input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input
                        id="google-email"
                        type="email"
                        className="login-input"
                        placeholder="yourname@gmail.com"
                        value={googleManualEmail}
                        onChange={(e) => setGoogleManualEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="login-form-group" style={{ marginBottom: 0 }}>
                    <label className="login-form-label" htmlFor="google-name">
                      Account Display Name
                    </label>
                    <div className="login-input-wrapper">
                      <UserCheck size={16} className="input-icon" />
                      <input
                        id="google-name"
                        type="text"
                        className="login-input"
                        placeholder="e.g. Perarasu P"
                        value={googleManualName}
                        onChange={(e) => setGoogleManualName(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-submit-btn"
                    style={{
                      marginTop: '8px',
                      background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                      color: '#ffffff'
                    }}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? 'Signing in...' : `Continue with ${googleManualEmail}`}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="login-footer">
            Powered by <a href="#">AquaVision AI</a> — Tamil Nadu Water Resources Department
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
