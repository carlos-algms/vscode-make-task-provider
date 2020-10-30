import vscode from 'vscode';

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

    let folder = null;
    let makefileFile = null;

    targets.forEach((target) => {
      if (isWorkspaceFolder(target.scope)) {
        folder = folders.get(target.scope.name);

        if (!folder) {
          folder = new FolderItem(target.scope);
          folders.set(target.scope.name, folder);
        }

        // const { scope } = target;
        // const relativePath = definition.path ? definition.path : '';
        // const fullPath = path.join(target.scope.name, relativePath);
        // TODO get relative and full path for the makefiles
        const relativePath = 'relative/Makefile';
        const fullPath = '/fullPath/Makefile';

        makefileFile = makefiles.get(fullPath);

        if (!makefileFile) {
          makefileFile = new MakefileItem(folder, relativePath);
          folder.addFile(makefileFile);
          makefiles.set(fullPath, makefileFile);
        }

        const targetItem = new MakefileTargetItem(this.extensionContext, makefileFile, target);
        makefileFile.addTargetItem(targetItem);
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
