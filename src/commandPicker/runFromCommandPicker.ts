import vscode from 'vscode';

import { showQuickPickForTasks } from '../shared/quickPicker';
import { MakefileTaskProvider } from '../Tasks/MakefileTaskProvider';

export async function runFromCommandPicker(taskProvider?: MakefileTaskProvider): Promise<void> {
  // TODO check if is safe to use vscode.tasks.fetchTasks({ type: 'make' });
  const targets = taskProvider ? await taskProvider.provideTasks() : null;

  // TODO identify the reason why there are no targets. No Makefile? parsing error?
  if (!targets || !targets.length) {
    vscode.window.showInformationMessage(`No make scripts found`);
    return;
  }

  const selectedTarget = await showQuickPickForTasks(targets);

  if (selectedTarget) {
    vscode.tasks.executeTask(selectedTarget);
  }
}
