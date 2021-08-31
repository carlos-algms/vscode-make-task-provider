import vscode from 'vscode';

import { registerCommands } from './commandPicker/commandsManager';
import { COMMANDS, CONFIG_KEYS } from './shared/config';
import getOutputChannel from './shared/getOutputChannel';
import watchForMakefiles from './shared/watchForMakefiles';
import registerTaskProvider from './Tasks/registerTaskProvider';
import { getTracker, trackEvent } from './telemetry/tracking';
import { registerTreeViewDataProvider } from './TreeView/registerTreeViewDataProvider';

export function activate(context: vscode.ExtensionContext): void {
  const taskProvider = registerTaskProvider(context);
  const treeViewDataProvider = registerTreeViewDataProvider(context);

  registerCommands(context, taskProvider, treeViewDataProvider);

  const runRefreshCommand = () => {
    vscode.commands.executeCommand(COMMANDS.refresh);
  };

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(runRefreshCommand),

    watchForMakefiles(runRefreshCommand),

    vscode.workspace.onDidChangeConfiguration((e) => {
      const shouldRefresh =
        e.affectsConfiguration(CONFIG_KEYS.autoDetect) ||
        e.affectsConfiguration(CONFIG_KEYS.makeExecutable);

      if (shouldRefresh) {
        runRefreshCommand();
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
