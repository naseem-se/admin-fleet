import { useState } from 'react';
import { LayoutGrid, Truck, UserRound, Fuel, Wrench } from 'lucide-react';
import { FleetSummaryTab } from './FleetSummaryTab';
import { VehicleReportTab } from './VehicleReportTab';
import { DriverReportTab } from './DriverReportTab';
import { FuelReportTab } from './FuelReportTab';
import { MaintenanceReportTab } from './MaintenanceReportTab';
import clsx from 'clsx';

const tabs = [
  { key: 'fleet', label: 'Fleet Summary', icon: LayoutGrid, Component: FleetSummaryTab },
  { key: 'vehicle', label: 'Vehicle', icon: Truck, Component: VehicleReportTab },
  { key: 'driver', label: 'Driver', icon: UserRound, Component: DriverReportTab },
  { key: 'fuel', label: 'Fuel', icon: Fuel, Component: FuelReportTab },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, Component: MaintenanceReportTab },
];

export function ReportsPage() {
  const [active, setActive] = useState('fleet');
  const ActiveComponent = tabs.find((t) => t.key === active).Component;

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Reports</h1>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={clsx(
              'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              active === key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
}