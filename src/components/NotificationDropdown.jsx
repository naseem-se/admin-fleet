import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get('/notifications')).data,
    refetchInterval: 60000,
  });

  const markAllRead = useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneRead = useMutation({
    mutationFn: (id) => apiClient.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unread = data?.unread_count ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative text-gray-500 hover:text-gray-700">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg animate-scaleIn z-50">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-medium text-gray-900">Notifications</span>
            {unread > 0 && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-brand-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!data || data.data.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</p>
            ) : (
              data.data.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read_at && markOneRead.mutate(n.id)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${!n.read_at ? 'bg-brand-50/40' : ''}`}
                >
                  <span className="flex items-center gap-1.5 text-sm text-gray-800">
                    {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                    {n.data?.summary ?? 'Notification'}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}