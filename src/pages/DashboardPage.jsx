import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Truck, CheckCircle2, Wrench, Fuel, Route as RouteIcon, Gauge, AlertTriangle, FileWarning, Users } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { StatCard } from '../components/StatCard';
import { FullPageLoader } from '../components/Loader';

export function DashboardPage() {
  const { data: overview, isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: async () => (await apiClient.get('/reports/overview')).data,
  });

  const { data: monthSummary } = useQuery({
    queryKey: ['reports', 'fleet-summary'],
    queryFn: async () => (await apiClient.get('/reports/fleet-summary')).data,
  });

  const { data: upcomingMaintenance } = useQuery({
    queryKey: ['maintenance-records', 'upcoming'],
    queryFn: async () => (await apiClient.get('/maintenance/upcoming', { params: { days: 14 } })).data.data,
  });

  const { data: expiringDocs } = useQuery({
    queryKey: ['documents', 'expiring'],
    queryFn: async () => (await apiClient.get('/documents/expiring', { params: { days: 30 } })).data.data,
  });

  if (isLoading) return <FullPageLoader />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center animate-fadeIn">
        <p className="text-sm text-red-700 font-medium">Couldn't load dashboard data.</p>
        <p className="text-xs text-red-500 mt-1">{error?.response?.data?.message ?? error?.message}</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Vehicles', value: overview.vehicles.total, icon: Truck, color: 'blue' },
    { label: 'Active Vehicles', value: overview.vehicles.active, icon: CheckCircle2, color: 'green' },
    { label: 'In Maintenance', value: overview.vehicles.maintenance, icon: Wrench, color: 'amber' },
    { label: 'Total Drivers', value: overview.drivers.total, icon: Users, color: 'purple' },
    { label: 'Total Journeys', value: overview.total_journeys, icon: RouteIcon, color: 'purple' },
    { label: 'Total Distance (km)', value: overview.total_distance.toLocaleString(), icon: Gauge, color: 'teal' },
    { label: 'Total Fuel Cost', value: overview.total_fuel_cost.toLocaleString(), icon: Fuel, color: 'red' },
    { label: 'Fleet Avg KMPL', value: overview.fleet_avg_kmpl ?? '-', icon: Fuel, color: 'green' },
  ];

  const chartData = (monthSummary?.per_vehicle ?? []).slice(0, 8).map((v) => ({ name: v.vehicle, distance: Number(v.distance) }));

  const alerts = [
    ...(upcomingMaintenance ?? []).map((m) => ({
      id: `m-${m.id}`, icon: Wrench, color: 'text-amber-600 bg-amber-50',
      text: `Maintenance due for ${m.vehicle?.registration_number ?? 'a vehicle'} on ${new Date(m.next_service_date)?.toLocaleDateString() ?? 'soon'}`,
    })),
    ...(expiringDocs ?? []).map((d) => ({
      id: `d-${d.id}`, icon: FileWarning, color: 'text-red-600 bg-red-50',
      text: `${d.document_type} for ${d.vehicle?.registration_number ?? 'a vehicle'} expires ${new Date(d.expiry_date)?.toLocaleDateString()}`,
    })),
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 card-hover">
          <h2 className="font-medium text-gray-900 mb-1">Distance by Vehicle</h2>
          <p className="text-xs text-gray-400 mb-4">This calendar month</p>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-12 text-center">No journey data yet this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="distance" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
          <h2 className="flex items-center gap-2 font-medium text-gray-900 mb-4">
            <AlertTriangle size={16} /> Alerts
            {alerts.length > 0 && <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{alerts.length}</span>}
          </h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No alerts — everything's on track.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
                    <a.icon size={15} />
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{a.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}