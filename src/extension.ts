import vscode from 'vscode';

import { registerCommands } from './commandPicker/commandsManager';
import { COMMANDS } from './shared/config';
import { MAKEFILE } from './shared/constants';
import registerTaskProvider from './Tasks/registerTaskProvider';
import { getTracker, trackEvent } from './telemetry/tracking';
import { registerTreeViewProvider } from './TreeView/registerTreeViewProvider';

export function activate(context: vscode.ExtensionContext): void {
  const taskProvider = registerTaskProvider(context);
  const treeViewProvider = registerTreeViewProvider(context);

  registerCommands(context, taskProvider, treeViewProvider);

  const runRefreshCommand = () => {
    vscode.commands.executeCommand(COMMANDS.refresh);
  };

  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(runRefreshCommand));

  if (vscode.workspace.workspaceFolders) {
    const watcher = vscode.workspace.createFileSystemWatcher(`**/${MAKEFILE}`);
    watcher.onDidChange(runRefreshCommand);
    watcher.onDidDelete(runRefreshCommand);
    watcher.onDidCreate(runRefreshCommand);
    context.subscriptions.push(watcher);
  }

  trackEvent('activated');
}

export function deactivate(): void {
  trackEvent('deactivated');
  getTracker().dispose();
}
