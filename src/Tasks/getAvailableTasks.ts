import vscode from 'vscode';

import { isAutoDetectEnabled } from '../shared/config';
import { MAKEFILE } from '../shared/constants';

import { createMakefileTask } from './createMakefileTask';
import getMakefileTargetNames from './getMakefileTargetNames';
import { MakefileTask } from './MakefileTask';
import { getCachedTasks, setCachedTasks } from './taskCaches';

const emptyTasks: MakefileTask[] = [];

export default async function getAvailableTasks(): Promise<MakefileTask[]> {
  let tasks = getCachedTasks();

  if (!tasks) {
    tasks = await fetchAvailableTasks();
    setCachedTasks(tasks);
  }

  return tasks;
}

async function fetchAvailableTasks(): Promise<MakefileTask[]> {
  const usedFiles: Set<string> = new Set();

  const folders = vscode.workspace.workspaceFolders;
  if (!folders) {
    return emptyTasks;
  }

  const validFolders = folders.filter((f) => isAutoDetectEnabled(f) && f.uri.scheme === 'file');

  if (!validFolders || !validFolders.length) {
    return emptyTasks;
  }

  try {
    const promises = validFolders.map(async (folder) => {
      const relativePattern = new vscode.RelativePattern(folder, `**/${MAKEFILE}`);
      const files = await vscode.workspace.findFiles(relativePattern);
      const uniqueFiles = files.filter((file) => {
        if (usedFiles.has(file.fsPath)) {
          return false;
        }
        usedFiles.add(file.fsPath);
        return true;
      });

      const filesPromises = uniqueFiles.map((file) => buildTasksFromMakefile(file, folder));

      return (await Promise.all(filesPromises)).flat();
    });

    const allTasks: MakefileTask[] = (await Promise.all(promises)).flat().filter(Boolean);
    return allTasks;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function buildTasksFromMakefile(
  makefileUri: vscode.Uri,
  folder: vscode.WorkspaceFolder,
): Promise<MakefileTask[]> {
  const targetNames = await getMakefileTargetNames(makefileUri);

  if (!targetNames) {
    return emptyTasks;
  }

  const tasks: MakefileTask[] = targetNames.map((name) =>
    createMakefileTask(name, folder, makefileUri),
  );

  return tasks;
}
