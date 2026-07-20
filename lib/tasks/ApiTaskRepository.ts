import { SubscribableTaskRepository, TaskRepository } from './TaskRepository';
import { NewTaskInput, Task } from './types';

/**
 * Server-backed repository: talks to the ClockLive web server's /api/tasks
 * endpoints (SQLite on the server — see server/index.mjs). If the API is
 * unreachable (e.g. `expo start --web` dev without the server), it degrades
 * permanently to the provided local fallback so the app keeps working.
 */
export class ApiTaskRepository extends SubscribableTaskRepository {
  private degraded = false;

  constructor(
    private readonly fallback: TaskRepository | null = null,
    private readonly baseUrl: string = '/api'
  ) {
    super();
  }

  private degrade(err: unknown): TaskRepository {
    if (!this.fallback) throw err;
    if (!this.degraded) {
      this.degraded = true;
      console.warn(
        'ClockLive API unreachable — falling back to browser-local storage:',
        err
      );
    }
    return this.fallback;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, init);
    if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
    return (await res.json()) as T;
  }

  async getTasks(): Promise<Task[]> {
    if (this.degraded) return this.fallback!.getTasks();
    try {
      return await this.request<Task[]>('/tasks');
    } catch (err) {
      return this.degrade(err).getTasks();
    }
  }

  async addTask(input: NewTaskInput): Promise<Task> {
    let task: Task;
    if (this.degraded) {
      task = await this.fallback!.addTask(input);
    } else {
      try {
        task = await this.request<Task>('/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
      } catch (err) {
        task = await this.degrade(err).addTask(input);
      }
    }
    await this.emit();
    return task;
  }

  async completeTask(id: string): Promise<void> {
    if (this.degraded) {
      await this.fallback!.completeTask(id);
    } else {
      try {
        await this.request(`/tasks/${encodeURIComponent(id)}/complete`, {
          method: 'POST',
        });
      } catch (err) {
        await this.degrade(err).completeTask(id);
      }
    }
    await this.emit();
  }

  async clearTasks(): Promise<void> {
    if (this.degraded) {
      await this.fallback!.clearTasks();
    } else {
      try {
        await this.request('/tasks', { method: 'DELETE' });
      } catch (err) {
        await this.degrade(err).clearTasks();
      }
    }
    await this.emit();
  }
}
