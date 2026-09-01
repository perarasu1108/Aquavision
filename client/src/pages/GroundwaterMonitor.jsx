import React, { useState, useEffect } from 'react';
import {
  Waves,
  Filter,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Droplet,
  Info,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatCard from '../components/common/StatCard';
import { apiService } from '../services/api';
import { monthlyWaterTrend, waterQualityData } from '../data/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const GroundwaterMonitor = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [trendData, setTrendData] = useState(monthlyWaterTrend);
  const [qualityList, setQualityList] = useState(waterQualityData);

  const seasonalComparisons = [
    { season: 'Pre-Monsoon (Apr-May)', avgDepth: 14.8, status: 'Stressed', change: '+2.4m' },
    { season: 'Monsoon (Jun-Sep)', avgDepth: 7.2, status: 'Recharging', change: '-7.6m' },
    { season: 'Post-Monsoon (Oct-Nov)', avgDepth: 5.9, status: 'Optimal', change: '-1.3m' },
    { season: 'Rabi Cultivation (Dec-Mar)', avgDepth: 10.4, status: 'Moderate', change: '+4.5m' }
  ];

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Aquifer & Groundwater Level Telemetry</h1>
          <p>Multi-district depth hydrographs, seasonal water table dynamics, and potable quality indices.</p>
        </div>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: '160px', padding: '8px 12px' }}
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="all">All Districts</option>
            <option value="coimbatore">Coimbatore</option>
            <option value="salem">Salem</option>
            <option value="madurai">Madurai</option>
            <option value="trichy">Trichy</option>
            <option value="erode">Erode</option>
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-4 mb-lg">
        <StatCard
          title="State Basin Average"
          value="8.8"
          unit="m bgl"
          icon={Waves}
          accent="blue"
          trend="Within Normal Range"
          trendType="up"
          subtitle="Annual Benchmark: 9.0m"
        />
        <StatCard
          title="Deepest Aquifer Level"
          value="24.2"
          unit="m bgl"
          icon={AlertOctagon}
          accent="warm"
          trend="Madurai (Critical)"
          trendType="down"
          subtitle="Needs Artificial Recharge"
        />
        <StatCard
          title="Shallowest Water Table"
          value="4.1"
          unit="m bgl"
          icon={Droplet}
          accent="green"
          trend="Trichy (Cauvery Delta)"
          trendType="up"
          subtitle="Abundant Recharge"
        />
        <StatCard
          title="Water Quality Index"
          value="88"
          unit="/ 100"
          icon={CheckCircle2}
          accent="purple"
          trend="Grade A Potable"
          trendType="up"
          subtitle="6 Parameters Monitored"
        />
      </div>

      {/* Main Hydrograph Trend */}
      <div className="mb-lg">
        <GlassCard
          title="District Comparative Hydrograph (12-Month Progression)"
          subtitle="Meters below ground level (m bgl) — Lower depth indicates higher water table."
        >
          <div style={{ height: '360px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="m" />
                <Tooltip
                  contentStyle={{
                    background: '#0c1225',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="coimbatore" name="Coimbatore" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="salem" name="Salem" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="madurai" name="Madurai" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="trichy" name="Trichy" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="erode" name="Erode" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Seasonal Dynamics & Water Quality Parameters */}
      <div className="grid grid-2 mb-lg">
        {/* Seasonal Dynamics */}
        <GlassCard
          title="Seasonal Water Table Dynamics"
          subtitle="Aquifer drawdowns and post-monsoon recharge cycles"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {seasonalComparisons.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.season}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {item.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#22d3ee' }}>
                    {item.avgDepth} m bgl
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: item.change.startsWith('-') ? '#10b981' : '#f59e0b',
                    fontWeight: 600
                  }}>
                    {item.change} swing
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Water Quality Parameters */}
        <GlassCard
          title="Hydrochemical Quality Parameters"
          subtitle="Continuous chemical sensor readings vs BIS (IS 10500) drinking standards"
        >
          <div className="data-table-wrapper" style={{ marginTop: '8px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Observed Value</th>
                  <th>Permissible Limit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {qualityList.map((q, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.param}</td>
                    <td style={{ color: '#22d3ee', fontWeight: 600 }}>
                      {q.value} {q.unit}
                    </td>
                    <td>{q.standard}</td>
                    <td>
                      <span className={`status-badge ${q.status === 'Optimal' || q.status === 'Good' || q.status === 'Safe' ? 'good' : 'warning'}`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default GroundwaterMonitor;
