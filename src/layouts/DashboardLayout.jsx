import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, Route as RouteIcon, Fuel, Wrench,
  FileText, LogOut, Menu, X, Search, Bell, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import clsx from 'clsx';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { VerifyEmailBanner } from '../components/VerifyEmailBanner';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/journeys', label: 'Live Journeys', icon: RouteIcon },
  { to: '/fuel', label: 'Fuel', icon: Fuel },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-sidebar flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              FM
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Fleet Manager</h1>
              <p className="text-xs text-slate-400 truncate max-w-[9rem]">{user?.company?.name}</p>
            </div>
          </div>
          <button className="text-slate-400 lg:hidden" onClick={() => setMobileNavOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-slate-400 hover:bg-sidebar-hover hover:text-white'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-sidebar-hover hover:text-red-400"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 flex-1">
            <button className="text-gray-500 lg:hidden" onClick={() => setMobileNavOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="relative hidden sm:block max-w-xs w-full">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="hidden sm:flex items-center gap-2">
              <Avatar name={user?.name} size="sm" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <VerifyEmailBanner />
          <div key={location.pathname} className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}