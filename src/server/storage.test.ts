import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IMAGE_BUCKET,
  IMAGE_MAX_BYTES,
  createImagePath,
  deleteImages,
  deleteImagesBestEffort,
  uploadImages,
  validateImageFile,
} from './storage';

const uploadMock = vi.fn();
const removeMock = vi.fn();
const createSignedUrlsMock = vi.fn();
const fromMock = vi.fn((bucket: string) => {
  void bucket;
  return {
    upload: uploadMock,
    remove: removeMock,
    createSignedUrls: createSignedUrlsMock,
  };
});

vi.mock('./supabaseClient', () => ({
  supabase: {
    storage: {
      from: (bucket: string) => fromMock(bucket),
    },
  },
}));

describe('storage image helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadMock.mockResolvedValue({ data: { path: 'path' }, error: null });
    removeMock.mockResolvedValue({ data: [], error: null });
    createSignedUrlsMock.mockResolvedValue({ data: [], error: null });
  });

  it('validates image mime type and size', () => {
    expect(() =>
      validateImageFile(new File(['x'], 'image.png', { type: 'image/png' }))
    ).not.toThrow();
    expect(() => validateImageFile(new File(['x'], 'text.txt', { type: 'text/plain' }))).toThrow(
      'text.txt er ikke et bilde.'
    );

    const largeFile = new File([new Uint8Array(IMAGE_MAX_BYTES + 1)], 'large.png', {
      type: 'image/png',
    });
    expect(() => validateImageFile(largeFile)).toThrow('large.png er større enn 5 MB.');
  });

  it('creates safe user-scoped paths', () => {
    const path = createImagePath('user-1', 'Regi bilder', new File(['x'], 'Min Fil!.PNG'));

    expect(path).toMatch(/^user-1\/regi-bilder\/.+-min-fil\.png$/);
  });

  it('uploads images to the configured bucket and cleans up earlier uploads on failure', async () => {
    uploadMock
      .mockResolvedValueOnce({ data: { path: 'one' }, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('upload failed') });

    await expect(
      uploadImages('user-1', 'regi', [
        new File(['one'], 'one.png', { type: 'image/png' }),
        new File(['two'], 'two.png', { type: 'image/png' }),
      ])
    ).rejects.toThrow('upload failed');

    expect(fromMock).toHaveBeenCalledWith(IMAGE_BUCKET);
    expect(uploadMock).toHaveBeenCalledTimes(2);
    expect(removeMock).toHaveBeenCalledTimes(1);
  });

  it('throws when deleting images fails', async () => {
    removeMock.mockResolvedValueOnce({ data: null, error: new Error('delete failed') });

    await expect(deleteImages(['user/regi/one.png'])).rejects.toThrow('delete failed');
  });

  it('keeps best-effort deletion non-blocking', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    removeMock.mockResolvedValueOnce({ data: null, error: new Error('delete failed') });

    await expect(deleteImagesBestEffort(['user/regi/one.png'])).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
