import vscode from 'vscode';
import path from 'path';

export function isWorkspaceFolder(value: unknown): value is vscode.WorkspaceFolder {
  return Boolean(value) && typeof value !== 'number';
}

/**
 * Get the relative path to a file in the Workspace
 */
export function getFileRelativePath(fileUri: vscode.Uri, folder: vscode.WorkspaceFolder): string {
  // TODO folder could be optional and assumed to be the current workspace folder
  const absolutePath = fileUri.path.substring(0, fileUri.path.length);
  const rootUri = folder.uri;
  return absolutePath.substring(rootUri.path.length + 1);
}

/**
 * Get the relative path to a given file's parent directory without trailing slash
 */
export function getParentRelativePath(fileUri: vscode.Uri, folder: vscode.WorkspaceFolder): string {
  const relativePath = getFileRelativePath(fileUri, folder);
  const lastPart = path.basename(relativePath);
  const parentPath = relativePath.substring(0, relativePath.length - lastPart.length - 1);
  return parentPath;
}
