import React from 'react';
import {
  ColumnMapping,
  IMPORTABLE_FIELDS,
  IMPORTABLE_FIELD_LABELS,
  REQUIRED_IMPORTABLE_FIELDS,
} from '../../../shared/types/csvImport';

const UNUSED = '__unused__';

const CsvColumnMapper: React.FC<{
  headers: string[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
}> = ({ headers, mapping, onChange }) => {
  const setFieldMapping = (field: (typeof IMPORTABLE_FIELDS)[number], header: string) => {
    const next = { ...mapping };
    if (header === UNUSED) {
      delete next[field];
    } else {
      next[field] = header;
    }
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {IMPORTABLE_FIELDS.map((field) => {
        const required = REQUIRED_IMPORTABLE_FIELDS.includes(field);
        return (
          <div key={field}>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {IMPORTABLE_FIELD_LABELS[field]}
              {required && <span className="text-red-600"> *</span>}
            </label>
            <select
              value={mapping[field] ?? UNUSED}
              onChange={(e) => setFieldMapping(field, e.target.value)}
              className="w-full rounded-sm border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            >
              <option value={UNUSED}>— ikke i bruk —</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};

export default CsvColumnMapper;
