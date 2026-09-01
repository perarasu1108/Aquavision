import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Waves,
  Pipette,
  Layers,
  Activity,
  Sparkles,
  BellRing,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  Droplets
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/groundwater', label: 'Groundwater Levels', icon: Waves },
    { to: '/borewells', label: 'Borewell Telemetry', icon: Pipette },
    { to: '/recharge', label: 'Recharge Structures', icon: Layers },
    { to: '/extraction', label: 'Extraction Patterns', icon: Activity },
    { to: '/ai-insights', label: 'AI Hydro Intelligence', icon: Sparkles, badge: 'AI' },
    { to: '/alerts', label: 'Alerts & Anomalies', icon: BellRing },
    { to: '/reports', label: 'Analytics & Reports', icon: FileBarChart2 }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Droplets size={22} className="animate-float" />
        </div>
        <div className="logo-text">
          <span style={{ fontWeight: 800 }}>Aqua</span>Vision
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Operations & Monitoring</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">
                <Icon size={19} />
              </span>
              <span className="nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
                      color: '#060b18',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '999px',
                      marginLeft: '6px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Toggle */}
      <div className="sidebar-footer">
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
