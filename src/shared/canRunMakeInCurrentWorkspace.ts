import vscode from 'vscode';

export function canRunMakeInCurrentWorkspace(): boolean {
  if (vscode.workspace.workspaceFolders) {
    return vscode.workspace.workspaceFolders.some((f) => f.uri.scheme === 'file');
  }
  return false;
}
