import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { reportsApi } from './api';
import { StatCard } from '../../components/StatCard';
import { FullPageLoader } from '../../components/Loader';
import { Truck, Gauge, Fuel, Wrench} from 'lucide-react';
import { DownloadButton } from '../../components/DownloadButton';

const currentMonth = new Date().toISOString().slice(0, 7);

export function FleetSummaryTab() {
  const [month, setMonth] = useState(currentMonth);

   const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'fleet-summary', month],
    queryFn: () => reportsApi.fleetSummary(month),
  });

  const chartData = (data?.per_vehicle ?? []).map((v) => ({ name: v.vehicle, distance: Number(v.distance) }));

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <DownloadButton
            icon={FileText}
            label="PDF"
            path="/reports/fleet-summary"
            params={{ month, format: 'pdf' }}
            filename={`fleet-summary-${month}.pdf`}
          />
          <DownloadButton
            icon={Download}
            label="Excel"
            path="/reports/fleet-summary"
            params={{ month, format: 'xlsx' }}
            filename={`fleet-summary-${month}.xlsx`}
          />
        </div>
      </div>

      {isLoading ? (
        <FullPageLoader />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-10 text-center animate-fadeIn">
          <p className="text-sm text-red-700">Couldn't load this report.</p>
          <p className="text-xs text-red-500 mt-1">{error?.response?.data?.message ?? error?.message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Vehicles" value={data.vehicles.total} icon={Truck} color="blue" />
            <StatCard label="Total Distance" value={`${data.total_distance.toLocaleString()} km`} icon={Gauge} color="teal" />
            <StatCard label="Fuel Cost" value={data.total_fuel_cost.toLocaleString()} icon={Fuel} color="green" />
            <StatCard label="Maintenance Cost" value={data.total_maintenance_cost.toLocaleString()} icon={Wrench} color="amber" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
            <h2 className="font-medium text-gray-900 mb-4">Distance by Vehicle</h2>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-400 py-12 text-center">No journey data for this month.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
                  <Bar dataKey="distance" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}