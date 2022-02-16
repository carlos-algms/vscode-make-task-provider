import vscode from 'vscode';

import { getSelectionForTarget } from '../Parsers/selectionFinder';
import {
  COMMANDS,
  CONFIG_KEYS,
  getTargetsExplorerClickAction,
  isAutoDetectEnabled,
} from '../shared/config';
import DisposeManager from '../shared/DisposeManager';
import { fetchTaskFromVsCode } from '../Tasks/getAvailableTasks';
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
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private taskTree: BaseTreeItem<null | FolderItem>[] | null = null;

  private eventEmitter = new vscode.EventEmitter<vscode.TreeItem | null>();

  readonly onDidChangeTreeData = this.eventEmitter.event;

  constructor() {
    super();
    this.disposables.push(
      this.eventEmitter,
      vscode.commands.registerCommand(COMMANDS.runTargetFromTreeView, this.runTargetFromTreeView),
      vscode.commands.registerCommand(COMMANDS.openMakefile, this.openHostFile),
      vscode.commands.registerCommand(COMMANDS.targetFromTreeViewClicked, this.handleTargetClicked),
    );
  }

  private runTargetFromTreeView = (item: MakefileTargetItem): Thenable<vscode.TaskExecution> => {
    trackEvent({
      action: 'Run Command',
      category: 'TreeView',
      label: 'Run Target',
    });

    return vscode.tasks.executeTask(item.task);
  };

  private handleTargetClicked = (item: MakefileTargetItem) => {
    const parent = item.getParent();
    const action = getTargetsExplorerClickAction(parent.resourceUri);

    if (action === 'run') {
      this.runTargetFromTreeView(item);
      return;
    }

    this.openHostFile(item);
  };

  /**
   * Open the file where the target tasks are stored
   * Can be a Makefile or a tasks.json
   */
  private openHostFile = async (item: TaskHostFileItem | MakefileTargetItem) => {
    trackEvent({
      action: 'Run Command',
      category: 'TreeView',
      label: 'Open File',
    });

    let uri: vscode.Uri | undefined;
    let targetItem: MakefileTargetItem | undefined;

    if (item instanceof MakefileTargetItem) {
      uri = item.getParent().resourceUri;
      targetItem = item;
    } else {
      uri = item.resourceUri;
    }

    if (!uri) {
      return;
    }

    const document: vscode.TextDocument = await vscode.workspace.openTextDocument(uri);
    const selection = getSelectionForTarget(document.getText(), targetItem?.label);

    await vscode.window.showTextDocument(document, {
      preserveFocus: true,
      selection,
    });
  };

  async getChildren(element?: BaseTreeItem): Promise<vscode.TreeItem[] | null | undefined> {
    if (!element) {
      if (!this.taskTree) {
        const availableTargets = await fetchTaskFromVsCode();

        if (availableTargets) {
          this.taskTree = buildTasksTree(availableTargets);
        }

        if (!this.taskTree?.length) {
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
