import React, { useState, useEffect } from 'react';
import {
  Pipette,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { apiService } from '../services/api';
import { useLocation } from 'react-router-dom';

const BorewellManager = () => {
  const location = useLocation();
  const [borewells, setBorewells] = useState([]);
  const [filteredBorewells, setFilteredBorewells] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBorewell, setEditingBorewell] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    district: 'Coimbatore',
    block: '',
    village: '',
    depth: 150,
    currentWaterLevel: 8.5,
    yieldRate: 3000,
    pumpType: 'Submersible',
    motorHP: 5,
    status: 'Active',
    lat: '11.0168',
    lng: '76.9558'
  });

  useEffect(() => {
    // Read search param if passed from navbar
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query) {
      setSearch(query);
    }
    loadBorewells();
  }, [location.search]);

  useEffect(() => {
    applyFilters();
  }, [search, districtFilter, statusFilter, borewells]);

  const loadBorewells = async () => {
    setLoading(true);
    try {
      const res = await apiService.getBorewells();
      if (res.data) {
        setBorewells(res.data);
      }
    } catch (err) {
      console.error('Error fetching borewells:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...borewells];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(b =>
        b.name?.toLowerCase().includes(s) ||
        b.borewellId?.toLowerCase().includes(s) ||
        b.village?.toLowerCase().includes(s) ||
        b.district?.toLowerCase().includes(s)
      );
    }
    if (districtFilter !== 'all') {
      list = list.filter(b => b.district?.toLowerCase() === districtFilter.toLowerCase());
    }
    if (statusFilter !== 'all') {
      list = list.filter(b => b.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    setFilteredBorewells(list);
  };

  const handleOpenAdd = () => {
    setEditingBorewell(null);
    setFormData({
      name: '',
      district: 'Coimbatore',
      block: 'Annur',
      village: 'Kallapatti',
      depth: 180,
      currentWaterLevel: 8.5,
      yieldRate: 3200,
      pumpType: 'Submersible',
      motorHP: 7.5,
      status: 'Active',
      lat: '11.0568',
      lng: '76.9858'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bw) => {
    setEditingBorewell(bw);
    setFormData({
      name: bw.name,
      district: bw.district,
      block: bw.block || '',
      village: bw.village || '',
      depth: bw.depth,
      currentWaterLevel: bw.currentWaterLevel,
      yieldRate: bw.yieldRate,
      pumpType: bw.pumpType || 'Submersible',
      motorHP: bw.motorHP || 5,
      status: bw.status,
      lat: bw.location?.coordinates ? bw.location.coordinates[1] : '11.01',
      lng: bw.location?.coordinates ? bw.location.coordinates[0] : '76.95'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to decommission / delete this borewell telemetry node?')) {
      await apiService.deleteBorewell(id);
      loadBorewells();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingBorewell) {
      await apiService.updateBorewell(editingBorewell._id, formData);
    } else {
      await apiService.createBorewell(formData);
    }
    setIsModalOpen(false);
    loadBorewells();
  };

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Borewell Telemetry & Inventory</h1>
          <p>Digital registry of deep borewells, telemetry sensors, yield flowrates, and operational statuses.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadBorewells}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd} style={{ gap: '6px' }}>
            <Plus size={15} />
            <span>Add Telemetry Well</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <GlassCard className="mb-lg" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search borewell name, ID, or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="form-select"
              style={{ width: '160px' }}
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

            <select
              className="form-select"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="under maintenance">Under Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Borewells Data Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Borewell ID</th>
              <th>Name & Village</th>
              <th>District & Block</th>
              <th>Total Depth</th>
              <th>Current Water Level</th>
              <th>Yield Rate</th>
              <th>Pump & HP</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBorewells.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No borewells matched your criteria.
                </td>
              </tr>
            ) : (
              filteredBorewells.map((bw) => {
                const isCritical = bw.currentWaterLevel > 15;
                return (
                  <tr key={bw._id}>
                    <td style={{ fontWeight: 700, color: '#22d3ee' }}>
                      {bw.borewellId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bw.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bw.village}</div>
                    </td>
                    <td>
                      <div>{bw.district}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bw.block || 'Main'}</div>
                    </td>
                    <td>{bw.depth} m</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isCritical ? '#ef4444' : '#0284c7'
                        }}
                      >
                        {bw.currentWaterLevel} m bgl
                      </span>
                      {isCritical && (
                        <span style={{ marginLeft: '6px', fontSize: '0.65rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: '4px' }}>
                          Critical
                        </span>
                      )}
                    </td>
                    <td>{bw.yieldRate?.toLocaleString()} L/hr</td>
                    <td>
                      <div>{bw.pumpType}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bw.motorHP} HP Motor</div>
                    </td>
                    <td>
                      <StatusBadge status={bw.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon btn-secondary"
                          onClick={() => handleOpenEdit(bw)}
                          title="Edit Borewell"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(bw._id)}
                          title="Delete Borewell"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBorewell ? `Edit Borewell (${editingBorewell.borewellId})` : 'Register New Telemetry Borewell'}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Borewell Station Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Kallapatti Central Well #2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
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
              <label className="form-label">Block / Taluk</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Annur"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Village / Panchayat</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Kallapatti"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Depth (Meters) *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.depth}
                onChange={(e) => setFormData({ ...formData, depth: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Water Level (m bgl) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                required
                value={formData.currentWaterLevel}
                onChange={(e) => setFormData({ ...formData, currentWaterLevel: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Yield Capacity (Liters / Hour)</label>
              <input
                type="number"
                className="form-input"
                value={formData.yieldRate}
                onChange={(e) => setFormData({ ...formData, yieldRate: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pump Type</label>
              <select
                className="form-select"
                value={formData.pumpType}
                onChange={(e) => setFormData({ ...formData, pumpType: e.target.value })}
              >
                <option value="Submersible">Submersible</option>
                <option value="Centrifugal">Centrifugal</option>
                <option value="Jet">Jet Pump</option>
                <option value="Hand Pump">Hand Pump</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="text"
                className="form-input"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="text"
                className="form-input"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingBorewell ? 'Save Changes' : 'Register Borewell'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BorewellManager;
