export interface Task {
  id: string;
  name: string;
  description: string;
  /** Minutes since midnight, 0–1439 */
  startMinutes: number;
  endMinutes: number;
  /** ISO date (YYYY-MM-DD); absent = repeats daily (current app behavior) */
  date?: string;
  color: string;
  isCompleted: boolean;
}

export type NewTaskInput = Omit<Task, 'id' | 'isCompleted'>;

export function newTaskId(): string {
  return (
    Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
  );
}
