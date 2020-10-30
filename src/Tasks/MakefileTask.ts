import vscode from 'vscode';

export interface MakefileTaskDefinition extends vscode.TaskDefinition {
  /**
   * Make target script name
   * Must exist in the Makefile
   */
  targetName: string;

  /**
   * Relative folder path where the Makefile is stored
   */
  relativeFolder?: string;
}

export interface MakefileTask extends vscode.Task {
  /**
   * @inheritdoc
   */
  definition: MakefileTaskDefinition;
}
