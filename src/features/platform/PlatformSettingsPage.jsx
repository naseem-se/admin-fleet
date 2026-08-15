import { ProfileTab } from '../settings/ProfileTab';

export function PlatformSettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>
      <ProfileTab />
    </div>
  );
}