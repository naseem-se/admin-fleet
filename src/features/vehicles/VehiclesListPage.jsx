import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Truck, Eye } from 'lucide-react';
import { useVehicles, useDeleteVehicle } from './useVehicles';
import { VehicleFormModal } from './VehicleFormModal';
import { StatusBadge } from '../../components/StatusBadge';
import { FullPageLoader, Loader } from '../../components/Loader';
import { useConfirm } from '../../components/ConfirmProvider';
import toast from 'react-hot-toast';
import { useDebounce } from '../../lib/useDebounce';
import { QrCode } from 'lucide-react';
import { VehicleQrModal } from '../../components/VehicleQrModal';

export function VehiclesListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const confirm = useConfirm();
  const [qrVehicle, setQrVehicle] = useState(null);

  const { data, isLoading, isFetching } = useVehicles({ search: debouncedSearch || undefined, status: status || undefined, page });
  const deleteMutation = useDeleteVehicle();

  function openCreate() {
    setEditingVehicle(null);
    setShowModal(true);
  }

  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  function openEdit(vehicle) {
    setEditingVehicle(vehicle);
    setShowModal(true);
  }

  async function handleDelete(vehicle) {
    const ok = await confirm({
      title: 'Delete vehicle?',
      message: `This will remove ${vehicle.registration_number}. Journey and fuel history are kept.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await deleteMutation.mutateAsync(vehicle.id);
    toast.success('Vehicle deleted');
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Vehicles</h1>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            placeholder="Search registration, make, model..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
        {isFetching && !isLoading && <Loader size="sm" className="self-center" />}
      </div>

      {isLoading ? (
        <FullPageLoader />
      ) : data?.data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <Truck className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No vehicles found.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {data?.data.map((vehicle) => (
              <div key={vehicle.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link to={`/vehicles/${vehicle.id}`} className="font-medium text-brand-700">
                      {vehicle.registration_number}
                    </Link>
                    <p className="text-sm text-gray-500">{[vehicle.make, vehicle.model].filter(Boolean).join(' ') || '-'}</p>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  {/* <span>{vehicle.assigned_driver?.name ?? 'Unassigned'}</span> */}
                  <span>{vehicle.current_odometer.toLocaleString()} km</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Link to={`/vehicles/${vehicle.id}`} className="text-gray-400 hover:text-brand-600">
                    <Eye size={16} />
                  </Link>
                  <button onClick={() => setQrVehicle(vehicle)} className="text-gray-400 hover:text-brand-600">
                    <QrCode size={16} />
                  </button>
                  <button onClick={() => openEdit(vehicle)} className="p-2 text-gray-400 hover:text-brand-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(vehicle)} className="p-2 text-gray-400 hover:text-red-600">
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
                    <th className="px-4 py-3">Registration</th>
                    <th className="px-4 py-3">Make / Model</th>
                    {/* <th className="px-4 py-3">Driver</th> */}
                    <th className="px-4 py-3">Odometer</th>
                    <th className="px-4 py-3">Avg KMPL</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/vehicles/${vehicle.id}`} className="font-medium text-brand-700 hover:underline">
                          {vehicle.registration_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{[vehicle.make, vehicle.model].filter(Boolean).join(' ') || '-'}</td>
                      {/* <td className="px-4 py-3 text-gray-600">{vehicle.assigned_driver?.name ?? '-'}</td> */}
                      <td className="px-4 py-3 text-gray-600">{vehicle.current_odometer.toLocaleString()} km</td>
                      <td className="px-4 py-3 text-gray-600">{vehicle.avg_kmpl_cached ?? '-'}</td>
                      <td className="px-4 py-3"><StatusBadge status={vehicle.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/vehicles/${vehicle.id}`} className="text-gray-400 hover:text-brand-600">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => setQrVehicle(vehicle)} className="text-gray-400 hover:text-brand-600">
                            <QrCode size={16} />
                          </button>
                          <button onClick={() => openEdit(vehicle)} className="text-gray-400 hover:text-brand-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(vehicle)} className="text-gray-400 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
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
          <span>Page {data.meta.current_page} of {data.meta.last_page} ({data.meta.total} total)</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40">
              Previous
            </button>
            <button disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && <VehicleFormModal vehicle={editingVehicle} onClose={() => setShowModal(false)} />}
      {qrVehicle && <VehicleQrModal vehicle={qrVehicle} onClose={() => setQrVehicle(null)} />}
    </div>
  );
}