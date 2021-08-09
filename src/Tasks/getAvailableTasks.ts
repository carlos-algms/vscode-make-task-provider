/* eslint-disable @typescript-eslint/naming-convention */
import vscode from 'vscode';

import { getMakefileNames } from '../shared/config';
import { showGenericErrorNotification } from '../shared/errorNotifications';
import getOutputChannel from '../shared/getOutputChannel';
import { findFilesInFolder, getValidWorkspaceFolders } from '../shared/workspaceFiles';
import { trackEvent, trackException, trackExecutionTime } from '../telemetry/tracking';

import { createMakefileTask } from './createMakefileTask';
import getMakefileTargetNames from './getMakefileTargetNames';
import { MakefileTask } from './MakefileTask';
import { getCachedTasks, setCachedTasks } from './taskCaches';

const emptyTasks: MakefileTask[] = [];

export default async function getAvailableTasks(): Promise<MakefileTask[]> {
  let tasks = getCachedTasks();

  if (!tasks) {
    tasks = await trackExecutionTime(fetchAvailableTasks, { label: 'Fetch available tasks' });
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
    const makefileNames = getMakefileNames();
    const glob = `**/{${makefileNames.join(',')}}`;

    const promises = folders.map(async (folder) => {
      const files = await findFilesInFolder(folder, glob);
      const tasksPromises = files.map((file) => buildTasksFromMakefile(file, folder));

      return (await Promise.all(tasksPromises)).flat();
    });

    const allTasks: MakefileTask[] = (await Promise.all(promises)).flat().filter(Boolean);
    return allTasks;
  } catch (errorThrown) {
    trackException(errorThrown, {
      action: 'Fetch available tasks',
      category: 'Tasks',
    });

    displayError(errorThrown);

    // returning empty list to avoid UI staying in infinite loading loop.
    return [];
  }
}

async function buildTasksFromMakefile(
  makefileUri: vscode.Uri,
  folder: vscode.WorkspaceFolder,
): Promise<MakefileTask[]> {
  const targetNames = await getMakefileTargetNames(makefileUri, folder);

  if (!targetNames) {
    trackEvent({
      action: 'Target names empty',
      category: 'Tasks',
      value: [],
    });
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

function displayError(errorThrown: Error) {
  const { message } = errorThrown;

  getOutputChannel().appendLine(message);
  showGenericErrorNotification();
}
