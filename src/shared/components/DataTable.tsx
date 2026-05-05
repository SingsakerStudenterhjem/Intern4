import type { ReactNode } from 'react';

type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
};

export const DataTable = <T,>({
  columns,
  rows,
  getRowKey,
  emptyMessage = 'Ingen data.',
}: DataTableProps<T>) => (
  <div className="overflow-auto rounded-md border border-gray-200 bg-white">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th key={column.key} className="px-4 py-2 text-left font-medium text-gray-700">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.length > 0 ? (
          rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-2 text-gray-800">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="px-4 py-3 text-gray-600">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
