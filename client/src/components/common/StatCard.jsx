import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  accent = 'cyan',
  trend,
  trendType = 'neutral',
  subtitle
}) => {
  return (
    <div className="stat-card">
      {/* Animated Subtle Water Wave Background */}
      <div className="stat-wave-bg">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '200%', height: '100%', fill: 'var(--accent-cyan)', animation: 'wave-slide 6s linear infinite' }}>
          <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1000,40 C1100,100 1150,20 1200,50 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
        <div>
          <div className="stat-label">{title}</div>
          <div className="stat-value" style={{ marginTop: '8px' }}>
            {value} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{unit}</span>
          </div>
        </div>
        {Icon && (
          <div className={`stat-icon ${accent}`}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', position: 'relative', zIndex: 2 }}>
          {trend && (
            <div className={`stat-trend ${trendType}`}>
              {trendType === 'up' && <ArrowUpRight size={14} />}
              {trendType === 'down' && <ArrowDownRight size={14} />}
              {trendType === 'neutral' && <Minus size={14} />}
              <span>{trend}</span>
            </div>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
