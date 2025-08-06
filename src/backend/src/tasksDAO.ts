import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { Task } from '../types/task';

export async function addTask(uid: string, data: Task): Promise<string | undefined> {
  try {
    const docRef = doc(db, 'tasks', uid);

    await setDoc(docRef, data);
    return uid;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getTask(uid: string): Promise<Task | undefined> {
  try {
    const taskDoc = await getDoc(doc(db, 'tasks', uid));
    if (taskDoc.exists()) {
      return taskDoc.data() as Task;
    } else {
      return;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    const tasksDoc = await getDocs(collection(db, 'tasks'));
    return tasksDoc.docs.map((doc) => doc.data() as Task);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateTask(uid: string, data: Partial<Task>): Promise<void> {
  try {
    const docRef = doc(db, 'tasks', uid);
    await setDoc(docRef, data, { merge: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
}
