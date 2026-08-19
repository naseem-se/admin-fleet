import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Users, AlertTriangle, Eye } from 'lucide-react';
import { useDrivers, useDeleteDriver } from './useDrivers';
import { DriverFormModal } from './DriverFormModal';
import { StatusBadge } from '../../components/StatusBadge';
import { Avatar } from '../../components/Avatar';
import { FullPageLoader, Loader } from '../../components/Loader';
import { useConfirm } from '../../components/ConfirmProvider';
import toast from 'react-hot-toast';
import { useDebounce } from '../../lib/useDebounce';

export function DriversListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const confirm = useConfirm();

  const { data, isLoading, isFetching } = useDrivers({ search: debouncedSearch || undefined, status: status || undefined, page });
  const deleteMutation = useDeleteDriver();

  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  function openCreate() {
    setEditingDriver(null);
    setShowModal(true);
  }

  function openEdit(driver) {
    setEditingDriver(driver);
    setShowModal(true);
  }

  async function handleDelete(driver) {
    const ok = await confirm({
      title: 'Delete driver?',
      message: `This will remove ${driver.name} from your driver list.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await deleteMutation.mutateAsync(driver.id);
    toast.success('Driver deleted');
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Drivers</h1>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Add Driver
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            placeholder="Search name, phone, license..."
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
          <option value="suspended">Suspended</option>
        </select>
        {isFetching && !isLoading && <Loader size="sm" className="self-center" />}
      </div>

      {isLoading ? (
        <FullPageLoader />
      ) : data?.data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <Users className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No drivers found.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {data?.data.map((driver) => (
              <div key={driver.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={driver.name} photoUrl={driver.profile_photo_url} size="sm" />
                    <div>
                      <Link to={`/drivers/${driver.id}`} className="font-medium text-brand-700">
                        {driver.name}
                      </Link>
                      <p className="text-sm text-gray-500">{driver.phone}</p>
                    </div>
                  </div>
                  <StatusBadge status={driver.status} />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{driver.assigned_vehicle?.registration_number ?? 'Unassigned'}</span>
                  {driver.license_expiring_soon && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle size={14} /> License expiring
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Link to={`/drivers/${driver.id}`} className="text-gray-400 hover:text-brand-600">
                    <Eye size={16} />
                  </Link>
                  <button onClick={() => openEdit(driver)} className="p-2 text-gray-400 hover:text-brand-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(driver)} className="p-2 text-gray-400 hover:text-red-600">
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
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">License</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.data.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={driver.name} photoUrl={driver.profile_photo_url} size="sm" />
                          <Link to={`/drivers/${driver.id}`} className="font-medium text-brand-700 hover:underline">
                            {driver.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{driver.phone}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          {driver.license_number ?? '-'}
                          {driver.license_expiring_soon && <AlertTriangle size={14} className="text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{driver.assigned_vehicle?.registration_number ?? '-'}</td>
                      <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/drivers/${driver.id}`} className="text-gray-400 hover:text-brand-600">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => openEdit(driver)} className="text-gray-400 hover:text-brand-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(driver)} className="text-gray-400 hover:text-red-600">
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

      {showModal && <DriverFormModal driver={editingDriver} onClose={() => setShowModal(false)} />}
    </div>
  );
}