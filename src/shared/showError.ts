import vscode from 'vscode';

import getOutputChannel from './getOutputChannel';

export default async function showError(): Promise<void> {
  const result = await vscode.window.showWarningMessage(
    'Problem finding Make targets. See the output for more information.',
    'Go to output',
  );

  if (result !== undefined) {
    getOutputChannel().show(true);
  }
}
