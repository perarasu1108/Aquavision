import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Clock,
  Droplet,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatCard from '../components/common/StatCard';
import { extractionByPurposeData } from '../data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const ExtractionPatterns = () => {
  const hourlyPumpingPattern = [
    { hour: '00:00', volume: 1200, normal: 1500 },
    { hour: '02:00', volume: 800, normal: 1000 },
    { hour: '04:00', volume: 1500, normal: 1800 },
    { hour: '06:00', volume: 6800, normal: 5000, spike: true },
    { hour: '08:00', volume: 9200, normal: 7500, spike: true },
    { hour: '10:00', volume: 8400, normal: 7000 },
    { hour: '12:00', volume: 4500, normal: 4200 },
    { hour: '14:00', volume: 3800, normal: 3500 },
    { hour: '16:00', volume: 6200, normal: 5500 },
    { hour: '18:00', volume: 7100, normal: 6000 },
    { hour: '20:00', volume: 4900, normal: 4500 },
    { hour: '22:00', volume: 2200, normal: 2000 }
  ];

  const topExtractors = [
    { rank: 1, name: 'Vadavalli Agri Cluster #3', district: 'Coimbatore', purpose: 'Agriculture', volumeKL: 48.5, hours: 14.5, flag: 'Over-Pumping' },
    { rank: 2, name: 'Melur Paddy Irrigation Unit', district: 'Madurai', purpose: 'Agriculture', volumeKL: 42.0, hours: 12.0, flag: 'High Usage' },
    { rank: 3, name: 'Bhavani Riverbed Extraction', district: 'Erode', purpose: 'Industrial', volumeKL: 38.2, hours: 10.5, flag: 'Normal' },
    { rank: 4, name: 'Kallapatti Central Well #1', district: 'Coimbatore', purpose: 'Drinking', volumeKL: 32.4, hours: 8.5, flag: 'Normal' },
    { rank: 5, name: 'Srirangam Temple Water Point', district: 'Trichy', purpose: 'Domestic', volumeKL: 28.0, hours: 7.0, flag: 'Normal' }
  ];

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header">
        <h1>Groundwater Extraction Patterns & Telemetry</h1>
        <p>Pumping duration analytics, diurnal extraction surges, sectoral distribution, and over-extraction triggers.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-4 mb-lg">
        <StatCard
          title="Daily Extraction Volume"
          value="422"
          unit="kL / day"
          icon={Droplet}
          accent="blue"
          trend="+4.2% Peak Summer Surge"
          trendType="up"
          subtitle="Regional Basins"
        />
        <StatCard
          title="Peak Pumping Window"
          value="06:00 - 10:30"
          unit="AM"
          icon={Clock}
          accent="purple"
          trend="Diurnal Surge"
          trendType="neutral"
          subtitle="Solar Feeders Active"
        />
        <StatCard
          title="Over-Extraction Flags"
          value="2"
          unit="Borewells"
          icon={ShieldAlert}
          accent="warm"
          trend="Vadavalli & Melur"
          trendType="down"
          subtitle=">12 hrs Continuous"
        />
        <StatCard
          title="Avg Pumping Efficiency"
          value="84"
          unit="%"
          icon={Zap}
          accent="green"
          trend="Smart Pump Regulated"
          trendType="up"
          subtitle="Power Grid Aligned"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-2 mb-lg" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Diurnal Hourly Extraction Chart */}
        <GlassCard
          title="Diurnal Hourly Extraction Profile (24-Hour Cycle)"
          subtitle="Actual extraction volume vs sustainable baseline (Liters / hr)"
        >
          <div style={{ height: '320px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyPumpingPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="L" />
                <Tooltip
                  contentStyle={{
                    background: '#0c1225',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="volume" name="Actual Extraction (L)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="normal" name="Sustainable Ceiling" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Purpose Breakdown Table & Progress */}
        <GlassCard
          title="Sectoral Quota Utilization"
          subtitle="Current extraction vs departmental volumetric allocations"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {extractionByPurposeData.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: item.color, fontWeight: 700 }}>
                    {item.value}% ({item.volumeKL?.toLocaleString()} kL)
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Top Extractors Leaderboard */}
      <GlassCard
        title="High-Discharge Telemetry Nodes (Top Daily Extractors)"
        subtitle="Ranked by cumulative pumping volume and running hours in past 24 hours"
      >
        <div className="data-table-wrapper" style={{ marginTop: '10px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Borewell Station</th>
                <th>District</th>
                <th>Primary Purpose</th>
                <th>24h Volume</th>
                <th>Pumping Run Hours</th>
                <th>Anomaly Flag</th>
              </tr>
            </thead>
            <tbody>
              {topExtractors.map((item) => (
                <tr key={item.rank}>
                  <td style={{ fontWeight: 700, color: '#22d3ee' }}>#{item.rank}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</td>
                  <td>{item.district}</td>
                  <td>{item.purpose}</td>
                  <td style={{ fontWeight: 700, color: '#0ea5e9' }}>{item.volumeKL} kL</td>
                  <td>{item.hours} hrs / day</td>
                  <td>
                    <span className={`status-badge ${item.flag === 'Over-Pumping' ? 'critical' : item.flag === 'High Usage' ? 'warning' : 'good'}`}>
                      {item.flag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default ExtractionPatterns;
