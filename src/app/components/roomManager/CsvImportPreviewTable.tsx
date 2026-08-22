import React from 'react';
import { NewUserInput } from '../../../shared/types/user';

export type PreviewRow = {
  row: number;
  data: NewUserInput;
  errors: string[];
};

const CsvImportPreviewTable: React.FC<{ rows: PreviewRow[] }> = ({ rows }) => {
  const validCount = rows.filter((r) => r.errors.length === 0).length;

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-700">
        <span className="font-semibold">{validCount}</span> av{' '}
        <span className="font-semibold">{rows.length}</span> rader er gyldige og vil bli importert.
        Rader med feil hoppes over.
      </p>
      <div className="max-h-[400px] overflow-auto border border-gray-200 rounded-sm bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Rad
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Navn
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                E-post
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Rolle
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Rom
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.row} className={r.errors.length > 0 ? 'bg-red-50' : undefined}>
                <td className="px-4 py-2 text-gray-500">{r.row + 1}</td>
                <td className="px-4 py-2">{r.data.name || '-'}</td>
                <td className="px-4 py-2">{r.data.email || '-'}</td>
                <td className="px-4 py-2">{r.data.role || '-'}</td>
                <td className="px-4 py-2">{r.data.roomNumber ?? '-'}</td>
                <td className="px-4 py-2">
                  {r.errors.length === 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                      OK
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold"
                      title={r.errors.join(', ')}
                    >
                      {r.errors[0]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={6}>
                  Ingen rader funnet i filen.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CsvImportPreviewTable;
