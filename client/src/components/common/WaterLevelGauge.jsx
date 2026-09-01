import React from 'react';

const WaterLevelGauge = ({ currentLevel = 8.5, maxDepth = 30, unit = 'm bgl', label = 'Basin Aquifer Water Table' }) => {
  // Calculate percentage full (lower depth = higher water table = more full)
  // Let's assume 0m is 100% full, 30m is 0% full
  const percentFull = Math.max(5, Math.min(95, Math.round(((maxDepth - currentLevel) / maxDepth) * 100)));
  const isCritical = currentLevel > 15;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            {label}
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {currentLevel} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: '999px',
            background: isCritical ? 'var(--status-danger-bg)' : 'var(--status-success-bg)',
            color: isCritical ? 'var(--status-danger)' : 'var(--status-success)',
            border: isCritical ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)'
          }}>
            {isCritical ? 'Critical Aquifer Deficit' : 'Safe Aquifer Level'} ({percentFull}% Infiltrated)
          </span>
        </div>
      </div>

      {/* Cyber Wave Reservoir Gauge */}
      <div className="water-tank-simulator">
        <div
          className="water-tank-liquid"
          style={{
            height: `${percentFull}%`,
            background: isCritical
              ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.7) 0%, rgba(220, 38, 38, 0.9) 100%)'
              : 'linear-gradient(180deg, rgba(0, 242, 254, 0.6) 0%, rgba(14, 165, 233, 0.9) 100%)'
          }}
        >
          {/* Animated SVG Wave Overlay */}
          <svg className="water-tank-wave" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
            fill: isCritical ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 242, 254, 0.7)'
          }}>
            <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1000,40 C1100,100 1150,20 1200,50 L1200,120 L0,120 Z"></path>
          </svg>
        </div>

        {/* Depth Markers Overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 14px', pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
            <span>Ground Surface (0m)</span>
            <span>100% Saturation</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '4px' }}>
            <span>Critical Threshold (15m)</span>
            <span>50%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
            <span>Deep Bedrock (30m)</span>
            <span>0% Saturation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelGauge;
