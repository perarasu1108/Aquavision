import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers, Maximize2, Minimize2, Eye, Droplet, Sparkles, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LAYER_PROVIDERS = {
  cyber: {
    name: 'Cyber Dark Matrix',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  },
  satellite: {
    name: 'Satellite Aerial (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  standard: {
    name: 'OpenStreetMap Hydro',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  }
};

const BorewellMap = ({
  borewells = [],
  height = '420px',
  center = [11.0168, 76.9558],
  zoom = 9,
  showControls = true
}) => {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState('cyber');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      style={{
        height: isFullscreen ? '90vh' : height,
        width: '100%',
        borderRadius: isFullscreen ? '0' : 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-card)',
        position: 'relative',
        boxShadow: 'var(--shadow-card)',
        zIndex: isFullscreen ? 9999 : 1
      }}
    >
      {/* Interactive Map Overlay Controls */}
      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
            background: 'rgba(4, 8, 20, 0.85)',
            backdropFilter: 'blur(16px)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-card)'
          }}
        >
          {/* Layer Selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.keys(LAYER_PROVIDERS).map((key) => (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeLayer === key ? 'var(--gradient-primary)' : 'transparent',
                  color: activeLayer === key ? '#040814' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {key === 'cyber' ? '⚡ Cyber' : key === 'satellite' ? '🛰️ Satellite' : '🗺️ Standard'}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }}></div>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Toggle Aquifer Drawdown Heatmap Layers"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: showHeatmap ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
              color: showHeatmap ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
          >
            <Eye size={12} /> Heatmap
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#040814' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={LAYER_PROVIDERS[activeLayer].attribution}
          url={LAYER_PROVIDERS[activeLayer].url}
        />

        {borewells.map((bw) => {
          const coords = bw.location?.coordinates || [76.9558, 11.0168];
          const lat = coords[1];
          const lng = coords[0];
          if (!lat || !lng) return null;

          const isCritical = bw.currentWaterLevel > 15;
          const color = isCritical ? '#ef4444' : bw.status === 'Active' ? '#00f2fe' : '#f59e0b';

          return (
            <React.Fragment key={bw._id}>
              {/* Drawdown Heatmap Buffer Circles */}
              {showHeatmap && (
                <Circle
                  center={[lat, lng]}
                  radius={isCritical ? 9000 : 5000}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: isCritical ? 0.18 : 0.08,
                    color: color,
                    weight: 1,
                    dashArray: '4, 8'
                  }}
                />
              )}

              {/* 3D Telemetry Pulsing Node */}
              <CircleMarker
                center={[lat, lng]}
                radius={isCritical ? 11 : 9}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.9,
                  weight: 3
                }}
              >
                <Popup className="cyber-leaflet-popup">
                  <div style={{ color: '#0f172a', padding: '6px', minWidth: '220px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                        {bw.borewellId}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: bw.status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: bw.status === 'Active' ? '#15803d' : '#b91c1c'
                      }}>
                        {bw.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '2px', color: '#0f172a' }}>
                      {bw.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '10px' }}>
                      {bw.district} Basin &bull; {bw.village || 'Telemetry Station'}
                    </div>

                    {/* Sensor Specs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '10px' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>Depth</span>
                        <strong style={{ color: '#0f172a' }}>{bw.depth} m</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>Water Level</span>
                        <strong style={{ color: isCritical ? '#ef4444' : '#0284c7' }}>
                          {bw.currentWaterLevel} m bgl
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/ai-insights`)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={12} /> Run 60-Day AI Forecast
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default BorewellMap;
