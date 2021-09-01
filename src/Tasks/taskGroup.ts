import vscode from 'vscode';

const buildNames = ['build', 'compile', 'watch'];
const testNames = ['test'];

export function getTaskGroupGuess(taskName: string): vscode.TaskGroup | undefined {
  const lowerCaseTaskName = taskName.toLowerCase();

  if (isBuildTask(lowerCaseTaskName)) {
    return vscode.TaskGroup.Build;
  }

  if (isTestTask(lowerCaseTaskName)) {
    return vscode.TaskGroup.Test;
  }

  return undefined;
}

export function isBuildTask(name: string): boolean {
  return buildNames.some((buildName) => name.includes(buildName));
}

export function isTestTask(name: string): boolean {
  return testNames.some((testName) => name.includes(testName));
}
