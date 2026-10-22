import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles, LogOut, ShieldCheck, MapPin, Sun, Moon, Command, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import CommandPalette from '../common/CommandPalette';

const Navbar = ({ collapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  return (
    <>
      <header className={`navbar ${collapsed ? 'collapsed' : ''}`}>
        {/* Command Palette Trigger Input */}
        <div className="navbar-cmd-btn" onClick={() => setIsCmdOpen(true)}>
          <Search size={16} />
          <span>Quick command or search...</span>
          <span className="cmd-badge">Ctrl K</span>
        </div>

        {/* Action Center */}
        <div className="navbar-actions">
          {/* Live Telemetry Beacon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-glass)',
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}
          >
            <Radio size={14} color="var(--accent-cyan)" className="animate-pulse" />
            <span style={{ fontWeight: 600 }}>Tamil Nadu Hydrogrid</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
          </div>

          {/* Theme Switcher Toggle Button */}
          <button
            className="navbar-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Cyber Theme'}
          >
            {theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#0284c7" />}
          </button>

          {/* AI Quick Button */}
          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate('/ai-insights')}
            style={{ gap: '6px' }}
          >
            <Sparkles size={15} />
            <span>AI Copilot</span>
          </button>

          {/* Notifications */}
          <button
            className="navbar-btn"
            onClick={() => navigate('/alerts')}
            title="Alerts & Thresholds"
          >
            <Bell size={19} />
            <span className="badge">3</span>
          </button>

          {/* User Badge - Shows the exact logged-in account */}
          {user ? (
            <div
              className="user-menu"
              onClick={logout}
              title={`Logged in as ${user.name} (${user.email || 'Government Account'})\nClick to Logout`}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="user-avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)',
                  color: '#040814',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '0.5px'
                }}
              >
                {user.avatar || (user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'US')}
              </div>
              <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name" style={{ fontSize: '0.82rem', fontWeight: 700, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <span className="user-role" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email || user.role}
                </span>
              </div>
              <LogOut size={16} color="var(--text-muted)" style={{ marginLeft: '6px' }} />
            </div>
          ) : (
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCmdOpen} onClose={setIsCmdOpen} />
    </>
  );
};

export default Navbar;
