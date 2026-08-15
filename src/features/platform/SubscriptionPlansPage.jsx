import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Package, Pencil, EyeOff } from 'lucide-react';
import { platformApi } from './api';
import { PlanFormModal } from './PlanFormModal';
import { useConfirm } from '../../components/ConfirmProvider';
import { FullPageLoader } from '../../components/Loader';

export function SubscriptionPlansPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({ queryKey: ['platform', 'plans'], queryFn: () => platformApi.plans.list() });

  const deactivateMutation = useMutation({
    mutationFn: (id) => platformApi.plans.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'plans'] });
      toast.success('Plan deactivated');
    },
  });

  async function handleDeactivate(plan) {
    const ok = await confirm({
      title: 'Deactivate this plan?',
      message: `${plan.name} will no longer be assignable to new companies. Existing subscriptions on it are unaffected.`,
      confirmLabel: 'Deactivate',
    });
    if (ok) deactivateMutation.mutate(plan.id);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Subscription Plans</h1>
        <button onClick={() => { setEditingPlan(null); setShowModal(true); }} className="btn-press flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus size={16} /> New Plan
        </button>
      </div>

      {isLoading ? (
        <FullPageLoader />
      ) : !plans || plans.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <Package className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No subscription plans yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl border bg-white p-5 card-hover ${!plan.is_active ? 'opacity-50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-medium text-gray-900">{plan.name}</h2>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingPlan(plan); setShowModal(true); }} className="text-gray-400 hover:text-brand-600"><Pencil size={16} /></button>
                  {plan.is_active && (
                    <button onClick={() => handleDeactivate(plan)} className="text-gray-400 hover:text-red-600"><EyeOff size={16} /></button>
                  )}
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">
                {plan.price} <span className="text-sm font-normal text-gray-400">/{plan.billing_cycle}</span>
              </p>
              <div className="text-sm text-gray-500 space-y-1 mt-3">
                <p>Up to {plan.max_vehicles} vehicles</p>
                <p>Up to {plan.max_users} users</p>
              </div>
              {!plan.is_active && <p className="mt-3 text-xs font-medium text-red-500">Inactive</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && <PlanFormModal plan={editingPlan} onClose={() => { setShowModal(false); setEditingPlan(null); }} />}
    </div>
  );
}