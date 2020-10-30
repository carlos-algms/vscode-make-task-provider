import vscode from 'vscode';

import { CONFIG_KEYS } from '../shared/config';
import { TYPE } from '../shared/constants';
import { invalidateTaskCaches } from '../Tasks/taskCaches';

import { MakefileTreeDataProvider } from './MakefileTreeDataProvider';

export function registerTreeViewProvider(
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

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_KEYS.autoDetect)) {
        invalidateTaskCaches();
        if (treeDataProvider) {
          treeDataProvider.refresh();
        }
      }
    }),
  );

  return treeDataProvider;
}
