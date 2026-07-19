import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscribableTaskRepository } from './TaskRepository';
import { NewTaskInput, Task, newTaskId } from './types';

const STORAGE_KEY = '@clocklive/tasks';

/**
 * JSON-blob backend over AsyncStorage (localStorage on web). Used as the
 * web backend; also a reference implementation for tests. No expiry —
 * tasks persist until explicitly cleared.
 */
export class AsyncStorageTaskRepository extends SubscribableTaskRepository {
  async getTasks(): Promise<Task[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Task[]) : [];
    } catch {
      return [];
    }
  }

  private async setTasks(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    await this.emit();
  }

  async addTask(input: NewTaskInput): Promise<Task> {
    const task: Task = { ...input, id: newTaskId(), isCompleted: false };
    const tasks = await this.getTasks();
    await this.setTasks([...tasks, task]);
    return task;
  }

  async completeTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    await this.setTasks(
      tasks.map((t) => (t.id === id ? { ...t, isCompleted: true } : t))
    );
  }

  async clearTasks(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await this.emit();
  }
}
