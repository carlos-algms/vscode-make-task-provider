import vscode from 'vscode';

import CommandsRegistration from './commands/CommandsRegistration';
import { COMMANDS, CONFIG_KEYS } from './shared/config';
import getOutputChannel from './shared/getOutputChannel';
import watchForMakefiles from './shared/watchForMakefiles';
import { TaskProviderRegistration } from './Tasks/registerTaskProvider';
import { getTracker, trackEvent } from './telemetry/tracking';
import { TreeViewRegistration } from './TreeView/registerTreeViewDataProvider';

export function activate(context: vscode.ExtensionContext): void {
  const taskProviderRegistration = new TaskProviderRegistration();
  const treeViewRegistration = new TreeViewRegistration();
  const commandsRegistration = new CommandsRegistration();

  commandsRegistration.onRunRefresh(treeViewRegistration.refreshTree);

  const executeRefreshCommand = () => {
    vscode.commands.executeCommand(COMMANDS.refresh);
  };

  context.subscriptions.push(
    taskProviderRegistration,
    treeViewRegistration,
    commandsRegistration,

    vscode.workspace.onDidChangeWorkspaceFolders(executeRefreshCommand),

    watchForMakefiles(executeRefreshCommand),

    vscode.workspace.onDidChangeConfiguration((e) => {
      const shouldRefresh =
        e.affectsConfiguration(CONFIG_KEYS.autoDetect) ||
        e.affectsConfiguration(CONFIG_KEYS.makeExecutable);

      if (shouldRefresh) {
        executeRefreshCommand();
      }
    }),

    getOutputChannel(),
  );

  trackEvent({
    action: 'activated',
  });
}

export function deactivate(): void {
  trackEvent({
    action: 'deactivated',
  });

  getTracker().dispose();
}
