import { ApiTaskRepository } from './ApiTaskRepository';
import { AsyncStorageTaskRepository } from './AsyncStorageTaskRepository';
import { TaskRepository } from './TaskRepository';

/**
 * Web backend: server-side SQLite via the /api/tasks endpoints
 * (server/index.mjs on the same origin that hosts the site). Degrades to
 * browser-local AsyncStorage when the API is unreachable (e.g. plain
 * `expo start --web` dev), so local-only use keeps working.
 */
export function createTaskRepository(): TaskRepository {
  return new ApiTaskRepository(new AsyncStorageTaskRepository());
}
