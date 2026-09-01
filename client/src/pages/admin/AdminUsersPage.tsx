import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, User, UserStatus } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_OPTIONS: UserStatus[] = ['ACTIVE', 'BLOCKED', 'INACTIVE'];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await api.get<ApiResponse<User[]>>('/users')).data.data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/users/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status ažuriran');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Korisnici" />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr><th className="p-3">Ime</th><th>Email</th><th>Uloga</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {data?.map((user) => {
              const profileId =
                user.role === 'ARTIST'
                  ? user.artistProfile?.id
                  : user.role === 'ORGANIZER'
                    ? user.organizerProfile?.id
                    : undefined;
              const profileLink =
                user.role === 'ARTIST' ? `/artists/${profileId}` : `/organizers/${profileId}`;

              return (
                <tr key={user.id} className="border-t border-slate-800">
                  <td className="p-3 text-white">{user.firstName} {user.lastName}</td>
                  <td className="text-slate-300">{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <select
                        className="input text-sm"
                        value={user.status}
                        disabled={updateStatusMutation.isPending}
                        onChange={(e) =>
                          updateStatusMutation.mutate({ id: user.id, status: e.target.value })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {profileId != null && (
                        <Link to={profileLink} className="text-sm text-primary-400 hover:text-primary-300">
                          Vidi profil
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
