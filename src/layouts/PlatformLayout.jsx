import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, Building2, Package, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import clsx from 'clsx';

const navItems = [
  { to: '/platform', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/platform/companies', label: 'Companies', icon: Building2 },
  { to: '/platform/plans', label: 'Subscription Plans', icon: Package },
  { to: '/platform/settings', label: 'Settings', icon: Settings },
];

export function PlatformLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-indigo-950 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-indigo-900">
              FM
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Platform Admin</h1>
              <p className="text-xs text-indigo-300">Super Admin</p>
            </div>
          </div>
          <button className="text-indigo-300 lg:hidden" onClick={() => setMobileNavOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-indigo-800 text-white' : 'text-indigo-300 hover:bg-indigo-900 hover:text-white'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-indigo-900">
          <div className="flex items-center gap-3 px-2 mb-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-900 hover:text-red-400"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 py-3">
          <button className="text-gray-500 lg:hidden" onClick={() => setMobileNavOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="hidden lg:block text-sm text-gray-400">Platform-wide management — changes here affect all companies</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}