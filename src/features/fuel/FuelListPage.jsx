import { useState } from 'react';
import { Fuel, Download, Plus } from 'lucide-react';
import { useFuelEntries } from './useFuel';
import { fuelApi } from './api';
import { StatCard } from '../../components/StatCard';
import { FullPageLoader, Loader } from '../../components/Loader';
import { FuelFormModal } from './FuelFormModal'; // add this import
import { DownloadButton } from '../../components/DownloadButton';

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export function FuelListPage() {
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const filters = { from, to, page };
  const { data, isLoading, isFetching } = useFuelEntries(filters);

  const totalLitres = data?.data.reduce((sum, e) => sum + Number(e.quantity_litres), 0) ?? 0;
  const totalCost = data?.data.reduce((sum, e) => sum + Number(e.total_cost), 0) ?? 0;


  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Fuel Entries</h1>
        <DownloadButton
          icon={Download}
          label="Export Excel"
          path="/reports/fuel"
          params={{ from, to, format: 'xlsx' }}
          filename="fuel-report.xlsx"
        />
        <button
          onClick={() => setShowModal(true)}
          className="btn-press flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Litres (period)" value={totalLitres.toFixed(2)} icon={Fuel} color="blue" />
        <StatCard label="Total Cost (period)" value={totalCost.toLocaleString()} icon={Fuel} color="green" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        {isFetching && !isLoading && <Loader size="sm" className="self-end mb-2" />}
      </div>

      {isLoading ? (
        <FullPageLoader />
      ) : data?.data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <Fuel className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No fuel entries in this period.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {data?.data.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">Vehicle #{entry.vehicle_id}</span>
                  <span className="text-sm text-gray-500">{new Date(entry.entry_time).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-2">
                  <span>{entry.quantity_litres} L @ {entry.rate_per_litre}</span>
                  <span className="text-right font-medium text-gray-900">{entry.total_cost}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Litres</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Total Cost</th>
                    <th className="px-4 py-3">Odometer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{new Date(entry.entry_time).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">#{entry.vehicle_id}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.quantity_litres} L</td>
                      <td className="px-4 py-3 text-gray-600">{entry.rate_per_litre}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{entry.total_cost}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.odometer_reading}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {data.meta.current_page} of {data.meta.last_page}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {showModal && <FuelFormModal onClose={() => setShowModal(false)} />}
    </div>
  );
}