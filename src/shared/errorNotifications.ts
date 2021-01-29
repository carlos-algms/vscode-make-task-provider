import vscode from 'vscode';

import getOutputChannel from './getOutputChannel';

export async function showGenericErrorNotification(): Promise<void> {
  const result = await vscode.window.showWarningMessage(
    `An Error occurred in the Make extension. See the output for more information.`,
    'Go to output',
  );

  if (result !== undefined) {
    getOutputChannel().show(true);
  }
}
