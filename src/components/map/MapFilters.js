'use client';

import { NEIGHBORHOODS, BIN_TYPES } from '@/lib/utils';

export default function MapFilters({ filters, setFilters }) {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const hasActiveFilter = Object.values(filters).some(Boolean);

  return (
    <div className="bg-sp-panel/50 border-b border-sp-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-500 shrink-0 mr-1">Filters:</span>

          <select
            value={filters.neighborhood}
            onChange={(e) => update('neighborhood', e.target.value)}
            className="select-field py-1.5 text-xs min-w-[140px]"
          >
            <option value="">All Neighborhoods</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <select
            value={filters.fillLevel}
            onChange={(e) => update('fillLevel', e.target.value)}
            className="select-field py-1.5 text-xs min-w-[130px]"
          >
            <option value="">All Fill Levels</option>
            <option value="empty">Empty (0–19%)</option>
            <option value="normal">Normal (20–59%)</option>
            <option value="almost_full">Almost Full (60–80%)</option>
            <option value="full">Full (&gt;80%)</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className="select-field py-1.5 text-xs min-w-[130px]"
          >
            <option value="">All Statuses</option>
            <option value="operational">Operational</option>
            <option value="damaged">Damaged</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={filters.binType}
            onChange={(e) => update('binType', e.target.value)}
            className="select-field py-1.5 text-xs min-w-[130px]"
          >
            <option value="">All Types</option>
            {BIN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => setFilters({ neighborhood: '', fillLevel: '', status: '', binType: '' })}
              className="text-xs text-sp-lime hover:text-sp-lime-dark transition-colors shrink-0 ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
