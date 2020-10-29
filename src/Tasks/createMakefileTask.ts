import vscode from 'vscode';
import { getTaskGroupGuess } from './taskGroup';
import { MakefileTask, MakefileTaskDefinition } from './MakefileTask';

type PossibleDefinition = MakefileTaskDefinition | string;

export function getDefinition(nameOrDefinition: PossibleDefinition): MakefileTaskDefinition {
  if (typeof nameOrDefinition === 'string') {
    return {
      type: 'make',
      targetName: nameOrDefinition,
    };
  }

  return nameOrDefinition;
}

export function createMakefileTask(
  nameOrDefinition: PossibleDefinition,
  folder: vscode.WorkspaceFolder,
  makefileRootFolder?: string,
): MakefileTask {
  const definition = getDefinition(nameOrDefinition);
  const { targetName } = definition;
  const options: vscode.ShellExecutionOptions = {
    cwd: makefileRootFolder ?? folder.uri.toString(),
  };

  const task = <MakefileTask>(
    new vscode.Task(
      definition,
      folder,
      targetName,
      'make',
      new vscode.ShellExecution(`make`, [targetName], options),
      [],
    )
  );

  task.group = getTaskGroupGuess(targetName);
  // TODO maybe include the relative path to the Makefile in case of multiple?
  // task.detail = `make ${targetName}`;

  return task;
}
