'use client';

import { useState } from 'react';
import { getFillStatus, getStatusInfo, getAlertTypeInfo, formatDate, formatRelativeTime, BIN_TYPES, hasPermission } from '@/lib/utils';

export default function BinDetailPanel({ bin, alerts, user, onClose, onRefresh }) {
  const [collectNote, setCollectNote] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [acting, setActing] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  if (!bin) return null;

  const fill = getFillStatus(bin.fillLevel);
  const statusInfo = getStatusInfo(bin.status);
  const binTypeInfo = BIN_TYPES.find((t) => t.value === bin.binType);
  const openAlerts = alerts.filter((a) => a.status === 'open');
  const canCollect = user && (user.role === 'admin' || user.role === 'collector');
  const canRepair = user && (user.role === 'admin' || user.role === 'repair');
  const hasDamageAlert = openAlerts.some((a) => a.type === 'damage');

  const handleCollect = async () => {
    setActing(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/bins/${bin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'collect', note: collectNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: 'success', text: 'Bin marked as collected.' });
        setCollectNote('');
        onRefresh();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error' });
    }
    setActing(false);
  };

  const handleResolve = async (alertId) => {
    setActing(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', note: resolveNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: 'success', text: 'Issue marked as resolved.' });
        setResolveNote('');
        onRefresh();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error' });
    }
    setActing(false);
  };

  return (
    <div className="w-full lg:w-[420px] bg-sp-panel border-l border-sp-border overflow-y-auto animate-slide-in"
         style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{bin.name}</h2>
            <p className="text-sm text-gray-500 font-mono">{bin.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-sp-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge ${statusInfo.bg} ${statusInfo.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} mr-1.5`} />
            {statusInfo.label}
          </span>
          <span className={`badge ${fill.bg} ${fill.text} ${fill.border} border`}>
            {fill.label} — {bin.fillLevel}%
          </span>
          {binTypeInfo && (
            <span className="badge bg-sp-bg text-gray-400 border border-sp-border">
              {binTypeInfo.icon} {binTypeInfo.label}
            </span>
          )}
        </div>

        {/* Fill level bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400">Fill Level</span>
            <span className="font-mono" style={{ color: fill.hex }}>{bin.fillLevel}%</span>
          </div>
          <div className="w-full h-3 bg-sp-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${bin.fillLevel}%`, backgroundColor: fill.hex }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 italic">⚡ Demo data — not a live sensor reading</p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <DetailItem label="Location" value={bin.location.address} />
          <DetailItem label="Neighborhood" value={bin.location.neighborhood} />
          <DetailItem label="Capacity" value={bin.capacity} />
          <DetailItem label="Sensor Battery" value={`${bin.sensorBattery}%`} valueColor={bin.sensorBattery < 20 ? 'text-red-400' : 'text-gray-300'} />
          <DetailItem label="Last Collection" value={formatRelativeTime(bin.lastCollection)} />
          <DetailItem label="Last Updated" value={formatRelativeTime(bin.lastUpdated)} />
          <DetailItem label="Installed" value={formatDate(bin.installDate)} />
          <DetailItem label="Coordinates" value={`${bin.location.lat.toFixed(4)}, ${bin.location.lng.toFixed(4)}`} mono />
        </div>

        {/* Open Alerts */}
        {openAlerts.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Active Alerts ({openAlerts.length})
            </h3>
            <div className="space-y-2">
              {openAlerts.map((alert) => {
                const typeInfo = getAlertTypeInfo(alert.type);
                return (
                  <div key={alert.id} className="bg-sp-bg rounded-lg p-3 border border-sp-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{typeInfo.icon}</span>
                        <span className="text-white font-medium">{typeInfo.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatRelativeTime(alert.reportedAt)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{alert.message}</p>

                    {/* Resolve action for repair staff on damage alerts */}
                    {canRepair && alert.type === 'damage' && (
                      <div className="mt-2 pt-2 border-t border-sp-border">
                        <input
                          type="text"
                          placeholder="Resolution note..."
                          value={resolveNote}
                          onChange={(e) => setResolveNote(e.target.value)}
                          className="input-field text-xs py-1.5 mb-2"
                        />
                        <button
                          onClick={() => handleResolve(alert.id)}
                          disabled={acting}
                          className="btn-primary text-xs w-full py-1.5"
                        >
                          {acting ? 'Processing...' : '✓ Mark Issue as Resolved'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collection action for staff */}
        {canCollect && (
          <div className="mb-5 p-4 bg-sp-bg rounded-lg border border-sp-border">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-sp-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Staff Action
            </h3>
            <input
              type="text"
              placeholder="Collection note (optional)..."
              value={collectNote}
              onChange={(e) => setCollectNote(e.target.value)}
              className="input-field text-sm py-2 mb-2"
            />
            <button
              onClick={handleCollect}
              disabled={acting}
              className="btn-primary w-full text-sm"
            >
              {acting ? 'Processing...' : '🗑️ Mark as Collected'}
            </button>
            <p className="text-xs text-gray-600 mt-1.5 italic">
              Fill level will be reset to demo value (no live sensor connected)
            </p>
          </div>
        )}

        {/* Action feedback */}
        {actionMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            actionMsg.type === 'success' ? 'bg-lime-500/10 text-lime-400 border border-lime-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {actionMsg.text}
          </div>
        )}

        {/* Activity History */}
        {bin.history && bin.history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Activity History</h3>
            <div className="space-y-2">
              {bin.history.slice().reverse().slice(0, 10).map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-1.5 h-1.5 bg-sp-border rounded-full mt-1.5 shrink-0" />
                  <div>
                    <span className="text-gray-300">{entry.action}</span>
                    {entry.performedBy && (
                      <span className="text-gray-500"> by {entry.performedBy}</span>
                    )}
                    <p className="text-gray-600">{entry.notes}</p>
                    <p className="text-gray-600">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, valueColor = 'text-gray-300', mono = false }) {
  return (
    <div className="bg-sp-bg rounded-lg p-2.5">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className={`text-sm ${valueColor} ${mono ? 'font-mono text-xs' : ''} truncate`}>{value}</div>
    </div>
  );
}
