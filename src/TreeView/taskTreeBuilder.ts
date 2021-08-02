import vscode from 'vscode';

import { isWorkspaceFolder } from '../shared/workspaceUtils';
import { MakefileTask } from '../Tasks/MakefileTask';

import {
  BaseTreeItem,
  FolderItem,
  MakefileItem,
  MakefileTargetItem,
  TaskHostFileItem,
  TasksJsonItem,
} from './TreeViewItems';

export function buildTasksTree(targets: MakefileTask[]): BaseTreeItem<null | FolderItem>[] {
  const folders = new Map<string, FolderItem>();
  const taskHostFiles = new Map<string, TaskHostFileItem>();

  targets.forEach((target) => {
    if (!isWorkspaceFolder(target.scope)) {
      return;
    }

    const folderItem: FolderItem = getFolderItem(target.scope, folders);
    const taskHostItem: TaskHostFileItem = getTaskHostFileItem(taskHostFiles, target, folderItem);
    const targetItem = new MakefileTargetItem(taskHostItem, target);

    taskHostItem.addChild(targetItem);
  });

  const items = [...folders.values()];

  if (items.length === 1) {
    return items[0].getChildren();
  }

  return items;
}

function getFolderItem(scope: vscode.WorkspaceFolder, map: Map<string, FolderItem>): FolderItem {
  let item = map.get(scope.name);

  if (!item) {
    item = new FolderItem(scope);
    map.set(scope.name, item);
  }

  return item;
}

function getTaskHostFileItem(
  map: Map<string, TaskHostFileItem>,
  task: MakefileTask,
  folderItem: FolderItem,
): TaskHostFileItem {
  const scope = <vscode.WorkspaceFolder>task.scope;
  let item: TaskHostFileItem | undefined;

  if (task.source === 'Workspace') {
    item = map.get(scope.name);

    if (!item) {
      item = new TasksJsonItem(folderItem);
      map.set(scope.name, item);
      folderItem.addChild(item);
    }
  } else {
    const makeFileRelativePath = task.definition.makeFileRelativePath ?? '';
    item = map.get(makeFileRelativePath);

    if (!item) {
      item = new MakefileItem(folderItem, makeFileRelativePath);
      map.set(makeFileRelativePath, item);
      folderItem.addChild(item);
    }
  }

  return item;
}
