import { Task, NewTaskInput } from './types';

/**
 * The storage seam. Components never talk to a database or AsyncStorage
 * directly — they call these operations (via the context provider), and a
 * concrete backend (SQLite on native, AsyncStorage on web, in-memory in
 * tests, cloud later) is injected behind this interface.
 */
export interface TaskRepository {
  getTasks(): Promise<Task[]>;
  addTask(input: NewTaskInput): Promise<Task>;
  completeTask(id: string): Promise<void>;
  clearTasks(): Promise<void>;
  /** Notifies with the full task list after every mutation. */
  subscribe(listener: (tasks: Task[]) => void): () => void;
}

export abstract class SubscribableTaskRepository implements TaskRepository {
  private listeners = new Set<(tasks: Task[]) => void>();

  abstract getTasks(): Promise<Task[]>;
  abstract addTask(input: NewTaskInput): Promise<Task>;
  abstract completeTask(id: string): Promise<void>;
  abstract clearTasks(): Promise<void>;

  subscribe(listener: (tasks: Task[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  protected async emit(): Promise<void> {
    const tasks = await this.getTasks();
    this.listeners.forEach((listener) => listener(tasks));
  }
}
