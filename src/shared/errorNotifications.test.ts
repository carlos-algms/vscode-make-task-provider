import sinon from 'sinon';
import vscode from 'vscode';

import { showGenericErrorNotification } from './errorNotifications';
import getOutputChannel from './getOutputChannel';

let showMocked: sinon.SinonStub;
let showWarningMessageMocked: sinon.SinonStub;

describe('Error Notifications', () => {
  beforeEach(() => {
    const channel = getOutputChannel();
    showMocked = sinon.stub(channel, 'show');
    showWarningMessageMocked = sinon.stub(vscode.window, 'showWarningMessage');
  });

  it('should not show the output if the user just closes the notification', async () => {
    await showGenericErrorNotification();
    showMocked.should.not.have.been.called;
  });

  it('should show the output channel if the user clicks on the button', async () => {
    showWarningMessageMocked.returns('the button was clicked');

    await showGenericErrorNotification();
    expect(showMocked).to.have.been.calledOnce;
  });
});
