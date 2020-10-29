import { ShellExecution, ShellExecutionOptions, Task, WorkspaceFolder } from 'vscode';
import { getTaskGroupGuess } from '../shared/taskGroup';
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
  folder: WorkspaceFolder,
  makefileRootFolder?: string,
): MakefileTask {
  const definition = getDefinition(nameOrDefinition);
  const { targetName } = definition;
  const options: ShellExecutionOptions = { cwd: makefileRootFolder ?? folder.uri.toString() };

  const task = <MakefileTask>(
    new Task(
      definition,
      folder,
      targetName,
      'make',
      new ShellExecution(`make`, [targetName], options),
      [],
    )
  );

  task.group = getTaskGroupGuess(targetName);
  // task.detail = `make ${targetName}`;

  return task;
}
