import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  TrendingDown,
  AlertTriangle,
  Brain,
  Layers,
  LineChart as LineChartIcon,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatCard from '../components/common/StatCard';
import { apiService } from '../services/api';
import { initialBorewells } from '../data/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'predictions' | 'anomalies'
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `🌊 **AquaVision AI Hydro-Intelligence Ready**\n\nI am connected to the regional groundwater telemetry and predictive neural network. You can ask me about:\n- **Aquifer drawdown predictions & seasonal forecasts**\n- **Borewells with severe critical depletion**\n- **Recharge structure impact assessments**\n- **Agricultural vs Industrial extraction policies**`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Prediction State
  const [selectedBorewellId, setSelectedBorewellId] = useState('BW-001');
  const [daysAhead, setDaysAhead] = useState(60);
  const [predictionData, setPredictionData] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadPrediction();
  }, [selectedBorewellId, daysAhead]);

  const loadPrediction = async () => {
    setLoadingPrediction(true);
    try {
      const res = await apiService.predictWaterLevel(selectedBorewellId, daysAhead);
      if (res.data) {
        setPredictionData(res.data);
      }
    } catch (err) {
      console.error('Error fetching prediction:', err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoadingChat(true);

    try {
      const res = await apiService.askAIChat(userText);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.data?.response || 'I analyzed the data but could not generate a response.' }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '⚠️ Connection issue with AI service. Please try again.' }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const quickPrompts = [
    'Which borewells are at critical water levels?',
    'What is the 60-day forecast for Coimbatore aquifer?',
    'Evaluate the efficiency of Annur Check Dam (RS-001)',
    'Suggest extraction policy limits for paddy irrigation'
  ];

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>AI Hydro-Intelligence & Aquifer Forecasting</h1>
          <p>Ensemble LSTM neural predictions, intelligent conversational copilot, and automated anomaly flags.</p>
        </div>

        {/* Tab Navigator */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} /> Conversational Copilot
          </button>
          <button
            className={`tab ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Brain size={14} /> Neural Forecasting Engine
          </button>
          <button
            className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`}
            onClick={() => setActiveTab('anomalies')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Cpu size={14} /> Anomaly Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: AI CHAT */}
      {activeTab === 'chat' && (
        <div>
          {/* Quick Prompts Bar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setInputMessage(q);
                }}
                style={{ fontSize: '0.76rem', whiteSpace: 'nowrap', background: 'rgba(255, 255, 255, 0.03)' }}
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-message ${m.sender}`}>
                  <div className="msg-avatar">
                    {m.sender === 'ai' ? <Bot size={18} /> : <UserIcon size={18} />}
                  </div>
                  <div
                    className="msg-bubble"
                    style={{ whiteSpace: 'pre-line' }}
                    dangerouslySetInnerHTML={{
                      __html: m.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/- /g, '&bull; ')
                    }}
                  />
                </div>
              ))}
              {loadingChat && (
                <div className="chat-message ai">
                  <div className="msg-avatar">
                    <Bot size={18} />
                  </div>
                  <div className="msg-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={14} className="spinner" />
                    <span>Analyzing sensor telemetries & computing response...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input
                type="text"
                placeholder="Ask AquaVision AI anything about groundwater, borewells, recharge structures..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" disabled={loadingChat || !inputMessage.trim()}>
                <Send size={15} style={{ display: 'inline', marginRight: '6px' }} />
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: NEURAL FORECASTING ENGINE */}
      {activeTab === 'predictions' && (
        <div>
          {/* Controls Bar */}
          <GlassCard className="mb-lg" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Select Borewell Station:
                  </label>
                  <select
                    className="form-select"
                    style={{ width: '260px' }}
                    value={selectedBorewellId}
                    onChange={(e) => setSelectedBorewellId(e.target.value)}
                  >
                    {initialBorewells.map((b) => (
                      <option key={b.borewellId} value={b.borewellId}>
                        {b.borewellId} - {b.name} ({b.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Prediction Horizon:
                  </label>
                  <select
                    className="form-select"
                    style={{ width: '160px' }}
                    value={daysAhead}
                    onChange={(e) => setDaysAhead(Number(e.target.value))}
                  >
                    <option value={30}>30 Days Ahead</option>
                    <option value={60}>60 Days Ahead</option>
                    <option value={90}>90 Days Ahead</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Architecture</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22d3ee' }}>
                    {predictionData?.modelConfidence || 'LSTM Recurrent Ensemble'}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Forecasting Chart */}
          <GlassCard
            title={`Water Table Depth Forecast: ${predictionData?.borewell?.name || selectedBorewellId}`}
            subtitle={`Projected drawdown curve for next ${daysAhead} days with 90% confidence bands (m bgl)`}
            action={
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: predictionData?.riskLevel?.includes('Critical') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                  color: predictionData?.riskLevel?.includes('Critical') ? '#ef4444' : '#10b981'
                }}
              >
                Risk Status: {predictionData?.riskLevel || 'Safe Sustainable'}
              </span>
            }
          >
            <div style={{ height: '360px', width: '100%', marginTop: '14px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData?.predictions || []}>
                  <defs>
                    <linearGradient id="predColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" interval={Math.floor(daysAhead / 8)} />
                  <YAxis stroke="#64748b" unit="m" />
                  <Tooltip
                    contentStyle={{
                      background: '#0c1225',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="predictedLevel"
                    name="Predicted Water Depth (m bgl)"
                    stroke="#22d3ee"
                    fill="url(#predColor)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidenceHigh"
                    name="Upper Bound (Pessimistic)"
                    stroke="#ef4444"
                    fill="none"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidenceLow"
                    name="Lower Bound (Optimistic)"
                    stroke="#10b981"
                    fill="none"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Depth</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  {predictionData?.borewell?.currentWaterLevel || 8.5} m bgl
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Projected End Depth ({daysAhead}d)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22d3ee' }}>
                  {predictionData?.predictions?.[predictionData.predictions.length - 1]?.predictedLevel || '--'} m bgl
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predicted Net Drawdown</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>
                  +{(
                    (predictionData?.predictions?.[predictionData.predictions.length - 1]?.predictedLevel || 8.5) -
                    (predictionData?.borewell?.currentWaterLevel || 8.5)
                  ).toFixed(2)} m
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: ANOMALY MATRIX */}
      {activeTab === 'anomalies' && (
        <div className="grid grid-2">
          <GlassCard title="Automated Neural Anomaly Detectors" subtitle="Continuous telemetry outlier scanning">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ padding: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#ef4444' }}>Rapid Drawdown Anomaly</span>
                  <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>Critical</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Borewell <strong>BW-006 (Thirumangalam)</strong> dropped 1.8m in 72 hours. Probability of unauthorized adjacent commercial suction pump: <strong>89.4%</strong>.
                </p>
              </div>

              <div style={{ padding: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>Silt Infiltration Impedance</span>
                  <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>Warning</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Recharge Structure <strong>RS-004 (Melur Farm Pond)</strong> recorded a 40% slower infiltration coefficient despite 80mm rainfall event.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Prescriptive AI Recommendations" subtitle="Optimized water policy and infrastructure actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ padding: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px' }}>
                <div style={{ fontWeight: 700, color: '#10b981' }}>Artificial Recharge Expansion Target</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Construct 2 check dams along the Noyyal tributary in Annur block to capture 120,000 m³ monsoon surplus.
                </p>
              </div>

              <div style={{ padding: '14px', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '10px' }}>
                <div style={{ fontWeight: 700, color: '#0ea5e9' }}>Staggered Agriculture Pumping Schedule</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Shift Perur agricultural feeder power supply from morning (07:00 AM) to late afternoon to reduce peak drawdown intensity by 30%.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
