import vscode from 'vscode';

import { trackEvent } from '../telemetry/tracking';

import getOutputChannel from './getOutputChannel';

export async function showGenericErrorNotification(): Promise<void> {
  const result = await vscode.window.showWarningMessage(
    `An Error occurred in the Make extension. See the output for more information.`,
    'Go to output',
  );

  if (result !== undefined) {
    trackEvent({
      action: 'Show Output',
    });

    getOutputChannel().show(true);
  }
}
