import { ExtensionContext, TaskProvider, tasks, workspace } from 'vscode';
import { MakefileTaskProvider } from './MakefileTaskProvider';
import { invalidateTaskCaches } from './taskCaches';

export default function registerTaskProvider(
  context: ExtensionContext,
): MakefileTaskProvider | null {
  if (!workspace.workspaceFolders) {
    return null;
  }

  const watcher = workspace.createFileSystemWatcher('**/Makefile');
  watcher.onDidChange(invalidateTaskCaches);
  watcher.onDidDelete(invalidateTaskCaches);
  watcher.onDidCreate(invalidateTaskCaches);
  context.subscriptions.push(watcher);

  const workspaceWatcher = workspace.onDidChangeWorkspaceFolders(invalidateTaskCaches);
  context.subscriptions.push(workspaceWatcher);

  const provider = new MakefileTaskProvider();
  const disposable = tasks.registerTaskProvider('make', <TaskProvider>provider);
  context.subscriptions.push(disposable);
  return provider;
}
