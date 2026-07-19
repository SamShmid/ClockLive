import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createTaskRepository } from '../lib/tasks/createTaskRepository';
import { migrateLegacyTasks } from '../lib/tasks/legacyMigration';
import { TaskRepository } from '../lib/tasks/TaskRepository';
import { NewTaskInput, Task } from '../lib/tasks/types';

export interface ClockTime {
  hour: number;
  minute: number;
}

export interface AppContextValue {
  tasks: Task[];
  addTask: (input: NewTaskInput) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  clearTasks: () => Promise<void>;
  time: ClockTime;
}

const noopAsync = async () => {};

const AppContext = createContext<AppContextValue>({
  tasks: [],
  addTask: noopAsync,
  completeTask: noopAsync,
  clearTasks: noopAsync,
  time: { hour: 0, minute: 0 },
});

interface ContextProviderProps {
  children: ReactNode;
  /** Injectable for tests / future cloud backend; defaults to the platform backend. */
  repository?: TaskRepository;
}

const ContextProvider = ({ children, repository }: ContextProviderProps) => {
  const repo = useMemo(() => repository ?? createTaskRepository(), [repository]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const unsubscribe = repo.subscribe(setTasks);
    (async () => {
      await migrateLegacyTasks(repo).catch((err) =>
        console.warn('Legacy task migration failed:', err)
      );
      setTasks(await repo.getTasks());
    })().catch((err) => console.warn('Task load failed:', err));
    return unsubscribe;
  }, [repo]);

  const addTask = useCallback(
    async (input: NewTaskInput) => {
      await repo.addTask(input);
    },
    [repo]
  );
  const completeTask = useCallback(
    async (id: string) => {
      await repo.completeTask(id);
    },
    [repo]
  );
  const clearTasks = useCallback(async () => {
    await repo.clearTasks();
  }, [repo]);

  const [time, setTime] = useState<ClockTime>(() => {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime({ hour: now.getHours(), minute: now.getMinutes() });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(
    () => ({ tasks, addTask, completeTask, clearTasks, time }),
    [tasks, addTask, completeTask, clearTasks, time]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, ContextProvider };
