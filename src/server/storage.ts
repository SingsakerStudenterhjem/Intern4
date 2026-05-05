import { supabase } from './supabaseClient';

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_IMAGES_BUCKET || 'Bilder';

const sanitizePathPart = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const getExtension = (file: File): string => {
  const extension = file.name.split('.').pop();
  return extension ? `.${sanitizePathPart(extension)}` : '';
};

export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${file.name} er ikke et bilde.`);
  }

  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error(`${file.name} er større enn 5 MB.`);
  }
}

export function createImagePath(userId: string, folder: string, file: File): string {
  const safeFolder = sanitizePathPart(folder) || 'images';
  const safeName = sanitizePathPart(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const uniquePart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${userId}/${safeFolder}/${uniquePart}-${safeName}${getExtension(file)}`;
}

export async function uploadImages(
  userId: string,
  folder: string,
  files: File[]
): Promise<string[]> {
  const paths: string[] = [];

  for (const file of files) {
    validateImageFile(file);
    const path = createImagePath(userId, folder, file);
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      try {
        await deleteImages(paths);
      } catch (cleanupError) {
        const cleanupMessage =
          cleanupError instanceof Error ? cleanupError.message : 'opprydding feilet';
        throw new Error(`${error.message}. ${cleanupMessage}`);
      }
      throw new Error(error.message);
    }

    paths.push(path);
  }

  return paths;
}

export async function deleteImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteImagesBestEffort(paths: string[]): Promise<void> {
  try {
    await deleteImages(paths);
  } catch (error) {
    console.error('Kunne ikke slette bilder fra storage', error);
  }
}

export async function createSignedImageUrls(
  paths: string[],
  expiresIn = 60 * 60
): Promise<string[]> {
  if (paths.length === 0) return [];

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrls(paths, expiresIn);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item) => item.signedUrl).filter(Boolean);
}

export async function createSignedImageUrl(
  path?: string | null,
  expiresIn = 60 * 60
): Promise<string | null> {
  if (!path) return null;

  const [url] = await createSignedImageUrls([path], expiresIn);
  return url ?? null;
}
