import { useState } from 'react';
import { Plus, Wrench, Trash2, AlertTriangle } from 'lucide-react';
import { useMaintenanceRecords, useUpcomingMaintenance, useDeleteMaintenanceRecord } from './useMaintenance';
import { MaintenanceFormModal } from './MaintenanceFormModal';
import { FullPageLoader } from '../../components/Loader';
import { Pencil } from 'lucide-react';
import { useConfirm } from '../../components/ConfirmProvider';
import toast from 'react-hot-toast';

export function MaintenanceListPage() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const confirm = useConfirm();

  const { data, isLoading } = useMaintenanceRecords({ page });
  const { data: upcoming } = useUpcomingMaintenance();
  const deleteMutation = useDeleteMaintenanceRecord();

  async function handleDelete(record) {
    const ok = await confirm({ title: 'Delete this record?', message: 'This maintenance record will be permanently removed.', confirmLabel: 'Delete' });
    if (!ok) return;
    await deleteMutation.mutateAsync(record.id);
    toast.success('Record deleted');
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Maintenance</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add Record
        </button>
      </div>

      {upcoming && upcoming.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3 text-amber-800 font-medium text-sm">
            <AlertTriangle size={16} /> Upcoming Maintenance ({upcoming.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {upcoming.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
                <span className="font-medium">{item.vehicle_id ? `Vehicle #${item.vehicle_id}` : 'Vehicle'}</span>
                {' — '}due {new Date(item.next_service_date).toLocaleDateString() ?? `at ${item.next_service_km} km`}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <FullPageLoader />
      ) : data?.data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <Wrench className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No maintenance records yet.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {data?.data.map((record) => (
              <div key={record.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 capitalize">{record.type.replace('_', ' ')}</span>
                  <span className="text-sm text-gray-500">{record.service_date}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{record.description || '-'}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{record.cost}</span>
                  <button onClick={() => setEditingRecord(record)} className="p-2 text-gray-400 hover:text-brand-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(record)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
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
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Performed By</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{ new Date(record.service_date).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">#{record.vehicle_id}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{record.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-gray-600">{record.description || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{record.cost}</td>
                      <td className="px-4 py-3 text-gray-600">{record.performed_by || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditingRecord(record)} className="p-2 text-gray-400 hover:text-brand-600">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(record)} className="text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
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

      {(showModal || editingRecord) && (
        <MaintenanceFormModal record={editingRecord} onClose={() => { setShowModal(false); setEditingRecord(null); }} />
      )}
    </div>
  );
}