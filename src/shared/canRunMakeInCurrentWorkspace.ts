import { workspace } from 'vscode';

export function canRunMakeInCurrentWorkspace(): boolean {
  if (workspace.workspaceFolders) {
    return workspace.workspaceFolders.some((f) => f.uri.scheme === 'file');
  }
  return false;
}
