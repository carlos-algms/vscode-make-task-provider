import vscode from 'vscode';

export function getSelectionForTarget(documentText: string, targetName?: string): vscode.Selection {
  if (!targetName) {
    return new vscode.Selection(0, 0, 0, 0);
  }

  const taskName = `${targetName}:`;
  const documentLines = documentText.split('\n');
  const lineNumber = documentLines.findIndex((line) => line.trim().startsWith(taskName));

  if (lineNumber === -1) {
    return new vscode.Selection(0, 0, 0, 0);
  }

  return new vscode.Selection(lineNumber, 0, lineNumber, taskName.length);
}
