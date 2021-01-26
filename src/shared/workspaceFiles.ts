import vscode from 'vscode';
import { trackExecutionTime } from '../telemetry/tracking';
import { COMMON_EXCLUDES, isAutoDetectEnabled } from './config';

export async function findFilesInFolder(
  folder: vscode.WorkspaceFolder,
  globPattern: string,
): Promise<vscode.Uri[]> {
  const relativePattern = new vscode.RelativePattern(folder, globPattern);
  // TODO make the exclude pattern dynamic
  const files = await trackExecutionTime(
    async () => vscode.workspace.findFiles(relativePattern, `{${COMMON_EXCLUDES}}`),
    {
      label: `Find Files in Folder: [${globPattern}]`,
      category: 'Workspace',
    },
  );
  return filterUniqueUris(files);
}

export function filterUniqueUris(uris: vscode.Uri[]): vscode.Uri[] {
  const usedFiles: Set<string> = new Set();

  return uris.filter((file) => {
    if (usedFiles.has(file.fsPath)) {
      return false;
    }
    usedFiles.add(file.fsPath);
    return true;
  });
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
