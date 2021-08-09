import path from 'path';
import vscode from 'vscode';

import { createMakefileTask } from './createMakefileTask';
import getAvailableTasks from './getAvailableTasks';
import { MakefileTask } from './MakefileTask';

export class MakefileTaskProvider implements vscode.TaskProvider<vscode.Task | MakefileTask> {
  provideTasks(): vscode.ProviderResult<MakefileTask[]> {
    return getAvailableTasks();
  }

  /**
   * @inheritdoc
   *
   * It is allowed to return a new `Task` instance, but it HAS to use the same `task.definition` from the parameter, without any mutation
   */
  resolveTask(task: MakefileTask): vscode.ProviderResult<vscode.Task> {
    const { definition, scope } = task;

    if (
      !definition.targetName ||
      scope === undefined ||
      scope === vscode.TaskScope.Global ||
      scope === vscode.TaskScope.Workspace
    ) {
      // scope is required to be a WorkspaceFolder
      return undefined;
    }

    const makefileUri: vscode.Uri = scope.uri.with({
      path: path.join(scope.uri.path, definition.makeFileRelativePath),
    });

    const providedTask = createMakefileTask(definition, scope, makefileUri);
    providedTask.group = vscode.TaskGroup.Rebuild; // hack: using Rebuild to identify tasks from tasks.json
    return providedTask;
  }
}
