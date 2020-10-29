import vscode from 'vscode';
import { createMakefileTask } from './createMakefileTask';
import getAvailableTasks from './getAvailableTasks';
import { MakefileTask } from './MakefileTask';

export class MakefileTaskProvider implements vscode.TaskProvider<vscode.Task | MakefileTask> {
  provideTasks(): vscode.ProviderResult<MakefileTask[]> {
    return getAvailableTasks();
  }

  resolveTask(task: MakefileTask): vscode.ProviderResult<vscode.Task> {
    const { definition } = task;

    if (
      !definition.targetName ||
      task.scope === undefined ||
      task.scope === vscode.TaskScope.Global ||
      task.scope === vscode.TaskScope.Workspace
    ) {
      // scope is required to be a WorkspaceFolder
      return undefined;
    }

    return createMakefileTask(definition, task.scope);
  }
}
