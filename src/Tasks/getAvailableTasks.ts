import path from 'path';
import { RelativePattern, Uri, workspace } from 'vscode';
import { isAutoDetectEnabled } from '../shared/config';
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

  const folders = workspace.workspaceFolders;
  if (!folders) {
    return emptyTasks;
  }

  const validFolders = folders.filter((f) => isAutoDetectEnabled(f) && f.uri.scheme === 'file');

  if (!validFolders || !validFolders.length) {
    return emptyTasks;
  }

  try {
    const promises = validFolders.map(async (folder) => {
      const relativePattern = new RelativePattern(folder, '**/Makefile');
      const files = await workspace.findFiles(relativePattern);
      const uniqueFiles = files.filter((file) => {
        if (usedFiles.has(file.fsPath)) {
          return false;
        }
        usedFiles.add(file.fsPath);
        return true;
      });

      const filesPromises = uniqueFiles.map(buildMakefileTasksForFolder);

      return (await Promise.all(filesPromises)).flat();
    });

    const allTasks: MakefileTask[] = (await Promise.all(promises)).filter(Boolean).flat();
    return allTasks;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function buildMakefileTasksForFolder(makefileUri: Uri): Promise<MakefileTask[]> {
  const folder = workspace.getWorkspaceFolder(makefileUri);

  if (!folder) {
    return emptyTasks;
  }

  const makefileRootFolder = path.dirname(makefileUri.fsPath);
  const targetNames = await getMakefileTargetNames(makefileRootFolder);

  if (!targetNames) {
    return emptyTasks;
  }

  const tasks: MakefileTask[] = targetNames.map((name) =>
    createMakefileTask(name, folder, makefileRootFolder),
  );

  return tasks;
}
