'use client';

import { getFillStatus } from '@/lib/utils';

export default function MapLegend() {
  const levels = [
    { label: 'Empty (0–19%)', hex: '#84cc16' },
    { label: 'Normal (20–59%)', hex: '#84cc16' },
    { label: 'Almost Full (60–80%)', hex: '#f59e0b' },
    { label: 'Full (>80%)', hex: '#ef4444' },
  ];

  const statuses = [
    { label: 'Operational', color: 'bg-lime-400' },
    { label: 'Damaged', color: 'bg-red-400' },
    { label: 'Maintenance', color: 'bg-amber-400' },
    { label: 'Offline', color: 'bg-gray-400' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[500] card p-3 max-w-[220px]">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Legend</h4>
      <div className="space-y-1.5 mb-3">
        {levels.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: l.hex, background: `${l.hex}22` }}>
              <div className="w-1.5 h-1.5 rounded-full m-[1px]" style={{ background: l.hex }} />
            </div>
            <span className="text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-sp-border pt-2 space-y-1.5">
        {statuses.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${s.color} shrink-0`} />
            <span className="text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
