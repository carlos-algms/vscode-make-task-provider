import getAvailableTasks from './getAvailableTasks';
import { MakefileTask } from './MakefileTask';
import { getCachedTasks, invalidateTaskCaches, setCachedTasks } from './taskCaches';

describe('Get Available Tasks', () => {
  afterEach(() => {
    invalidateTaskCaches();
  });

  it('should return the cached tasks ', async () => {
    const cachedTasks: MakefileTask[] = [];
    setCachedTasks(cachedTasks);

    const tasks = await getAvailableTasks();
    expect(tasks).to.equal(cachedTasks);
  });

  it('should parse the Makefile and return the tasks', async () => {
    const tasks = await getAvailableTasks();
    expect(tasks).to.have.length(3);

    const cachedTasks = getCachedTasks();
    expect(tasks).to.equal(cachedTasks);

    expect(tasks.map((t) => t.name)).deep.equal(['foo', 'build', 'test']);
  });
});
