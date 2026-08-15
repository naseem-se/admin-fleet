import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { platformApi } from './api';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader } from '../../components/Loader';

export function AssignSubscriptionModal({ companyId, onClose }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      subscription_plan_id: '',
      starts_at: new Date().toISOString().slice(0, 10),
      ends_at: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    },
  });

  const { data: plans } = useQuery({ queryKey: ['platform', 'plans'], queryFn: () => platformApi.plans.list() });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => platformApi.subscriptions.assign(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'companies', companyId] });
      toast.success('Subscription assigned');
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

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Subscription</h2>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select {...register('subscription_plan_id', { required: 'Select a plan' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
              <option value="">Select a plan</option>
              {plans?.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price}/{p.billing_cycle}</option>)}
            </select>
            {errors.subscription_plan_id && <p className="mt-1 text-xs text-red-600">{errors.subscription_plan_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starts</label>
              <input type="date" {...register('starts_at')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ends</label>
              <input type="date" {...register('ends_at', { required: 'Required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              {errors.ends_at && <p className="mt-1 text-xs text-red-600">{errors.ends_at.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {mutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}