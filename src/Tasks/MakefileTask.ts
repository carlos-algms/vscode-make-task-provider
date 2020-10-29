import vscode from 'vscode';

export interface MakefileTaskDefinition extends vscode.TaskDefinition {
  targetName: string;
}

export interface MakefileTask extends vscode.Task {
  /**
   * @inheritdoc
   */
  definition: MakefileTaskDefinition;
}
