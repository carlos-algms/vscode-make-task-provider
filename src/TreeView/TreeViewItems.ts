/* eslint-disable no-use-before-define, max-classes-per-file */
import vscode from 'vscode';
import path from 'path';
import { MAKEFILE } from '../shared/constants';
import { MakefileTask } from '../Tasks/MakefileTask';
import { COMMANDS } from '../shared/config';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { Expanded, None } = vscode.TreeItemCollapsibleState;

export class BaseTreeItem<TParent = null, TChild = vscode.TreeItem> extends vscode.TreeItem {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  label: string;

  private parent: TParent;

  protected children: TChild[] = [];

  constructor(parent: TParent, label: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label, collapsibleState);
    this.parent = parent;
  }

  getParent(): TParent {
    return this.parent;
  }

  getChildren(): TChild[] {
    return this.children;
  }

  addChild(child: TChild): void {
    this.children.push(child);
  }
}

export class FolderItem extends BaseTreeItem<null, TaskHostFileItem> {
  readonly workspaceFolder: vscode.WorkspaceFolder;

  constructor(workspaceFolder: vscode.WorkspaceFolder) {
    super(null, workspaceFolder.name, Expanded);
    this.contextValue = 'folder';
    this.resourceUri = workspaceFolder.uri;
    this.iconPath = vscode.ThemeIcon.Folder;

    this.workspaceFolder = workspaceFolder;
  }

  getChildren(): TaskHostFileItem[] {
    return this.children.sort((a, b) => {
      if (a instanceof TasksJsonItem) {
        return 1;
      }

      if (b instanceof TasksJsonItem) {
        return -1;
      }

      return a.label.length - b.label.length;
    });
  }
}

export class TaskHostFileItem extends BaseTreeItem<FolderItem> {}

export class TasksJsonItem extends TaskHostFileItem {
  private static fixedLabel: string = path.join('.vscode', 'tasks.json');

  static getLabel(): string {
    return TasksJsonItem.fixedLabel;
  }

  constructor(parent: FolderItem) {
    super(parent, TasksJsonItem.getLabel(), Expanded);

    this.contextValue = MAKEFILE;
    this.resourceUri = vscode.Uri.file(
      path.join(parent.resourceUri?.fsPath ?? '', this.label ?? ''),
    );
    this.iconPath = vscode.ThemeIcon.File;
  }
}

export class MakefileItem extends TaskHostFileItem {
  static getLabel(relativePath: string): string {
    if (relativePath.length > 0) {
      return path.join(relativePath, MAKEFILE);
    }

    return MAKEFILE;
  }

  constructor(parent: FolderItem, relativePath: string) {
    super(parent, MakefileItem.getLabel(relativePath), Expanded);

    this.contextValue = MAKEFILE;

    this.resourceUri = vscode.Uri.file(
      path.join(parent.resourceUri?.fsPath ?? '', relativePath, MAKEFILE),
    );
    this.iconPath = vscode.ThemeIcon.File;
  }
}

export class MakefileTargetItem extends BaseTreeItem<MakefileItem> {
  task: MakefileTask;

  constructor(hostFile: BaseTreeItem<FolderItem>, task: MakefileTask) {
    super(hostFile, task.name, None);

    this.task = task;

    this.contextValue = 'MakefileTarget';

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
}

export class NoTargets extends BaseTreeItem<null> {
  constructor(message: string) {
    super(null, message, None);
    this.contextValue = 'noScripts';
  }
}
