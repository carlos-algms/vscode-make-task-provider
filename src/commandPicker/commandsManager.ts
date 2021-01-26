import vscode from 'vscode';

import { COMMANDS } from '../shared/config';
import { MakefileTaskProvider } from '../Tasks/MakefileTaskProvider';
import { invalidateTaskCaches } from '../Tasks/taskCaches';
import { trackEvent } from '../telemetry/tracking';
import { MakefileTreeDataProvider } from '../TreeView/MakefileTreeDataProvider';

import { runFromCommandPicker } from './runFromCommandPicker';

export function registerCommands(
  context: vscode.ExtensionContext,
  taskProvider?: MakefileTaskProvider,
  treeViewProvider?: MakefileTreeDataProvider,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.runTarget, () => {
      runFromCommandPicker(taskProvider);
    }),

    vscode.commands.registerCommand(COMMANDS.refresh, () => {
      invalidateTaskCaches();

      if (treeViewProvider) {
        treeViewProvider.refresh();
      }

      trackEvent({
        action: 'Run Command',
        category: 'Global',
        label: 'Refresh',
      });
    }),
  );
}
