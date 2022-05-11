import path from 'path';
import vscode from 'vscode';

import { getExtraArguments, getMakeExecutablePath } from '../shared/config';
import { TYPE } from '../shared/constants';
import { getFileRelativePath } from '../shared/workspaceFiles';

import { MakefileTask, MakefileTaskDefinition } from './MakefileTask';
import { getTaskGroupGuess } from './taskGroup';

type PossibleDefinition = MakefileTaskDefinition | string;

/**
 * When the definition is coming from `resolveTask`, it is required to return it immutable.
 */
function getDefinition(
  nameOrDefinition: PossibleDefinition,
  makefilePath: string,
  folderPath: string,
): MakefileTaskDefinition {
  if (typeof nameOrDefinition === 'string') {
    return {
      type: TYPE,
      targetName: nameOrDefinition,
      makeFileRelativePath: getFileRelativePath(makefilePath, folderPath),
    };
  }

  return nameOrDefinition;
}

/**
 * This function will be called when:
 * 1. A task is defined in tasks.json and requires a execution definition
 * 2. While parsing a Makefile and only the name of the target is available
 */
export function createMakefileTask(
  nameOrDefinition: PossibleDefinition,
  folder: vscode.WorkspaceFolder,
  makefileUri: vscode.Uri,
): MakefileTask {
  const definition = getDefinition(nameOrDefinition, makefileUri.fsPath, folder.uri.fsPath);
  const { targetName, makeFileRelativePath, args = [] } = definition;

  const cwd = path.dirname(makefileUri.fsPath);
  const makefile = path.basename(makeFileRelativePath);

  const options: vscode.ShellExecutionOptions = { cwd };
  // TODO: check performance degradation here
  const makeBin = getMakeExecutablePath(folder);
  const extraArguments = getExtraArguments(folder);
  const uniqueArgs = Array.from(new Set([...extraArguments, ...args]));

  const task = <MakefileTask>(
    new vscode.Task(
      definition,
      folder,
      targetName,
      TYPE,
      new vscode.ShellExecution(makeBin, ['-f', makefile, ...uniqueArgs, targetName], options),
      [],
    )
  );

  task.group = getTaskGroupGuess(targetName);
  // task.detail = `make ${targetName}`;

  return task;
}
