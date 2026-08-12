import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateMaintenanceRecord, useUpdateMaintenanceRecord } from './useMaintenance';
import { VehicleSelect } from '../vehicles/VehicleSelect';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader } from '../../components/Loader';

export function MaintenanceFormModal({ record, onClose }) {
  const isEdit = !!record;
  const [vehicle, setVehicle] = useState(
    record ? { id: record.vehicle_id, registration_number: record.vehicle?.registration_number } : null
  );

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      type: record?.type ?? 'oil_change',
      description: record?.description ?? '',
      cost: record?.cost ?? '',
      odometer_at_service: record?.odometer_at_service ?? '',
      service_date: record?.service_date ?? new Date().toISOString().slice(0, 10),
      next_service_date: record?.next_service_date ?? '',
      next_service_km: record?.next_service_km ?? '',
      performed_by: record?.performed_by ?? '',
    },
  });

  const createMutation = useCreateMaintenanceRecord();
  const updateMutation = useUpdateMaintenanceRecord();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values) {
    if (!isEdit && !vehicle) {
      toast.error('Please select a vehicle.');
      return;
    }

    const payload = {
      ...values,
      cost: values.cost ? Number(values.cost) : undefined,
      odometer_at_service: values.odometer_at_service ? Number(values.odometer_at_service) : undefined,
      next_service_km: values.next_service_km ? Number(values.next_service_km) : undefined,
    };
    if (!isEdit) payload.vehicle_id = vehicle.id;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: record.id, payload });
        toast.success('Maintenance record updated');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Maintenance record added');
      }
      onClose();
    } catch (err) {
      const fieldErrors = extractValidationErrors(err);
      if (Object.keys(fieldErrors).length) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      } else {
        toast.error(extractErrorMessage(err));
      }
    }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{isEdit ? 'Edit' : 'Add'} Maintenance Record</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              {isEdit ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {vehicle?.registration_number} <span className="text-xs text-gray-400">(fixed)</span>
                </div>
              ) : (
                <VehicleSelect value={vehicle} onChange={setVehicle} />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select {...register('type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                <option value="oil_change">Oil Change</option>
                <option value="service">Service</option>
                <option value="repair">Repair</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input {...register('cost')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odometer at Service</label>
              <input {...register('odometer_at_service')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
              <input type="date" {...register('service_date', { required: 'Service date is required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              {errors.service_date && <p className="mt-1 text-xs text-red-600">{errors.service_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Performed By</label>
              <input {...register('performed_by')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date</label>
              <input type="date" {...register('next_service_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Service KM</label>
              <input {...register('next_service_km')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {isSubmitting && <Loader size="sm" className="border-white/40 border-t-white" />}
              {isEdit ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}