import React, { useState } from 'react';
import {
  FileBarChart2,
  Download,
  FileText,
  Printer,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('comprehensive');
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      setGenerating(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,BorewellID,District,Depth_m,WaterLevel_mbgl,Yield_L_hr,Status\nBW-001,Coimbatore,180,8.4,3200,Active\nBW-002,Coimbatore,210,16.8,1800,Active\nBW-003,Salem,140,5.2,4500,Active\nBW-004,Salem,195,18.9,1200,Maintenance\nBW-005,Madurai,160,11.5,2800,Active\nBW-006,Madurai,240,24.2,600,Inactive\nBW-007,Trichy,120,4.8,4800,Active\nBW-008,Erode,135,6.1,4100,Active\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AquaVision_Telemetry_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header">
        <h1>Hydro-Analytics & Departmental Audits</h1>
        <p>Comprehensive groundwater ledger generation, artificial recharge audits, and regulatory export formats.</p>
      </div>

      <div className="grid grid-2 mb-lg" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
        {/* Report Configuration */}
        <GlassCard title="Report Generation Suite" subtitle="Configure audit scope and export parameters">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div className="form-group">
              <label className="form-label">Audit Period</label>
              <select
                className="form-select"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
              >
                <option value="monthly">Current Month (August 2026)</option>
                <option value="quarterly">Q2 FY26 Post-Monsoon Audit</option>
                <option value="annual">Annual State Hydrogeology Ledger</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Report Category</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="comprehensive">Comprehensive State Water Ledger</option>
                <option value="critical">Critical Aquifer Stress Audit</option>
                <option value="recharge">Artificial Recharge & Check Dam Audit</option>
                <option value="extraction">Industrial & Agri Extraction Quotas</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
                style={{ flex: 1, gap: '6px' }}
              >
                <Sparkles size={16} />
                <span>{generating ? 'Compiling AI Ledger...' : 'Generate Executive Report'}</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleDownloadCSV}
                title="Download CSV dataset"
                style={{ gap: '6px' }}
              >
                <Download size={16} />
                <span>CSV</span>
              </button>
            </div>

            {downloadSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.8rem', marginTop: '6px' }}>
                <CheckCircle2 size={16} />
                <span>Report compiled successfully with AI Executive Summary!</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Executive Summary Preview */}
        <GlassCard title="Executive Water Resource Summary (Tamil Nadu Basin)" subtitle="Auto-compiled state summary for Water Resource Secretariats">
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.84rem', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#22d3ee', marginBottom: '8px' }}>
              State Hydrogeology Assessment Highlights
            </div>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <li>
                <strong>Aquifer Storage Recovery:</strong> Regional water tables experienced a net recovery of <strong>+1.6m</strong> post-monsoon, led by the Cauvery delta (Trichy: 4.8m bgl).
              </li>
              <li>
                <strong>Critical Hotspot:</strong> Madurai division (Thirumangalam block) continues to record severe groundwater depletion (&gt; 24m bgl) due to extensive summer bore extraction.
              </li>
              <li>
                <strong>Recharge Structure Output:</strong> Artificial infiltration structures impounded <strong>210,000 m³</strong>, contributing an estimated <strong>828,000 m³/yr</strong> of subsurface percolation.
              </li>
              <li>
                <strong>Regulatory Compliance:</strong> 92% of commercial extraction borewells met volumetric smart meter filing deadlines for the current fiscal cycle.
              </li>
            </ul>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Compiled by: <strong>AquaVision Hydro-AI Engine</strong></span>
              <span>Classification: <strong>Official Government Record</strong></span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Reports;
