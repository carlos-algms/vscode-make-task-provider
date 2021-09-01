import vscode from 'vscode';

import { isAutoDetectEnabled } from './config';

export function isWorkspaceFolder(value: unknown): value is vscode.WorkspaceFolder {
  return Boolean(value) && typeof value !== 'number';
}

export function getValidWorkspaceFolders(): vscode.WorkspaceFolder[] | null {
  const folders = vscode.workspace.workspaceFolders;

  if (!folders) {
    return null;
  }

  const validFolders = folders.filter((f) => isAutoDetectEnabled(f) && f.uri.scheme === 'file');

  if (!validFolders.length) {
    return null;
  }

  return validFolders;
}
