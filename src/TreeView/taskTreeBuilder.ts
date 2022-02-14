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

  const folderItems = [...folders.values()];

  /**
   * In case just one workspace is open, there is no need of showing the only folder open in the tree.
   */
  if (folderItems.length === 1) {
    return folderItems[0].getChildren();
  }

  return folderItems;
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
  const { source } = task;
  let item: TaskHostFileItem | undefined;

  if (source === 'Workspace') {
    item = map.get(source);

    if (!item) {
      item = new TasksJsonItem(folderItem);
      map.set(source, item);
      folderItem.addChild(item);
    }
  } else {
    const makeFileRelativePath = task.definition.makeFileRelativePath ?? '';
    const key = `${folderItem.label}-${makeFileRelativePath}`;
    item = map.get(key);

    if (!item) {
      item = new MakefileItem(folderItem, makeFileRelativePath);
      map.set(key, item);
      folderItem.addChild(item);
    }
  }

  return item;
}
