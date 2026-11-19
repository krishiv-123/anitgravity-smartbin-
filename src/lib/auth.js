// Authentication utilities for SmartPark
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'smartpark-dev-secret-change-in-production-min-32-chars-long',
  cookieName: process.env.SESSION_COOKIE_NAME || 'smartpark_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

/**
 * Get the current session from cookies (for server components and API routes)
 */
export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  return session;
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session.user;
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session.user || null;
}

/**
 * Require authentication — returns user or throws
 */
export async function requireAuth(allowedRoles = null) {
  const session = await getSession();
  if (!session.user) {
    return { error: 'Authentication required', status: 401 };
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }
  return { user: session.user };
}

/**
 * Role permission checks
 */
export const PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageBins: true,
    canCollectBins: true,
    canResolveIssues: true,
    canViewDashboard: true,
    canEditSettings: true,
    canViewAuditLog: true,
  },
  collector: {
    canManageUsers: false,
    canManageBins: false,
    canCollectBins: true,
    canResolveIssues: false,
    canViewDashboard: true,
    canEditSettings: false,
    canViewAuditLog: false,
  },
  repair: {
    canManageUsers: false,
    canManageBins: false,
    canCollectBins: false,
    canResolveIssues: true,
    canViewDashboard: true,
    canEditSettings: false,
    canViewAuditLog: false,
  },
};

export function hasPermission(role, permission) {
  return PERMISSIONS[role]?.[permission] || false;
}

export { sessionOptions };
