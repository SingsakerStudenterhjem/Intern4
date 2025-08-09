import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import { RegiLogSchema, WorkTypeSchema } from '../../../backend/types/regi';
import { addRegiLog } from '../../../backend/src/regiDAO';
import { uploadRegiImages } from '../../../services/firebase/uploadRegiImages';
import { useAuth } from '../../../hooks/useAuth';

const FormSchema = z.object({
  title: z.string().min(1, 'Påkrevd'),
  description: z.string().min(1, 'Påkrevd'),
  date: z.string().min(1, 'Påkrevd'),
  hours: z.coerce.number().positive('Må være > 0'),
  type: WorkTypeSchema,
  images: z.any().optional(),
});

const WorkLogForm: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    hours: '',
    type: 'annet',
  });

  const setField = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

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
      const imageUrls = files.length ? await uploadRegiImages(user.uid, files) : [];

      const payload = RegiLogSchema.parse({
        userId: user.uid,
        title: form.title,
        description: form.description,
        date: Timestamp.fromDate(new Date(form.date)),
        hours: Number(form.hours),
        type: parsed.data.type,
        images: imageUrls,
        createdAt: Timestamp.now(),
        status: 'pending',
      });

      await addRegiLog({
        userId: payload.userId,
        title: payload.title,
        description: payload.description,
        date: payload.date,
        hours: payload.hours,
        type: payload.type,
        images: payload.images,
      });

      setForm({ title: '', description: '', date: '', hours: '', type: 'annet' });
      setFiles([]);
      onCreated && onCreated();
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md bg-gray-50">
      <h2 className="font-medium text-xl mb-2">Registrer regi</h2>
      <div className="mb-3">
        <label className="block mb-1">Tittel</label>
        <input
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Arbeidet oppsummert"
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Arbeidets art</label>
        <select
          value={form.type}
          onChange={(e) => setField('type', e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="vedlikehold">Vedlikehold</option>
          <option value="rengjoring">Rengjøring</option>
          <option value="arrangement">Arrangement</option>
          <option value="kafe">Kafé</option>
          <option value="dugnad">Dugnad</option>
          <option value="annet">Annet</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Beskrivelse</label>
        <textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={4}
          placeholder="Forklaring av arbeidet"
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1">Dato</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block mb-1">Timer</label>
          <input
            type="number"
            step="0.25"
            value={form.hours}
            onChange={(e) => setField('hours', e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="1.5"
          />
          {errors.hours && <p className="text-red-600 text-sm mt-1">{errors.hours}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Bilder (valgfritt)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {submitting ? 'Lagrer...' : 'Registrer'}
      </button>
    </form>
  );
};

export default WorkLogForm;
