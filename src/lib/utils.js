// Utility helpers for SmartPark

/**
 * Default fill-level status thresholds (configurable by admin)
 */
export const DEFAULT_FILL_THRESHOLDS = {
  EMPTY_MAX: 19,
  NORMAL_MAX: 59,
  ALMOST_FULL_MAX: 80,
};

export const FILL_THRESHOLDS = DEFAULT_FILL_THRESHOLDS;

/**
 * Get fill status label and color from percentage with optional dynamic thresholds
 */
export function getFillStatus(percentage, thresholds = DEFAULT_FILL_THRESHOLDS) {
  const emptyMax = thresholds.EMPTY_MAX ?? thresholds.emptyMax ?? 19;
  const normalMax = thresholds.NORMAL_MAX ?? thresholds.normalMax ?? 59;
  const almostFullMax = thresholds.ALMOST_FULL_MAX ?? thresholds.almostFullMax ?? 80;

  if (percentage <= emptyMax) {
    return { label: 'Empty', color: 'lime', bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30', hex: '#84cc16' };
  }
  if (percentage <= normalMax) {
    return { label: 'Normal', color: 'lime', bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30', hex: '#84cc16' };
  }
  if (percentage <= almostFullMax) {
    return { label: 'Almost Full', color: 'amber', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#f59e0b' };
  }
  return { label: 'Full', color: 'red', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', hex: '#ef4444' };
}

/**
 * Get severity display info
 */
export function getSeverityInfo(severity) {
  const map = {
    low:      { label: 'Low',      bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30',   dot: 'bg-blue-400' },
    medium:   { label: 'Medium',   bg: 'bg-amber-500/20',  text: 'text-amber-400',  border: 'border-amber-500/30',  dot: 'bg-amber-400' },
    high:     { label: 'High',     bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
    critical: { label: 'Critical', bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/30',    dot: 'bg-red-400' },
  };
  return map[severity] || map.low;
}

/**
 * Get status display info
 */
export function getStatusInfo(status) {
  const map = {
    operational:  { label: 'Operational',  bg: 'bg-lime-500/20',   text: 'text-lime-400',   dot: 'bg-lime-400' },
    damaged:      { label: 'Damaged',      bg: 'bg-red-500/20',    text: 'text-red-400',    dot: 'bg-red-400' },
    maintenance:  { label: 'Maintenance',  bg: 'bg-amber-500/20',  text: 'text-amber-400',  dot: 'bg-amber-400' },
    offline:      { label: 'Offline',      bg: 'bg-gray-500/20',   text: 'text-gray-400',   dot: 'bg-gray-400' },
  };
  return map[status] || map.operational;
}

/**
 * Get alert type display info
 */
export function getAlertTypeInfo(type) {
  const map = {
    full:          { label: 'Bin Full',           icon: '🗑️' },
    almost_full:   { label: 'Almost Full',        icon: '⚠️' },
    damage:        { label: 'Damage Report',      icon: '🔧' },
    sensor_fault:  { label: 'Sensor Fault',       icon: '📡' },
    connectivity:  { label: 'Connectivity Issue', icon: '🔗' },
    maintenance:   { label: 'Maintenance Due',    icon: '🛠️' },
  };
  return map[type] || { label: type, icon: '📋' };
}

/**
 * Format a date for display
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Generate a complaint reference number
 */
export function generateRefNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SP-${dateStr}-${rand}`;
}

/**
 * Classname helper
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Neighborhoods in demo city
 */
export const NEIGHBORHOODS = [
  'Downtown',
  'Riverside Park',
  'University District',
  'Market Square',
  'Tech Quarter',
  'Greenfield Heights',
  'Lakeside',
  'Old Town',
];

/**
 * Issue types for complaints
 */
export const ISSUE_TYPES = [
  { value: 'damage',   label: 'Physical Damage' },
  { value: 'overflow', label: 'Bin Overflowing' },
  { value: 'odor',     label: 'Bad Odor / Hygiene' },
  { value: 'missing',  label: 'Bin Missing' },
  { value: 'access',   label: 'Access Blocked' },
  { value: 'other',    label: 'Other Issue' },
];

/**
 * Bin types
 */
export const BIN_TYPES = [
  { value: 'general',   label: 'General Waste',    icon: '🗑️' },
  { value: 'recycling', label: 'Recycling',         icon: '♻️' },
  { value: 'organic',   label: 'Organic / Compost', icon: '🌿' },
  { value: 'hazardous', label: 'Hazardous Waste',   icon: '☢️' },
];
