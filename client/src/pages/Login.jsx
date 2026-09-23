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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginDemo, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleQuickDemo = (role) => {
    loginDemo(role);
    navigate('/');
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
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
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
                  />
                  Remember me
                </label>
                <button type="button" className="login-forgot">
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
                id="login-submit"
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
