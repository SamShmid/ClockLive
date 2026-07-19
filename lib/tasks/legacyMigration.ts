import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseTimeString } from '../time';
import { TaskRepository } from './TaskRepository';
import { NewTaskInput } from './types';

const MIGRATION_FLAG = '@clocklive/legacy-migrated';

interface LegacyTask {
  task?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
  isCompleted?: boolean;
}

function toNewTask(legacy: LegacyTask): NewTaskInput | null {
  const startMinutes = parseTimeString(legacy.startTime ?? '');
  const endMinutes = parseTimeString(legacy.endTime ?? '');
  if (startMinutes === null || endMinutes === null) return null;
  return {
    name: legacy.task ?? '',
    description: legacy.description ?? '',
    startMinutes,
    endMinutes,
    color: legacy.color ?? '#6874e7',
  };
}

function extractLegacyTasks(raw: string): LegacyTask[] {
  try {
    const parsed = JSON.parse(raw);
    // react-native-storage wrapped payloads in { rawData, expires, ... }
    const data = parsed?.rawData ?? parsed;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item) => item && typeof item === 'object' && 'startTime' in item
    );
  } catch {
    return [];
  }
}

/**
 * Best-effort one-time import of tasks saved by the old
 * react-native-storage layer. In practice the old layer expired every
 * task 60 seconds after saving (bug #1), so surviving data is unlikely —
 * but if any exists, carry it over rather than silently dropping it.
 */
export async function migrateLegacyTasks(repo: TaskRepository): Promise<void> {
  if (await AsyncStorage.getItem(MIGRATION_FLAG)) return;

  const keys = await AsyncStorage.getAllKeys();
  const legacyKeys = keys.filter(
    (k) => k.includes('tasks') && !k.startsWith('@clocklive/')
  );

  for (const key of legacyKeys) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;
    for (const legacy of extractLegacyTasks(raw)) {
      const input = toNewTask(legacy);
      if (input && !legacy.isCompleted) {
        await repo.addTask(input);
      }
    }
    await AsyncStorage.removeItem(key);
  }

  await AsyncStorage.setItem(MIGRATION_FLAG, '1');
}
