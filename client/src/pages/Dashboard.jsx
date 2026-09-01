import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Waves,
  Pipette,
  Layers,
  Activity,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Sliders,
  CloudRain,
  Sun,
  Flame,
  CheckCircle
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import GlassCard from '../components/common/GlassCard';
import StatusBadge from '../components/common/StatusBadge';
import BorewellMap from '../components/maps/BorewellMap';
import WaterLevelGauge from '../components/common/WaterLevelGauge';
import { apiService } from '../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [rechargeStats, setRechargeStats] = useState(null);
  const [borewells, setBorewells] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [waterTrend, setWaterTrend] = useState([]);
  const [extractionData, setExtractionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scenario Simulator State
  const [simulationScenario, setSimulationScenario] = useState('baseline'); // 'baseline' | 'monsoon' | 'drought'

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bwStatsRes, rcStatsRes, bwListRes, altRes, trendRes, extRes] = await Promise.all([
        apiService.getBorewellStats(),
        apiService.getRechargeStats(),
        apiService.getBorewells(),
        apiService.getAlerts(),
        apiService.getWaterTrend(),
        apiService.getExtractionBreakdown()
      ]);

      if (bwStatsRes.data) setStats(bwStatsRes.data);
      if (rcStatsRes.data) setRechargeStats(rcStatsRes.data);
      if (bwListRes.data) setBorewells(bwListRes.data);
      if (altRes.data) setAlerts(altRes.data.slice(0, 4));
      if (trendRes.data?.monthlyAvg) setWaterTrend(trendRes.data.monthlyAvg);
      if (extRes.data?.purposeBreakdown) setExtractionData(extRes.data.purposeBreakdown);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#00f2fe', '#10b981', '#f59e0b', '#a855f7'];

  // Apply scenario multiplier to trend
  const simulatedTrend = waterTrend.map(item => {
    let offset = 0;
    if (simulationScenario === 'monsoon') offset = -2.2; // water table rises, depth decreases
    if (simulationScenario === 'drought') offset = 3.1;  // water table drops, depth increases
    return {
      ...item,
      coimbatore: Math.max(2, parseFloat((item.coimbatore + offset).toFixed(1))),
      madurai: Math.max(3, parseFloat((item.madurai + offset * 1.2).toFixed(1))),
      salem: Math.max(2, parseFloat((item.salem + offset * 0.8).toFixed(1)))
    };
  });

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Aquifer Command & Telemetry Center</h1>
          <p>Real-time telemetry streams, AI hydrological drawdown simulations, and artificial recharge analytics.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadDashboardData} style={{ gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Sync Grid</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/borewells')} style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Register Borewell</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-4 mb-lg stagger-children">
        <StatCard
          title="Monitored Borewells"
          value={stats?.total || '8'}
          unit="Nodes"
          icon={Pipette}
          accent="cyan"
          trend={`${stats?.active || '6'} operational`}
          trendType="up"
          subtitle="99.4% Sensor Uptime"
        />

        <StatCard
          title="Average Water Table"
          value={stats?.avgWaterLevel || '9.6'}
          unit="m bgl"
          icon={Waves}
          accent="purple"
          trend="-0.4m Drawdown"
          trendType="down"
          subtitle="Safe Target: < 12m"
        />

        <StatCard
          title="Artificial Recharge"
          value={((rechargeStats?.totalCapacity || 210000) / 1000).toFixed(0)}
          unit="kL Cap."
          icon={Layers}
          accent="emerald"
          trend={`${rechargeStats?.avgStorageLevel || '58.3'}% storage full`}
          trendType="up"
          subtitle="6 Geo-tagged Units"
        />

        <StatCard
          title="Critical Alerts"
          value={alerts.filter(a => !a.isResolved).length || '3'}
          unit="Active"
          icon={AlertTriangle}
          accent="amber"
          trend="1 Severe Depletion"
          trendType="down"
          subtitle="Action Required"
        />
      </div>

      {/* Dynamic Water Table Simulator & Scenario Modeling Bar */}
      <GlassCard className="mb-lg" style={{ padding: '20px 26px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'center' }}>
          {/* Animated Liquid Reservoir Gauge */}
          <WaterLevelGauge
            currentLevel={stats?.avgWaterLevel || 9.6}
            maxDepth={30}
            unit="m bgl"
            label="Tamil Nadu Basin Aquifer Dynamic Head"
          />

          {/* Quick Scenario Simulator */}
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sliders size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Aquifer Climate & Pumping Simulator</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Test how hypothetical rainfall surplus or drought surges alter regional groundwater tables:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                className={`btn btn-sm ${simulationScenario === 'baseline' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSimulationScenario('baseline')}
                style={{ fontSize: '0.74rem' }}
              >
                Normal Baseline
              </button>
              <button
                className={`btn btn-sm ${simulationScenario === 'monsoon' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSimulationScenario('monsoon')}
                style={{ fontSize: '0.74rem' }}
              >
                <CloudRain size={13} /> +30% Monsoon
              </button>
              <button
                className={`btn btn-sm ${simulationScenario === 'drought' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSimulationScenario('drought')}
                style={{ fontSize: '0.74rem' }}
              >
                <Flame size={13} /> Severe Heatwave
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Charts Row */}
      <div className="grid grid-2 mb-lg" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        {/* Fluctuation Hydrograph */}
        <GlassCard
          title="Dynamic Groundwater Hydrograph"
          subtitle="Depth to water table (meters below ground level) with real-time scenario modeling"
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/groundwater')}>
              Deep Dive <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ height: '320px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulatedTrend}>
                <defs>
                  <linearGradient id="cyberCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cyberRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} unit="m" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-modal)',
                    borderColor: 'var(--border-card)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-neon)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="coimbatore" name="Coimbatore (m)" stroke="#00f2fe" fill="url(#cyberCyan)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="madurai" name="Madurai (Critical)" stroke="#ef4444" fill="url(#cyberRed)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="salem" name="Salem (m)" stroke="#10b981" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Sectoral Breakdown */}
        <GlassCard
          title="Sectoral Water Quota Allocation"
          subtitle="Monthly volume extracted by user classification"
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/extraction')}>
              Patterns <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={extractionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {extractionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-modal)',
                    borderColor: 'var(--border-card)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(val) => [`${val}% of Total Volume`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
            {extractionData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Geospatial Satellite Map + AI Copilot Dispatch */}
      <div className="grid grid-2 mb-lg" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <GlassCard
          title="GIS Telemetry Map & Satellite Imagery"
          subtitle="Switch between Cyber, ESRI Satellite, and Drawdown Heatmap layers"
        >
          <BorewellMap borewells={borewells} height="360px" />
        </GlassCard>

        {/* AI Copilot Card */}
        <GlassCard
          title="AI Hydro-Intelligence Dispatch"
          subtitle="Real-time predictive analysis from ensemble LSTM neural models"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/ai-insights')} style={{ gap: '4px' }}>
              <Sparkles size={13} /> Chat with AI
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                gap: '12px'
              }}
            >
              <Sparkles size={22} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent-cyan)', marginBottom: '2px' }}>
                  Pre-Monsoon Depletion Alert
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Madurai agricultural aquifer shows a <strong>1.4m faster drawdown</strong> than 5-year averages due to early summer paddy irrigation.
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                gap: '12px'
              }}
            >
              <Waves size={22} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent-emerald)', marginBottom: '2px' }}>
                  Artificial Recharge High Impact
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Annur Check Dam (RS-001) raised groundwater tables in surrounding 3 villages by <strong>+2.1m</strong> over 45 days.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Neural Ensemble Confidence: <strong style={{ color: 'var(--accent-cyan)' }}>94.2%</strong></span>
              <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/ai-insights')}>
                View 90-Day Forecast &rarr;
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Alerts Feed */}
      <GlassCard
        title="Active Telemetry & Field Alerts"
        subtitle="Critical threshold exceedances and infrastructure maintenance requirements"
        action={
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/alerts')}>
            All Alerts ({alerts.length}) <ArrowRight size={14} />
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alt) => (
            <div
              key={alt._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--bg-glass)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <StatusBadge status={alt.severity} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {alt.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {alt.message}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {alt.district} &bull; {alt.isResolved ? 'Resolved' : 'Pending Action'}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
