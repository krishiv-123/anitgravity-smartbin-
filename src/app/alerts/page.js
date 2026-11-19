'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getSeverityInfo, getAlertTypeInfo, formatDate, formatRelativeTime, NEIGHBORHOODS } from '@/lib/utils';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: '',
    neighborhood: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/alerts').then((r) => r.json()),
      fetch('/api/bins').then((r) => r.json()),
    ]).then(([alertsData, binsData]) => {
      setAlerts(alertsData.alerts || []);
      setBins(binsData.bins || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getBin = (binId) => bins.find((b) => b.id === binId);

  const filteredAlerts = alerts.filter((alert) => {
    if (filters.type && alert.type !== filters.type) return false;
    if (filters.severity && alert.severity !== filters.severity) return false;
    if (filters.status && alert.status !== filters.status) return false;
    if (filters.neighborhood) {
      const bin = getBin(alert.binId);
      if (!bin || bin.location.neighborhood !== filters.neighborhood) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  const openCount = alerts.filter((a) => a.status === 'open').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'open').length;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sp-lime/30 border-t-sp-lime rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="page-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                Alerts & Notifications
              </h1>
              <p className="text-gray-500 mt-1">Monitor bin conditions, collection needs, and maintenance issues</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-sp-panel rounded-lg border border-sp-border">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-sm text-gray-300">{openCount} Open</span>
              </div>
              {criticalCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/30">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-sm text-red-400">{criticalCount} Critical</span>
                </div>
              )}
              <span className="demo-badge text-xs">Demo Data</span>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-3 mb-5">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-gray-500 shrink-0">Filter:</span>
              <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="select-field py-1.5 text-xs min-w-[140px]">
                <option value="">All Types</option>
                <option value="full">Bin Full</option>
                <option value="almost_full">Almost Full</option>
                <option value="damage">Damage</option>
                <option value="sensor_fault">Sensor Fault</option>
                <option value="connectivity">Connectivity</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="select-field py-1.5 text-xs min-w-[120px]">
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="select-field py-1.5 text-xs min-w-[120px]">
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select value={filters.neighborhood} onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })} className="select-field py-1.5 text-xs min-w-[150px]">
                <option value="">All Neighborhoods</option>
                {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {Object.values(filters).some(Boolean) && (
                <button onClick={() => setFilters({ type: '', severity: '', status: '', neighborhood: '' })} className="text-xs text-sp-lime hover:underline shrink-0">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Alert list */}
          <div className="text-sm text-gray-500 mb-3">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </div>
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const bin = getBin(alert.binId);
              const severity = getSeverityInfo(alert.severity);
              const typeInfo = getAlertTypeInfo(alert.type);
              const isResolved = alert.status === 'resolved';

              return (
                <div key={alert.id} className={`card p-4 ${isResolved ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${severity.bg}`}>
                      <span className="text-lg">{typeInfo.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{typeInfo.label}</span>
                        <span className={`badge ${severity.bg} ${severity.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${severity.dot} mr-1`} />
                          {severity.label}
                        </span>
                        <span className={`badge ${
                          alert.status === 'open' ? 'bg-amber-500/20 text-amber-400' :
                          alert.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-lime-500/20 text-lime-400'
                        }`}>
                          {alert.status === 'open' ? 'Open' : alert.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mb-2">{alert.message}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        {bin && (
                          <>
                            <span className="font-mono">{alert.binId}</span>
                            <span>{bin.name}</span>
                            <span>{bin.location.neighborhood}</span>
                          </>
                        )}
                        <span>Reported {formatRelativeTime(alert.reportedAt)}</span>
                        {alert.resolvedAt && (
                          <span className="text-lime-500">Resolved {formatRelativeTime(alert.resolvedAt)} by {alert.resolvedBy}</span>
                        )}
                      </div>

                      {alert.resolutionNote && (
                        <div className="mt-2 p-2 bg-sp-bg rounded text-xs text-gray-400 border border-sp-border">
                          <span className="text-gray-500">Resolution: </span>{alert.resolutionNote}
                        </div>
                      )}
                    </div>

                    {/* Map link */}
                    <Link
                      href={`/?bin=${alert.binId}`}
                      className="btn-secondary text-xs shrink-0"
                    >
                      View on Map →
                    </Link>
                  </div>
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="card p-12 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-400">No alerts match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
