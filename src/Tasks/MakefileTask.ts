import vscode from 'vscode';

export interface MakefileTaskDefinition extends vscode.TaskDefinition {
  /**
   * Make target script name
   * Must exist in the Makefile
   */
  targetName: string;

  /**
   * The relative path to the Makefile containing the Target task
   */
  makeFileRelativePath: string;

  /**
   * Extra arguments to be passed to the make command
   */
  args?: string[];
}

export interface MakefileTask extends vscode.Task {
  /**
   * @inheritdoc
   */
  definition: MakefileTaskDefinition;
}
