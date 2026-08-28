import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { FeatureFlag } from '../lib/types';

export default function ConfigPage() {
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'flags'], queryFn: () => adminApi.config.getFlags() });
  const flags = res?.data ?? [];
  const toggleMut = useMutation({ mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => adminApi.config.toggleFlag(id, enabled), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'flags'] }) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Configuration</h1><p className="mt-1 text-sm font-medium text-gray-500">Feature flags dan pengaturan platform</p></div>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold text-white"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>{flags.filter(f=>f.enabled).length} aktif</span>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white ring-1 ring-gray-100" />)}</div>
        : flags.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-violet"><svg className="h-7 w-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg></div><p className="mt-4 font-medium text-gray-600">Belum ada feature flags</p><p className="text-sm text-gray-400">Flags akan muncul di sini</p></div>
        : <div className="space-y-3">
          {flags.map((flag: FeatureFlag) => (
            <div key={flag.id} className="group flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-primary-100 transition-all">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${flag.enabled ? 'bg-gradient-to-br from-primary-500 to-violet-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={flag.enabled ? 'M13 10V3L4 14h7v7l9-11h-7z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728'} /></svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{flag.name}</h3>
                    <code className="rounded-full bg-soft-violet px-2.5 py-0.5 text-xs font-bold text-primary-700 ring-1 ring-primary-100">{flag.key}</code>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${flag.enabled ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-50 text-gray-500 ring-gray-200'}`}>{flag.enabled ? 'ON' : 'OFF'}</span>
                    <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-bold text-white">{flag.environment}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{flag.description}</p>
                </div>
              </div>
              <button onClick={() => toggleMut.mutate({ id: flag.id, enabled: !flag.enabled })} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${flag.enabled ? 'bg-gradient-to-r from-primary-500 to-violet-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
        }
      </div>
    </AdminLayout>
  );
}
