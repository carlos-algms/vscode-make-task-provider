import vscode from 'vscode';

import FolderDetector from './FolderDetector';

export default class TaskDetector {
  private taskProvider: vscode.Disposable | undefined;

  private detectors = new Map<string, FolderDetector>();

  private disposables: vscode.Disposable[] = [];

  start(): void {
    const folders = vscode.workspace.workspaceFolders;

    if (folders) {
      this.updateWorkspaceFolders(folders, []);
    }

    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders((event) =>
        this.updateWorkspaceFolders(event.added, event.removed),
      ),

      vscode.workspace.onDidChangeConfiguration(this.updateConfiguration, this),
    );
  }

  dispose(): void {
    if (this.taskProvider) {
      this.taskProvider.dispose();
      this.taskProvider = undefined;
    }

    this.detectors.clear();

    const { disposables } = this;
    this.disposables = [];

    for (const disposable of disposables) {
      disposable.dispose();
    }
  }

  private updateWorkspaceFolders(
    added: readonly vscode.WorkspaceFolder[],
    removed: readonly vscode.WorkspaceFolder[],
  ): void {
    this.removeDetectorsForFolders(removed);
    this.startDetectorForFolders(added);
    this.updateProvider();
  }

  private removeDetectorsForFolders(folders: readonly vscode.WorkspaceFolder[]) {
    for (const remove of folders) {
      const identifier = remove.uri.toString();
      const detector = this.detectors.get(identifier);
      if (detector) {
        detector.dispose();
        this.detectors.delete(identifier);
      }
    }
  }

  private removeAllDetectors() {
    for (const detector of this.detectors.values()) {
      detector.dispose();
    }
    this.detectors.clear();
  }

  private startDetectorForFolders(folders: readonly vscode.WorkspaceFolder[]) {
    for (const folder of folders) {
      if (!this.detectors.has(folder.uri.toString())) {
        const detector = new FolderDetector(folder);
        this.detectors.set(folder.uri.toString(), detector);
        detector.start();
      }
    }
  }

  private updateConfiguration(): void {
    this.removeAllDetectors();

    const folders = vscode.workspace.workspaceFolders;

    if (folders) {
      this.startDetectorForFolders(folders);
    }

    this.updateProvider();
  }

  private updateProvider(): void {
    if (!this.taskProvider && this.detectors.size > 0) {
      this.taskProvider = vscode.tasks.registerTaskProvider('make', {
        provideTasks: (): Promise<vscode.Task[]> => {
          return this.getTasks();
        },
        resolveTask: (task: vscode.Task): Promise<vscode.Task | undefined> => {
          return this.getTask(task);
        },
      });
    } else if (this.taskProvider && this.detectors.size === 0) {
      this.taskProvider.dispose();
      this.taskProvider = undefined;
    }
  }

  async getTasks(): Promise<vscode.Task[]> {
    if (this.detectors.size === 0) {
      return [];
    }

    const promises: Promise<vscode.Task[]>[] = [];
    for (const detector of this.detectors.values()) {
      promises.push(
        detector.getTasks().then(
          (tasks) => tasks,
          () => [],
        ),
      );
    }

    const tasksResolved = await Promise.all(promises);
    const result: vscode.Task[] = tasksResolved.flat();

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
