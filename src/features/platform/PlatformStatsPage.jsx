import { useQuery } from '@tanstack/react-query';
import { Building2, CheckCircle2, Clock, Ban, Truck, Users, Route as RouteIcon, CreditCard } from 'lucide-react';
import { platformApi } from './api';
import { StatCard } from '../../components/StatCard';
import { FullPageLoader } from '../../components/Loader';

export function PlatformStatsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: () => platformApi.stats(),
  });

  if (isLoading) return <FullPageLoader />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center animate-fadeIn">
        <p className="text-sm text-red-700 font-medium">Couldn't load platform stats.</p>
        <p className="text-xs text-red-500 mt-1">{error?.response?.data?.message ?? error?.message}</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Companies', value: data.total_companies, icon: Building2, color: 'blue' },
    { label: 'Active Companies', value: data.active_companies, icon: CheckCircle2, color: 'green' },
    { label: 'Trial Companies', value: data.trial_companies, icon: Clock, color: 'amber' },
    { label: 'Suspended Companies', value: data.suspended_companies, icon: Ban, color: 'red' },
    { label: 'Total Vehicles', value: data.total_vehicles, icon: Truck, color: 'purple' },
    { label: 'Total Drivers', value: data.total_drivers, icon: Users, color: 'teal' },
    { label: 'Active Journeys Now', value: data.active_journeys_now, icon: RouteIcon, color: 'blue' },
    { label: 'Active Subscriptions', value: data.active_subscriptions, icon: CreditCard, color: 'green' },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Platform Overview</h1>
      <p className="text-sm text-gray-500 mb-6">Aggregate numbers across every company on the platform.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>
    </div>
  );
}