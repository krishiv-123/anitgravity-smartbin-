// Seed data for SmartPark demo — Greenfield Demo City
// All readings are simulated demo data

const NOW = new Date().toISOString();
const hours = (h) => new Date(Date.now() - h * 3600000).toISOString();
const days = (d) => new Date(Date.now() - d * 86400000).toISOString();

export const DEMO_BINS = [
  {
    id: 'BIN-001', name: 'City Hall Plaza A',
    location: { lat: 30.2672, lng: -97.7431, address: '110 Congress Ave', neighborhood: 'Downtown' },
    fillLevel: 72, status: 'operational', binType: 'general',
    lastCollection: hours(18), lastUpdated: hours(0.5), sensorBattery: 88, capacity: '240L', installDate: days(400),
  },
  {
    id: 'BIN-002', name: 'City Hall Plaza B',
    location: { lat: 30.2678, lng: -97.7425, address: '112 Congress Ave', neighborhood: 'Downtown' },
    fillLevel: 34, status: 'operational', binType: 'recycling',
    lastCollection: hours(6), lastUpdated: hours(0.3), sensorBattery: 92, capacity: '240L', installDate: days(400),
  },
  {
    id: 'BIN-003', name: 'Riverside Trail North',
    location: { lat: 30.2615, lng: -97.7510, address: 'Riverside Trail at Bridge Rd', neighborhood: 'Riverside Park' },
    fillLevel: 91, status: 'operational', binType: 'general',
    lastCollection: days(2), lastUpdated: hours(0.2), sensorBattery: 75, capacity: '360L', installDate: days(300),
  },
  {
    id: 'BIN-004', name: 'Dog Park Recycling',
    location: { lat: 30.2598, lng: -97.7485, address: 'Riverside Dog Park', neighborhood: 'Riverside Park' },
    fillLevel: 45, status: 'operational', binType: 'recycling',
    lastCollection: hours(12), lastUpdated: hours(1), sensorBattery: 81, capacity: '120L', installDate: days(250),
  },
  {
    id: 'BIN-005', name: 'Campus Library East',
    location: { lat: 30.2850, lng: -97.7365, address: '200 University Blvd', neighborhood: 'University District' },
    fillLevel: 86, status: 'operational', binType: 'general',
    lastCollection: days(1.5), lastUpdated: hours(0.1), sensorBattery: 69, capacity: '240L', installDate: days(500),
  },
  {
    id: 'BIN-006', name: 'Student Union Organic',
    location: { lat: 30.2862, lng: -97.7352, address: '215 University Blvd', neighborhood: 'University District' },
    fillLevel: 58, status: 'operational', binType: 'organic',
    lastCollection: hours(8), lastUpdated: hours(0.4), sensorBattery: 94, capacity: '120L', installDate: days(180),
  },
  {
    id: 'BIN-007', name: 'Central Market Entrance',
    location: { lat: 30.2710, lng: -97.7490, address: '1 Market Square', neighborhood: 'Market Square' },
    fillLevel: 95, status: 'operational', binType: 'general',
    lastCollection: days(3), lastUpdated: hours(0.1), sensorBattery: 55, capacity: '360L', installDate: days(600),
  },
  {
    id: 'BIN-008', name: 'Market Food Court',
    location: { lat: 30.2718, lng: -97.7478, address: '5 Market Lane', neighborhood: 'Market Square' },
    fillLevel: 67, status: 'operational', binType: 'organic',
    lastCollection: hours(10), lastUpdated: hours(0.6), sensorBattery: 83, capacity: '240L', installDate: days(350),
  },
  {
    id: 'BIN-009', name: 'Innovation Hub',
    location: { lat: 30.2740, lng: -97.7380, address: '300 Tech Pkwy', neighborhood: 'Tech Quarter' },
    fillLevel: 22, status: 'operational', binType: 'recycling',
    lastCollection: hours(4), lastUpdated: hours(0.3), sensorBattery: 97, capacity: '240L', installDate: days(90),
  },
  {
    id: 'BIN-010', name: 'Startup Campus Gate',
    location: { lat: 30.2755, lng: -97.7395, address: '320 Tech Pkwy', neighborhood: 'Tech Quarter' },
    fillLevel: 11, status: 'operational', binType: 'general',
    lastCollection: hours(2), lastUpdated: hours(0.2), sensorBattery: 99, capacity: '120L', installDate: days(60),
  },
  {
    id: 'BIN-011', name: 'Hilltop Viewpoint',
    location: { lat: 30.2800, lng: -97.7550, address: '45 Heights Rd', neighborhood: 'Greenfield Heights' },
    fillLevel: 38, status: 'damaged', binType: 'general',
    lastCollection: hours(20), lastUpdated: hours(2), sensorBattery: 61, capacity: '240L', installDate: days(450),
  },
  {
    id: 'BIN-012', name: 'Heights Community Center',
    location: { lat: 30.2815, lng: -97.7530, address: '60 Heights Rd', neighborhood: 'Greenfield Heights' },
    fillLevel: 50, status: 'operational', binType: 'recycling',
    lastCollection: hours(14), lastUpdated: hours(0.5), sensorBattery: 78, capacity: '240L', installDate: days(300),
  },
  {
    id: 'BIN-013', name: 'Lakeside Pavilion',
    location: { lat: 30.2560, lng: -97.7420, address: 'Lake Trail South', neighborhood: 'Lakeside' },
    fillLevel: 83, status: 'operational', binType: 'general',
    lastCollection: days(1), lastUpdated: hours(0.3), sensorBattery: 72, capacity: '360L', installDate: days(380),
  },
  {
    id: 'BIN-014', name: 'Boathouse Recycling',
    location: { lat: 30.2548, lng: -97.7445, address: 'Boathouse Lane', neighborhood: 'Lakeside' },
    fillLevel: 15, status: 'maintenance', binType: 'recycling',
    lastCollection: hours(3), lastUpdated: hours(5), sensorBattery: 12, capacity: '120L', installDate: days(500),
  },
  {
    id: 'BIN-015', name: 'Old Town Fountain',
    location: { lat: 30.2695, lng: -97.7340, address: '1 Heritage Plaza', neighborhood: 'Old Town' },
    fillLevel: 42, status: 'operational', binType: 'general',
    lastCollection: hours(9), lastUpdated: hours(0.7), sensorBattery: 86, capacity: '240L', installDate: days(700),
  },
  {
    id: 'BIN-016', name: 'Heritage Museum',
    location: { lat: 30.2688, lng: -97.7325, address: '15 Museum Row', neighborhood: 'Old Town' },
    fillLevel: 29, status: 'operational', binType: 'recycling',
    lastCollection: hours(7), lastUpdated: hours(0.4), sensorBattery: 91, capacity: '240L', installDate: days(600),
  },
  {
    id: 'BIN-017', name: 'Transit Hub Main',
    location: { lat: 30.2650, lng: -97.7400, address: 'Central Station', neighborhood: 'Downtown' },
    fillLevel: 78, status: 'operational', binType: 'general',
    lastCollection: hours(16), lastUpdated: hours(0.1), sensorBattery: 65, capacity: '360L', installDate: days(550),
  },
  {
    id: 'BIN-018', name: 'Park Playground',
    location: { lat: 30.2630, lng: -97.7530, address: 'Riverside Park South', neighborhood: 'Riverside Park' },
    fillLevel: 55, status: 'offline', binType: 'general',
    lastCollection: hours(24), lastUpdated: days(2), sensorBattery: 3, capacity: '240L', installDate: days(420),
  },
];

export const DEMO_ALERTS = [
  {
    id: 'ALT-001', binId: 'BIN-003', type: 'full', severity: 'high',
    message: 'Bin fill level exceeded 90%. Immediate collection required.',
    status: 'open', reportedAt: hours(2), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  {
    id: 'ALT-002', binId: 'BIN-007', type: 'full', severity: 'critical',
    message: 'Bin fill level at 95%. Overflowing risk. Priority collection needed.',
    status: 'open', reportedAt: hours(1), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  {
    id: 'ALT-003', binId: 'BIN-005', type: 'almost_full', severity: 'medium',
    message: 'Bin approaching full capacity at 86%.',
    status: 'open', reportedAt: hours(3), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  {
    id: 'ALT-004', binId: 'BIN-011', type: 'damage', severity: 'high',
    message: 'Lid hinge broken. Bin cannot close properly. Reported by public.',
    status: 'open', reportedAt: hours(8), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  {
    id: 'ALT-005', binId: 'BIN-014', type: 'sensor_fault', severity: 'medium',
    message: 'Battery critically low at 12%. Sensor may stop reporting.',
    status: 'open', reportedAt: hours(5), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  {
    id: 'ALT-006', binId: 'BIN-018', type: 'connectivity', severity: 'high',
    message: 'No data received for 48 hours. Sensor offline or connectivity lost.',
    status: 'open', reportedAt: days(2), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  {
    id: 'ALT-007', binId: 'BIN-013', type: 'almost_full', severity: 'medium',
    message: 'Bin fill level at 83%. Schedule collection within 12 hours.',
    status: 'open', reportedAt: hours(4), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  {
    id: 'ALT-008', binId: 'BIN-017', type: 'almost_full', severity: 'low',
    message: 'Bin fill level at 78%. Monitor and plan collection.',
    status: 'open', reportedAt: hours(6), resolvedAt: null, resolvedBy: null, resolutionNote: null,
  },
  // Resolved alerts for history
  {
    id: 'ALT-009', binId: 'BIN-001', type: 'full', severity: 'high',
    message: 'Bin was full at 94%. Collection completed.',
    status: 'resolved', reportedAt: days(1), resolvedAt: hours(18), resolvedBy: 'collector1', resolutionNote: 'Collected and reset. Area cleaned.',
  },
  {
    id: 'ALT-010', binId: 'BIN-009', type: 'damage', severity: 'medium',
    message: 'Minor dent on side panel. Still functional.',
    status: 'resolved', reportedAt: days(5), resolvedAt: days(3), resolvedBy: 'repair1', resolutionNote: 'Panel replaced. Bin fully operational.',
  },
  {
    id: 'ALT-011', binId: 'BIN-015', type: 'maintenance', severity: 'low',
    message: 'Scheduled quarterly sensor calibration.',
    status: 'resolved', reportedAt: days(10), resolvedAt: days(8), resolvedBy: 'admin', resolutionNote: 'Sensor recalibrated. Readings verified.',
  },
];

export const DEMO_COMPLAINTS = [
  {
    id: 'CMP-001', refNumber: 'SP-20261115-A3K9',
    binId: 'BIN-011', issueType: 'damage',
    location: '45 Heights Rd, Greenfield Heights',
    description: 'The lid hinge on this bin is completely broken. The lid hangs open and rain gets in, causing bad smells. Please repair urgently.',
    photoUrl: null,
    contactName: 'Jane Smith', contactEmail: 'jane.s@email.com', contactPhone: null,
    status: 'under_review', submittedAt: days(1), resolvedAt: null,
  },
  {
    id: 'CMP-002', refNumber: 'SP-20261117-B7M2',
    binId: 'BIN-007', issueType: 'overflow',
    location: '1 Market Square',
    description: 'This bin has been overflowing for two days. Trash is scattered around the entrance area. Needs immediate attention.',
    photoUrl: null,
    contactName: null, contactEmail: null, contactPhone: null,
    status: 'submitted', submittedAt: hours(12), resolvedAt: null,
  },
];

// Default password hash for "admin123" - generated with bcryptjs
// In production, change all default passwords immediately
export const DEMO_USERS = [
  {
    id: 'USR-001', username: 'admin', role: 'admin',
    displayName: 'System Administrator', email: 'admin@smartpark.demo',
    // Password: admin123 (bcrypt hash)
    passwordHash: '$2a$10$dummyhashforadmin123replacewithrealoneXXXXXXXXXXXXXXX',
    createdAt: days(365), lastLogin: hours(2), active: true,
  },
  {
    id: 'USR-002', username: 'collector1', role: 'collector',
    displayName: 'Mike Johnson', email: 'mike.j@smartpark.demo',
    passwordHash: '$2a$10$dummyhashforcollector1replacewithrealoneXXXXXXXXXXXXX',
    createdAt: days(300), lastLogin: hours(8), active: true,
  },
  {
    id: 'USR-003', username: 'repair1', role: 'repair',
    displayName: 'Sarah Chen', email: 'sarah.c@smartpark.demo',
    passwordHash: '$2a$10$dummyhashforrepair1replacewithrealonXXXXXXXXXXXXXXXX',
    createdAt: days(200), lastLogin: days(1), active: true,
  },
];

export const DEMO_AUDIT_LOG = [
  {
    id: 'AUD-001', userId: 'USR-001', username: 'admin',
    action: 'USER_CREATE', target: 'USR-002',
    details: 'Created user collector1 with role collector',
    timestamp: days(300),
  },
  {
    id: 'AUD-002', userId: 'USR-002', username: 'collector1',
    action: 'BIN_COLLECTED', target: 'BIN-001',
    details: 'Marked bin as collected. Fill level reset.',
    timestamp: hours(18),
  },
  {
    id: 'AUD-003', userId: 'USR-003', username: 'repair1',
    action: 'ALERT_RESOLVED', target: 'ALT-010',
    details: 'Resolved damage alert. Panel replaced.',
    timestamp: days(3),
  },
];
