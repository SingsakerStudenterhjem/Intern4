import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { z } from 'zod';
import { RegiLogSchema, WorkTypeSchema } from '../../../../shared/types/regi';
import { useAuth } from '../../../../app/providers/AuthContext';
import { useWorkLogFormWorkflow } from '../hooks/useWorkLogFormWorkflow';

const FormSchema = z.object({
  title: z.string().min(1, 'Påkrevd'),
  description: z.string().min(1, 'Påkrevd'),
  date: z.string().min(1, 'Påkrevd'),
  hours: z.coerce.number().positive('Må være > 0'),
  type: WorkTypeSchema,
  images: z.array(z.instanceof(File)).optional(),
});

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const WorkLogForm: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { categories, createWorkLog } = useWorkLogFormWorkflow();
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    type: '',
  });

  useEffect(() => {
    if (categories.length === 0) return;
    setForm((prev) => ({
      ...prev,
      type: prev.type || categories[0].name,
    }));
  }, [categories]);

  const setField = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const syncFiles = (nextFiles: File[]) => {
    setFiles(nextFiles);

    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
  };

  const addFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const existingFileKeys = new Set(files.map(getFileKey));
    const nextFiles = [...files];

    selectedFiles.forEach((file) => {
      if (!existingFileKeys.has(getFileKey(file))) {
        nextFiles.push(file);
      }
    });

    syncFiles(nextFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = FormSchema.safeParse({ ...form, hours: form.hours, images: files });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (map[i.path[0] as string] = i.message));
      setErrors(map);
      return;
    }

    if (!user) return;

    try {
      setSubmitting(true);
      const payload = RegiLogSchema.parse({
        userId: user.id,
        title: form.title,
        description: form.description,
        date: new Date(form.date),
        hours: Number(form.hours),
        type: parsed.data.type,
        createdAt: new Date(),
        status: 'pending',
      });

      await createWorkLog(
        {
          userId: payload.userId,
          title: payload.title,
          description: payload.description,
          date: payload.date,
          hours: payload.hours,
          type: payload.type,
        },
        files
      );

      setForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        type: categories[0]?.name ?? '',
      });
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onCreated) {
        onCreated();
      }
    } catch (submitError) {
      setErrors({
        form:
          submitError instanceof Error ? submitError.message : 'Kunne ikke registrere regiarbeid.',
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="font-semibold text-xl text-gray-900">Registrer regi</h2>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Tittel</label>
        <input
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Arbeidet oppsummert"
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-gray-700">Arbeidets art</label>
        <select
          value={form.type}
          onChange={(e) => setField('type', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Velg type</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium text-gray-700">Beskrivelse</label>
        <textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Forklaring av arbeidet"
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Dato</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Timer</label>
          <input
            type="number"
            step="0.25"
            value={form.hours}
            onChange={(e) => setField('hours', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1.5"
          />
          {errors.hours && <p className="text-red-600 text-sm mt-1">{errors.hours}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Bilder (valgfritt)</label>
        <input
          ref={fileInputRef}
          id="work-log-images"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => addFiles(Array.from(e.target.files || []))}
          className="sr-only"
        />
        <label
          htmlFor="work-log-images"
          className="inline-flex cursor-pointer items-center rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        >
          Velg bilder
        </label>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}`}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              >
                <span className="truncate pr-3">{file.name}</span>
                <button
                  type="button"
                  onClick={() => syncFiles(files.filter((_, fileIndex) => fileIndex !== index))}
                  className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  aria-label={`Fjern ${file.name}`}
                  title="Fjern bilde"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {submitting ? 'Lagrer...' : 'Registrer'}
      </button>
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
    </form>
  );
};

export default WorkLogForm;
