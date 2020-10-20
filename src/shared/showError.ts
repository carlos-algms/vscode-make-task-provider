import vscode from 'vscode';

import getOutputChannel from './getOutputChannel';
import localize from './localize';

export default function showError() {
  vscode.window
    .showWarningMessage(
      localize(
        'makeTaskDetectError',
        'Problem finding Make targets. See the output for more information.',
      ),
      localize('makeShowOutput', 'Go to output'),
    )
    .then(() => {
      getOutputChannel().show(true);
    });
}
