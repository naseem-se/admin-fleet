import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRound, Gauge, Fuel } from 'lucide-react';
import { reportsApi } from './api';
import { DriverSelect } from '../drivers/DriverSelect';
import { DateRangePicker } from '../../components/DateRangePicker';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { FullPageLoader } from '../../components/Loader';

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export function DriverReportTab() {
  const [driver, setDriver] = useState(null);
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'driver', driver?.id, from, to],
    queryFn: () => reportsApi.driverReport(driver.id, from, to),
    enabled: !!driver,
  });

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full sm:w-64">
          <label className="block text-xs text-gray-500 mb-1">Driver</label>
          <DriverSelect value={driver} onChange={setDriver} />
        </div>
        <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      </div>

      {!driver ? (
        <EmptyState icon={UserRound} message="Select a driver to view their report." />
      ) : isLoading ? (
        <FullPageLoader />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-10 text-center animate-fadeIn">
          <p className="text-sm text-red-700">Couldn't load this report.</p>
          <p className="text-xs text-red-500 mt-1">{error?.response?.data?.message ?? error?.message}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Journeys" value={data.total_journeys} icon={UserRound} color="blue" />
            <StatCard label="Total Distance" value={`${data.total_distance.toLocaleString()} km`} icon={Gauge} color="teal" />
            <StatCard label="Fuel Cost" value={data.total_fuel_cost.toLocaleString()} icon={Fuel} color="green" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden card-hover">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Journeys</h2>
            </div>
            {data.journeys.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No journeys in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Start</th>
                      <th className="px-4 py-3">Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.journeys.map((j) => (
                      <tr key={j.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{j.vehicle?.registration_number ?? '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(j.start_time).toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{j.total_distance ?? '-'} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}