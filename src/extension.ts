import vscode from 'vscode';

import { registerCommands } from './commandPicker/commandsManager';
import { COMMANDS } from './shared/config';
import registerTaskProvider from './Tasks/registerTaskProvider';
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
    const watcher = vscode.workspace.createFileSystemWatcher('**/Makefile');
    watcher.onDidChange(runRefreshCommand);
    watcher.onDidDelete(runRefreshCommand);
    watcher.onDidCreate(runRefreshCommand);
    context.subscriptions.push(watcher);
  }
}

export function deactivate(): void {
  // noop
}
