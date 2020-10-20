import vscode from 'vscode';

import getOutputChannel from './getOutputChannel';
import localize from './localize';

export default async function showError() {
  const result = await vscode.window.showWarningMessage(
    localize(
      'makeTaskDetectError',
      'Problem finding Make targets. See the output for more information.',
    ),
    localize('makeShowOutput', 'Go to output'),
  );

  if (result !== undefined) {
    getOutputChannel().show(true);
  }
}
