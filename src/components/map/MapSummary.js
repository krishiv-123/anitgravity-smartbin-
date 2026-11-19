'use client';

import { getFillStatus } from '@/lib/utils';

export default function MapSummary({ bins, alerts }) {
  const totalBins = bins.length;
  const needCollection = bins.filter((b) => b.fillLevel > 80).length;
  const activeDamage = alerts.filter((a) => a.type === 'damage' && a.status === 'open').length;
  const operational = bins.filter((b) => b.status === 'operational').length;
  const openAlerts = alerts.filter((a) => a.status === 'open').length;

  const stats = [
    { label: 'Total Bins', value: totalBins, icon: '🗑️', color: 'text-white' },
    { label: 'Need Collection', value: needCollection, icon: '⚠️', color: needCollection > 0 ? 'text-amber-400' : 'text-lime-400' },
    { label: 'Damage Reports', value: activeDamage, icon: '🔧', color: activeDamage > 0 ? 'text-red-400' : 'text-lime-400' },
    { label: 'Operational', value: operational, icon: '✓', color: 'text-lime-400' },
    { label: 'Open Alerts', value: openAlerts, icon: '🔔', color: openAlerts > 0 ? 'text-amber-400' : 'text-lime-400' },
  ];

  return (
    <div className="bg-sp-panel border-b border-sp-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center gap-6 overflow-x-auto">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 shrink-0">
              <span className="text-sm">{s.icon}</span>
              <span className={`text-lg font-semibold font-mono ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
