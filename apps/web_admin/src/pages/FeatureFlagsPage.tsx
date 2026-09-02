import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { FeatureFlag } from '../lib/types';

export default function FeatureFlagsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newFlag, setNewFlag] = useState({ name: '', key: '', description: '', enabled: false, environment: 'development' });

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: () => adminApi.config.getFlags(),
  });
  const flags = res?.data ?? [];

  const toggleMut = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => adminApi.config.toggleFlag(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }),
  });

  const createMut = useMutation({
    mutationFn: (data: typeof newFlag) => adminApi.config.createFlag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      setShowCreate(false);
      setNewFlag({ name: '', key: '', description: '', enabled: false, environment: 'development' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.config.deleteFlag(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola fitur dan maintenance mode platform</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm">
            Create Flag
          </button>
        </div>

        {showCreate && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">New Feature Flag</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Name" value={newFlag.name}
                onChange={e => setNewFlag({ ...newFlag, name: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              <input placeholder="Key (e.g. maintenance_mode)" value={newFlag.key}
                onChange={e => setNewFlag({ ...newFlag, key: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              <input placeholder="Description" value={newFlag.description}
                onChange={e => setNewFlag({ ...newFlag, description: e.target.value })}
                className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => createMut.mutate(newFlag)}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                Save
              </button>
              <button onClick={() => setShowCreate(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : flags.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-500">Belum ada feature flags</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag: FeatureFlag) => (
              <div key={flag.id} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{flag.name}</h3>
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{flag.key}</code>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{flag.environment}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{flag.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleMut.mutate({ id: flag.id, enabled: !flag.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this feature flag?')) deleteMut.mutate(flag.id); }}
                    className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
