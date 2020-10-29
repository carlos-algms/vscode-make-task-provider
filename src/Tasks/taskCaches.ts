import { MakefileTask } from './MakefileTask';

let cachedTasks: MakefileTask[] | null = null;

export function invalidateTaskCaches(): void {
  cachedTasks = null;
}

export function getCachedTasks(): MakefileTask[] | null {
  return cachedTasks;
}

export function setCachedTasks(tasks: MakefileTask[]): void {
  cachedTasks = tasks;
}
