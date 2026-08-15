import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, Ban, CheckCircle2, Plus } from 'lucide-react';
import { platformApi } from './api';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmProvider';
import { FullPageLoader } from '../../components/Loader';
import { AssignSubscriptionModal } from './AssignSubscriptionModal';

export function CompanyDetailPage() {
  const { id } = useParams();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [showAssign, setShowAssign] = useState(false);

  const { data: company, isLoading } = useQuery({
    queryKey: ['platform', 'companies', id],
    queryFn: () => platformApi.companies.get(id),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['platform', 'companies', id, 'subscriptions'],
    queryFn: () => platformApi.subscriptions.list(id),
  });

  const suspendMutation = useMutation({
    mutationFn: () => platformApi.companies.suspend(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platform', 'companies', id] }); toast.success('Company suspended'); },
  });
  const activateMutation = useMutation({
    mutationFn: () => platformApi.companies.activate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platform', 'companies', id] }); toast.success('Company activated'); },
  });

  async function handleSuspendToggle() {
    if (company.status === 'suspended') {
      const ok = await confirm({ title: 'Activate this company?', message: `${company.name} will regain access.`, confirmLabel: 'Activate', danger: false });
      if (ok) activateMutation.mutate();
    } else {
      const ok = await confirm({ title: 'Suspend this company?', message: `${company.name}'s users will lose access immediately.`, confirmLabel: 'Suspend' });
      if (ok) suspendMutation.mutate();
    }
  }

  if (isLoading) return <FullPageLoader />;
  if (!company) return null;

  return (
    <div>
      <Link to="/platform/companies" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Companies
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
            <Building2 className="text-brand-600" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{company.name}</h1>
            <p className="text-sm text-gray-500">{company.slug} · {company.timezone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSuspendToggle}
            className={`btn-press flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
              company.status === 'suspended' ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-red-300 text-red-700 hover:bg-red-50'
            }`}
          >
            {company.status === 'suspended' ? <CheckCircle2 size={16} /> : <Ban size={16} />}
            {company.status === 'suspended' ? 'Activate' : 'Suspend'}
          </button>
          <StatusBadge status={company.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Subscription History</h2>
            <button onClick={() => setShowAssign(true)} className="btn-press flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">
              <Plus size={14} /> Assign Plan
            </button>
          </div>

          {!subscriptions || subscriptions.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No subscriptions assigned yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.plan?.name ?? 'Unknown plan'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.starts_at).toLocaleDateString()} → {new Date(sub.ends_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
          <h2 className="font-medium text-gray-900 mb-3">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Legal name</dt><dd className="text-gray-900">{company.legal_name ?? '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Vehicles</dt><dd className="text-gray-900">{company.vehicle_count ?? 0}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Users</dt><dd className="text-gray-900">{company.user_count ?? 0}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Created</dt><dd className="text-gray-900">{new Date(company.created_at).toLocaleDateString()}</dd></div>
          </dl>
        </div>
      </div>

      {showAssign && <AssignSubscriptionModal companyId={id} onClose={() => setShowAssign(false)} />}
    </div>
  );
}   