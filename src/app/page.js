'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BinDetailPanel from '@/components/map/BinDetailPanel';
import MapLegend from '@/components/map/MapLegend';
import MapSummary from '@/components/map/MapSummary';
import MapFilters from '@/components/map/MapFilters';
import { getFillStatus, formatRelativeTime, NEIGHBORHOODS } from '@/lib/utils';

const CityMap = dynamic(() => import('@/components/map/CityMap'), { ssr: false });

function MapPageContent() {
  const searchParams = useSearchParams();
  const targetBinId = searchParams.get('bin');

  const [bins, setBins] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    neighborhood: '',
    fillLevel: '',
    status: '',
    binType: '',
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIotModal, setShowIotModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/bins').then((r) => r.json()),
      fetch('/api/alerts').then((r) => r.json()),
      fetch('/api/auth/session').then((r) => r.json()),
    ]).then(([binsData, alertsData, sessionData]) => {
      const fetchedBins = binsData.bins || [];
      setBins(fetchedBins);
      setAlerts(alertsData.alerts || []);
      if (sessionData.user) setUser(sessionData.user);

      // If URL has ?bin=BIN-xxx, pre-select it
      if (targetBinId) {
        const found = fetchedBins.find((b) => b.id.toLowerCase() === targetBinId.toLowerCase());
        if (found) {
          setSelectedBin(found);
        }
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, [targetBinId]);

  const refreshBins = async () => {
    const r = await fetch('/api/bins');
    const d = await r.json();
    const fetchedBins = d.bins || [];
    setBins(fetchedBins);
    if (selectedBin) {
      const updated = fetchedBins.find((b) => b.id === selectedBin.id);
      if (updated) setSelectedBin(updated);
    }
    const ar = await fetch('/api/alerts');
    const ad = await ar.json();
    setAlerts(ad.alerts || []);
  };

  const filteredBins = bins.filter((bin) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !bin.name.toLowerCase().includes(q) &&
        !bin.id.toLowerCase().includes(q) &&
        !bin.location.address.toLowerCase().includes(q) &&
        !bin.location.neighborhood.toLowerCase().includes(q)
      ) return false;
    }
    if (filters.neighborhood && bin.location.neighborhood !== filters.neighborhood) return false;
    if (filters.status && bin.status !== filters.status) return false;
    if (filters.binType && bin.binType !== filters.binType) return false;
    if (filters.fillLevel) {
      const fl = getFillStatus(bin.fillLevel);
      if (filters.fillLevel === 'empty' && fl.label !== 'Empty') return false;
      if (filters.fillLevel === 'normal' && fl.label !== 'Normal') return false;
      if (filters.fillLevel === 'almost_full' && fl.label !== 'Almost Full') return false;
      if (filters.fillLevel === 'full' && fl.label !== 'Full') return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sp-lime/30 border-t-sp-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading SmartPark Civic Map...</p>
          <p className="text-xs text-gray-500 mt-1">Connecting to Greenfield municipal sensors</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Header bar */}
      <div className="bg-sp-panel border-b border-sp-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-sp-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Greenfield Demo City
                </h1>
                <span className="badge bg-sp-lime/10 text-sp-lime border border-sp-lime/20 text-xs">
                  Public Portal
                </span>
                <button
                  onClick={() => setShowIotModal(true)}
                  className="text-xs text-gray-400 hover:text-sp-lime underline flex items-center gap-1 transition-colors ml-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  IoT Integration Info
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Real-time civic bin telemetry • {bins.length} smart bins active across {NEIGHBORHOODS.length} zones
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bins, IDs, streets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>

              {/* View toggle */}
              <div className="flex bg-sp-bg rounded-lg border border-sp-border p-0.5 shrink-0">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'map' ? 'bg-sp-lime text-sp-bg font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                  Map View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-sp-lime text-sp-bg font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  List View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <MapSummary bins={bins} alerts={alerts} />

      {/* Filters */}
      <MapFilters filters={filters} setFilters={setFilters} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {viewMode === 'map' ? (
          <>
            {/* Map */}
            <div className="flex-1 relative" style={{ minHeight: '520px' }}>
              <CityMap
                bins={filteredBins}
                selectedBin={selectedBin}
                onSelectBin={setSelectedBin}
                alerts={alerts}
              />
              <MapLegend />
            </div>
          </>
        ) : (
          /* List view */
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400">
                  Showing <strong className="text-white">{filteredBins.length}</strong> of {bins.length} bins
                </span>
                <span className="text-xs text-gray-500 italic">Click any bin to open detail & staff actions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredBins.map((bin) => {
                  const fill = getFillStatus(bin.fillLevel);
                  const hasAlert = alerts.some((a) => a.binId === bin.id && a.status === 'open');
                  const isSelected = selectedBin?.id === bin.id;
                  return (
                    <button
                      key={bin.id}
                      onClick={() => { setSelectedBin(bin); }}
                      className={`card p-4 text-left transition-all duration-200 hover:border-sp-lime/40 ${
                        isSelected ? 'border-sp-lime ring-1 ring-sp-lime/50 bg-sp-hover' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold text-white">{bin.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{bin.id} • {bin.capacity}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasAlert && (
                            <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-[10px]">
                              Alert
                            </span>
                          )}
                          <span className={`badge ${fill.bg} ${fill.text} border ${fill.border} text-[10px]`}>
                            {bin.fillLevel}%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">{bin.location.address}</div>
                      {/* Fill bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={fill.text}>{fill.label}</span>
                          <span className="text-gray-500 font-mono text-[11px]">{bin.fillLevel}% full</span>
                        </div>
                        <div className="w-full h-2 bg-sp-bg rounded-full overflow-hidden border border-sp-border/50">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${bin.fillLevel}%`, backgroundColor: fill.hex }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-sp-border/50">
                        <span>{bin.location.neighborhood}</span>
                        <span>Updated {formatRelativeTime(bin.lastUpdated)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Detail panel */}
        {selectedBin && (
          <BinDetailPanel
            bin={selectedBin}
            alerts={alerts.filter((a) => a.binId === selectedBin.id)}
            user={user}
            onClose={() => setSelectedBin(null)}
            onRefresh={refreshBins}
          />
        )}
      </div>

      {/* IoT Integration Modal */}
      {showIotModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-sp-panel border border-sp-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sp-lime/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-sp-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">SmartPark IoT Sensor Architecture</h3>
                  <p className="text-xs text-gray-400">Hardware & Telemetry Integration Guide</p>
                </div>
              </div>
              <button
                onClick={() => setShowIotModal(false)}
                className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-sp-hover"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
                <strong className="block font-semibold mb-1">⚡ Demo City Environment Notice</strong>
                All current sensor readings, battery levels, and telemetry events in Greenfield Demo City are generated demo values. Live hardware integration hooks are configured and ready to connect.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="card p-3 bg-sp-bg">
                  <div className="text-sp-lime font-semibold mb-1">1. Ultrasonic Fill Measurement</div>
                  <p className="text-gray-400">
                    Industrial ultrasonic rangefinders (e.g. MaxBotix MB7389 or waterproof JSN-SR04T) mounted on the underside of bin lids compute fill level:
                  </p>
                  <code className="block mt-2 p-2 bg-black/50 rounded font-mono text-[11px] text-gray-300">
                    Fill% = ((Depth - Distance) / Depth) * 100
                  </code>
                </div>

                <div className="card p-3 bg-sp-bg">
                  <div className="text-sp-lime font-semibold mb-1">2. Connectivity & Microcontroller</div>
                  <p className="text-gray-400">
                    Low-power ESP32-S3 or Quectel BG95 modules broadcast readings via Cellular NB-IoT, LTE-M, or LoRaWAN every 5–15 minutes, preserving battery for up to 3 years.
                  </p>
                </div>
              </div>

              <div className="card p-3 bg-sp-bg">
                <div className="text-sp-lime font-semibold mb-1">3. Ingestion Webhook / MQTT Endpoint</div>
                <p className="text-gray-400 mb-2">
                  Bins post telemetry payloads to the secure API endpoint:
                </p>
                <div className="p-2.5 bg-black/60 rounded font-mono text-[11px] text-gray-300 overflow-x-auto">
                  {`POST /api/telemetry
Headers: { "X-Sensor-Key": "SECURE_DEVICE_TOKEN" }
Payload: {
  "binId": "BIN-001",
  "fillLevel": 74,
  "battery": 88,
  "tamperDetected": false,
  "temperatureC": 22.4
}`}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowIotModal(false)}
                className="btn-primary text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-sp-lime/30 border-t-sp-lime rounded-full animate-spin" />
        </div>
      }>
        <MapPageContent />
      </Suspense>
      <Footer />
    </>
  );
}
