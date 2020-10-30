/* eslint-disable no-use-before-define, max-classes-per-file */
import vscode from 'vscode';
import path from 'path';
import { MAKEFILE } from '../shared/constants';
import { MakefileTask } from '../Tasks/MakefileTask';
import { COMMANDS } from '../shared/config';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { Expanded } = vscode.TreeItemCollapsibleState;

export class FolderItem extends vscode.TreeItem {
  fileItems: MakefileItem[] = [];

  workspaceFolder: vscode.WorkspaceFolder;

  constructor(folder: vscode.WorkspaceFolder) {
    super(folder.name, Expanded);
    this.contextValue = 'folder';
    this.resourceUri = folder.uri;
    this.workspaceFolder = folder;
    this.iconPath = vscode.ThemeIcon.Folder;
  }

  addFile(file: MakefileItem): void {
    this.fileItems.push(file);
  }
}

export class MakefileItem extends vscode.TreeItem {
  relativePath: string;

  folder: FolderItem;

  targets: MakefileTargetItem[] = [];

  static getLabel(_folderName: string, relativePath: string): string {
    if (relativePath.length > 0) {
      return path.join(relativePath, MAKEFILE);
    }

    return MAKEFILE;
  }

  constructor(folder: FolderItem, relativePath: string) {
    super(MakefileItem.getLabel(folder.label ?? '', relativePath), Expanded);

    this.folder = folder;
    this.relativePath = relativePath;
    this.contextValue = MAKEFILE;

    if (relativePath) {
      this.resourceUri = vscode.Uri.file(
        path.join(folder.resourceUri?.fsPath ?? '', relativePath, MAKEFILE),
      );
    } else {
      this.resourceUri = vscode.Uri.file(path.join(folder.resourceUri?.fsPath ?? '', MAKEFILE));
    }
    this.iconPath = vscode.ThemeIcon.File;
  }

  addTargetItem(target: MakefileTargetItem): void {
    this.targets.push(target);
  }
}

export class MakefileTargetItem extends vscode.TreeItem {
  task: MakefileTask;

  makefileItem: MakefileItem;

  // TODO exclude context, it is not being used
  constructor(_context: vscode.ExtensionContext, makefileItem: MakefileItem, task: MakefileTask) {
    super(task.name, vscode.TreeItemCollapsibleState.None);

    this.contextValue = 'MakefileTarget';
    this.makefileItem = makefileItem;
    this.task = task;

    // TODO read the default click action from the config, run, or open the file at the script position
    this.command = {
      title: 'Run this target',
      command: COMMANDS.runTargetFromTreeView,
      arguments: [this],
    };

    this.tooltip = task.detail ?? '';

    if (task.group === vscode.TaskGroup.Test) {
      this.iconPath = new vscode.ThemeIcon('beaker');
    } else if (task.group === vscode.TaskGroup.Build) {
      this.iconPath = new vscode.ThemeIcon('package');
    } else {
      this.iconPath = new vscode.ThemeIcon('terminal');
    }
  }

  getFolder(): vscode.WorkspaceFolder {
    return this.makefileItem.folder.workspaceFolder;
  }
}

export class NoTargets extends vscode.TreeItem {
  constructor(message: string) {
    super(message, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'noScripts';
  }
}
