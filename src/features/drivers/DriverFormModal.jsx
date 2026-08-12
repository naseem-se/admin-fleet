import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useCreateDriver, useUpdateDriver } from './useDrivers';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader } from '../../components/Loader';
import toast from 'react-hot-toast';

export function DriverFormModal({ driver, onClose }) {
  const isEdit = !!driver;
  const [wantsLogin, setWantsLogin] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      name: driver?.name ?? '',
      phone: driver?.phone ?? '',
      cnic_number: driver?.cnic_number ?? '',
      license_number: driver?.license_number ?? '',
      license_expiry_date: driver?.license_expiry_date?.slice(0, 10) ?? '',
      status: driver?.status ?? 'active',
      email: '',
      password: '',
    },
  });

  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values) {
    try {
      if (isEdit) {
        const { name, phone, cnic_number, license_number, license_expiry_date, status } = values;
        await updateMutation.mutateAsync({
          id: driver.id,
          payload: { name, phone, cnic_number, license_number, license_expiry_date, status },
        });
      } else {
        await createMutation.mutateAsync({ ...values, create_login: wantsLogin });
      }
      toast.success(driver ? 'Driver updated' : 'Driver added')
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
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEdit ? 'Edit Driver' : 'Add Driver'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...register('phone', { required: 'Phone is required' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
              <input {...register('cnic_number')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input {...register('license_number')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
              <input type="date" {...register('license_expiry_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>

          {!isEdit && (
            <div className="rounded-lg border border-gray-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={wantsLogin} onChange={(e) => setWantsLogin(e.target.checked)} />
                Create a portal/PWA login for this driver
              </label>

              {wantsLogin && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      {...register('email', { required: wantsLogin ? 'Email is required' : false })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      {...register('password', { required: wantsLogin ? 'Password is required' : false })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader size="sm" className="border-white/40 border-t-white" />}
              {isSubmitting ? 'Saving...' : 'Save Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}