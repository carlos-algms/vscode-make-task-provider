import { MakefileTask } from './MakefileTask';
import { getCachedTasks, invalidateTaskCaches, setCachedTasks } from './taskCaches';

describe('Tasks Cache', () => {
  it('should mange the list of tasks', () => {
    let tasks = getCachedTasks();
    expect(tasks).to.be.null;

    const fakeTasks: MakefileTask[] = [];
    setCachedTasks(fakeTasks);

    tasks = getCachedTasks();
    expect(tasks).to.equal(fakeTasks);

    invalidateTaskCaches();
    tasks = getCachedTasks();
    expect(tasks).to.be.null;
  });
});
