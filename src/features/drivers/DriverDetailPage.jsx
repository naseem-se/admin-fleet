import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserRound, Truck, KeyRound, X, FileText, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { driversApi } from './api';
import { VehicleSelect } from '../vehicles/VehicleSelect';
import { useUpdateVehicle } from '../vehicles/useVehicles';
import { StatusBadge } from '../../components/StatusBadge';
import { Avatar } from '../../components/Avatar';
import { StatCard } from '../../components/StatCard';
import { FullPageLoader, Loader } from '../../components/Loader';
import { useForm } from 'react-hook-form';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useConfirm } from '../../components/ConfirmProvider';
import { DriverDocumentFormModal } from './DriverDocumentFormModal';
import { apiClient } from '../../lib/apiClient';
import { DriverPhotoUpload } from './DriverPhotoUpload';

export function DriverDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [assigning, setAssigning] = useState(false);
  const [pendingVehicle, setPendingVehicle] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const confirm = useConfirm();
  const [addingDoc, setAddingDoc] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const { data: driver, isLoading: driverLoading, refetch: refetchDriver } = useQuery({
    queryKey: ['drivers', id],
    queryFn: () => driversApi.get(id),
  });

  const { data: performance, isLoading: perfLoading } = useQuery({
    queryKey: ['drivers', id, 'performance'],
    queryFn: () => driversApi.performance(id),
    enabled: !!driver,
  });

  const vehicleMutation = useUpdateVehicle();

  // async function confirmAssign() {
  //   if (!pendingVehicle) return;
  //   await vehicleMutation.mutateAsync({ id: pendingVehicle.id, payload: { assigned_driver_id: driver.id } });
  //   setAssigning(false);
  //   setPendingVehicle(null);
  //   refetchDriver();
  //   toast.success('Vehicle assigned')
  // }

  // async function unassign() {
  //   if (!driver.assigned_vehicle) return;
  //   const ok = await confirm({ title: 'Unassign vehicle?', message: 'This driver will have no assigned vehicle.', confirmLabel: 'Unassign', danger: false });
  //   if (!ok) return;
  //   await vehicleMutation.mutateAsync({ id: driver.assigned_vehicle.id, payload: { assigned_driver_id: null } });
  //   refetchDriver();
  //   toast.success('Vehicle Unassigned')
  // }

  async function handleDeleteDoc(doc) {
    const ok = await confirm({ title: 'Delete document?', message: 'This document will be permanently removed.', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await apiClient.delete(`/driver-documents/${doc.id}`);
      toast.success('Document deleted');
      refetchDriver();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }


  if (driverLoading) return <FullPageLoader />;
  if (!driver) return null;

  return (
    <div>
      <Link to="/drivers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Drivers
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Avatar name={driver.name} photoUrl={driver.profile_photo_url} size="sm" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{driver.name}</h1>
            <p className="text-sm text-gray-500">{driver.phone}</p>
          </div>
        </div>
        <StatusBadge status={driver.status} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6 card-hover">
        <h2 className="font-medium text-gray-900 mb-3">Profile Photo</h2>
        <DriverPhotoUpload driver={driver} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Journeys (30d)" value={perfLoading ? '-' : performance?.total_journeys ?? 0} icon={UserRound} color="blue" />
        <StatCard label="Distance (30d)" value={perfLoading ? '-' : `${performance?.total_distance ?? 0} km`} icon={Truck} color="purple" />
        <StatCard label="Fuel Litres (30d)" value={perfLoading ? '-' : performance?.total_fuel_litres ?? 0} icon={Truck} color="teal" />
        <StatCard label="Fuel Cost (30d)" value={perfLoading ? '-' : performance?.total_fuel_cost ?? 0} icon={Truck} color="green" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        

        <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 font-medium text-gray-900">
              <FileText size={16} /> Documents
            </h2>
            <button onClick={() => setAddingDoc(true)} className="text-xs text-brand-600 hover:underline">+ Add</button>
          </div>

          {!driver.documents || driver.documents.length === 0 ? (
            <p className="text-sm text-gray-400">No documents on file.</p>
          ) : (
            <div className="space-y-2">
              {driver.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <div>
                    <span className="capitalize text-gray-700">{doc.document_type.replace('_', ' ')}</span>
                    <p className="text-xs text-gray-500">{new Date(doc.expiry_date).toLocaleDateString() ?? 'No expiry set'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-600">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
          <h2 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
            <KeyRound size={16} /> Portal / PWA Login
          </h2>

          {showLoginForm ? (
            <LoginForm
              driver={driver}
              mode={driver.has_login ? 'edit' : 'create'}
              onDone={() => { setShowLoginForm(false); queryClient.invalidateQueries({ queryKey: ['drivers', id] }); }}
              onCancel={() => setShowLoginForm(false)}
            />
          ) : driver.has_login ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Login active
              <button onClick={() => setShowLoginForm(true)} className="text-xs font-medium text-green-800 underline">
                Change email / password
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLoginForm(true)} className="btn-press w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600">
              + Create login for this driver
            </button>
          )}
        </div>
      </div>

      {(addingDoc || editingDoc) && (
        <DriverDocumentFormModal
          driverId={driver.id}
          document={editingDoc}
          onClose={() => { setAddingDoc(false); setEditingDoc(null); refetchDriver(); }}
        />
      )}
    </div>
  );
}

function LoginForm({ driver, mode, onDone, onCancel }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const payload = { ...values };
      if (mode === 'edit' && !payload.password) delete payload.password; // don't overwrite with blank
      if (mode === 'edit') {
        await driversApi.updateLogin(driver.id, payload);
      } else {
        await driversApi.createLogin(driver.id, payload);
      }
      toast.success(mode === 'edit' ? 'Login updated' : 'Login created');
      onDone();
    } catch (err) {
      const fieldErrors = extractValidationErrors(err);
      if (Object.keys(fieldErrors).length) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      } else {
        toast.error(extractErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <input
          type="email"
          placeholder={mode === 'edit' ? 'New email (leave blank to keep current)' : 'Email'}
          {...register('email', { required: mode === 'create' })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">Valid email is required</p>}
      </div>
      <div>
        <input
          type="password"
          placeholder={mode === 'edit' ? 'New password (leave blank to keep current)' : 'Password'}
          {...register('password', { required: mode === 'create', minLength: 8 })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">Min 8 characters</p>}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="btn-press flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
          {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
          {mode === 'edit' ? 'Update Login' : 'Create Login'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}