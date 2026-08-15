import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Building2, Ban, CheckCircle2 } from 'lucide-react';
import { platformApi } from './api';
import { useDebounce } from '../../lib/useDebounce';
import { CompanyFormModal } from './CompanyFormModal';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmProvider';
import { FullPageLoader, Loader } from '../../components/Loader';

export function CompaniesListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['platform', 'companies', { search: debouncedSearch, status, page }],
    queryFn: () => platformApi.companies.list({ search: debouncedSearch || undefined, status: status || undefined, page }),
    placeholderData: (prev) => prev,
  });

  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const suspendMutation = useMutation({
    mutationFn: (id) => platformApi.companies.suspend(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platform', 'companies'] }); toast.success('Company suspended'); },
  });
  const activateMutation = useMutation({
    mutationFn: (id) => platformApi.companies.activate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['platform', 'companies'] }); toast.success('Company activated'); },
  });

  async function handleSuspend(company) {
    const ok = await confirm({
      title: 'Suspend this company?',
      message: `${company.name}'s users will lose access immediately. This can be reversed at any time.`,
      confirmLabel: 'Suspend',
    });
    if (ok) suspendMutation.mutate(company.id);
  }

  async function handleActivate(company) {
    const ok = await confirm({
      title: 'Activate this company?',
      message: `${company.name} will regain access.`,
      confirmLabel: 'Activate',
      danger: false,
    });
    if (ok) activateMutation.mutate(company.id);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500">{data?.meta?.total ?? 0} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-press flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus size={16} /> New Company
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name or slug..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
          <option value="">All statuses</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        {isFetching && !isLoading && <Loader size="sm" className="self-center" />}
      </div>

      {isLoading ? (
        <FullPageLoader />
      ) : data?.data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <Building2 className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No companies found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Vehicles</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/platform/companies/${company.id}`} className="font-medium text-brand-700 hover:underline">
                        {company.name}
                      </Link>
                      <p className="text-xs text-gray-400">{company.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{company.active_subscription?.plan ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{company.vehicle_count ?? 0}</td>
                    <td className="px-4 py-3 text-gray-600">{company.user_count ?? 0}</td>
                    <td className="px-4 py-3"><StatusBadge status={company.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {company.status === 'suspended' ? (
                          <button onClick={() => handleActivate(company)} className="text-gray-400 hover:text-green-600" title="Activate">
                            <CheckCircle2 size={16} />
                          </button>
                        ) : (
                          <button onClick={() => handleSuspend(company)} className="text-gray-400 hover:text-red-600" title="Suspend">
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {data.meta.current_page} of {data.meta.last_page}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {showModal && <CompanyFormModal onClose={() => setShowModal(false)} />}
    </div>
  );
}