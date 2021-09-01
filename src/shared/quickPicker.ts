import vscode from 'vscode';

export async function showQuickPicker<T extends vscode.QuickPickItem>(
  items: T[],
  placeHolder = '',
): Promise<T | null | void> {
  const selected = await vscode.window.showQuickPick(items, {
    placeHolder,
  });

  return selected;
}

export async function showQuickPickForTasks<T extends vscode.Task>(
  targets: T[],
): Promise<T | null> {
  const items = targets.map((t) => ({
    label: t.name,
    task: t,
  }));

  const selected = await showQuickPicker(items, 'Select a Make target to run');

  if (!selected) {
    return null;
  }

  return selected.task;
}
