import vscode from 'vscode';

export type MakefileTaskDefinition = vscode.TaskDefinition & {
  targetName: string;
};
