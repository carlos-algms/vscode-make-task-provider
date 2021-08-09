import vscode from 'vscode';

import { TYPE } from '../shared/constants';

import { MakefileTreeDataProvider } from './MakefileTreeDataProvider';

export function registerTreeViewDataProvider(
  context: vscode.ExtensionContext,
): MakefileTreeDataProvider | undefined {
  if (!vscode.workspace.workspaceFolders) {
    return undefined;
  }

  const treeDataProvider = new MakefileTreeDataProvider(context);

  context.subscriptions.push(
    vscode.window.createTreeView(TYPE, {
      treeDataProvider,
      showCollapseAll: true,
    }),
  );

  return treeDataProvider;
}
