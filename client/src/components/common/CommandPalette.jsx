import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Waves,
  Pipette,
  Layers,
  Activity,
  Sparkles,
  BellRing,
  FileBarChart2,
  ArrowRight,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { initialBorewells, initialRechargeStructures } from '../../data/mockData';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultActions = [
    { label: 'Overview Dashboard', icon: LayoutDashboard, category: 'Navigation', action: () => navigate('/') },
    { label: 'Groundwater Levels & Hydrographs', icon: Waves, category: 'Navigation', action: () => navigate('/groundwater') },
    { label: 'Borewell Telemetry & Inventory', icon: Pipette, category: 'Navigation', action: () => navigate('/borewells') },
    { label: 'Artificial Recharge Structures', icon: Layers, category: 'Navigation', action: () => navigate('/recharge') },
    { label: 'Extraction Patterns & Surges', icon: Activity, category: 'Navigation', action: () => navigate('/extraction') },
    { label: 'AI Hydro-Intelligence Copilot', icon: Sparkles, category: 'AI Intelligence', action: () => navigate('/ai-insights') },
    { label: 'Active Alerts & Thresholds', icon: BellRing, category: 'Alerts', action: () => navigate('/alerts') },
    { label: 'Export State Water Ledger', icon: FileBarChart2, category: 'Reports', action: () => navigate('/reports') },
    { label: `Toggle Theme (${theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})`, icon: theme === 'dark' ? Sun : Moon, category: 'System', action: toggleTheme }
  ];

  // Search borewells & structures
  const searchResults = [
    ...defaultActions,
    ...initialBorewells.map(b => ({
      label: `${b.borewellId} — ${b.name} (${b.district})`,
      icon: Pipette,
      category: 'Borewell Station',
      action: () => navigate(`/borewells?search=${encodeURIComponent(b.borewellId)}`)
    })),
    ...initialRechargeStructures.map(s => ({
      label: `${s.structureId} — ${s.name} (${s.type})`,
      icon: Layers,
      category: 'Recharge Structure',
      action: () => navigate('/recharge')
    }))
  ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (item) => {
    item.action();
    onClose(false);
  };

  return (
    <div className="cmd-palette-backdrop" onClick={() => onClose(false)}>
      <div className="cmd-palette-box" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-palette-input">
          <Search size={20} color="var(--accent-cyan)" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, telemetry station ID, or report name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-icon btn-secondary" onClick={() => onClose(false)} style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="cmd-palette-results">
          {searchResults.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for "{query}"
            </div>
          ) : (
            searchResults.slice(0, 8).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`cmd-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '2px 8px', borderRadius: '4px' }}>
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: '10px 18px', background: 'var(--bg-glass)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Navigation: <strong>↑ ↓</strong> to select</span>
          <span>Open: <strong>↵ Enter</strong></span>
          <span>Close: <strong>ESC</strong></span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
