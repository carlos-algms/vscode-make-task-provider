import vscode from 'vscode';

import { registerCommands } from './commandPicker/commandsManager';
import { COMMANDS, getMakefileNames } from './shared/config';
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
    const makefileNames = getMakefileNames();
    const glob = `**/{${makefileNames.join(',')}}`;
    const watcher = vscode.workspace.createFileSystemWatcher(glob);

    watcher.onDidChange(runRefreshCommand);
    watcher.onDidDelete(runRefreshCommand);
    watcher.onDidCreate(runRefreshCommand);

    context.subscriptions.push(watcher);
  }

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
