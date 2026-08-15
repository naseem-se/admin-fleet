import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Truck, Gauge, Droplet, Wrench, FileText, UserRound, X, QrCode, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { vehiclesApi } from './api';
import { useUpdateVehicle } from './useVehicles';
import { DriverSelect } from '../drivers/DriverSelect';
import { DocumentFormModal } from './DocumentFormModal';
import { VehicleQrModal } from '../../components/VehicleQrModal';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/StatCard';
import { FullPageLoader } from '../../components/Loader';
import { useConfirm } from '../../components/ConfirmProvider';
import { apiClient, extractErrorMessage } from '../../lib/apiClient';

export function VehicleDetailPage() {
  const { id } = useParams();
  const confirm = useConfirm();
  const [assigning, setAssigning] = useState(false);
  const [pendingDriver, setPendingDriver] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [addingDoc, setAddingDoc] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vehicles', id, 'history'],
    queryFn: () => vehiclesApi.history(id),
  });

  const updateMutation = useUpdateVehicle();

  async function confirmAssign() {
    if (!pendingDriver) return;
    await updateMutation.mutateAsync({ id, payload: { assigned_driver_id: pendingDriver.id } });
    toast.success('Driver assigned');
    setAssigning(false);
    setPendingDriver(null);
    refetch();
  }

  async function unassign() {
    const ok = await confirm({ title: 'Unassign driver?', message: 'This vehicle will have no assigned driver.', confirmLabel: 'Unassign', danger: false });
    if (!ok) return;
    await updateMutation.mutateAsync({ id, payload: { assigned_driver_id: null } });
    toast.success('Driver unassigned');
    refetch();
  }

  async function handleDeleteDoc(doc) {
    const ok = await confirm({ title: 'Delete document?', message: 'This document will be permanently removed.', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await apiClient.delete(`/vehicle-documents/${doc.id}`);
      toast.success('Document deleted');
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  if (isLoading) return <FullPageLoader />;
  if (!data) return null;

  const { vehicle, journeys, fuel_entries, maintenance_records, documents, live_avg_kmpl } = data;
  const displayAvgKmpl = vehicle.avg_kmpl_cached ?? live_avg_kmpl;

  return (
    <div>
      <Link to="/vehicles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Vehicles
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
            <Truck className="text-brand-600" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{vehicle.registration_number}</h1>
            <p className="text-sm text-gray-500">{[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowQr(true)} className="btn-press flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <QrCode size={16} /> QR Code
          </button>
          <StatusBadge status={vehicle.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Odometer" value={`${vehicle.current_odometer.toLocaleString()} km`} icon={Gauge} color="blue" />
        <StatCard label="Avg KMPL" value={displayAvgKmpl ?? '-'} icon={Droplet} color="teal" />
        <StatCard label="Fuel Entries" value={fuel_entries.length} icon={Droplet} color="green" />
        <StatCard label="Maintenance Records" value={maintenance_records.length} icon={Wrench} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-5 card-hover">
          <h2 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
            <UserRound size={16} /> Assigned Driver
          </h2>

          {vehicle.assigned_driver && !assigning ? (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{vehicle.assigned_driver.name}</p>
                <p className="text-xs text-gray-500">{vehicle.assigned_driver.phone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAssigning(true)} className="text-xs text-brand-600 hover:underline">Change</button>
                <button onClick={unassign} className="text-gray-400 hover:text-red-600"><X size={14} /></button>
              </div>
            </div>
          ) : assigning ? (
            <div className="space-y-2">
              <DriverSelect value={pendingDriver} onChange={setPendingDriver} />
              <div className="flex gap-2">
                <button onClick={confirmAssign} disabled={!pendingDriver} className="btn-press flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                  Assign
                </button>
                <button onClick={() => { setAssigning(false); setPendingDriver(null); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAssigning(true)} className="btn-press w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600">
              + Assign a driver
            </button>
          )}

          <div className="flex items-center justify-between mt-6 mb-3">
            <h2 className="flex items-center gap-2 font-medium text-gray-900">
              <FileText size={16} /> Documents
            </h2>
            <button onClick={() => setAddingDoc(true)} className="text-xs text-brand-600 hover:underline">+ Add</button>
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">No documents on file.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <div>
                    <span className="capitalize text-gray-700">{doc.document_type}</span>
                    <p className="text-xs text-gray-500">
                      {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'No expiry set'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-brand-600"
                        title="View / Download"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => setEditingDoc(doc)} className="text-gray-400 hover:text-brand-600"><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteDoc(doc)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
            <h2 className="font-medium text-gray-900 mb-3">Recent Journeys</h2>
            {journeys.length === 0 ? (
              <p className="text-sm text-gray-400">No journeys yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {journeys.slice(0, 5).map((j) => (
                  <div key={j.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-600">{new Date(j.start.time).toLocaleDateString()}</span>
                    <span className="text-gray-900 font-medium">{j.total_distance ?? '-'} km</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
            <h2 className="font-medium text-gray-900 mb-3">Recent Fuel Entries</h2>
            {fuel_entries.length === 0 ? (
              <p className="text-sm text-gray-400">No fuel entries yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {fuel_entries.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-600">{new Date(f.entry_time).toLocaleDateString()}</span>
                    <span className="text-gray-900 font-medium">{f.quantity_litres} L · {f.total_cost}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showQr && <VehicleQrModal vehicle={vehicle} onClose={() => setShowQr(false)} />}
      {(addingDoc || editingDoc) && (
        <DocumentFormModal
          vehicleId={vehicle.id}
          document={editingDoc}
          onClose={() => { setAddingDoc(false); setEditingDoc(null); refetch(); }}
        />
      )}
    </div>
  );
}