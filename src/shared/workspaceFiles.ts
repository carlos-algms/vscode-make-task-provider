import vscode from 'vscode';

import { trackExecutionTime } from '../telemetry/tracking';

import { COMMON_EXCLUDES } from './config';

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

/**
 * Get the relative path to a file in the Workspace
 */
export function getFileRelativePath(filePath: string, folderPath: string): string {
  // TODO folder could be optional and assumed to be the current workspace folder
  const absolutePath = filePath.substring(0, filePath.length);
  return absolutePath.substring(folderPath.length + 1);
}
