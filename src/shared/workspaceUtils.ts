import vscode from 'vscode';

export function isWorkspaceFolder(value: unknown): value is vscode.WorkspaceFolder {
  return value && typeof value !== 'number';
}
