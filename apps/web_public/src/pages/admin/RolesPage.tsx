import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

const ROLES = [
  { id: 'ROLE_PLATFORM_ADMIN', name: 'Platform Admin', description: 'Akses penuh ke seluruh platform', color: 'bg-red-100 text-red-700' },
  { id: 'ROLE_PROVIDER_OWNER', name: 'Provider Owner', description: 'Mengelola bisnis dan booking', color: 'bg-blue-100 text-blue-700' },
  { id: 'ROLE_PROVIDER_STAFF', name: 'Provider Staff', description: 'Staf yang melayani booking', color: 'bg-green-100 text-green-700' },
  { id: 'ROLE_CUSTOMER', name: 'Customer', description: 'Pengguna yang melakukan booking', color: 'bg-purple-100 text-purple-700' },
];

export default function AdminRolesPage() {
  const qc = useQueryClient();

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users'),
  });

  const users = usersRes?.data?.data ?? [];

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const usersByRole = ROLES.map((r) => ({
    ...r,
    count: users.filter((u: any) => u.role === r.id).length,
  }));

  return (
    <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Role</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {usersByRole.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${role.color}`}>
                {role.name}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{role.count}</p>
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Semua Pengguna</h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name || '-'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLES.find((r) => r.id === user.role)?.color || 'bg-gray-100 text-gray-600'}`}>
                    {ROLES.find((r) => r.id === user.role)?.name || user.role}
                  </span>
                  <select
                    value={user.role}
                    onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value })}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:border-primary-500 focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
