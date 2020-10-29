import vscode from 'vscode';

import { showQuickPickForTasks } from '../shared/quickPicker';
import { MakefileTaskProvider } from '../Tasks/MakefileTaskProvider';

export async function runFromCommandPicker(taskProvider: MakefileTaskProvider): Promise<void> {
  const targets = await taskProvider.provideTasks();

  // TODO identify the reason why there is no targets. No Makefile? parsing error?
  if (!targets || !targets.length) {
    vscode.window.showInformationMessage(`No make scripts found`);
    return;
  }

  const selectedTarget = await showQuickPickForTasks(targets);

  if (selectedTarget) {
    vscode.tasks.executeTask(selectedTarget);
  }
}
