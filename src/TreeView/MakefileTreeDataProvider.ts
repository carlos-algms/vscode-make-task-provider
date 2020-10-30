import vscode from 'vscode';
import path from 'path';

import { COMMANDS, CONFIG_KEYS, isAutoDetectEnabled } from '../shared/config';
import { TYPE } from '../shared/constants';
import { isWorkspaceFolder } from '../shared/workspaceUtils';
import { MakefileTask } from '../Tasks/MakefileTask';

import { FolderItem, MakefileItem, MakefileTargetItem, NoTargets } from './TreeViewItems';

export class MakefileTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private taskTree: FolderItem[] | MakefileItem[] | NoTargets[] | null = null;

  private extensionContext: vscode.ExtensionContext;

  private eventEmitter: vscode.EventEmitter<vscode.TreeItem | null> = new vscode.EventEmitter<vscode.TreeItem | null>();

  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.eventEmitter.event;

  constructor(context: vscode.ExtensionContext) {
    const { subscriptions } = context;
    this.extensionContext = context;

    subscriptions.push(
      vscode.commands.registerCommand(COMMANDS.runTargetFromTreeView, this.runTargetFromTreeView),
      vscode.commands.registerCommand(COMMANDS.openMakefile, this.openMakefile),
    );
  }

  private runTargetFromTreeView = (item: MakefileTargetItem): Thenable<vscode.TaskExecution> => {
    return vscode.tasks.executeTask(item.task);
  };

  private openMakefile = async (selection: MakefileItem | MakefileTargetItem) => {
    let uri: vscode.Uri | undefined;

    if (selection instanceof MakefileItem) {
      uri = selection.resourceUri;
    } else if (selection instanceof MakefileTargetItem) {
      uri = selection.makefileItem.resourceUri;
    }

    if (!uri) {
      return;
    }

    const document: vscode.TextDocument = await vscode.workspace.openTextDocument(uri);
    const offset = this.findScript(
      document,
      selection instanceof MakefileTargetItem ? selection : undefined,
    );
    const position = document.positionAt(offset);

    await vscode.window.showTextDocument(document, {
      preserveFocus: true,
      selection: new vscode.Selection(position, position),
    });
  };

  private findScript(_document: vscode.TextDocument, _script?: MakefileTargetItem): number {
    // TODO get the position of the script in the file
    return 0;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!this.taskTree) {
      const availableTargets = <MakefileTask[]>await vscode.tasks.fetchTasks({ type: TYPE });

      if (availableTargets) {
        this.taskTree = this.buildTaskTree(availableTargets);
        if (this.taskTree.length === 0) {
          let message = 'No scripts found.';

          if (!isAutoDetectEnabled()) {
            message = `The setting "${CONFIG_KEYS.autoDetect}" is false.`;
          }

          this.taskTree = [new NoTargets(message)];
        }
      }
    }

    if (element instanceof FolderItem) {
      return element.fileItems;
    }

    if (element instanceof MakefileItem) {
      return element.targets;
    }

    if (element instanceof MakefileTargetItem || element instanceof NoTargets) {
      return [];
    }

    if (!element) {
      if (this.taskTree) {
        return this.taskTree;
      }
    }

    return [];
  }

  private buildTaskTree(targets: MakefileTask[]): FolderItem[] | MakefileItem[] | NoTargets[] {
    const folders = new Map<string, FolderItem>();
    const makefiles = new Map<string, MakefileItem>();

    let folderItem: FolderItem | undefined;
    let makefileItem: MakefileItem | undefined;

    targets.forEach((target) => {
      // TODO if the target is `target.source === 'Workspace`, list it under a different folder
      if (isWorkspaceFolder(target.scope)) {
        folderItem = folders.get(target.scope.name);

        if (!folderItem) {
          folderItem = new FolderItem(target.scope);
          folders.set(target.scope.name, folderItem);
        }

        const { definition } = target;
        const relativePath = definition.relativeFolder ?? '';
        const fullPath = path.join(target.scope.name, relativePath);

        makefileItem = makefiles.get(fullPath);

        if (!makefileItem) {
          makefileItem = new MakefileItem(folderItem, relativePath);
          folderItem.addFile(makefileItem);
          makefiles.set(fullPath, makefileItem);
        }

        const targetItem = new MakefileTargetItem(this.extensionContext, makefileItem, target);
        makefileItem.addTargetItem(targetItem);
      }
    });

    if (folders.size === 1) {
      return [...makefiles.values()];
    }

    return [...folders.values()];
  }

  refresh(): void {
    this.taskTree = null;
    this.eventEmitter.fire(null);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getParent(element: vscode.TreeItem): vscode.TreeItem | null {
    if (element instanceof FolderItem) {
      return null;
    }

    if (element instanceof MakefileItem) {
      return element.folder;
    }

    if (element instanceof MakefileTargetItem) {
      return element.makefileItem;
    }

    if (element instanceof NoTargets) {
      return null;
    }

    return null;
  }
}
