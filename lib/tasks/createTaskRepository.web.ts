import { AsyncStorageTaskRepository } from './AsyncStorageTaskRepository';
import { TaskRepository } from './TaskRepository';

/**
 * Web backend: AsyncStorage (localStorage). Keeps the web target working
 * without expo-sqlite's wasm setup; swapping to sqlite-on-web later is a
 * one-line change here thanks to the repository seam.
 */
export function createTaskRepository(): TaskRepository {
  return new AsyncStorageTaskRepository();
}
