interface Column<T> { key: string; label: string; render?: (item: T) => React.ReactNode; className?: string; }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; pagination?: { page: number; totalPages: number; total: number }; onPageChange?: (page: number) => void; isLoading?: boolean; emptyMessage?: string; }

export default function DataTable<T extends { id: string }>({ columns, data, pagination, onPageChange, isLoading, emptyMessage = 'Tidak ada data' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="p-8 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{columns.map((col) => <th key={col.key} className={`px-6 py-3.5 text-left text-[13px] font-medium uppercase tracking-wider text-gray-500 ${col.className || ''}`}>{col.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((col) => <td key={col.key} className={`px-6 py-4 text-sm ${col.className || ''}`}>{col.render ? col.render(item) : (item as any)[col.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <p className="text-sm text-gray-500">Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => onPageChange?.(p)} className={`h-8 w-8 rounded text-sm font-medium ${p === pagination.page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
