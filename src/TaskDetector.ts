import vscode from 'vscode';

import FolderDetector from './FolderDetector';

export default class TaskDetector {
  private taskProvider: vscode.Disposable | undefined;
  private detectors: Map<string, FolderDetector> = new Map();

  constructor() {}

  start(): void {
    const folders = vscode.workspace.workspaceFolders;

    if (folders) {
      this.updateWorkspaceFolders(folders, []);
    }

    vscode.workspace.onDidChangeWorkspaceFolders((event) =>
      this.updateWorkspaceFolders(event.added, event.removed),
    );

    vscode.workspace.onDidChangeConfiguration(this.updateConfiguration, this);
  }

  dispose(): void {
    if (this.taskProvider) {
      this.taskProvider.dispose();
      this.taskProvider = undefined;
    }

    this.detectors.clear();
  }

  private updateWorkspaceFolders(
    added: readonly vscode.WorkspaceFolder[],
    removed: readonly vscode.WorkspaceFolder[],
  ): void {
    for (const remove of removed) {
      const detector = this.detectors.get(remove.uri.toString()); // TODO uri.toString() can be cached?
      if (detector) {
        detector.dispose();
        this.detectors.delete(remove.uri.toString());
      }
    }

    for (const add of added) {
      const detector = new FolderDetector(add);
      this.detectors.set(add.uri.toString(), detector);
      if (detector.isEnabled()) {
        detector.start();
      }
    }

    this.updateProvider();
  }

  private updateConfiguration(): void {
    for (const detector of this.detectors.values()) {
      detector.dispose();
      this.detectors.delete(detector.workspaceFolder.uri.toString());
    }

    const folders = vscode.workspace.workspaceFolders;

    if (folders) {
      for (const folder of folders) {
        if (!this.detectors.has(folder.uri.toString())) {
          const detector = new FolderDetector(folder);
          this.detectors.set(folder.uri.toString(), detector);
          if (detector.isEnabled()) {
            detector.start();
          }
        }
      }
    }
    this.updateProvider();
  }

  private updateProvider(): void {
    if (!this.taskProvider && this.detectors.size > 0) {
      const _this = this;

      this.taskProvider = vscode.tasks.registerTaskProvider('make', {
        provideTasks: (): Promise<vscode.Task[]> => {
          return _this.getTasks();
        },
        resolveTask(_task: vscode.Task): Promise<vscode.Task | undefined> {
          return _this.getTask(_task);
        },
      });
    } else if (this.taskProvider && this.detectors.size === 0) {
      this.taskProvider.dispose();
      this.taskProvider = undefined;
    }
  }

  getTasks(): Promise<vscode.Task[]> {
    return this.computeTasks();
  }

  private async computeTasks(): Promise<vscode.Task[]> {
    if (this.detectors.size === 0) {
      return [];
    }

    if (this.detectors.size === 1) {
      return this.detectors.values().next().value.getTasks();
    }

    const promises: Promise<vscode.Task[]>[] = [];
    for (const detector of this.detectors.values()) {
      promises.push(
        detector.getTasks().then(
          (value) => value,
          () => [],
        ),
      );
    }

    const tasksResolved = await Promise.all(promises);
    const result: vscode.Task[] = [];

    for (const tasks of tasksResolved) {
      if (tasks && tasks.length > 0) {
        result.push(...tasks);
      }
    }

    return result;
  }

  async getTask(task: vscode.Task): Promise<vscode.Task | undefined> {
    if (this.detectors.size === 0) {
      return undefined;
    }

    if (this.detectors.size === 1) {
      return this.detectors.values().next().value.getTask(task);
    }

    if (task.scope === vscode.TaskScope.Workspace || task.scope === vscode.TaskScope.Global) {
      return undefined;
    }

    if (task.scope) {
      const detector = this.detectors.get(task.scope.uri.toString());
      if (detector) {
        return detector.getTask(task);
      }
    }

    return undefined;
  }
}
