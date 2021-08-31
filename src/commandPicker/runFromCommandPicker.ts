import vscode from 'vscode';

import { showQuickPickForTasks } from '../shared/quickPicker';
import { fetchTaskFromVsCode } from '../Tasks/getAvailableTasks';
import { MakefileTaskProvider } from '../Tasks/MakefileTaskProvider';
import { trackEvent } from '../telemetry/tracking';

export async function runFromCommandPicker(_taskProvider?: MakefileTaskProvider): Promise<void> {
  trackEvent({
    action: 'Run Command',
    category: 'CommandPicker',
    label: 'runTarget',
    value: 'triggered',
  });

  const targets = await fetchTaskFromVsCode();

  // TODO identify the reason why there are no targets. No Makefile? parsing error?
  if (!targets?.length) {
    vscode.window.showInformationMessage(`No Make targets found`);

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
