'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/',       label: 'Map',     icon: MapIcon },
  { href: '/alerts', label: 'Alerts',  icon: AlertIcon },
  { href: '/report', label: 'Report',  icon: ReportIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});

    fetch('/api/alerts')
      .then((r) => r.json())
      .then((d) => {
        if (d.alerts) setAlertCount(d.alerts.filter((a) => a.status === 'open').length);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="bg-sp-panel border-b border-sp-border sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-sp-lime/20 rounded-lg flex items-center justify-center group-hover:bg-sp-lime/30 transition-colors">
              <svg className="w-5 h-5 text-sp-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">
              Smart<span className="text-sp-lime">Park</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-sp-lime/10 text-sp-lime'
                      : 'text-gray-400 hover:text-white hover:bg-sp-hover'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.label === 'Alerts' && alertCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full font-mono">
                      {alertCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            <span className="demo-badge text-xs">
              ⚡ Demo Data
            </span>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/staff/dashboard"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/staff/dashboard')
                      ? 'bg-sp-lime/10 text-sp-lime'
                      : 'text-gray-400 hover:text-white hover:bg-sp-hover'
                  )}
                >
                  <DashboardIcon className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-sp-bg rounded-lg border border-sp-border">
                  <div className="w-6 h-6 bg-sp-lime/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-sp-lime font-semibold">
                      {user.displayName?.[0] || user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">{user.displayName || user.username}</span>
                  <span className="text-xs text-gray-500 capitalize">({user.role})</span>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/staff/login"
                className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-sp-hover"
              >
                Staff Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-sp-hover"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sp-border animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active ? 'bg-sp-lime/10 text-sp-lime' : 'text-gray-400 hover:text-white hover:bg-sp-hover'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {item.label === 'Alerts' && alertCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">{alertCount}</span>
                  )}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-sp-border mt-2">
              {user ? (
                <>
                  <Link
                    href="/staff/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-sp-hover"
                  >
                    <DashboardIcon className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-sm text-gray-300">{user.displayName}</span>
                    <button onClick={handleLogout} className="text-sm text-red-400">Sign out</button>
                  </div>
                </>
              ) : (
                <Link
                  href="/staff/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-sp-hover"
                >
                  Staff Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MapIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function ReportIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
