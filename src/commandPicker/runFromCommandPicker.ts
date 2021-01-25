import vscode from 'vscode';
import { showQuickPickForTasks } from '../shared/quickPicker';
import { MakefileTaskProvider } from '../Tasks/MakefileTaskProvider';
import { trackEvent } from '../telemetry/tracking';

export async function runFromCommandPicker(taskProvider?: MakefileTaskProvider): Promise<void> {
  trackEvent('Command', {
    category: 'commandPicker',
    action: 'run',
    label: 'runTarget',
  });

  // TODO check if is safe to use vscode.tasks.fetchTasks({ type: 'make' });
  const targets = taskProvider ? await taskProvider.provideTasks() : null;

  // TODO identify the reason why there are no targets. No Makefile? parsing error?
  if (!targets?.length) {
    vscode.window.showInformationMessage(`No make scripts found`);

    trackEvent('Command', {
      category: 'commandPicker',
      action: 'run',
      label: 'noTargets',
    });
    return;
  }

  const selectedTarget = await showQuickPickForTasks(targets);

  if (selectedTarget) {
    vscode.tasks.executeTask(selectedTarget);
    trackEvent('Command', {
      category: 'commandPicker',
      action: 'run',
      label: 'execute',
      task: {
        name: selectedTarget.name,
        source: selectedTarget.source,
        detail: selectedTarget.detail,
        problemMatchers: selectedTarget.problemMatchers?.toString(),
        targetName: selectedTarget.definition.targetName,
        relativeFolder: selectedTarget.definition.relativeFolder,
        type: selectedTarget.definition.type,
      },
    });
  } else {
    trackEvent('Command', {
      category: 'commandPicker',
      action: 'run',
      label: 'userCancelled',
    });
  }
}
