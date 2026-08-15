import { useState } from 'react';
import { User, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileTab } from '../features/settings/ProfileTab';
import { CompanyTab } from '../features/settings/CompanyTab';
import clsx from 'clsx';

export function SettingsPage() {
  const { hasRole } = useAuth();
  const [tab, setTab] = useState('profile');

  const tabs = [
    { key: 'profile', label: 'My Profile', icon: User },
    ...(hasRole('company_admin') ? [{ key: 'company', label: 'Company', icon: Building2 }] : []),
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab />}
      {tab === 'company' && hasRole('company_admin') && <CompanyTab />}
    </div>
  );
}