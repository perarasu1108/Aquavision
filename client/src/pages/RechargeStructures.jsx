import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Building,
  Gauge,
  Compass
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { apiService } from '../services/api';

const RechargeStructures = () => {
  const [structures, setStructures] = useState([]);
  const [filteredStructures, setFilteredStructures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Check Dam',
    capacity: 40000,
    currentStorageLevel: 75,
    district: 'Coimbatore',
    block: 'Annur',
    status: 'Operational',
    condition: 'Good',
    estimatedRecharge: 150000,
    cost: 3500000
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [typeFilter, districtFilter, structures]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        apiService.getRechargeStructures(),
        apiService.getRechargeStats()
      ]);
      if (listRes.data) setStructures(listRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching recharge structures:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...structures];
    if (typeFilter !== 'all') {
      list = list.filter(s => s.type.toLowerCase() === typeFilter.toLowerCase());
    }
    if (districtFilter !== 'all') {
      list = list.filter(s => s.district.toLowerCase() === districtFilter.toLowerCase());
    }
    setFilteredStructures(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiService.createRechargeStructure(formData);
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Artificial Recharge Structures & Check Dams</h1>
          <p>Harvesting capacity tracking, storage levels, and artificial infiltration effectiveness.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadData}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Sync</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)} style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Add Structure</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-4 mb-lg">
        <StatCard
          title="Total Structures"
          value={stats?.total || '6'}
          unit="Units"
          icon={Layers}
          accent="blue"
          trend={`${stats?.operational || '5'} operational`}
          trendType="up"
          subtitle="100% geo-tagged"
        />
        <StatCard
          title="Total Impoundment"
          value={((stats?.totalCapacity || 210000) / 1000).toFixed(0)}
          unit="kL"
          icon={Gauge}
          accent="green"
          trend={`${stats?.avgStorageLevel || '58.3'}% storage full`}
          trendType="up"
          subtitle="Monsoon Prepared"
        />
        <StatCard
          title="Est. Annual Infiltration"
          value={((stats?.totalEstimatedRecharge || 828000) / 1000).toFixed(0)}
          unit="kL / yr"
          icon={Building}
          accent="purple"
          trend="+18% over FY23"
          trendType="up"
          subtitle="Aquifer replenishment"
        />
        <StatCard
          title="Structures Needing Repair"
          value="1"
          unit="Damaged"
          icon={AlertTriangle}
          accent="warm"
          trend="RS-004 Melur Farm Pond"
          trendType="down"
          subtitle="Desiltation Required"
        />
      </div>

      {/* Filter Bar */}
      <GlassCard className="mb-lg" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filters:</span>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Structure Types</option>
            <option value="check dam">Check Dam</option>
            <option value="percolation tank">Percolation Tank</option>
            <option value="recharge shaft">Recharge Shaft</option>
            <option value="farm pond">Farm Pond</option>
            <option value="nala bund">Nala Bund</option>
            <option value="recharge well">Recharge Well</option>
          </select>

          <select
            className="form-select"
            style={{ width: '180px' }}
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="all">All Districts</option>
            <option value="coimbatore">Coimbatore</option>
            <option value="salem">Salem</option>
            <option value="madurai">Madurai</option>
            <option value="trichy">Trichy</option>
            <option value="erode">Erode</option>
          </select>
        </div>
      </GlassCard>

      {/* Cards Grid */}
      <div className="grid grid-3 mb-lg">
        {filteredStructures.map((s) => {
          const isLow = s.currentStorageLevel < 30;
          return (
            <GlassCard key={s._id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee' }}>{s.structureId}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>{s.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.district} &bull; {s.block} ({s.type})
                    </div>
                  </div>
                  <StatusBadge status={s.condition} />
                </div>

                {/* Live Storage Progress Bar */}
                <div style={{ margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Storage Level</span>
                    <span style={{ fontWeight: 700, color: isLow ? '#f59e0b' : '#22d3ee' }}>
                      {s.currentStorageLevel}% ({((s.capacity * s.currentStorageLevel) / 100).toLocaleString()} m³)
                    </span>
                  </div>
                  <div className={`progress-bar ${isLow ? 'danger' : ''}`}>
                    <div className="progress-fill" style={{ width: `${s.currentStorageLevel}%` }}></div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total Capacity</span>
                    <div style={{ fontWeight: 600 }}>{s.capacity?.toLocaleString()} m³</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Est. Annual Recharge</span>
                    <div style={{ fontWeight: 600, color: '#10b981' }}>{s.estimatedRecharge?.toLocaleString()} m³</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Constructed</span>
                    <div style={{ fontWeight: 600 }}>Year {s.constructionYear}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Status</span>
                    <div style={{ fontWeight: 600 }}>{s.status}</div>
                  </div>
                </div>
              </div>

              {/* Beneficiary Villages */}
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Beneficiary: </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {s.beneficiaryVillages?.join(', ') || 'Local Cluster'}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Structure Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Recharge Structure"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Structure Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Pollachi Sub-surface Dam #1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Structure Type *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Check Dam">Check Dam</option>
                <option value="Percolation Tank">Percolation Tank</option>
                <option value="Recharge Shaft">Recharge Shaft</option>
                <option value="Farm Pond">Farm Pond</option>
                <option value="Nala Bund">Nala Bund</option>
                <option value="Recharge Well">Recharge Well</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              <select
                className="form-select"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              >
                <option value="Coimbatore">Coimbatore</option>
                <option value="Salem">Salem</option>
                <option value="Madurai">Madurai</option>
                <option value="Trichy">Trichy</option>
                <option value="Erode">Erode</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Capacity (m³) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Storage Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={formData.currentStorageLevel}
                onChange={(e) => setFormData({ ...formData, currentStorageLevel: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Annual Recharge (m³)</label>
              <input
                type="number"
                className="form-input"
                value={formData.estimatedRecharge}
                onChange={(e) => setFormData({ ...formData, estimatedRecharge: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Structure
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RechargeStructures;
