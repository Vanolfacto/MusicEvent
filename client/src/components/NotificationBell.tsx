import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { ApiResponse, Notification } from '../types';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () =>
      (await api.get<ApiResponse<{ items: Notification[]; unreadCount: number }>>('/notifications')).data
        .data,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = data?.items || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
        aria-label="Notifikacije"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
              <p className="text-sm font-medium text-white">Notifikacije</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-primary-400 hover:underline"
                >
                  Označi sve kao pročitano
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">Nemate notifikacija</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                    className={`block w-full border-b border-slate-800/60 px-4 py-3 text-left text-sm last:border-0 ${
                      n.isRead ? 'text-slate-500' : 'bg-primary-500/5 text-slate-200'
                    }`}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{n.message}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
