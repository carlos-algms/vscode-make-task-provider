import vscode from 'vscode';

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
