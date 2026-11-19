// In-memory data store for SmartPark
// In production, replace with a real database (PostgreSQL, Neon, Supabase, etc.)

import { DEMO_BINS, DEMO_ALERTS, DEMO_COMPLAINTS, DEMO_USERS, DEMO_AUDIT_LOG } from './seed';
import bcrypt from 'bcryptjs';

// Initialize store with deep copies of seed data
let bins = JSON.parse(JSON.stringify(DEMO_BINS));
let alerts = JSON.parse(JSON.stringify(DEMO_ALERTS));
let complaints = JSON.parse(JSON.stringify(DEMO_COMPLAINTS));
let users = [];
let auditLog = JSON.parse(JSON.stringify(DEMO_AUDIT_LOG));
let settings = {
  cityName: 'Greenfield Demo City',
  demoMode: true,
  emptyMax: 19,
  normalMax: 59,
  almostFullMax: 80,
  notificationEmail: 'dispatch@smartpark.demo',
  autoDispatchThreshold: 85,
  iotEndpoint: 'mqtt://broker.smartpark.demo:8883/sensors/bins',
  telemetryIntervalSeconds: 300,
};
let initialized = false;

/**
 * Initialize users with hashed passwords
 */
async function initStore() {
  if (initialized) return;

  // Hash default passwords for demo users
  const defaultPasswords = {
    'admin': 'admin123',
    'collector1': 'collect123',
    'repair1': 'repair123',
  };

  users = await Promise.all(
    DEMO_USERS.map(async (u) => ({
      ...u,
      passwordHash: await bcrypt.hash(defaultPasswords[u.username] || 'password123', 10),
    }))
  );

  // Add activity history to bins
  bins = bins.map((bin) => ({
    ...bin,
    history: bin.history || [
      {
        action: 'INSTALLED',
        timestamp: bin.installDate,
        performedBy: 'system',
        notes: `Bin installed at ${bin.location.address}`,
      },
    ],
  }));

  initialized = true;
}

// Auto-initialize
const initPromise = initStore();

// ─── Bins ──────────────────────────────────────────

export async function getBins() {
  await initPromise;
  return [...bins];
}

export async function getBinById(id) {
  await initPromise;
  return bins.find((b) => b.id === id) || null;
}

export async function updateBin(id, data) {
  await initPromise;
  const idx = bins.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  bins[idx] = { ...bins[idx], ...data, lastUpdated: new Date().toISOString() };
  return bins[idx];
}

export async function createBin(binData) {
  await initPromise;
  const maxNum = bins.reduce((max, b) => {
    const num = parseInt(b.id.replace('BIN-', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const newBin = {
    ...binData,
    id: binData.id || `BIN-${String(maxNum + 1).padStart(3, '0')}`,
    lastUpdated: new Date().toISOString(),
    installDate: binData.installDate || new Date().toISOString(),
    lastCollection: binData.lastCollection || new Date().toISOString(),
    sensorBattery: binData.sensorBattery !== undefined ? binData.sensorBattery : 100,
    history: [
      {
        action: 'INSTALLED',
        timestamp: new Date().toISOString(),
        performedBy: binData.createdBy || 'admin',
        notes: `Bin created at ${binData.location?.address || 'unspecified'}`,
      },
    ],
  };
  bins.push(newBin);
  return newBin;
}

export async function deleteBin(id) {
  await initPromise;
  const idx = bins.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  bins.splice(idx, 1);
  return true;
}

export async function addBinHistory(binId, entry) {
  await initPromise;
  const bin = bins.find((b) => b.id === binId);
  if (!bin) return null;
  if (!bin.history) bin.history = [];
  bin.history.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  return bin;
}

// ─── Alerts ────────────────────────────────────────

export async function getAlerts() {
  await initPromise;
  return [...alerts];
}

export async function getAlertById(id) {
  await initPromise;
  return alerts.find((a) => a.id === id) || null;
}

export async function createAlert(alertData) {
  await initPromise;
  const maxNum = alerts.reduce((max, a) => {
    const num = parseInt(a.id.replace('ALT-', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const newAlert = {
    ...alertData,
    id: `ALT-${String(maxNum + 1).padStart(3, '0')}`,
    status: 'open',
    reportedAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
    resolutionNote: null,
  };
  alerts.push(newAlert);
  return newAlert;
}

export async function updateAlert(id, data) {
  await initPromise;
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  alerts[idx] = { ...alerts[idx], ...data };
  return alerts[idx];
}

// ─── Complaints ────────────────────────────────────

export async function getComplaints() {
  await initPromise;
  return [...complaints];
}

export async function getComplaintById(id) {
  await initPromise;
  return complaints.find((c) => c.id === id) || null;
}

export async function getComplaintByRef(refNumber) {
  await initPromise;
  return complaints.find((c) => c.refNumber === refNumber) || null;
}

export async function createComplaint(data) {
  await initPromise;
  const maxNum = complaints.reduce((max, c) => {
    const num = parseInt(c.id.replace('CMP-', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const newComplaint = {
    ...data,
    id: `CMP-${String(maxNum + 1).padStart(3, '0')}`,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    resolvedAt: null,
  };
  complaints.push(newComplaint);
  return newComplaint;
}

export async function updateComplaint(id, data) {
  await initPromise;
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  complaints[idx] = { ...complaints[idx], ...data };
  return complaints[idx];
}

// ─── Users ─────────────────────────────────────────

export async function getUsers() {
  await initPromise;
  return users.map(({ passwordHash, ...u }) => u);
}

export async function getUserById(id) {
  await initPromise;
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function getUserByUsername(username) {
  await initPromise;
  return users.find((u) => u.username === username) || null;
}

export async function createUser(userData) {
  await initPromise;
  const hash = await bcrypt.hash(userData.password, 10);
  const maxNum = users.reduce((max, u) => {
    const num = parseInt(u.id.replace('USR-', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const newUser = {
    id: `USR-${String(maxNum + 1).padStart(3, '0')}`,
    username: userData.username,
    passwordHash: hash,
    role: userData.role,
    displayName: userData.displayName,
    email: userData.email,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    active: true,
  };
  users.push(newUser);
  const { passwordHash, ...safe } = newUser;
  return safe;
}

export async function updateUser(id, data) {
  await initPromise;
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  users[idx] = { ...users[idx], ...data };
  const { passwordHash, ...safe } = users[idx];
  return safe;
}

export async function verifyUser(username, password) {
  await initPromise;
  const user = users.find((u) => u.username === username && u.active);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  user.lastLogin = new Date().toISOString();
  const { passwordHash, ...safe } = user;
  return safe;
}

// ─── Settings & Thresholds ──────────────────────────

export async function getSettings() {
  await initPromise;
  return { ...settings };
}

export async function updateSettings(newSettings) {
  await initPromise;
  settings = { ...settings, ...newSettings };
  return { ...settings };
}

// ─── Audit Log ─────────────────────────────────────

export async function getAuditLog() {
  await initPromise;
  return [...auditLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function addAuditEntry(entry) {
  await initPromise;
  const newEntry = {
    ...entry,
    id: `AUD-${String(auditLog.length + 1).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(newEntry);
  return newEntry;
}
