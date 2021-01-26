/* eslint-disable @typescript-eslint/naming-convention */
import vscode from 'vscode';

import { MAKEFILE } from '../shared/constants';
import { findFilesInFolder, getValidWorkspaceFolders } from '../shared/workspaceFiles';
import { trackEvent, trackException } from '../telemetry/tracking';

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
  const folders = getValidWorkspaceFolders();

  if (!folders) {
    return emptyTasks;
  }

  try {
    const promises = folders.map(async (folder) => {
      const files = await findFilesInFolder(folder, `**/${MAKEFILE}`);
      const tasksPromises = files.map((file) => buildTasksFromMakefile(file, folder));

      return (await Promise.all(tasksPromises)).flat();
    });

    const allTasks: MakefileTask[] = (await Promise.all(promises)).flat().filter(Boolean);
    return allTasks;
  } catch (error) {
    trackException(error, {
      action: 'Fetch available tasks',
      category: 'Tasks',
    });
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

  trackEvent({
    action: 'Target names found',
    category: 'Tasks',
    value: targetNames,
    valueText: targetNames.toString(),
  });

  const tasks: MakefileTask[] = targetNames.map((name) =>
    createMakefileTask(name, folder, makefileUri),
  );

  return tasks;
}
