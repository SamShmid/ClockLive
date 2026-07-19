import * as SQLite from 'expo-sqlite';
import { SubscribableTaskRepository } from './TaskRepository';
import { NewTaskInput, Task, newTaskId } from './types';

interface TaskRow {
  id: string;
  name: string;
  description: string;
  start_minutes: number;
  end_minutes: number;
  date: string | null;
  color: string;
  is_completed: number;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startMinutes: row.start_minutes,
    endMinutes: row.end_minutes,
    date: row.date ?? undefined,
    color: row.color,
    isCompleted: row.is_completed !== 0,
  };
}

export class SqliteTaskRepository extends SubscribableTaskRepository {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  constructor(private readonly databaseName: string = 'clocklive.db') {
    super();
  }

  private db(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = (async () => {
        const db = await SQLite.openDatabaseAsync(this.databaseName);
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            start_minutes INTEGER NOT NULL,
            end_minutes INTEGER NOT NULL,
            date TEXT,
            color TEXT NOT NULL,
            is_completed INTEGER NOT NULL DEFAULT 0
          );
        `);
        return db;
      })();
    }
    return this.dbPromise;
  }

  async getTasks(): Promise<Task[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<TaskRow>(
      'SELECT * FROM tasks ORDER BY start_minutes, id'
    );
    return rows.map(rowToTask);
  }

  async addTask(input: NewTaskInput): Promise<Task> {
    const db = await this.db();
    const task: Task = { ...input, id: newTaskId(), isCompleted: false };
    await db.runAsync(
      `INSERT INTO tasks (id, name, description, start_minutes, end_minutes, date, color, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      task.id,
      task.name,
      task.description,
      task.startMinutes,
      task.endMinutes,
      task.date ?? null,
      task.color
    );
    await this.emit();
    return task;
  }

  async completeTask(id: string): Promise<void> {
    const db = await this.db();
    await db.runAsync('UPDATE tasks SET is_completed = 1 WHERE id = ?', id);
    await this.emit();
  }

  async clearTasks(): Promise<void> {
    const db = await this.db();
    await db.runAsync('DELETE FROM tasks');
    await this.emit();
  }
}
