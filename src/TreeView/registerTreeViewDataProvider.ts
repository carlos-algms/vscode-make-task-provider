import vscode from 'vscode';

import { TYPE } from '../shared/constants';
import DisposeManager from '../shared/DisposeManager';

import { MakefileTreeDataProvider } from './MakefileTreeDataProvider';

export class TreeViewRegistration extends DisposeManager {
  readonly treeDataProvider?: MakefileTreeDataProvider;

  constructor() {
    super();

    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    this.treeDataProvider = new MakefileTreeDataProvider();

    this.disposables.push(
      this.treeDataProvider,

      vscode.window.createTreeView(TYPE, {
        treeDataProvider: this.treeDataProvider,
        showCollapseAll: true,
      }),
    );
  }

  refreshTree = (): void => {
    this.treeDataProvider?.refresh();
  };
}
