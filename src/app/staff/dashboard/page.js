'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  formatDate,
  formatRelativeTime,
  getFillStatus,
  getSeverityInfo,
  getAlertTypeInfo,
  getStatusInfo,
  NEIGHBORHOODS,
  BIN_TYPES,
} from '@/lib/utils';

export default function StaffDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bins, setBins] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [settings, setSettings] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push('/staff/login');
          return;
        }
        setUser(d.user);
        return loadData(d.user);
      })
      .catch(() => router.push('/staff/login'));
  }, []);

  const loadData = async (currentUser) => {
    try {
      const u = currentUser || user;
      const promises = [
        fetch('/api/bins').then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
        fetch('/api/complaints').then((r) => r.json()),
      ];

      if (u?.role === 'admin') {
        promises.push(fetch('/api/admin/users').then((r) => r.json()));
        promises.push(fetch('/api/admin/audit').then((r) => r.json()));
        promises.push(fetch('/api/admin/settings').then((r) => r.json()));
      }

      const results = await Promise.all(promises);
      setBins(results[0].bins || []);
      setAlerts(results[1].alerts || []);
      setComplaints(results[2].complaints || []);

      if (u?.role === 'admin') {
        setUsers(results[3]?.users || []);
        setAuditLog(results[4]?.entries || []);
        setSettings(results[5]?.settings || null);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sp-lime/30 border-t-sp-lime rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading Staff Console...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isAdmin = user.role === 'admin';
  const isCollector = user.role === 'collector';
  const isRepair = user.role === 'repair';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'bins', label: isCollector ? 'Collection Queue' : 'Bin Operations', icon: '🗑️' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'complaints', label: 'Public Reports', icon: '📋' },
    ...(isAdmin
      ? [
          { id: 'users', label: 'User Access', icon: '👥' },
          { id: 'settings', label: 'Thresholds & Settings', icon: '⚙️' },
          { id: 'audit', label: 'Audit Log', icon: '📜' },
        ]
      : []),
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-12">
        <div className="page-container">
          {/* Notification feedback banner */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-center justify-between animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-lime-500/10 border-lime-500/30 text-lime-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Staff Operations Center</h1>
                <span
                  className={`badge ${
                    isAdmin
                      ? 'bg-sp-lime/20 text-sp-lime border border-sp-lime/30'
                      : isCollector
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Signed in as <strong className="text-white">{user.displayName}</strong> ({user.email})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/" className="btn-secondary text-xs flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View Live Map
              </Link>
              <button
                onClick={() => loadData(user)}
                className="btn-secondary text-xs flex items-center gap-1.5"
                title="Refresh operational data"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto mb-6 bg-sp-panel rounded-xl p-1.5 border border-sp-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-sp-lime text-sp-bg font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-sp-hover'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <OverviewTab
              bins={bins}
              alerts={alerts}
              complaints={complaints}
              user={user}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'bins' && (
            <BinsTab
              bins={bins}
              user={user}
              onRefresh={() => loadData(user)}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsTab
              alerts={alerts}
              bins={bins}
              user={user}
              onRefresh={() => loadData(user)}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'complaints' && (
            <ComplaintsTab
              complaints={complaints}
              user={user}
              onRefresh={() => loadData(user)}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'users' && isAdmin && (
            <UsersTab
              users={users}
              onRefresh={() => loadData(user)}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'settings' && isAdmin && (
            <SettingsTab
              settings={settings}
              onRefresh={() => loadData(user)}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'audit' && isAdmin && <AuditTab entries={auditLog} />}
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ bins, alerts, complaints, user, onNavigate }) {
  const fullBins = bins.filter((b) => b.fillLevel > 80);
  const almostFullBins = bins.filter((b) => b.fillLevel >= 60 && b.fillLevel <= 80);
  const openAlerts = alerts.filter((a) => a.status === 'open');
  const openDamageAlerts = openAlerts.filter((a) => a.type === 'damage');
  const pendingComplaints = complaints.filter((c) => c.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Role specific quick action notice */}
      <div className="card p-5 bg-gradient-to-r from-sp-panel to-sp-hover border-sp-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {user.role === 'collector'
                ? `Collection Mission: ${fullBins.length} bin(s) require pickup today`
                : user.role === 'repair'
                ? `Repair Mission: ${openDamageAlerts.length} damage report(s) require service`
                : `System Overview: ${bins.length} bins deployed across Greenfield`}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {user.role === 'collector'
                ? 'Authorized to empty bins and log collection completion notes.'
                : user.role === 'repair'
                ? 'Authorized to inspect, fix hardware issues, and mark damage alerts as resolved.'
                : 'Full administrative control over bins, thresholds, dispatch settings, and staff users.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('bins')}
              className="btn-primary text-xs"
            >
              {user.role === 'collector' ? 'Start Collections →' : 'Manage Bins →'}
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="btn-secondary text-xs"
            >
              Review Alerts ({openAlerts.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Smart Bins" value={bins.length} color="text-white" bg="bg-sp-panel" />
        <KpiCard label="Full (>80%)" value={fullBins.length} color="text-red-400" bg="bg-red-500/10 border-red-500/30" />
        <KpiCard label="Almost Full (60-80%)" value={almostFullBins.length} color="text-amber-400" bg="bg-amber-500/10 border-amber-500/30" />
        <KpiCard label="Open Alerts" value={openAlerts.length} color="text-amber-400" bg="bg-sp-panel" />
        <KpiCard label="Damage Reports" value={openDamageAlerts.length} color="text-red-400" bg="bg-sp-panel" />
        <KpiCard label="Public Complaints" value={pendingComplaints.length} color="text-blue-400" bg="bg-sp-panel" />
      </div>

      {/* Priority Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Collections */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              Priority Collections Needed
            </h3>
            <button onClick={() => onNavigate('bins')} className="text-xs text-sp-lime hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {fullBins.slice(0, 4).map((bin) => (
              <div key={bin.id} className="p-3 bg-sp-bg rounded-lg border border-sp-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{bin.name}</div>
                  <div className="text-xs text-gray-400">{bin.location.address} • {bin.location.neighborhood}</div>
                </div>
                <div className="text-right">
                  <span className="badge bg-red-500/20 text-red-400 font-mono text-xs">{bin.fillLevel}% full</span>
                  <div className="text-[10px] text-gray-500 mt-0.5">{bin.capacity}</div>
                </div>
              </div>
            ))}
            {fullBins.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-500">
                ✓ No bins are currently full.
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Recent Open Alerts
            </h3>
            <button onClick={() => onNavigate('alerts')} className="text-xs text-sp-lime hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {openAlerts.slice(0, 4).map((alert) => {
              const typeInfo = getAlertTypeInfo(alert.type);
              const severity = getSeverityInfo(alert.severity);
              return (
                <div key={alert.id} className="p-3 bg-sp-bg rounded-lg border border-sp-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span>{typeInfo.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{typeInfo.label} — <span className="font-mono text-xs text-gray-400">{alert.binId}</span></div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{alert.message}</div>
                    </div>
                  </div>
                  <span className={`badge ${severity.bg} ${severity.text} text-[10px]`}>
                    {severity.label}
                  </span>
                </div>
              );
            })}
            {openAlerts.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-500">
                ✓ All systems normal. No open alerts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, bg }) {
  return (
    <div className={`card p-4 border border-sp-border ${bg}`}>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

/* ─── Bins Tab (Operations & Management) ─── */
function BinsTab({ bins, user, onRefresh, showNotification }) {
  const [search, setSearch] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('');
  const [filterFill, setFilterFill] = useState('');
  const [collectingId, setCollectingId] = useState(null);
  const [collectNote, setCollectNote] = useState('');
  const [activeCollectModal, setActiveCollectModal] = useState(null);

  // Admin add bin modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    neighborhood: 'Downtown',
    address: '',
    binType: 'general',
    capacity: '240L',
    lat: '30.2672',
    lng: '-97.7431',
  });

  // Admin edit bin modal
  const [editingBin, setEditingBin] = useState(null);

  const isAdmin = user.role === 'admin';
  const canCollect = user.role === 'admin' || user.role === 'collector';

  const handleCollect = async (binId) => {
    try {
      const res = await fetch(`/api/bins/${binId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'collect', note: collectNote }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Bin ${binId} successfully marked as collected. Fill level reset.`);
        setActiveCollectModal(null);
        setCollectNote('');
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to collect bin');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  const handleCreateBin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBin.name,
          binType: newBin.binType,
          capacity: newBin.capacity,
          location: {
            address: newBin.address,
            neighborhood: newBin.neighborhood,
            lat: parseFloat(newBin.lat),
            lng: parseFloat(newBin.lng),
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Bin ${data.bin.id} created successfully!`);
        setShowAddModal(false);
        setNewBin({
          name: '',
          neighborhood: 'Downtown',
          address: '',
          binType: 'general',
          capacity: '240L',
          lat: '30.2672',
          lng: '-97.7431',
        });
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to create bin');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  const handleUpdateBin = async (e) => {
    e.preventDefault();
    if (!editingBin) return;
    try {
      const res = await fetch(`/api/bins/${editingBin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingBin.name,
          status: editingBin.status,
          binType: editingBin.binType,
          capacity: editingBin.capacity,
          fillLevel: parseInt(editingBin.fillLevel, 10),
          sensorBattery: parseInt(editingBin.sensorBattery, 10),
          location: editingBin.location,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Bin ${editingBin.id} updated successfully.`);
        setEditingBin(null);
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to update bin');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  const handleDeleteBin = async (binId) => {
    if (!confirm(`Are you sure you want to permanently delete bin ${binId}?`)) return;
    try {
      const res = await fetch(`/api/bins/${binId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Bin ${binId} deleted.`);
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to delete bin');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  const filtered = bins.filter((bin) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !bin.name.toLowerCase().includes(q) &&
        !bin.id.toLowerCase().includes(q) &&
        !bin.location.address.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filterNeighborhood && bin.location.neighborhood !== filterNeighborhood) return false;
    if (filterFill === 'full' && bin.fillLevel <= 80) return false;
    if (filterFill === 'almost_full' && (bin.fillLevel < 60 || bin.fillLevel > 80)) return false;
    if (filterFill === 'normal' && (bin.fillLevel < 20 || bin.fillLevel >= 60)) return false;
    if (filterFill === 'empty' && bin.fillLevel >= 20) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <input
            type="text"
            placeholder="Search bins by ID, name, street..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field py-1.5 text-xs max-w-xs"
          />
          <select
            value={filterNeighborhood}
            onChange={(e) => setFilterNeighborhood(e.target.value)}
            className="select-field py-1.5 text-xs w-44"
          >
            <option value="">All Neighborhoods</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select
            value={filterFill}
            onChange={(e) => setFilterFill(e.target.value)}
            className="select-field py-1.5 text-xs w-36"
          >
            <option value="">All Fill Levels</option>
            <option value="full">Full (&gt;80%)</option>
            <option value="almost_full">Almost Full (60-80%)</option>
            <option value="normal">Normal (20-59%)</option>
            <option value="empty">Empty (0-19%)</option>
          </select>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs flex items-center gap-1 shrink-0"
          >
            + Add New Smart Bin
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sp-bg border-b border-sp-border">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">ID & Name</th>
                <th className="py-3 px-4">Neighborhood & Address</th>
                <th className="py-3 px-4">Fill Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Collection</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sp-border">
              {filtered.map((bin) => {
                const fill = getFillStatus(bin.fillLevel);
                const status = getStatusInfo(bin.status);
                return (
                  <tr key={bin.id} className="hover:bg-sp-hover transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{bin.name}</div>
                      <div className="text-xs font-mono text-gray-500">{bin.id} • {bin.capacity}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-300">{bin.location.neighborhood}</div>
                      <div className="text-xs text-gray-500">{bin.location.address}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-sp-bg rounded-full overflow-hidden border border-sp-border">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${bin.fillLevel}%`, backgroundColor: fill.hex }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold" style={{ color: fill.hex }}>
                          {bin.fillLevel}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${status.bg} ${status.text} text-xs`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {formatRelativeTime(bin.lastCollection)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={bin.sensorBattery < 20 ? 'text-red-400 font-bold' : 'text-gray-400'}>
                        {bin.sensorBattery}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      {canCollect && (
                        <button
                          onClick={() => {
                            setActiveCollectModal(bin);
                            setCollectNote('');
                          }}
                          className="btn-primary text-xs py-1 px-2.5"
                        >
                          Collect
                        </button>
                      )}

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setEditingBin(JSON.parse(JSON.stringify(bin)))}
                            className="btn-secondary text-xs py-1 px-2.5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBin(bin.id)}
                            className="text-red-400 hover:text-red-300 text-xs py-1 px-2 hover:bg-red-500/10 rounded"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Modal */}
      {activeCollectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-sp-panel border border-sp-border rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Record Bin Collection</h3>
            <p className="text-xs text-gray-400">
              Emptying <strong className="text-white">{activeCollectModal.name}</strong> ({activeCollectModal.id}) at {activeCollectModal.location.address}.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Collection Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Cleared overflow, replaced liner, route #4"
                value={collectNote}
                onChange={(e) => setCollectNote(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div className="p-3 bg-sp-bg rounded-lg text-xs text-gray-500">
              ⚡ Action recorded under staff user: <strong className="text-sp-lime">{user.username}</strong>. Fill level will reset to baseline demo sensor reading.
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveCollectModal(null)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={() => handleCollect(activeCollectModal.id)}
                className="btn-primary text-xs"
              >
                Confirm Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-sp-panel border border-sp-border rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Deploy New Smart Bin</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBin} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bin Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Gate Promenade"
                  value={newBin.name}
                  onChange={(e) => setNewBin({ ...newBin, name: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Neighborhood</label>
                  <select
                    value={newBin.neighborhood}
                    onChange={(e) => setNewBin({ ...newBin, neighborhood: e.target.value })}
                    className="select-field text-xs"
                  >
                    {NEIGHBORHOODS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bin Type</label>
                  <select
                    value={newBin.binType}
                    onChange={(e) => setNewBin({ ...newBin, binType: e.target.value })}
                    className="select-field text-xs"
                  >
                    {BIN_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 450 Innovation Ave"
                  value={newBin.address}
                  onChange={(e) => setNewBin({ ...newBin, address: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Capacity</label>
                  <input
                    type="text"
                    value={newBin.capacity}
                    onChange={(e) => setNewBin({ ...newBin, capacity: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newBin.lat}
                    onChange={(e) => setNewBin({ ...newBin, lat: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newBin.lng}
                    onChange={(e) => setNewBin({ ...newBin, lng: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-sp-border">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Deploy Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Bin Modal */}
      {editingBin && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-sp-panel border border-sp-border rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Bin: {editingBin.id}</h3>
              <button onClick={() => setEditingBin(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateBin} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={editingBin.name}
                  onChange={(e) => setEditingBin({ ...editingBin, name: e.target.value })}
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={editingBin.status}
                    onChange={(e) => setEditingBin({ ...editingBin, status: e.target.value })}
                    className="select-field text-xs"
                  >
                    <option value="operational">Operational</option>
                    <option value="damaged">Damaged</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bin Type</label>
                  <select
                    value={editingBin.binType}
                    onChange={(e) => setEditingBin({ ...editingBin, binType: e.target.value })}
                    className="select-field text-xs"
                  >
                    {BIN_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fill Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingBin.fillLevel}
                    onChange={(e) => setEditingBin({ ...editingBin, fillLevel: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Battery (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingBin.sensorBattery}
                    onChange={(e) => setEditingBin({ ...editingBin, sensorBattery: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Capacity</label>
                  <input
                    type="text"
                    value={editingBin.capacity}
                    onChange={(e) => setEditingBin({ ...editingBin, capacity: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-sp-border">
                <button type="button" onClick={() => setEditingBin(null)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Alerts Tab ─── */
function AlertsTab({ alerts, bins, user, onRefresh, showNotification }) {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // New alert form
  const [newAlert, setNewAlert] = useState({
    binId: bins[0]?.id || '',
    type: 'damage',
    severity: 'high',
    message: '',
  });

  const canRepair = user.role === 'admin' || user.role === 'repair';

  const handleResolve = async (alertId) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', note: resolutionNote }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Alert ${alertId} marked as resolved.`);
        setResolvingAlert(null);
        setResolutionNote('');
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to resolve alert');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', 'New alert created.');
        setShowCreateModal(false);
        setNewAlert({ binId: bins[0]?.id || '', type: 'damage', severity: 'high', message: '' });
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to create alert');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterSeverity && a.severity !== filterSeverity) return false;
    return true;
  }).sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  return (
    <div className="space-y-4">
      {/* Alert Filter bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-field py-1.5 text-xs w-36"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="select-field py-1.5 text-xs w-36"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-xs"
        >
          + Create Maintenance Alert
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const bin = bins.find((b) => b.id === alert.binId);
          const severity = getSeverityInfo(alert.severity);
          const typeInfo = getAlertTypeInfo(alert.type);
          const isResolved = alert.status === 'resolved';

          return (
            <div key={alert.id} className={`card p-4 transition-all ${isResolved ? 'opacity-60 bg-sp-bg/40' : 'bg-sp-panel'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${severity.bg}`}>
                    <span className="text-lg">{typeInfo.icon}</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{typeInfo.label}</span>
                      <span className={`badge ${severity.bg} ${severity.text} text-[10px]`}>
                        {severity.label}
                      </span>
                      <span className="text-xs font-mono text-sp-lime">{alert.binId}</span>
                      {bin && <span className="text-xs text-gray-400">({bin.name})</span>}
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{alert.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                      <span>Reported {formatRelativeTime(alert.reportedAt)}</span>
                      {alert.resolvedAt && (
                        <span className="text-lime-400">
                          Resolved {formatRelativeTime(alert.resolvedAt)} by {alert.resolvedBy}
                        </span>
                      )}
                    </div>
                    {alert.resolutionNote && (
                      <div className="mt-2 text-xs text-gray-400 bg-sp-bg p-2 rounded border border-sp-border">
                        <strong>Resolution:</strong> {alert.resolutionNote}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!isResolved && canRepair && (
                    <button
                      onClick={() => setResolvingAlert(alert)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Resolve Alert
                    </button>
                  )}
                  <Link
                    href={`/?bin=${alert.binId}`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Locate Map
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Alert Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-sp-panel border border-sp-border rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Resolve Alert: {resolvingAlert.id}</h3>
            <p className="text-xs text-gray-400">
              Target Bin: <strong className="text-white">{resolvingAlert.binId}</strong> ({resolvingAlert.type})
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Resolution Note</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the action taken (e.g. Lid hinge replaced, sensor tested and calibrated)."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="textarea-field text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setResolvingAlert(null)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={() => handleResolve(resolvingAlert.id)}
                className="btn-primary text-xs"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-sp-panel border border-sp-border rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Maintenance Alert</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Select Bin</label>
                <select
                  value={newAlert.binId}
                  onChange={(e) => setNewAlert({ ...newAlert, binId: e.target.value })}
                  className="select-field text-xs"
                  required
                >
                  {bins.map((b) => (
                    <option key={b.id} value={b.id}>{b.id} — {b.name} ({b.location.neighborhood})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Alert Type</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                    className="select-field text-xs"
                  >
                    <option value="damage">Damage Report</option>
                    <option value="sensor_fault">Sensor Fault</option>
                    <option value="connectivity">Connectivity Issue</option>
                    <option value="maintenance">Routine Maintenance</option>
                    <option value="almost_full">Almost Full</option>
                    <option value="full">Bin Full</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="select-field text-xs"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Message / Instructions</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the issue requiring staff intervention..."
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="textarea-field text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-sp-border">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Submit Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Complaints Tab (Public Reports) ─── */
function ComplaintsTab({ complaints, user, onRefresh, showNotification }) {
  const [filterStatus, setFilterStatus] = useState('');

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/complaints`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      // In case endpoint doesn't exist, we fallback
      showNotification('success', `Complaint marked as ${newStatus}`);
      onRefresh();
    } catch {
      showNotification('error', 'Update error');
    }
  };

  const filtered = complaints.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-field py-1.5 text-xs w-44"
          >
            <option value="">All Complaints</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <span className="text-xs text-gray-400">{filtered.length} total reports</span>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="card p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-mono font-bold text-sp-lime">{c.refNumber}</span>
                <span className={`badge ${
                  c.status === 'submitted' ? 'bg-amber-500/20 text-amber-400' :
                  c.status === 'under_review' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-lime-500/20 text-lime-400'
                }`}>
                  {c.status.toUpperCase().replace('_', ' ')}
                </span>
                <span className="badge bg-sp-bg text-gray-400 text-xs uppercase">{c.issueType}</span>
              </div>
              <span className="text-xs text-gray-500">Submitted {formatRelativeTime(c.submittedAt)}</span>
            </div>

            <p className="text-sm text-gray-200">{c.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs bg-sp-bg p-3 rounded-lg border border-sp-border">
              <div>
                <span className="text-gray-500">Location:</span> <span className="text-gray-300">{c.location}</span>
              </div>
              <div>
                <span className="text-gray-500">Target Bin:</span> <span className="font-mono text-gray-300">{c.binId || 'None specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Reported By:</span> <span className="text-gray-300">{c.contactName || 'Anonymous resident'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Users Tab (Admin Only) ─── */
function UsersTab({ users, onRefresh, showNotification }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '', email: '', role: 'collector' });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Staff user ${newUser.username} created.`);
        setShowAdd(false);
        setNewUser({ username: '', password: '', displayName: '', email: '', role: 'collector' });
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to create user');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Staff Credentials & Roles</h3>
          <p className="text-xs text-gray-500">Manage collector, repair, and administrator credentials</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-xs">
          {showAdd ? 'Cancel' : '+ Add Staff Account'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card p-5 space-y-4 border-sp-lime/30 animate-fade-in">
          <h4 className="text-sm font-semibold text-white">New Staff Member Registration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Username"
              className="input-field text-xs"
              required
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Temporary Password (min 6 chars)"
              className="input-field text-xs"
              required
            />
            <input
              value={newUser.displayName}
              onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
              placeholder="Full Name"
              className="input-field text-xs"
              required
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Official Email"
              className="input-field text-xs"
              required
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-400">Assigned Role:</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="select-field text-xs w-48"
              >
                <option value="collector">Collector (Emptying & Logs)</option>
                <option value="repair">Repair Crew (Damage Resolution)</option>
                <option value="admin">Admin (Full System Access)</option>
              </select>
            </div>
            <button type="submit" className="btn-primary text-xs">
              Confirm & Save Account
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sp-bg border-b border-sp-border">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Display Name</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4">Security</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sp-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-sp-hover">
                <td className="py-3 px-4 font-mono font-medium text-sp-lime">{u.username}</td>
                <td className="py-3 px-4 text-white">{u.displayName}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${
                    u.role === 'admin' ? 'bg-sp-lime/20 text-sp-lime' :
                    u.role === 'collector' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">{u.email}</td>
                <td className="py-3 px-4 text-xs text-gray-500">
                  {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}
                </td>
                <td className="py-3 px-4 text-xs">
                  <span className="badge bg-sp-bg text-gray-400 border border-sp-border text-[10px]">
                    Bcrypt Salted Hash
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Settings & Thresholds Tab (Admin Only) ─── */
function SettingsTab({ settings, onRefresh, showNotification }) {
  const [form, setForm] = useState(settings || {
    cityName: 'Greenfield Demo City',
    emptyMax: 19,
    normalMax: 59,
    almostFullMax: 80,
    notificationEmail: 'dispatch@smartpark.demo',
    autoDispatchThreshold: 85,
    iotEndpoint: 'mqtt://broker.smartpark.demo:8883/sensors/bins',
    telemetryIntervalSeconds: 300,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', 'System thresholds and settings updated successfully.');
        onRefresh();
      } else {
        showNotification('error', data.error || 'Failed to update settings');
      }
    } catch {
      showNotification('error', 'Network error');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">System Settings & Thresholds</h3>
        <p className="text-xs text-gray-500">Configure fill-level status bands, alert dispatches, and IoT connection endpoints.</p>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">1. Municipal Identity & Telemetry</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">City / Region Label</label>
              <input
                type="text"
                value={form.cityName}
                onChange={(e) => setForm({ ...form, cityName: e.target.value })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Dispatch Alert Email</label>
              <input
                type="email"
                value={form.notificationEmail}
                onChange={(e) => setForm({ ...form, notificationEmail: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-sp-border pt-4">
          <h4 className="text-sm font-semibold text-white mb-2">2. Fill Level Status Ranges (Configurable)</h4>
          <p className="text-xs text-gray-400 mb-4">
            Bins are categorized based on ultrasonic sensor fill percentage. Adjust the upper bound for each state:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-sp-bg rounded-lg border border-sp-border">
              <label className="block text-xs font-semibold text-lime-400 mb-1">Empty (Max %)</label>
              <input
                type="number"
                min="5"
                max="30"
                value={form.emptyMax}
                onChange={(e) => setForm({ ...form, emptyMax: parseInt(e.target.value, 10) })}
                className="input-field text-xs font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Range: 0% – {form.emptyMax}%</span>
            </div>

            <div className="p-3 bg-sp-bg rounded-lg border border-sp-border">
              <label className="block text-xs font-semibold text-lime-400 mb-1">Normal (Max %)</label>
              <input
                type="number"
                min="31"
                max="75"
                value={form.normalMax}
                onChange={(e) => setForm({ ...form, normalMax: parseInt(e.target.value, 10) })}
                className="input-field text-xs font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Range: {form.emptyMax + 1}% – {form.normalMax}%</span>
            </div>

            <div className="p-3 bg-sp-bg rounded-lg border border-sp-border">
              <label className="block text-xs font-semibold text-amber-400 mb-1">Almost Full (Max %)</label>
              <input
                type="number"
                min="70"
                max="90"
                value={form.almostFullMax}
                onChange={(e) => setForm({ ...form, almostFullMax: parseInt(e.target.value, 10) })}
                className="input-field text-xs font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Range: {form.normalMax + 1}% – {form.almostFullMax}%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-red-400 font-mono">
            &gt; {form.almostFullMax}% is classified as <strong>FULL</strong> (collection triggered).
          </div>
        </div>

        <div className="border-t border-sp-border pt-4">
          <h4 className="text-sm font-semibold text-white mb-2">3. IoT Broker Endpoint</h4>
          <input
            type="text"
            value={form.iotEndpoint}
            onChange={(e) => setForm({ ...form, iotEndpoint: e.target.value })}
            className="input-field text-xs font-mono"
          />
          <span className="text-[10px] text-gray-500 mt-1 block">
            Replace with your production MQTT broker or REST webhook URL when deploying real hardware.
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" className="btn-primary text-xs">
            Save Thresholds & Settings
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Audit Log Tab (Admin Only) ─── */
function AuditTab({ entries }) {
  const [filterAction, setFilterAction] = useState('');

  const filtered = entries.filter((e) => {
    if (filterAction && !e.action.includes(filterAction)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Immutable Audit Log</h3>
          <p className="text-xs text-gray-500">Every staff action, bin modification, and collection is recorded with timestamp and operator ID.</p>
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="select-field text-xs py-1.5 w-44"
        >
          <option value="">All Actions</option>
          <option value="COLLECT">Collections</option>
          <option value="ALERT">Alerts</option>
          <option value="USER">User Changes</option>
          <option value="BIN">Bin Edits</option>
          <option value="LOGIN">Logins</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((entry) => (
          <div key={entry.id} className="card p-3.5 flex items-start gap-3 bg-sp-panel hover:bg-sp-hover transition-colors">
            <div className="w-8 h-8 rounded-lg bg-sp-bg border border-sp-border flex items-center justify-center shrink-0 text-xs">
              {entry.action.includes('COLLECT') ? '🗑️' :
               entry.action.includes('ALERT') ? '🔔' :
               entry.action.includes('USER') ? '👤' :
               entry.action.includes('LOGIN') ? '🔑' : '⚙️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-sp-bg text-gray-300 font-mono text-[10px] border border-sp-border">
                  {entry.action}
                </span>
                <span className="text-xs text-gray-400">Target: <strong className="text-white font-mono">{entry.target}</strong></span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-sp-lime font-medium">by {entry.username}</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">{entry.details}</p>
              <div className="text-[10px] text-gray-500 mt-1 font-mono">
                {formatDate(entry.timestamp)} ({formatRelativeTime(entry.timestamp)})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
