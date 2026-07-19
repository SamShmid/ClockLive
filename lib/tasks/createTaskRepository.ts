import { SqliteTaskRepository } from './SqliteTaskRepository';
import { TaskRepository } from './TaskRepository';

/**
 * Native (iOS/Android) backend: SQLite.
 * The web build resolves createTaskRepository.web.ts instead.
 */
export function createTaskRepository(): TaskRepository {
  return new SqliteTaskRepository();
}
