import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase().replace(/\s+/g, '-');
  let type = 'info';

  if (['active', 'operational', 'good', 'safe', 'optimal'].includes(normalized)) {
    type = 'active';
  } else if (['inactive', 'poor', 'critical', 'severe'].includes(normalized)) {
    type = 'inactive';
  } else if (['under-maintenance', 'maintenance', 'fair', 'warning', 'needs-repair'].includes(normalized)) {
    type = 'maintenance';
  }

  return (
    <span className={`status-badge ${type}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
