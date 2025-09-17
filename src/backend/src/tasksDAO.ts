import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { Task, TaskCreationData } from '../types/regi/tasks/task.types';

export async function addTask(data: TaskCreationData): Promise<string> {
  try {
    const docRef = doc(collection(db, 'regiTasks'));
    const taskData = {
      ...data,
      id: docRef.id,
      createdAt: Timestamp.now(),
      deadline: data.deadline ? Timestamp.fromDate(data.deadline) : undefined,
    };

    await setDoc(docRef, taskData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Could not add task: ${error.message}`);
  }
}

export async function getTask(taskId: string): Promise<Task | undefined> {
  try {
    const taskDoc = await getDoc(doc(db, 'regiTasks', taskId));
    if (taskDoc.exists()) {
      return { id: taskDoc.id, ...taskDoc.data() } as Task;
    }
    return undefined;
  } catch (error: any) {
    throw new Error(`Could not get task: ${error.message}`);
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    // Attempt optimized query with composite index
    try {
      const tasksQuery = query(
        collection(db, 'regiTasks'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      const tasksDoc = await getDocs(tasksQuery);
      return tasksDoc.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
    } catch (indexError) {
      // Fallback: Query without orderBy if composite index is not available
      try {
        const tasksQuery = query(collection(db, 'regiTasks'), where('isActive', '==', true));
        const tasksDoc = await getDocs(tasksQuery);

        // Manual sort by createdAt (newest first)
        const tasks = tasksDoc.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
        return tasks.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
      } catch (fallbackError) {
        // Final fallback: Get all tasks and filter manually
        const allDocs = await getDocs(collection(db, 'regiTasks'));
        const allTasks = allDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);

        return allTasks
          .filter((task) => task.isActive !== false)
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });
      }
    }
  } catch (error: any) {
    throw new Error(`Could not get tasks: ${error.message}`);
  }
}

export async function updateTask(
  taskId: string,
  data: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'regiTasks', taskId);
    const updateData = { ...data };

    // Convert Date objects to Firestore Timestamps
    if (data.deadline && data.deadline instanceof Date) {
      updateData.deadline = Timestamp.fromDate(data.deadline);
    }

    if (data.completedAt && data.completedAt instanceof Date) {
      updateData.completedAt = Timestamp.fromDate(data.completedAt);
    }

    await updateDoc(docRef, updateData);
  } catch (error: any) {
    throw new Error(`Could not update task: ${error.message}`);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    // Soft delete by setting isActive to false
    await updateTask(taskId, { isActive: false });
  } catch (error: any) {
    throw new Error(`Could not delete task: ${error.message}`);
  }
}

export async function hardDeleteTask(taskId: string): Promise<void> {
  try {
    const docRef = doc(db, 'regiTasks', taskId);
    await deleteDoc(docRef);
  } catch (error: any) {
    throw new Error(`Could not permanently delete task: ${error.message}`);
  }
}

export async function joinTask(taskId: string, userId: string): Promise<boolean> {
  try {
    const task = await getTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Validation checks
    if (task.participants.includes(userId)) {
      throw new Error('User already joined this task');
    }

    if (task.maxParticipants && task.participants.length >= task.maxParticipants) {
      throw new Error('Task is full');
    }

    const docRef = doc(db, 'regiTasks', taskId);
    await updateDoc(docRef, {
      participants: arrayUnion(userId),
    });

    return true;
  } catch (error: any) {
    throw new Error(`Could not join task: ${error.message}`);
  }
}

export async function leaveTask(taskId: string, userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'regiTasks', taskId);
    await updateDoc(docRef, {
      participants: arrayRemove(userId),
    });

    return true;
  } catch (error: any) {
    throw new Error(`Could not leave task: ${error.message}`);
  }
}

export async function getTasksByUser(userId: string): Promise<Task[]> {
  try {
    // Attempt query with composite index
    try {
      const tasksQuery = query(
        collection(db, 'regiTasks'),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true)
      );
      const tasksDoc = await getDocs(tasksQuery);
      return tasksDoc.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
    } catch (indexError) {
      // Fallback: Get all active tasks and filter manually
      const allActiveTasks = await getTasks();
      return allActiveTasks.filter((task) => task.participants.includes(userId));
    }
  } catch (error: any) {
    throw new Error(`Could not get user tasks: ${error.message}`);
  }
}
