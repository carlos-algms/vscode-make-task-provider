import path from 'path';
import vscode from 'vscode';

import exec from './shared/exec';
import localize from './shared/localize';
import exists from './shared/exists';
import getOutputChannel from './shared/getOutputChannel';
import showError from './shared/showError';

type AutoDetect = 'on' | 'off';

interface MakeTaskDefinition extends vscode.TaskDefinition {
  task: string;
  args?: string[];
  file?: string;
}

const MAKEFILE = 'Makefile';

const buildNames = ['build', 'compile', 'watch'];
function isBuildTask(name: string): boolean {
  for (const buildName of buildNames) {
    if (name.indexOf(buildName) !== -1) {
      return true;
    }
  }
  return false;
}

const testNames = ['test'];
function isTestTask(name: string): boolean {
  for (const testName of testNames) {
    if (name.indexOf(testName) !== -1) {
      return true;
    }
  }
  return false;
}

export default class FolderDetector {
  private fileWatcher?: vscode.FileSystemWatcher;
  private promise?: Thenable<vscode.Task[]>;

  constructor(private _workspaceFolder: vscode.WorkspaceFolder) {}

  get workspaceFolder(): vscode.WorkspaceFolder {
    return this._workspaceFolder;
  }

  isEnabled(): boolean {
    return (
      vscode.workspace
        .getConfiguration('make', this._workspaceFolder.uri)
        .get<AutoDetect>('autoDetect', 'on') === 'on'
    );
  }

  unsetPromise = () => {
    this.promise = undefined;
  };

  start(): void {
    const pattern = path.join(this._workspaceFolder.uri.fsPath, `{${MAKEFILE}}`);
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

  async getTask(_task: vscode.Task): Promise<vscode.Task | undefined> {
    const taskDefinition = _task.definition;
    const target = taskDefinition.task;

    if (target) {
      const options: vscode.ShellExecutionOptions = { cwd: this.workspaceFolder.uri.fsPath };
      const source = 'make';
      const quotedMakeTask = target.includes(' ') ? `"${target}"` : target;

      const task = new vscode.Task(
        taskDefinition,
        this.workspaceFolder,
        target,
        source,
        new vscode.ShellExecution(`make`, [quotedMakeTask, ...taskDefinition.args], options),
      );
      return task;
    }

    return undefined;
  }

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
    const rootPath =
      this._workspaceFolder.uri.scheme === 'file' ? this._workspaceFolder.uri.fsPath : undefined;
    const emptyTasks: vscode.Task[] = [];

    if (!rootPath) {
      return emptyTasks;
    }

    const makeFileExists = await exists(path.join(rootPath, MAKEFILE));

    if (!makeFileExists) {
      return emptyTasks;
    }

    const commandLine = `make --no-builtin-rules --no-builtin-variables --print-data-base --just-print`;

    try {
      const { stdout, stderr } = await exec(commandLine, { cwd: rootPath });

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

          const source = 'make';
          const kind: MakeTaskDefinition = {
            type: source,
            task: name,
          };
          const options: vscode.ShellExecutionOptions = {};

          const task = new vscode.Task(
            kind,
            this.workspaceFolder,
            name,
            source,
            new vscode.ShellExecution(`make ${name}`, options),
          );

          const lowerCaseTaskName = name.toLowerCase();
          if (isBuildTask(lowerCaseTaskName)) {
            task.group = vscode.TaskGroup.Build;
          } else if (isTestTask(lowerCaseTaskName)) {
            task.group = vscode.TaskGroup.Test;
          }

          result.push(task);
        }
      }
      return result;
    } catch (err) {
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
          'Auto detecting Make for folder {0} failed with error: {1}',
          this.workspaceFolder.name,
          err.error ? err.error.toString() : 'unknown',
        ),
      );
      showError();

      this.unsetPromise();

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
