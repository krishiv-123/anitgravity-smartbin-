'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getFillStatus } from '@/lib/utils';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;

// Center of Greenfield Demo City
const CITY_CENTER = [30.2700, -97.7430];
const DEFAULT_ZOOM = 14;

function createBinIcon(bin) {
  const fill = getFillStatus(bin.fillLevel);
  const isAlert = bin.status === 'damaged' || bin.status === 'offline' || bin.fillLevel > 80;

  return L.divIcon({
    className: 'custom-bin-marker',
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${fill.hex}22;
        border: 2px solid ${fill.hex};
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        position: relative;
        box-shadow: 0 0 10px ${fill.hex}33;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <div style="
          width: 18px; height: 18px;
          background: ${fill.hex};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="font-size: 9px; color: #0a0a0f; font-weight: 700;">${bin.fillLevel}</span>
        </div>
        ${isAlert ? `<div style="
          position: absolute; top: -3px; right: -3px;
          width: 10px; height: 10px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #0a0a0f;
        " class="marker-pulse"></div>` : ''}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function FlyToSelected({ selectedBin }) {
  const map = useMap();
  useEffect(() => {
    if (selectedBin) {
      map.flyTo([selectedBin.location.lat, selectedBin.location.lng], 16, { duration: 0.8 });
    }
  }, [selectedBin, map]);
  return null;
}

export default function CityMap({ bins, selectedBin, onSelectBin, alerts }) {
  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      style={{ minHeight: '500px', background: '#0a0a0f' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected selectedBin={selectedBin} />
      {bins.map((bin) => (
        <Marker
          key={bin.id}
          position={[bin.location.lat, bin.location.lng]}
          icon={createBinIcon(bin)}
          eventHandlers={{
            click: () => onSelectBin(bin),
          }}
        >
          <Popup>
            <div style={{ minWidth: '180px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', color: '#fff' }}>{bin.name}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>{bin.id} • {bin.location.neighborhood}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  flex: 1, height: '6px', background: '#1e1e26', borderRadius: '3px', overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${bin.fillLevel}%`, height: '100%', background: getFillStatus(bin.fillLevel).hex, borderRadius: '3px'
                  }} />
                </div>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: getFillStatus(bin.fillLevel).hex }}>
                  {bin.fillLevel}%
                </span>
              </div>
              <button
                onClick={() => onSelectBin(bin)}
                style={{
                  marginTop: '8px', width: '100%', padding: '6px',
                  background: '#84cc1622', border: '1px solid #84cc1644',
                  borderRadius: '6px', color: '#84cc16', fontSize: '12px',
                  cursor: 'pointer', fontWeight: 500,
                }}
              >
                View Details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
