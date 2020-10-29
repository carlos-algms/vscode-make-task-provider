import vscode from 'vscode';
import { MakefileTaskProvider } from './MakefileTaskProvider';
import { invalidateTaskCaches } from './taskCaches';

export default function registerTaskProvider(
  context: vscode.ExtensionContext,
): MakefileTaskProvider | null {
  if (!vscode.workspace.workspaceFolders) {
    return null;
  }

  const watcher = vscode.workspace.createFileSystemWatcher('**/Makefile');
  watcher.onDidChange(invalidateTaskCaches);
  watcher.onDidDelete(invalidateTaskCaches);
  watcher.onDidCreate(invalidateTaskCaches);
  context.subscriptions.push(watcher);

  const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(invalidateTaskCaches);
  context.subscriptions.push(workspaceWatcher);

  const provider = new MakefileTaskProvider();
  const disposable = vscode.tasks.registerTaskProvider('make', <vscode.TaskProvider>provider);
  context.subscriptions.push(disposable);
  return provider;
}
