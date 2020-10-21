import vscode from 'vscode';
import TaskDetector from './TaskDetector';

export async function runFromCommandPicker(taskDetector: TaskDetector | null): Promise<void> {
  if (!taskDetector) {
    return;
  }

  const targets = await taskDetector.getTasks();
  const targetNames = targets.map((target) => target.name);
  const selectedTarget = await vscode.window.showQuickPick(targetNames);

  if (selectedTarget) {
    const foundTask = targets.find((target) => target.name === selectedTarget);

    if (foundTask !== undefined) {
      vscode.tasks.executeTask(foundTask);
    }
    // TODO log task not found
  }
}
