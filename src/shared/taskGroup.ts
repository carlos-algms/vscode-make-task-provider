import vscode from 'vscode';

const buildNames = ['build', 'compile', 'watch'];
const testNames = ['test'];

export function isBuildTask(name: string): boolean {
  for (const buildName of buildNames) {
    if (name.includes(buildName)) {
      return true;
    }
  }
  return false;
}

export function isTestTask(name: string): boolean {
  for (const testName of testNames) {
    if (name.includes(testName)) {
      return true;
    }
  }
  return false;
}

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
