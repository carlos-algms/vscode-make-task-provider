import { ProviderResult, Task, TaskProvider, TaskScope } from 'vscode';
import { createMakefileTask } from './createMakefileTask';
import getAvailableTasks from './getAvailableTasks';
import { MakefileTask } from './MakefileTask';

export class MakefileTaskProvider implements TaskProvider<Task | MakefileTask> {
  provideTasks(): ProviderResult<MakefileTask[]> {
    return getAvailableTasks();
  }

  resolveTask(task: MakefileTask): ProviderResult<Task> {
    const { definition } = task;

    if (
      !definition.targetName ||
      task.scope === undefined ||
      task.scope === TaskScope.Global ||
      task.scope === TaskScope.Workspace
    ) {
      // scope is required to be a WorkspaceFolder
      return undefined;
    }

    return createMakefileTask(definition, task.scope);
  }
}
