import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebaseConfig';

export async function uploadRegiImages(userId: string, files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    const path = `regi/${userId}/${Date.now()}_${file.name}`;
    const r = ref(storage, path);
    await uploadBytes(r, file);
    urls.push(await getDownloadURL(r));
  }
  return urls;
}
