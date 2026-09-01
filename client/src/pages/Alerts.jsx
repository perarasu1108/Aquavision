import React, { useState, useEffect } from 'react';
import {
  BellRing,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Filter,
  RefreshCw,
  Clock
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import { apiService } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [severityFilter, statusFilter, alerts]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAlerts();
      if (res.data) setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...alerts];
    if (severityFilter !== 'all') {
      list = list.filter(a => a.severity.toLowerCase() === severityFilter.toLowerCase());
    }
    if (statusFilter !== 'all') {
      const isResolved = statusFilter === 'resolved';
      list = list.filter(a => a.isResolved === isResolved);
    }
    setFilteredAlerts(list);
  };

  const handleResolve = async (id) => {
    await apiService.resolveAlert(id);
    loadAlerts();
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.severity === 'Critical' && !a.isResolved).length;

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Alerts, Thresholds & Telemetry Exceptions</h1>
          <p>Real-time telemetry threshold triggers, critical aquifer depletion alarms, and maintenance tickets.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadAlerts}>
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Sync Feed</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-3 mb-lg">
        <StatCard
          title="Critical Depletion Alerts"
          value={criticalCount}
          unit="Active"
          icon={AlertOctagon}
          accent="warm"
          trend="Immediate Moratorium Req."
          trendType="down"
          subtitle="Depth > 20m bgl"
        />
        <StatCard
          title="Unresolved Issues"
          value={alerts.filter(a => !a.isResolved).length}
          unit="Tickets"
          icon={AlertTriangle}
          accent="blue"
          trend="Pending field action"
          trendType="neutral"
          subtitle="Field engineers dispatched"
        />
        <StatCard
          title="Resolved Incident Rate"
          value="75"
          unit="%"
          icon={ShieldCheck}
          accent="green"
          trend="48h SLA Adherence"
          trendType="up"
          subtitle="Closed loop resolution"
        />
      </div>

      {/* Filter Bar */}
      <GlassCard className="mb-lg" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filters:</span>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <select
            className="form-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="unresolved">Pending Resolution</option>
            <option value="resolved">Resolved / Closed</option>
          </select>
        </div>
      </GlassCard>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.map((alt) => (
          <GlassCard
            key={alt._id}
            style={{
              padding: '18px 22px',
              borderLeft: alt.severity === 'Critical' ? '4px solid #ef4444' : alt.severity === 'High' ? '4px solid #f59e0b' : '4px solid #0ea5e9'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <StatusBadge status={alt.severity} />
                  <span style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 700 }}>
                    {alt.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    &bull; {alt.district} ({alt.entityName || 'Basin'})
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {alt.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {alt.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  <Clock size={12} />
                  <span>Reported: {new Date(alt.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {alt.isResolved ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CheckCircle size={16} /> Resolved
                  </span>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleResolve(alt._id)}
                    style={{ gap: '6px' }}
                  >
                    <CheckCircle size={14} /> Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
