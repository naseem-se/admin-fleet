import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsApi } from './api';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader, FullPageLoader } from '../../components/Loader';
import { StatusBadge } from '../../components/StatusBadge';

export function CompanyTab() {
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', 'settings'],
    queryFn: () => settingsApi.getCompanySettings(),
  });

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    defaultValues: { name: '', legal_name: '', timezone: '', gps_ping_interval_seconds: 300, distance_unit: 'km' },
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        legal_name: company.legal_name ?? '',
        timezone: company.timezone,
        gps_ping_interval_seconds: company.gps_ping_interval_seconds,
        distance_unit: company.distance_unit,
      });
    }
  }, [company, reset]);

  const mutation = useMutation({
    mutationFn: (payload) => settingsApi.updateCompanySettings(payload),
    onSuccess: () => {
      toast.success('Company settings updated');
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
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

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-gray-900">Company Settings</h2>
        <StatusBadge status={company.status} />
      </div>

      {company.active_subscription && (
        <div className="mb-5 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Plan: <span className="font-medium text-gray-900">{company.active_subscription.plan}</span>
          {' · '}Renews {new Date(company.active_subscription.ends_at).toLocaleDateString()}
        </div>
      )}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input {...register('name', { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
          <input {...register('legal_name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <input {...register('timezone')} placeholder="Asia/Karachi" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GPS Ping Interval (seconds)</label>
            <input type="number" {...register('gps_ping_interval_seconds', { min: 60, max: 1800 })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            {errors.gps_ping_interval_seconds && <p className="mt-1 text-xs text-red-600">Between 60 and 1800 seconds</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance Unit</label>
            <select {...register('distance_unit')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
              <option value="km">Kilometers</option>
              <option value="mi">Miles</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
          {mutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
          Save Company Settings
        </button>
      </form>
    </div>
  );
}