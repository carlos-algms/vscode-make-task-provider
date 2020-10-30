import vscode from 'vscode';
import { TYPE } from '../shared/constants';

import { MakefileTaskProvider } from './MakefileTaskProvider';

export default function registerTaskProvider(
  context: vscode.ExtensionContext,
): MakefileTaskProvider | undefined {
  if (!vscode.workspace.workspaceFolders) {
    return undefined;
  }

  const provider = new MakefileTaskProvider();
  const disposable = vscode.tasks.registerTaskProvider(TYPE, <vscode.TaskProvider>provider);
  context.subscriptions.push(disposable);
  return provider;
}
