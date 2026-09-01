import React from 'react';

const GlassCard = ({ children, className = '', title, subtitle, action, style = {} }) => {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {(title || action) && (
        <div className="chart-header">
          <div>
            {title && <h3 className="chart-title">{title}</h3>}
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default GlassCard;
