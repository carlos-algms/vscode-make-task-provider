/* eslint-disable @typescript-eslint/naming-convention */
import vscode from 'vscode';

import { makefileParser } from '../Parsers/makefileParser';
import { getMakefileNames } from '../shared/config';
import { TYPE } from '../shared/constants';
import { showGenericErrorNotification } from '../shared/errorNotifications';
import getOutputChannel from '../shared/getOutputChannel';
import { findFilesInFolder } from '../shared/workspaceFiles';
import { getValidWorkspaceFolders } from '../shared/workspaceUtils';
import { trackEvent, trackException, trackExecutionTime } from '../telemetry/tracking';

import { createMakefileTask } from './createMakefileTask';
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
    const promises = folders.map(async (folder) => {
      const makefileNames = getMakefileNames(folder);
      const glob = `**/{${makefileNames.join(',')}}`;
      const makefiles = await findFilesInFolder(folder, glob);
      const tasksPromises = makefiles.map((file) => buildTasksFromMakefile(file, folder));

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
  const targetNames = await makefileParser(makefileUri.fsPath);

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

/**
 * Uses `vscode.tasks.fetchTasks(..)` to list all available tasks,
 * including the ones defined in the tasks.json
 */
export function fetchTaskFromVsCode(): Promise<MakefileTask[]> {
  return <Promise<MakefileTask[]>>vscode.tasks.fetchTasks({ type: TYPE });
}
