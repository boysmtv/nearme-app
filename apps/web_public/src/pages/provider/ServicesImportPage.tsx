import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface ImportRow {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function ServicesImportPage() {
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (data: ImportRow[]) =>
      api.post('/provider/services/bulk', { services: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      setImportData([]);
      setShowPreview(false);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const headers = lines[0]?.split(',').map((h) => h.trim().toLowerCase()) ?? [];

      const nameIdx = headers.indexOf('name');
      const descIdx = headers.indexOf('description');
      const durationIdx = headers.indexOf('duration');
      const priceIdx = headers.indexOf('price');
      const categoryIdx = headers.indexOf('category');

      const rows: ImportRow[] = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.trim());
        return {
          name: cols[nameIdx] || '',
          description: cols[descIdx] || '',
          duration: parseInt(cols[durationIdx] || '60', 10),
          price: parseInt(cols[priceIdx] || '0', 10),
          category: cols[categoryIdx] || '',
          status: 'pending' as const,
        };
      }).filter((r) => r.name);

      setImportData(rows);
      setShowPreview(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = () => {
    importMutation.mutate(importData);
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Import Layanan (CSV)</h1>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Format CSV</h2>
        <p className="text-sm text-gray-600 mb-4">
          File CSV harus memiliki header: <code className="bg-gray-100 px-1 rounded">name,description,duration,price,category</code>
        </p>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto">
{`name,description,duration,price,category
Potong Rambut,Potong rambut pria,60,50000,Rambut
Coloring,Pewarnaan rambut,120,300000,Rambut
 facial,Perawatan wajah,90,150000,Kecantikan`}
        </pre>

        <div className="mt-6 flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Pilih File CSV
          </button>
          {importData.length > 0 && (
            <span className="text-sm text-gray-500">{importData.length} layanan ditemukan</span>
          )}
        </div>
      </div>

      {showPreview && importData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Preview ({importData.length} layanan)</h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPreview(false); setImportData([]); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {importMutation.isPending ? 'Mengimport...' : 'Import Semua'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Nama</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Deskripsi</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Durasi</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Harga</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Kategori</th>
                </tr>
              </thead>
              <tbody>
                {importData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{row.name}</td>
                    <td className="py-2 px-3 text-gray-600 max-w-[200px] truncate">{row.description}</td>
                    <td className="py-2 px-3 text-right text-gray-600">{row.duration}m</td>
                    <td className="py-2 px-3 text-right text-gray-900 font-medium">Rp {row.price.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-gray-600">{row.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importMutation.isSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              ✓ Berhasil mengimport {importData.length} layanan
            </div>
          )}
          {importMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              ✗ Gagal mengimport layanan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
