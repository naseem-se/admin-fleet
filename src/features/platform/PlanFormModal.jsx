import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { platformApi } from './api';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader } from '../../components/Loader';

export function PlanFormModal({ plan, onClose }) {
  const isEdit = !!plan;
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      name: plan?.name ?? '',
      max_vehicles: plan?.max_vehicles ?? '',
      max_users: plan?.max_users ?? '',
      price: plan?.price ?? '',
      billing_cycle: plan?.billing_cycle ?? 'monthly',
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => isEdit ? platformApi.plans.update(plan.id, payload) : platformApi.plans.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'plans'] });
      toast.success(isEdit ? 'Plan updated' : 'Plan created');
      onClose();
    },
    onError: (err) => {
      const fieldErrors = extractValidationErrors(err);
      if (Object.keys(fieldErrors).length) {
        Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      } else {
        toast.error(extractErrorMessage(err));
      }
    },
  });

  function onSubmit(values) {
    mutation.mutate({
      ...values,
      max_vehicles: Number(values.max_vehicles),
      max_users: Number(values.max_users),
      price: Number(values.price),
    });
  }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{isEdit ? 'Edit' : 'New'} Plan</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input {...register('name', { required: 'Required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Vehicles</label>
              <input type="number" {...register('max_vehicles', { required: 'Required', min: 1 })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
              <input type="number" {...register('max_users', { required: 'Required', min: 1 })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" step="0.01" {...register('price', { required: 'Required', min: 0 })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
              <select {...register('billing_cycle')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {mutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
              {isEdit ? 'Update' : 'Create'} Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}