import vscode from 'vscode';

import { TYPE } from '../shared/constants';
import { trackEvent } from '../telemetry/tracking';

import { MakefileTaskProvider } from './MakefileTaskProvider';

export default function registerTaskProvider(
  context: vscode.ExtensionContext,
): MakefileTaskProvider | undefined {
  if (!vscode.workspace.workspaceFolders) {
    return undefined;
  }

  const provider = new MakefileTaskProvider();
  const disposable = vscode.tasks.registerTaskProvider(TYPE, <vscode.TaskProvider>provider);
  context.subscriptions.push(disposable);

  setupTasksTimingTrack(context);
  return provider;
}

function setupTasksTimingTrack(context: vscode.ExtensionContext) {
  const executionTimingMap = new WeakMap<vscode.TaskExecution, number>();

  context.subscriptions.push(
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
        label: execution.task.name,
        value: duration,
      });
    }),
  );
}
