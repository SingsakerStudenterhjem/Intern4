import { addDoc, collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { RegiLog, RegiLogWithId } from '../types/regi';

const COL = 'regiLogs';

export async function addRegiLog(data: Omit<RegiLog, 'id' | 'createdAt' | 'status'>) {
  const payload: RegiLog = { ...data, status: 'pending', createdAt: Timestamp.now() };
  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
}

export async function getRegiLogsByUser(userId: string): Promise<RegiLogWithId[]> {
  const q = query(collection(db, COL), where('userId', '==', userId), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RegiLog) }));
}
