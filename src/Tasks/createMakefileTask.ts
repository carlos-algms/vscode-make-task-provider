import path from 'path';
import vscode from 'vscode';

import { MAKE_BIN, TYPE } from '../shared/constants';
import { getParentRelativePath } from '../shared/workspaceUtils';

import { MakefileTask, MakefileTaskDefinition } from './MakefileTask';
import { getTaskGroupGuess } from './taskGroup';

type PossibleDefinition = MakefileTaskDefinition | string;

/**
 * When the definition is coming from `resolveTask`, it is required to return it immutable.
 */
export function getDefinition(
  nameOrDefinition: PossibleDefinition,
  folder: vscode.WorkspaceFolder,
  makefileUri: vscode.Uri,
): MakefileTaskDefinition {
  if (typeof nameOrDefinition === 'string') {
    return {
      type: 'make',
      targetName: nameOrDefinition,
      relativeFolder: getParentRelativePath(makefileUri, folder),
    };
  }

  return nameOrDefinition;
}

export function createMakefileTask(
  nameOrDefinition: PossibleDefinition,
  folder: vscode.WorkspaceFolder,
  makefileUri: vscode.Uri,
): MakefileTask {
  const definition = getDefinition(nameOrDefinition, folder, makefileUri);
  const { targetName } = definition;

  const cwd = path.dirname(makefileUri.fsPath);

  const options: vscode.ShellExecutionOptions = { cwd };

  const task = <MakefileTask>(
    new vscode.Task(
      definition,
      folder,
      targetName,
      TYPE,
      new vscode.ShellExecution(MAKE_BIN, [targetName], options),
      [],
    )
  );

  task.group = getTaskGroupGuess(targetName);
  // task.detail = `make ${targetName}`;

  return task;
}
