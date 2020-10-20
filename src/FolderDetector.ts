import path from 'path';
import vscode from 'vscode';

import exec from './shared/exec';
import exists from './shared/exists';
import getOutputChannel from './shared/getOutputChannel';
import localize from './shared/localize';
import showError from './shared/showError';
import { getTaskGroupGuess } from './shared/taskGroup';

type AutoDetect = 'on' | 'off';

const MAKEFILE = 'Makefile';

export default class FolderDetector {
  private fileWatcher?: vscode.FileSystemWatcher;
  private promise?: Thenable<vscode.Task[]>;
  private rootPath?: string;
  private sourceName = 'make';

  constructor(public readonly workspaceFolder: vscode.WorkspaceFolder) {
    this.rootPath = workspaceFolder.uri.scheme === 'file' ? workspaceFolder.uri.fsPath : undefined;
  }

  isEnabled(): boolean {
    return (
      vscode.workspace
        .getConfiguration('make', this.workspaceFolder.uri)
        .get<AutoDetect>('autoDetect', 'on') === 'on'
    );
  }

  unsetPromise = (): void => {
    this.promise = undefined;
  };

  start(): void {
    if (!this.rootPath) {
      getOutputChannel().appendLine(
        'Wrong Workspace schema: ' + this.workspaceFolder.uri.toString(),
      );
      showError();
      return;
    }

    const pattern = path.join(this.rootPath, `{${MAKEFILE}}`);
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    this.fileWatcher.onDidChange(this.unsetPromise);
    this.fileWatcher.onDidCreate(this.unsetPromise);
    this.fileWatcher.onDidDelete(this.unsetPromise);
  }

  async getTasks(): Promise<vscode.Task[]> {
    if (!this.isEnabled()) {
      return [];
    }

    if (!this.promise) {
      this.promise = this.computeTasks();
    }

    return this.promise;
  }

  async getTask({ definition, name }: vscode.Task): Promise<vscode.Task | undefined> {
    const options: vscode.ShellExecutionOptions = { cwd: this.workspaceFolder.uri.fsPath };

    const task = new vscode.Task(
      definition,
      this.workspaceFolder,
      name,
      this.sourceName,
      new vscode.ShellExecution(`make`, [name], options),
    );

    task.group = getTaskGroupGuess(name);

    return task;
  }

  // TODO export to a helper
  private getResultLines(result: string): string[] {
    const startAt = result.lastIndexOf('# Files');
    const lines = result.substr(startAt).split(/\r{0,1}\n/g);
    const validLineRegex = /^(?!(Makefile|#|\.|\s)).+?:$/;
    const validLines = lines
      .filter((line) => validLineRegex.test(line))
      .map((line) => line.replace(':', ''));
    return validLines;
  }

  private async computeTasks(): Promise<vscode.Task[]> {
    const emptyTasks: vscode.Task[] = [];

    if (!this.rootPath) {
      return emptyTasks;
    }

    const makeFileExists = await exists(path.join(this.rootPath, MAKEFILE));

    if (!makeFileExists) {
      return emptyTasks;
    }

    // TODO extract reading the Make targets to external file
    const commandLine = `make --no-builtin-rules --no-builtin-variables --print-data-base --just-print`;

    try {
      const { stdout, stderr } = await exec(commandLine, { cwd: this.rootPath });

      if (stderr) {
        getOutputChannel().appendLine(stderr);
        showError();
      }

      const result: vscode.Task[] = [];

      if (stdout) {
        const lines = this.getResultLines(stdout);

        for (const name of lines) {
          if (name.length === 0) {
            continue;
          }

          const kind: vscode.TaskDefinition = {
            type: this.sourceName,
            task: name,
          };
          const options: vscode.ShellExecutionOptions = { cwd: this.rootPath };

          const task = new vscode.Task(
            kind,
            this.workspaceFolder,
            name,
            this.sourceName,
            new vscode.ShellExecution(`make`, [name], options),
          );

          task.group = getTaskGroupGuess(name);

          result.push(task);
        }
      }
      return result;
    } catch (err) {
      this.unsetPromise();
      const channel = getOutputChannel();

      if (err.stderr) {
        channel.appendLine(err.stderr);
      }
      if (err.stdout) {
        channel.appendLine(err.stdout);
      }

      channel.appendLine(
        localize(
          'execFailed',
          'Auto detecting Make targets for folder `{0}` failed with error: {1}',
          this.workspaceFolder.name,
          err.error ? err.error.toString() : 'unknown',
        ),
      );
      showError();

      return emptyTasks;
    }
  }

  dispose() {
    this.unsetPromise();

    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
  }
}
