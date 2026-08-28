interface Column<T> { key: string; label: string; render?: (item: T) => React.ReactNode; className?: string; }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; pagination?: { page: number; totalPages: number; total: number }; onPageChange?: (page: number) => void; isLoading?: boolean; emptyMessage?: string; }

export default function DataTable<T extends { id: string }>({ columns, data, pagination, onPageChange, isLoading, emptyMessage = 'Tidak ada data' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {data.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-violet">
            <svg className="h-7 w-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">{emptyMessage}</p>
          <p className="mt-1 text-xs text-gray-400">Data akan muncul di sini</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-soft-violet/70 via-white to-soft-pink/40">
              <tr>{columns.map((col) => <th key={col.key} className={`px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600 ${col.className || ''}`}>{col.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item) => (
                <tr key={item.id} className="group hover:bg-gradient-to-r hover:from-soft-violet/30 hover:to-soft-pink/20 transition-colors">
                  {columns.map((col) => <td key={col.key} className={`px-6 py-4 text-sm ${col.className || ''}`}>{col.render ? col.render(item) : (item as any)[col.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 bg-gradient-to-r from-white to-soft-violet/20 px-6 py-3">
          <p className="text-sm text-gray-500">Halaman <span className="font-semibold text-gray-900">{pagination.page}</span> dari {pagination.totalPages} <span className="text-gray-400">({pagination.total} total)</span></p>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => onPageChange?.(p)} className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all ${p === pagination.page ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-200' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-soft-violet hover:text-primary-700'}`}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
