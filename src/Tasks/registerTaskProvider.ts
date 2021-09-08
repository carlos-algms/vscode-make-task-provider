import vscode from 'vscode';

import { TYPE } from '../shared/constants';
import DisposeManager from '../shared/DisposeManager';
import { trackEvent } from '../telemetry/tracking';

import { MakefileTaskProvider } from './MakefileTaskProvider';

export class TaskProviderRegistration extends DisposeManager {
  readonly taskProvider?: MakefileTaskProvider;

  constructor() {
    super();

    if (vscode.workspace.workspaceFolders) {
      this.taskProvider = new MakefileTaskProvider();

      this.disposables.push(
        vscode.tasks.registerTaskProvider(TYPE, this.taskProvider),
        setupTasksTimingTrack(),
      );
    }
  }
}

function setupTasksTimingTrack(): vscode.Disposable {
  const executionTimingMap = new WeakMap<vscode.TaskExecution, number>();

  return vscode.Disposable.from(
    vscode.tasks.onDidStartTask(({ execution }) => {
      if (execution.task.source === TYPE) {
        executionTimingMap.set(execution, Date.now());
      }
    }),

    vscode.tasks.onDidEndTask(({ execution }) => {
      const { task } = execution;

      if (task.source !== TYPE) {
        return;
      }

      const start = executionTimingMap.get(execution) ?? 0;
      const duration = Date.now() - start;
      executionTimingMap.delete(execution);

      trackEvent({
        action: 'Timing',
        category: 'Task Execution',
        label: task.name,
        value: duration,
      });
    }),
  );
}
