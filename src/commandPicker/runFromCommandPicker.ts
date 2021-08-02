import vscode from 'vscode';

import { showQuickPickForTasks } from '../shared/quickPicker';
import { MakefileTaskProvider } from '../Tasks/MakefileTaskProvider';
import { trackEvent } from '../telemetry/tracking';

export async function runFromCommandPicker(taskProvider?: MakefileTaskProvider): Promise<void> {
  trackEvent({
    action: 'Run Command',
    category: 'CommandPicker',
    label: 'runTarget',
    value: 'triggered',
  });

  // TODO check if is safe to use vscode.tasks.fetchTasks({ type: 'make' });
  const targets = taskProvider ? await taskProvider.provideTasks() : null;

  // TODO identify the reason why there are no targets. No Makefile? parsing error?
  if (!targets?.length) {
    vscode.window.showInformationMessage(`No make scripts found`);

    trackEvent({
      action: 'Run Command',
      category: 'CommandPicker',
      label: 'runTarget',
      value: 'noTargetsAvailable',
    });

    return;
  }

  const selectedTarget = await showQuickPickForTasks(targets);

  if (selectedTarget) {
    vscode.tasks.executeTask(selectedTarget);
  }

  trackEvent({
    action: 'Run Command',
    category: 'CommandPicker',
    label: 'runTarget',
    value: selectedTarget?.name ?? 'userCancelled',
  });
}
