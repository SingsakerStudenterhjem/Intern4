import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  ColumnMapping,
  FIELD_HEADER_ALIASES,
  IMPORTABLE_FIELDS,
  ImportableField,
  ImportRowResult,
  REQUIRED_IMPORTABLE_FIELDS,
} from '../../../shared/types/csvImport';
import { NewUserInput, NewUserInputSchema } from '../../../shared/types/user';
import { createUsersBulk, getRoles, Role } from '../../../server/dao/userDAO';
import { ROUTES } from '../../constants/routes';
import CsvColumnMapper from '../../components/roomManager/CsvColumnMapper';
import CsvImportPreviewTable, {
  PreviewRow,
} from '../../components/roomManager/CsvImportPreviewTable';

type Step = 'upload' | 'map' | 'preview' | 'import';

const normalizeHeader = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '');

const guessMapping = (headers: string[]): ColumnMapping => {
  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const mapping: ColumnMapping = {};

  IMPORTABLE_FIELDS.forEach((field) => {
    const aliases = FIELD_HEADER_ALIASES[field].map(normalizeHeader);
    const match = normalizedHeaders.find((h) => aliases.includes(h.norm));
    if (match) mapping[field] = match.raw;
  });

  return mapping;
};

const buildUserInput = (row: Record<string, string>, mapping: ColumnMapping): NewUserInput => {
  const get = (field: ImportableField): string | undefined => {
    const header = mapping[field];
    if (!header) return undefined;
    const value = row[header];
    return value !== undefined && value !== '' ? value : undefined;
  };

  return {
    name: get('name') ?? '',
    email: get('email') ?? '',
    phone: get('phone'),
    birthDate: get('birthDate') ? new Date(get('birthDate') as string) : undefined,
    address: {
      street: get('street'),
      postalCode: get('postalCode'),
      city: get('city'),
      country: get('country'),
    },
    study: get('study'),
    studyPlace: get('studyPlace'),
    seniority: get('seniority') ? parseInt(get('seniority') as string, 10) : 0,
    roomNumber: get('roomNumber') ? parseInt(get('roomNumber') as string, 10) : 0,
    role: get('role') ?? 'Halv/Halv',
    onLeave: /^(ja|yes|true|1)$/i.test(get('onLeave') ?? ''),
    isActive: get('isActive') ? /^(ja|yes|true|1)$/i.test(get('isActive') as string) : true,
    regiPreapproved: false,
  };
};

const ImportUsersPage: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportRowResult[]>([]);

  const handleFile = (file: File) => {
    setParseError(null);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const headers = parsed.meta.fields ?? [];
        if (headers.length === 0) {
          setParseError('Fant ingen kolonner i filen.');
          return;
        }
        setCsvHeaders(headers);
        setCsvRows(parsed.data);
        setMapping(guessMapping(headers));
        setStep('map');
      },
      error: (err) => {
        setParseError(err.message ?? 'Kunne ikke lese CSV-filen.');
      },
    });
  };

  const previewRows: PreviewRow[] = useMemo(() => {
    const roleNames = new Set(roles.map((r) => r.name));

    return csvRows.map((row, index) => {
      const data = buildUserInput(row, mapping);
      const errors: string[] = [];

      const parsed = NewUserInputSchema.safeParse(data);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          errors.push(`${issue.path.join('.')}: ${issue.message}`);
        });
      }

      if (roleNames.size > 0 && !roleNames.has(data.role)) {
        errors.push(`Ukjent rolle: "${data.role}"`);
      }

      return { row: index, data, errors };
    });
  }, [csvRows, mapping, roles]);

  const goToPreview = async () => {
    const missingRequired = REQUIRED_IMPORTABLE_FIELDS.filter((f) => !mapping[f]);
    if (missingRequired.length > 0) {
      setParseError(`Følgende felter må mappes: ${missingRequired.map((f) => f).join(', ')}`);
      return;
    }
    setParseError(null);
    try {
      const roleList = await getRoles();
      setRoles(roleList);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
    setStep('preview');
  };

  const validRows = previewRows.filter((r) => r.errors.length === 0);

  const runImport = async () => {
    setImporting(true);
    setStep('import');
    setResults([]);
    try {
      await createUsersBulk(
        validRows.map((r) => r.data),
        (result) => setResults((prev) => [...prev, result])
      );
    } finally {
      setImporting(false);
    }
  };

  const successResults = results.filter((r) => r.status === 'success');
  const errorResults = results.filter((r) => r.status === 'error');

  const exportPasswordList = () => {
    const lines = successResults.map((r) => `${r.email}\t${r.initialPassword ?? ''}`);
    const text = ['E-post\tMidlertidig passord', ...lines].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nye-brukere-passord.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Importer brukere fra CSV</h1>
              <p className="text-gray-600 mt-1">
                Last opp en CSV-fil, koble kolonnene til feltene, og opprett flere brukere samlet.
              </p>
            </div>
            <Link
              to={ROUTES.LEGG_TIL_BEBOER}
              className="inline-flex items-center text-sm font-medium text-navy-600 hover:text-navy-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tilbake
            </Link>
          </div>
        </header>

        {parseError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-sm text-red-700">{parseError}</p>
          </div>
        )}

        {step === 'upload' && (
          <div className="bg-white rounded-sm shadow p-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Velg CSV-fil</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-navy-600 file:text-white hover:file:bg-navy-700"
            />
          </div>
        )}

        {step === 'map' && (
          <div className="bg-white rounded-sm shadow p-6 space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Koble kolonner</h2>
              <p className="text-sm text-gray-600">
                Fil: <span className="font-medium">{fileName}</span> ({csvRows.length} rader). Vi
                har forsøkt å gjette kolonnene automatisk — juster ved behov.
              </p>
            </div>
            <CsvColumnMapper headers={csvHeaders} mapping={mapping} onChange={setMapping} />
            <div className="flex justify-between">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
              >
                Tilbake
              </button>
              <button
                onClick={goToPreview}
                className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-sm hover:bg-navy-700"
              >
                Forhåndsvis
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="bg-white rounded-sm shadow p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Forhåndsvisning</h2>
            <CsvImportPreviewTable rows={previewRows} />
            <div className="flex justify-between">
              <button
                onClick={() => setStep('map')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
              >
                Tilbake
              </button>
              <button
                onClick={runImport}
                disabled={validRows.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-sm hover:bg-navy-700 disabled:opacity-50"
              >
                Importer {validRows.length} brukere
              </button>
            </div>
          </div>
        )}

        {step === 'import' && (
          <div className="bg-white rounded-sm shadow p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              {importing ? 'Importerer...' : 'Import fullført'}
            </h2>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-green-700">{successResults.length}</span>{' '}
              opprettet
              {' · '}
              <span className="font-semibold text-red-700">{errorResults.length}</span> feilet
              {' · '}
              {results.length} av {validRows.length} behandlet
            </p>

            {!importing && successResults.length > 0 && (
              <button
                onClick={exportPasswordList}
                className="px-4 py-2 text-sm font-medium text-white bg-navy-600 rounded-sm hover:bg-navy-700"
              >
                Last ned e-post/passord-liste
              </button>
            )}

            <div className="max-h-[360px] overflow-auto border border-gray-200 rounded-sm">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-gray-200">
                  {results.map((r) => (
                    <tr key={r.row} className={r.status === 'error' ? 'bg-red-50' : undefined}>
                      <td className="px-4 py-2">{r.email}</td>
                      <td className="px-4 py-2">
                        {r.status === 'success' ? (
                          <span className="text-green-700">
                            Opprettet{r.initialPassword ? ` — passord: ${r.initialPassword}` : ''}
                          </span>
                        ) : (
                          <span className="text-red-700">{r.message}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!importing && (
              <Link
                to={ROUTES.LEGG_TIL_BEBOER}
                className="inline-flex items-center text-sm font-medium text-navy-600 hover:text-navy-700"
              >
                Gå til brukerliste
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportUsersPage;
