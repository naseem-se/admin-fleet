import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { platformApi } from './api';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader } from '../../components/Loader';

export function CompanyFormModal({ onClose }) {
  const { register, handleSubmit, setError, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '', legal_name: '', slug: '', timezone: 'UTC',
      admin_name: '', admin_email: '', admin_password: '',
      subscription_plan_id: '', trial_days: '14',
    },
  });

  const { data: plans } = useQuery({ queryKey: ['platform', 'plans'], queryFn: () => platformApi.plans.list() });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => platformApi.companies.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'companies'] });
      toast.success('Company created');
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

  async function onSubmit(values) {
    mutation.mutate({
      ...values,
      subscription_plan_id: values.subscription_plan_id || undefined,
      trial_days: values.trial_days ? Number(values.trial_days) : undefined,
    });
  }

  // Auto-suggest a slug from the company name, but let the user override it freely.
  const name = watch('name');

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">New Company</h2>
        <p className="text-sm text-gray-500 mb-4">Creates the company and its first admin login together.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input {...register('name', { required: 'Required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                {...register('slug', { required: 'Required' })}
                placeholder={name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name (optional)</label>
            <input {...register('legal_name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium uppercase text-gray-400 mb-3">First Admin Login</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <input {...register('admin_name', { required: 'Required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                {errors.admin_name && <p className="mt-1 text-xs text-red-600">{errors.admin_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                <input type="email" {...register('admin_email', { required: 'Required' })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                {errors.admin_email && <p className="mt-1 text-xs text-red-600">{errors.admin_email.message}</p>}
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
            <input type="password" {...register('admin_password', { required: 'Required', minLength: 8 })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            {errors.admin_password && <p className="mt-1 text-xs text-red-600">Min 8 characters</p>}
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Plan (optional)</label>
              <select {...register('subscription_plan_id')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                <option value="">No plan yet</option>
                {plans?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
              <input type="number" {...register('trial_days')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {mutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
              Create Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}