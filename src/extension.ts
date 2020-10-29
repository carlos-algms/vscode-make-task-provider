import vscode from 'vscode';
import { registerCommands } from './commandPicker/commandsManager';

import registerTaskProvider from './Tasks/registerTaskProvider';

export function activate(context: vscode.ExtensionContext): void {
  const provider = registerTaskProvider(context);

  // TODO implement onDidChangeWorkspaceFolders to create the provider
  if (provider) {
    registerCommands(context, provider);
  }
}

export function deactivate(): void {
  // noop
}
