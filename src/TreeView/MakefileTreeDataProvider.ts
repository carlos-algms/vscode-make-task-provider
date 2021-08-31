import vscode from 'vscode';

import { COMMANDS, CONFIG_KEYS, isAutoDetectEnabled } from '../shared/config';
import { TYPE } from '../shared/constants';
import DisposeManager from '../shared/DisposeManager';
import { MakefileTask } from '../Tasks/MakefileTask';
import { trackEvent } from '../telemetry/tracking';

import { buildTasksTree } from './taskTreeBuilder';
import {
  BaseTreeItem,
  FolderItem,
  MakefileTargetItem,
  NoTargets,
  TaskHostFileItem,
} from './TreeViewItems';

export class MakefileTreeDataProvider
  extends DisposeManager
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private taskTree: BaseTreeItem<null | FolderItem>[] | null = null;

  private eventEmitter = new vscode.EventEmitter<vscode.TreeItem | null>();

  readonly onDidChangeTreeData = this.eventEmitter.event;

  constructor() {
    super();
    this.disposables.push(
      this.eventEmitter,
      vscode.commands.registerCommand(COMMANDS.runTargetFromTreeView, this.runTargetFromTreeView),
      vscode.commands.registerCommand(COMMANDS.openMakefile, this.openHostFile),
    );
  }

  private runTargetFromTreeView = (item: MakefileTargetItem): Thenable<vscode.TaskExecution> => {
    trackEvent({
      action: 'Run Command',
      category: 'TreeView',
      label: item.label,
    });

    return vscode.tasks.executeTask(item.task);
  };

  /**
   * Open the file where the target tasks are stored
   * Can be a Makefile or a tasks.json
   */
  private openHostFile = async (selection: TaskHostFileItem | MakefileTargetItem) => {
    trackEvent({
      action: 'Run Command',
      category: 'TreeView',
      label: 'Open File',
    });

    let uri: vscode.Uri | undefined;
    let targetItem: MakefileTargetItem | undefined;

    if (selection instanceof MakefileTargetItem) {
      uri = selection.getParent().resourceUri;
      targetItem = selection;
    } else {
      uri = selection.resourceUri;
    }

    if (!uri) {
      return;
    }

    const document: vscode.TextDocument = await vscode.workspace.openTextDocument(uri);
    const offset = this.findScript(document, targetItem);
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

  async getChildren(element?: BaseTreeItem): Promise<vscode.TreeItem[] | null | undefined> {
    if (!element) {
      if (!this.taskTree) {
        const availableTargets = <MakefileTask[]>await vscode.tasks.fetchTasks({ type: TYPE });

        if (availableTargets) {
          this.taskTree = buildTasksTree(availableTargets);
        }

        if (!this.taskTree || this.taskTree.length === 0) {
          let message = 'No scripts found.';

          if (!isAutoDetectEnabled()) {
            // TODO maybe return an item that when clicked enable the auto detection and triggers a refresh
            message = `The setting "${CONFIG_KEYS.autoDetect}" is false.`;
          }

          this.taskTree = [new NoTargets(message)];
        }
      }

      return this.taskTree;
    }

    return element.getChildren();
  }

  refresh = (): void => {
    this.taskTree = null;
    this.eventEmitter.fire(null);
  };

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getParent(element: BaseTreeItem): vscode.TreeItem | null {
    return element.getParent();
  }
}
