import sinon from 'sinon';
import vscode from 'vscode';

import { showGenericErrorNotification } from './errorNotifications';
import getOutputChannel from './getOutputChannel';

let showMocked: vscode.OutputChannel['show'];
let showWarningMessageReturnValue: undefined | string;

describe('Error Notifications', () => {
  beforeEach(() => {
    const channel = getOutputChannel();
    showMocked = sinon.replace(channel, 'show', sinon.fake());

    sinon.replace(
      vscode.window,
      'showWarningMessage',
      sinon.fake(() => showWarningMessageReturnValue),
    );
  });

  it('should not show the output if the user just closes the notification', async () => {
    await showGenericErrorNotification();
    showMocked.should.not.have.been.called;
  });

  it('should show the output channel if the user clicks on the button', async () => {
    showWarningMessageReturnValue = 'the button was clicked';

    await showGenericErrorNotification();
    expect(showMocked).to.have.been.calledOnce;
  });
});
